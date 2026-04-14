const prisma = require("../db/prisma");
const openaiService = require("../services/openai.service");

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid || ""
  );
}

function hasCrisisContent(text) {
  const lower = normalizeText(text).toLowerCase();
  const triggers = [
    "zabić się",
    "nie chcę żyć",
    "nie chce żyć",
    "samobój",
    "odebrać sobie życie",
    "skrzywdzić siebie",
    "krzywdę sobie",
  ];
  return triggers.some((t) => lower.includes(t));
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

exports.createSession = async (_req, res) => {
  try {
    const session = await prisma.session.create({ data: {} });
    return res.json({ ok: true, token: session.id });
  } catch (error) {
    console.error("[API] Session create error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd serwera przy tworzeniu sesji." });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "");
    const payload = req.body.payload || {};

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    const existing = await prisma.session.findUnique({ where: { id: token } });
    if (!existing) {
      return res.status(404).json({ ok: false, message: "Nie znaleziono sesji." });
    }

    await prisma.session.update({
      where: { id: token },
      data: { payload },
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("[API] Session update error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd zapisu sesji." });
  }
};

exports.analyzeText = async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "");
    const input = normalizeText(req.body.input || req.body.customDescription || "");
    const incomingPatterns = Array.isArray(req.body.patterns) ? req.body.patterns.slice(0, 20) : [];

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
      return res.json({
        ok: true,
        crisis: true,
        analysis:
          "Wygląda na to, że możesz być w kryzysie. To narzędzie nie jest właściwe w takiej sytuacji. Skontaktuj się z numerem 112 albo Centrum Wsparcia 800 70 2222.",
        patterns: incomingPatterns,
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
          data: {
            payload,
            preview_report: preview,
            patterns: allPatterns,
          },
        });
      } else {
        await prisma.session.create({
          data: {
            id: token,
            payload,
            preview_report: preview,
            patterns: allPatterns,
          },
        });
      }
    }

    return res.json({ ok: true, preview, patterns: allPatterns });
  } catch (error) {
    console.error("[API] Analyze error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd analizy." });
  }
};

exports.generateCheckpoint = async (req, res) => {
  try {
    const payload = {
      path: normalizeText(req.body.path || ""),
      mode: req.body.mode === "hard" ? "hard" : "soft",
      answers: Array.isArray(req.body.answers) ? req.body.answers.slice(0, 30) : [],
      patterns: Array.isArray(req.body.patterns) ? req.body.patterns.slice(0, 30) : [],
    };

    const checkpoint = await openaiService.generateCheckpoint(payload);
    return res.json({ ok: true, checkpoint });
  } catch (error) {
    console.error("[API] Checkpoint error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd checkpointu." });
  }
};

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
      session: {
        ...session,
        isPaid: session.payment_status === "PAID",
      },
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
      return res.json({
        ok: true,
        report: session.full_report,
        patterns: session.patterns,
      });
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
        message: "Wystąpił błąd podczas generowania raportu.",
        error: session.last_error || null,
      });
    }

    return res.status(404).json({ ok: false, message: "Raport nie jest dostępny." });
  } catch (error) {
    console.error("[API] Report fetch error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd systemu pobierania raportu." });
  }
};