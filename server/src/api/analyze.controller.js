"use strict";

const crypto = require("crypto");
const prisma = require("../db/prisma.js");
const openaiService = require("../services/openai.service.js");

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid || ""
  );
}

function isValidEmail(email) {
  const e = normalizeText(email);
  return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

const CRISIS_PATTERNS = [
  /\bnie\s*chc[eę]\s*[żz]y[cć]\b/i,
  /\bsamob[oó]j/i,
  /\bodebra[cć]\s+sobie\s+[żz]ycie\b/i,
  /\bzabij[eę]\s+si[eę]\b/i,
  /\bskrzywdz[ić]\s+siebie\b/i,
  /\bboj[eę]\s+si[eę]\s+o\s+[żz]ycie\b/i,
  /\bboj[eę]\s+si[eę],?\s+[żz]e\s+mnie\s+zabije\b/i,
  /\bpobi[łl]\b/i,
  /\buderzy[łl]\b/i,
  /\bprzemoc\b/i,
  /\bn[oó][żz]\b/i,
  /\bkrew\b/i,
];

function hasCrisisContent(text) {
  const value = normalizeText(text);
  if (!value) return false;
  return CRISIS_PATTERNS.some((pattern) => pattern.test(value));
}

function hasLowQualityContent(text) {
  const value = normalizeText(text).toLowerCase();
  if (!value || value.length < 18) return true;

  const letters = (value.match(/[a-ząćęłńóśźż]/gi) || []).length;
  const spaces = (value.match(/\s/g) || []).length;
  const uniqueChars = new Set(value.replace(/\s/g, "").split("")).size;
  const jokePatterns = [
    /\b(test|testing|pr[oó]ba|haha|hehe|lol|xd|żart|jaja|beka|dupa|g[łl]upoty|asdf|qwerty)\b/i,
    /(.)\1{5,}/,
    /^[a-ząćęłńóśźż]{1,3}(\s+[a-ząćęłńóśźż]{1,3}){3,}$/i,
  ];

  if (jokePatterns.some((pattern) => pattern.test(value))) return true;
  if (letters < 14 || spaces < 2 || uniqueChars < 8) return true;

  return false;
}

function extractPatterns(text) {
  const lower = normalizeText(text).toLowerCase();
  const patterns = [];

  if (lower.includes("zdrad")) patterns.push("zdrada");
  if (lower.includes("wróci") || lower.includes("wracam") || lower.includes("ex")) patterns.push("powrót");
  if (lower.includes("kontrol") || lower.includes("sprawdz")) patterns.push("kontrola");
  if (lower.includes("gaslight") || lower.includes("wmawia")) patterns.push("gaslighting");
  if (lower.includes("toksy")) patterns.push("toksyczny_układ");
  if (lower.includes("lęk") || lower.includes("boję") || lower.includes("samot")) patterns.push("lękowy_styl");
  if (lower.includes("obses") || lower.includes("stalk")) patterns.push("obsesyjność");
  if (lower.includes("rozstan")) patterns.push("rozstanie");
  if (lower.includes("schemat")) patterns.push("powtarzalny_schemat");
  if (lower.includes("napię")) patterns.push("napięcie");
  if (lower.includes("niepew")) patterns.push("niepewność");

  if (
    lower.includes("trzeci") ||
    lower.includes("inna osoba") ||
    lower.includes("inny facet") ||
    lower.includes("inna kobieta")
  ) {
    patterns.push("ktoś_trzeci");
  }

  return [...new Set(patterns)];
}

function crisisResponse(extraMessage) {
  return {
    ok: true,
    crisis: true,
    message:
      extraMessage ||
      "W treści pojawił się sygnał możliwego kryzysu. Standardowa analiza została zatrzymana.",
  };
}

function getSignedSecret() {
  return (
    process.env.REPORT_LINK_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.OPENAI_API_KEY ||
    "ctms-dev-secret"
  );
}

function createSignedSignature(token, exp) {
  return crypto
    .createHmac("sha256", getSignedSecret())
    .update(`${token}.${exp}`)
    .digest("hex");
}

function verifySignedSignature(token, exp, sig) {
  const now = Date.now();
  const expires = Number(exp);

  if (!Number.isFinite(expires) || expires < now) {
    return false;
  }

  const expected = createSignedSignature(token, String(exp));
  const a = Buffer.from(expected);
  const b = Buffer.from(String(sig));

  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

// ─── SESJA ───────────────────────────────────────────────────────────────────

exports.createSession = async (_req, res) => {
  try {
    const session = await prisma.session.create({ data: {} });
    return res.json({ ok: true, token: session.id, sessionId: session.id });
  } catch (error) {
    console.error("[API] Session create error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd serwera przy tworzeniu sesji." });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const token = normalizeText(req.body.token || req.body.sessionId || "");
    const payload = req.body.payload || {};
    const email = normalizeText(req.body.email || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    const existing = await prisma.session.findUnique({ where: { id: token } });
    if (!existing) {
      return res.status(404).json({ ok: false, message: "Nie znaleziono sesji." });
    }

    const updateData = { payload };
    if (email && isValidEmail(email)) updateData.email = email;

    await prisma.session.update({ where: { id: token }, data: updateData });

    return res.json({ ok: true, token });
  } catch (error) {
    console.error("[API] Session update error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd zapisu sesji." });
  }
};

exports.captureEmail = async (req, res) => {
  try {
    const token = normalizeText(req.body.token || req.body.sessionToken || "");
    const email = normalizeText(req.body.email || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy adres e-mail." });
    }

    const existing = await prisma.session.findUnique({ where: { id: token } });
    if (!existing) {
      return res.status(404).json({ ok: false, message: "Nie znaleziono sesji." });
    }

    await prisma.session.update({ where: { id: token }, data: { email } });

    return res.json({ ok: true });
  } catch (error) {
    console.error("[API] Capture email error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd zapisu e-maila." });
  }
};

// ─── ANALIZA ─────────────────────────────────────────────────────────────────

exports.analyzeText = async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "");
    const input = normalizeText(
      req.body.input || req.body.customDescription || req.body.openText || ""
    );
    const incomingPatterns = Array.isArray(req.body.patterns)
      ? req.body.patterns.slice(0, 20)
      : [];

    if (token && !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    if (!input || input.length < 10) {
      return res.status(400).json({ ok: false, message: "Za mało danych do analizy." });
    }

    if (input.length > 20000) {
      return res.status(400).json({ ok: false, message: "Opis jest zbyt długi." });
    }

    if (hasCrisisContent(input)) {
      return res.json(
        crisisResponse(
          "W treści pojawił się sygnał możliwego kryzysu lub przemocy. Standardowa analiza została zatrzymana."
        )
      );
    }

    if (hasLowQualityContent(input)) {
      return res.status(422).json({
        ok: false,
        code: "LOW_QUALITY_INPUT",
        message: "Opis wygląda na testowy, przypadkowy albo zbyt krótki. Podaj konkretne zdarzenia i fakty, żeby wynik miał sens.",
      });
    }

    const detectedPatterns = extractPatterns(input);
    const allPatterns = [...new Set([...incomingPatterns, ...detectedPatterns])];

    const payload = {
      path: normalizeText(req.body.path || ""),
      mode: req.body.mode === "hard" ? "hard" : "soft",
      patterns: allPatterns,
      customDescription: input,
      answers: Array.isArray(req.body.answers) ? req.body.answers.slice(0, 50) : [],
    };

    const preview = await openaiService.generatePreview(payload);

    if (token) {
      const existing = await prisma.session.findUnique({ where: { id: token } });

      if (existing) {
        await prisma.session.update({
          where: { id: token },
          data: { payload, preview_report: preview, patterns: allPatterns },
        });
      } else {
        await prisma.session.create({
          data: { id: token, payload, preview_report: preview, patterns: allPatterns },
        });
      }
    }

    return res.json({ ok: true, preview, patterns: allPatterns });
  } catch (error) {
    console.error("[API] Analyze error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd analizy." });
  }
};

// ─── CHECKPOINT ──────────────────────────────────────────────────────────────

exports.generateCheckpoint = async (req, res) => {
  try {
    const answers = Array.isArray(req.body.answers) ? req.body.answers.slice(0, 30) : [];
    const interviews = Array.isArray(req.body.interviews) ? req.body.interviews.slice(0, 10) : [];

    const rawText = [
      ...answers.map((a) => normalizeText(a.text || a.answer || a.label || "")),
      ...interviews.map((i) => normalizeText(i.userText || i.user || "")),
    ]
      .filter(Boolean)
      .join("\n");

    if (hasCrisisContent(rawText)) {
      return res.json(
        crisisResponse(
          "W odpowiedziach pojawiły się sygnały możliwego kryzysu. Standardowy checkpoint został zatrzymany."
        )
      );
    }

    const payload = {
      path: normalizeText(req.body.path || ""),
      mode: req.body.mode === "hard" ? "hard" : "soft",
      answers,
      patterns: Array.isArray(req.body.patterns) ? req.body.patterns.slice(0, 30) : [],
    };

    const checkpoint = await openaiService.generateCheckpoint(payload);
    return res.json({ ok: true, checkpoint });
  } catch (error) {
    console.error("[API] Checkpoint error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd checkpointu." });
  }
};

// ─── RAPORT ──────────────────────────────────────────────────────────────────

exports.getSessionData = async (req, res) => {
  try {
    const token = normalizeText(req.params.token || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    const session = await prisma.session.findUnique({
      where: { id: token },
      select: {
        id: true,
        email: true,
        preview_report: true,
        patterns: true,
        payment_status: true,
        report_status: true,
        created_at: true,
      },
    });

    if (!session) {
      return res.status(404).json({ ok: false, message: "Nie znaleziono sesji." });
    }

    return res.json({
      ok: true,
      session: { ...session, isPaid: session.payment_status === "PAID" },
    });
  } catch (error) {
    console.error("[API] Get session error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd pobierania sesji." });
  }
};

exports.getReport = async (req, res) => {
  try {
    const token = normalizeText(req.params.token || req.query.token || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    const session = await prisma.session.findUnique({
      where: { id: token },
      select: {
        payment_status: true,
        report_status: true,
        full_report: true,
        patterns: true,
        last_error: true,
      },
    });

    if (!session) {
      return res.status(404).json({ ok: false, message: "Nie znaleziono sesji." });
    }

    if (session.report_status === "READY" && session.full_report) {
      return res.json({ ok: true, report: session.full_report, patterns: session.patterns });
    }

    if (session.payment_status !== "PAID") {
      return res.status(402).json({ ok: false, message: "Raport nie został jeszcze opłacony." });
    }

    if (session.report_status === "QUEUED" || session.report_status === "PROCESSING") {
      return res.status(202).json({
        ok: false,
        pending: true,
        message: "Raport jest jeszcze przygotowywany.",
      });
    }

    if (session.report_status === "FAILED") {
      return res.status(500).json({
        ok: false,
        message: "Wystąpił błąd podczas przygotowania raportu.",
        error: session.last_error || null,
      });
    }

    return res.status(404).json({ ok: false, message: "Raport nie jest dostępny." });
  } catch (error) {
    console.error("[API] Report fetch error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd systemu pobierania raportu." });
  }
};

exports.getSignedReport = async (req, res) => {
  try {
    const token = normalizeText(req.query.token || "");
    const exp = normalizeText(req.query.exp || "");
    const sig = normalizeText(req.query.sig || "");

    if (!token || !exp || !sig || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy link dostępu." });
    }

    if (!verifySignedSignature(token, exp, sig)) {
      return res
        .status(403)
        .json({ ok: false, message: "Link dostępu wygasł albo jest nieprawidłowy." });
    }

    const session = await prisma.session.findUnique({
      where: { id: token },
      select: {
        payment_status: true,
        report_status: true,
        full_report: true,
      },
    });

    if (
      !session ||
      session.payment_status !== "PAID" ||
      session.report_status !== "READY" ||
      !session.full_report
    ) {
      return res.status(404).json({ ok: false, message: "Raport nie jest dostępny." });
    }

    return res.json({ ok: true, report: session.full_report });
  } catch (error) {
    console.error("[API] Signed report fetch error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd dostępu do raportu." });
  }
};
