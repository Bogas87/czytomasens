const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");
const Stripe = require("stripe");
const OpenAI = require("openai");
const { Resend } = require("resend");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").trim();
const MODEL = (process.env.OPENAI_MODEL || "gpt-4o").trim();

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim());
const openai = new OpenAI({ apiKey: (process.env.OPENAI_API_KEY || "").trim() });
const resend = process.env.RESEND_API_KEY
  ? new Resend((process.env.RESEND_API_KEY || "").trim())
  : null;

const allowedOrigins = [CLIENT_URL].filter(Boolean);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Za dużo zapytań. Spróbuj później." },
});

const FRONTEND_DIST = path.join(__dirname, "..", "dist");

let db;

function normalizeText(value) {
  return String(value || "").trim();
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function isValidEmail(email) {
  const e = normalizeText(email);
  return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
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

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function scoreFromPatterns(patterns) {
  let tension = 32;
  let drift = 28;
  let rebuild = 62;

  if (patterns.includes("zdrada")) {
    tension += 22;
    drift += 18;
    rebuild -= 18;
  }
  if (patterns.includes("powrót")) {
    tension += 12;
    drift += 8;
    rebuild -= 10;
  }
  if (patterns.includes("kontrola")) {
    tension += 14;
    drift += 10;
    rebuild -= 12;
  }
  if (patterns.includes("gaslighting")) {
    tension += 22;
    drift += 20;
    rebuild -= 24;
  }
  if (patterns.includes("toksyczny_układ")) {
    tension += 15;
    drift += 12;
    rebuild -= 14;
  }
  if (patterns.includes("lękowy_styl")) {
    tension += 8;
    rebuild -= 6;
  }
  if (patterns.includes("obsesyjność")) {
    tension += 12;
    drift += 8;
    rebuild -= 10;
  }

  return {
    tensionPercent: clamp(tension, 10, 96),
    driftPercent: clamp(drift, 10, 94),
    rebuildPercent: clamp(rebuild, 8, 88),
  };
}

function buildFallbackPreview(payload, patterns) {
  const mode = payload.mode === "hard" ? "hard" : "soft";
  const scores = scoreFromPatterns(patterns);
  return {
    headline: scores.tensionPercent > 65 ? "To jest schemat" : "Coś tu pęka",
    subheadline:
      scores.rebuildPercent < 40
        ? "W tej formie relacja bardziej utrzymuje napięcie niż poczucie bezpieczeństwa."
        : "Tu nadal jest przestrzeń na zmianę, ale nie bez konfrontacji z mechanizmem.",
    previewLine:
      mode === "hard"
        ? "Największy problem nie wygląda tu na brak odpowiedzi. Bardziej na próbę obrony układu, który dawno przestał dawać spokój."
        : "Największy problem nie wygląda tu na jedną sytuację. Raczej na wzorzec, który wraca pod różnymi nazwami.",
    tensionPercent: scores.tensionPercent,
    driftPercent: scores.driftPercent,
    rebuildPercent: scores.rebuildPercent,
    sections: [
      {
        title: "Pierwszy ogląd",
        text:
          patterns.length > 0
            ? `W opisie widać mechanizmy: ${patterns.join(", ")}. To nie wygląda na drobiazg, tylko na wzór.`
            : "W opisie widać napięcie między tym, co czujesz, a tym, co próbujesz sobie wytłumaczyć.",
        tone: "normal",
      },
    ],
    closing:
      mode === "hard"
        ? "Jeśli fakty i decyzje idą w przeciwnych kierunkach, to zwykle nie emocje mają rację."
        : "Zanim nazwiesz to chemią albo losem, sprawdź, czy nie wracasz po prostu do znanego schematu.",
  };
}

async function generatePreview(payload) {
  const patterns = Array.isArray(payload.patterns) ? payload.patterns : [];
  const fallback = buildFallbackPreview(payload, patterns);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            'Jesteś chłodnym analitykiem wzorców relacyjnych. Nie diagnozujesz. Nie pocieszasz. Masz przygotować krótki, mocny preview raportu. Zwróć STRICT JSON: {"headline":"","subheadline":"","previewLine":"","tensionPercent":0,"driftPercent":0,"rebuildPercent":0,"sections":[{"title":"Pierwszy ogląd","text":"","tone":"normal"}],"closing":""}',
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = safeJsonParse(completion.choices?.[0]?.message?.content || "{}", null);
    if (!parsed) return fallback;

    parsed.tensionPercent = clamp(Number(parsed.tensionPercent || fallback.tensionPercent), 0, 100);
    parsed.driftPercent = clamp(Number(parsed.driftPercent || fallback.driftPercent), 0, 100);
    parsed.rebuildPercent = clamp(Number(parsed.rebuildPercent || fallback.rebuildPercent), 0, 100);

    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      parsed.sections = fallback.sections;
    }

    parsed.headline ||= fallback.headline;
    parsed.subheadline ||= fallback.subheadline;
    parsed.previewLine ||= fallback.previewLine;
    parsed.closing ||= fallback.closing;

    return parsed;
  } catch (error) {
    console.error("Preview AI error:", error.message);
    return fallback;
  }
}

async function generateCheckpoint(payload) {
  const fallback = {
    title: "Zatrzymaj się na chwilę",
    insight: "W Twoich odpowiedziach zaczyna być widać wzorzec, a nie tylko pojedyncze zdarzenie.",
    question: "Która część tego układu najbardziej przeczy temu, co próbujesz sobie o nim opowiedzieć?",
  };

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            'Jesteś chłodnym analitykiem relacji. Masz przerwać użytkownika krótkim checkpointem. Nie pocieszaj. Nie diagnozuj. Nazwij niespójność i zadaj jedno pytanie pod żebro. Zwróć STRICT JSON: {"title":"","insight":"","question":""}',
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
    });

    return safeJsonParse(completion.choices?.[0]?.message?.content || "{}", fallback) || fallback;
  } catch (error) {
    console.error("Checkpoint AI error:", error.message);
    return fallback;
  }
}

async function generateFullReport(payload) {
  const patterns = Array.isArray(payload.patterns)
    ? payload.patterns
    : extractPatterns(payload.customDescription || payload.input || "");

  const fallbackPreview = buildFallbackPreview(payload, patterns);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            'Jesteś chłodnym, analitycznym ekspertem od wzorców relacyjnych. Nie diagnozujesz. Nie pocieszasz. Nie używasz terapeutycznych klisz. Masz pokazać mechanizm, ukryte motywy i naturalny kierunek sytuacji. Zwróć STRICT JSON w formacie: {"headline":"","subheadline":"","previewLine":"","tensionPercent":0,"driftPercent":0,"rebuildPercent":0,"sections":[{"title":"Diagnostyka: Co tu się naprawdę dzieje","text":"","tone":"normal"},{"title":"Ukryte Motywy: Co Cię w tym trzyma","text":"","tone":"danger"},{"title":"Wnioski: Kierunek i schemat","text":"","tone":"gold"}],"closing":""}',
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = safeJsonParse(completion.choices?.[0]?.message?.content || "{}", null);
    if (!parsed) throw new Error("Empty report");

    parsed.tensionPercent = clamp(Number(parsed.tensionPercent || fallbackPreview.tensionPercent), 0, 100);
    parsed.driftPercent = clamp(Number(parsed.driftPercent || fallbackPreview.driftPercent), 0, 100);
    parsed.rebuildPercent = clamp(Number(parsed.rebuildPercent || fallbackPreview.rebuildPercent), 0, 100);

    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      parsed.sections = [
        {
          title: "Diagnostyka: Co tu się naprawdę dzieje",
          text: fallbackPreview.sections[0].text,
          tone: "normal",
        },
      ];
    }

    parsed.headline ||= fallbackPreview.headline;
    parsed.subheadline ||= fallbackPreview.subheadline;
    parsed.previewLine ||= fallbackPreview.previewLine;
    parsed.closing ||= fallbackPreview.closing;

    return parsed;
  } catch (error) {
    console.error("Full report AI error:", error.message);
    return {
      ...fallbackPreview,
      sections: [
        {
          title: "Diagnostyka: Co tu się naprawdę dzieje",
          text: fallbackPreview.sections[0].text,
          tone: "normal",
        },
        {
          title: "Ukryte Motywy: Co Cię w tym trzyma",
          text: "W opisie widać próbę utrzymania układu mimo sygnałów ostrzegawczych. To zwykle wynika nie tylko z uczuć, ale też z lęku, przywiązania do znanego schematu albo potrzeby odzyskania kontroli.",
          tone: "danger",
        },
        {
          title: "Wnioski: Kierunek i schemat",
          text: "Jeśli logika relacji się nie zmieni, napięcie będzie wracać nawet wtedy, gdy na chwilę zrobi się spokojniej. Zmienią się sceny, ale nie mechanizm.",
          tone: "gold",
        },
      ],
    };
  }
}

async function initDb() {
  db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      email TEXT,
      payload TEXT,
      preview_report TEXT,
      full_report TEXT,
      patterns TEXT,
      is_paid INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("Brak STRIPE_WEBHOOK_SECRET");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const token = session.metadata?.token || session.client_reference_id;
      if (!token) return res.json({ received: true });

      const existing = await db.get("SELECT * FROM sessions WHERE id = ?", [token]);
      if (!existing) return res.json({ received: true });

      const payload = safeJsonParse(existing.payload, {});
      const fullReport = await generateFullReport(payload);

      await db.run(
        `UPDATE sessions SET is_paid = 1, full_report = ? WHERE id = ?`,
        [JSON.stringify(fullReport), token]
      );

      if (existing.email && resend) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: existing.email,
            subject: "Twój pełny raport CzyToMaSens jest gotowy",
            html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Twój raport jest gotowy</h2><p>Kliknij poniżej, aby wrócić do aplikacji i odebrać pełny raport.</p><p><a href="${CLIENT_URL}?success=1&token=${token}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">Otwórz raport</a></p></div>`,
          });
        } catch (mailError) {
          console.error("Resend error:", mailError.message);
        }
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd webhooka" });
  }
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Brak dostępu CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "80kb" }));
app.use(express.urlencoded({ extended: true, limit: "80kb" }));
app.use("/api", limiter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/session/create", async (_req, res) => {
  try {
    const token = crypto.randomUUID();

    await db.run(
      `INSERT OR IGNORE INTO sessions (id, payload, patterns, is_paid) VALUES (?, ?, ?, 0)`,
      [token, JSON.stringify({}), JSON.stringify([])]
    );

    return res.json({ ok: true, token });
  } catch (error) {
    console.error("Session create error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd sesji." });
  }
});

app.post("/api/session/update", async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "");
    const payload = req.body.payload || {};

    if (!token) {
      return res.status(400).json({ ok: false, message: "Brak tokenu." });
    }

    const existing = await db.get("SELECT id FROM sessions WHERE id = ?", [token]);
    const patterns = Array.isArray(payload.patterns)
      ? payload.patterns
      : extractPatterns(payload.customDescription || payload.customText || payload.input || "");
    const preview = payload.preview || null;

    if (!existing) {
      await db.run(
        `INSERT INTO sessions (id, payload, preview_report, patterns, is_paid) VALUES (?, ?, ?, ?, 0)`,
        [
          token,
          JSON.stringify(payload),
          preview ? JSON.stringify(preview) : null,
          JSON.stringify(patterns),
        ]
      );
    } else {
      await db.run(
        `UPDATE sessions SET payload = ?, preview_report = COALESCE(?, preview_report), patterns = ? WHERE id = ?`,
        [
          JSON.stringify(payload),
          preview ? JSON.stringify(preview) : null,
          JSON.stringify(patterns),
          token,
        ]
      );
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error("Session update error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd zapisu sesji." });
  }
});

app.post("/api/checkpoint", async (req, res) => {
  try {
    const payload = {
      path: normalizeText(req.body.path || ""),
      mode: req.body.mode === "hard" ? "hard" : "soft",
      answers: Array.isArray(req.body.answers) ? req.body.answers.slice(0, 30) : [],
      patterns: Array.isArray(req.body.patterns) ? req.body.patterns.slice(0, 30) : [],
    };

    const checkpoint = await generateCheckpoint(payload);
    return res.json({ ok: true, checkpoint });
  } catch (error) {
    console.error("Checkpoint error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd checkpointu." });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "");
    const input = normalizeText(req.body.input || req.body.customDescription || "");
    const mode = req.body.mode === "hard" ? "hard" : "soft";
    const incomingPatterns = Array.isArray(req.body.patterns) ? req.body.patterns.slice(0, 20) : [];

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
          "Wygląda na to, że możesz być w kryzysie. To narzędzie nie jest właściwe w takiej sytuacji. Skontaktuj się z numerem 112, Centrum Wsparcia 800 70 2222 albo z najbliższym specjalistą.",
        patterns: incomingPatterns,
      });
    }

    const detectedPatterns = extractPatterns(input);
    const allPatterns = [...new Set([...incomingPatterns, ...detectedPatterns])];

    const payload = {
      path: normalizeText(req.body.path || ""),
      mode,
      patterns: allPatterns,
      customDescription: input,
      answers: Array.isArray(req.body.answers) ? req.body.answers.slice(0, 50) : [],
    };

    const preview = await generatePreview(payload);

    if (token) {
      const existing = await db.get("SELECT id FROM sessions WHERE id = ?", [token]);

      if (!existing) {
        await db.run(
          `INSERT INTO sessions (id, payload, preview_report, patterns, is_paid) VALUES (?, ?, ?, ?, 0)`,
          [token, JSON.stringify(payload), JSON.stringify(preview), JSON.stringify(allPatterns)]
        );
      } else {
        await db.run(
          `UPDATE sessions SET payload = ?, preview_report = ?, patterns = ? WHERE id = ?`,
          [JSON.stringify(payload), JSON.stringify(preview), JSON.stringify(allPatterns), token]
        );
      }
    }

    return res.json({ ok: true, preview, patterns: allPatterns });
  } catch (error) {
    console.error("Analyze error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd analizy." });
  }
});

app.post("/api/create-checkout", async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "") || crypto.randomUUID();
    const email = normalizeText(req.body.email || "");
    const payload = req.body.payload || {};
    const customDescription = normalizeText(
      payload.customDescription || payload.customText || payload.input || ""
    );

    if (!customDescription || customDescription.length < 10) {
      return res.status(400).json({ ok: false, message: "Brak treści do analizy." });
    }

    if (customDescription.length > 20000) {
      return res.status(400).json({ ok: false, message: "Opis jest zbyt długi." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy adres e-mail." });
    }

    const patterns = Array.isArray(payload.patterns)
      ? payload.patterns
      : extractPatterns(customDescription);

    const preview = payload.preview || buildFallbackPreview(payload, patterns);

    const existing = await db.get("SELECT id FROM sessions WHERE id = ?", [token]);

    if (!existing) {
      await db.run(
        `INSERT INTO sessions (id, email, payload, preview_report, patterns, is_paid) VALUES (?, ?, ?, ?, ?, 0)`,
        [
          token,
          email || null,
          JSON.stringify({ ...payload, customDescription, patterns }),
          JSON.stringify(preview),
          JSON.stringify(patterns),
        ]
      );
    } else {
      await db.run(
        `UPDATE sessions SET email = ?, payload = ?, preview_report = ?, patterns = ? WHERE id = ?`,
        [
          email || null,
          JSON.stringify({ ...payload, customDescription, patterns }),
          JSON.stringify(preview),
          JSON.stringify(patterns),
          token,
        ]
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "p24", "blik"],
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: "CzyToMaSens – pełny raport",
              description: "Rozszerzona analiza wzorców relacyjnych",
            },
            unit_amount: 4900,
          },
          quantity: 1,
        },
      ],
      metadata: { token },
      client_reference_id: token,
      success_url: `${CLIENT_URL}?success=1&token=${token}`,
      cancel_url: `${CLIENT_URL}?cancel=1`,
    });

    return res.json({
      ok: true,
      checkoutUrl: session.url,
      url: session.url,
      token,
    });
  } catch (error) {
    console.error("Checkout error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd płatności." });
  }
});

async function readReport(token, res) {
  const session = await db.get("SELECT * FROM sessions WHERE id = ?", [token]);

  if (!session) {
    return res.status(404).json({ ok: false, message: "Nie znaleziono sesji." });
  }

  if (!session.is_paid) {
    return res.status(402).json({ ok: false, message: "Raport nie został jeszcze opłacony." });
  }

  const fullReport = safeJsonParse(session.full_report, null);

  if (!fullReport) {
    return res.status(500).json({ ok: false, message: "Raport nie jest jeszcze gotowy." });
  }

  return res.json({
    ok: true,
    report: fullReport,
    patterns: safeJsonParse(session.patterns, []),
  });
}

app.get("/api/report/:token", async (req, res) => {
  try {
    const token = normalizeText(req.params.token || "");

    if (!token) {
      return res.status(400).json({ ok: false, message: "Brak tokenu." });
    }

    return await readReport(token, res);
  } catch (error) {
    console.error("Report fetch error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd pobierania raportu." });
  }
});

app.get("/api/report", async (req, res) => {
  try {
    const token = normalizeText(req.query.token || "");

    if (!token) {
      return res.status(400).json({ ok: false, message: "Brak tokenu." });
    }

    return await readReport(token, res);
  } catch (error) {
    console.error("Report fetch error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd pobierania raportu." });
  }
});

app.get("/api/session/:token", async (req, res) => {
  try {
    const token = normalizeText(req.params.token || "");

    if (!token) {
      return res.status(400).json({ ok: false, message: "Brak tokenu." });
    }

    const session = await db.get(
      "SELECT id, email, preview_report, patterns, is_paid, created_at FROM sessions WHERE id = ?",
      [token]
    );

    if (!session) {
      return res.status(404).json({ ok: false, message: "Nie znaleziono sesji." });
    }

    return res.json({
      ok: true,
      session: {
        id: session.id,
        email: session.email,
        preview: safeJsonParse(session.preview_report, null),
        patterns: safeJsonParse(session.patterns, []),
        isPaid: Boolean(session.is_paid),
        createdAt: session.created_at,
      },
    });
  } catch (error) {
    console.error("Session fetch error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd pobierania sesji." });
  }
});

app.use(express.static(FRONTEND_DIST));

app.get("/", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, message: "Nie znaleziono endpointu API." });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server działa na porcie ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("DB init error:", error.message);
    process.exit(1);
  });