"use strict";

const prisma = require("../db/prisma.js");
const openaiService = require("../services/openai.service.js");
const caseReasoning = require("../services/case_reasoning.service.js");
const { verifySignedAccess } = require("../security/report-access.js");

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
    const email = normalizeText(req.body.email || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    const existing = await prisma.session.findUnique({ where: { id: token } });
    if (!existing) {
      return res.status(404).json({ ok: false, message: "Nie znaleziono sesji." });
    }

    const existingPayload = existing.payload && typeof existing.payload === "object" ? existing.payload : {};
    const nestedPayload = req.body.payload && typeof req.body.payload === "object" ? req.body.payload : null;
    const legacyPayload = { ...req.body };
    delete legacyPayload.token;
    delete legacyPayload.sessionId;
    delete legacyPayload.email;
    delete legacyPayload.payload;

    const incomingPayload = nestedPayload || legacyPayload;
    const interviewState = existing.interview_state && typeof existing.interview_state === "object"
      ? existing.interview_state
      : {};
    const serverCaseState = interviewState.caseState || existingPayload.caseState || null;

    const payload = {
      ...existingPayload,
      ...incomingPayload,
      ...(serverCaseState && !incomingPayload.caseState ? { caseState: serverCaseState } : {}),
    };

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

    const safety = caseReasoning.assessSafetyText(input);
    if (safety.level >= 2) {
      return res.json(
        crisisResponse(
          safety.level >= 3
            ? "W treści pojawił się sygnał możliwego bezpośredniego zagrożenia. Zwykła analiza została zatrzymana."
            : "W treści pojawił się konkretny sygnał przemocy lub realnego zagrożenia. Priorytetem jest teraz bezpieczeństwo, nie dalsza analiza relacji."
        )
      );
    }

    const detectedPatterns = extractPatterns(input);
    const allPatterns = [...new Set([...incomingPatterns, ...detectedPatterns])];

    let existing = null;
    if (token) {
      existing = await prisma.session.findUnique({ where: { id: token } });
    }

    const existingPayload = existing?.payload && typeof existing.payload === "object" ? existing.payload : {};
    const interviewState = existing?.interview_state && typeof existing.interview_state === "object" ? existing.interview_state : {};
    const payload = {
      ...existingPayload,
      path: normalizeText(req.body.path || existingPayload.path || ""),
      mode: req.body.mode === "hard" ? "hard" : (existingPayload.mode || "soft"),
      patterns: allPatterns,
      customDescription: input,
      openText: normalizeText(req.body.openText || input),
      answers: Array.isArray(req.body.answers) ? req.body.answers.slice(0, 50) : (existingPayload.answers || []),
      relationshipMap: req.body.relationshipMap || existingPayload.relationshipMap || {},
      ...(interviewState.caseState || existingPayload.caseState
        ? { caseState: interviewState.caseState || existingPayload.caseState }
        : {}),
      safetyLevel: safety.level,
    };

    const preview = await openaiService.generatePreview(payload);

    if (token) {
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

    const safety = caseReasoning.assessSafetyText(rawText);
    if (safety.level >= 2) {
      return res.json(
        crisisResponse(
          safety.level >= 3
            ? "W odpowiedziach pojawił się sygnał możliwego bezpośredniego zagrożenia. Standardowy checkpoint został zatrzymany."
            : "W odpowiedziach pojawił się konkretny sygnał przemocy lub realnego zagrożenia. Priorytetem jest teraz bezpieczeństwo."
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
  return res.status(403).json({
    ok: false,
    message: "Pełny raport jest dostępny wyłącznie przez bezpieczny link czasowy.",
  });
};

exports.getSignedReport = async (req, res) => {
  try {
    const token = normalizeText(req.query.token || "");
    const exp = normalizeText(req.query.exp || "");
    const sig = normalizeText(req.query.sig || "");

    if (!token || !exp || !sig || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy link dostępu." });
    }

    if (!verifySignedAccess(token, exp, sig)) {
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
