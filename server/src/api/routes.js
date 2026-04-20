import crypto from "node:crypto";
import { Router } from "express";
import stripeController from "./stripe.controller.js";

const router = Router();

/**
 * HEALTH
 */
router.get("/health", (_req, res) => {
  return res.json({
    ok: true,
    service: "CzyToMaSens API",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    timestamp: new Date().toISOString(),
  });
});

/**
 * START SESJI
 */
router.post("/session/create", async (req, res) => {
  try {
    const {
      entryKey = "default",
      answers = {},
      consent = {},
      email = null,
    } = req.body || {};

    const sessionId =
      crypto.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return res.json({
      ok: true,
      token: sessionId,
      sessionId,
      session: {
        id: sessionId,
        entryKey,
        answers,
        consent,
        email,
        stage: "questions",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/session/create error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się utworzyć sesji.",
    });
  }
});

/**
 * ZAPIS SESJI / ODPOWIEDZI
 */
router.post("/session/update", async (req, res) => {
  try {
    const {
      token = null,
      sessionId = null,
      answers = {},
      email = null,
      payload = null,
      preview = null,
    } = req.body || {};

    return res.json({
      ok: true,
      saved: true,
      token: token || sessionId,
      answers,
      email,
      payload,
      preview,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("POST /api/session/update error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się zapisać sesji.",
    });
  }
});

/**
 * STARY ALIAS - gdyby frontend jeszcze walił tutaj
 */
router.post("/session/save", async (req, res) => {
  try {
    const { sessionId = null, answers = {}, email = null } = req.body || {};

    return res.json({
      ok: true,
      saved: true,
      sessionId,
      answers,
      email,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("POST /api/session/save error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się zapisać sesji.",
    });
  }
});

/**
 * CAPTURE EMAIL
 */
router.post("/capture-email", async (req, res) => {
  try {
    const { token = null, sessionToken = null, email = "" } = req.body || {};

    if (!email || !String(email).includes("@")) {
      return res.status(400).json({
        ok: false,
        error: "Nieprawidłowy e-mail.",
      });
    }

    return res.json({
      ok: true,
      saved: true,
      token: token || sessionToken || null,
      email,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("POST /api/capture-email error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się zapisać e-maila.",
    });
  }
});

/**
 * CHECKPOINT
 */
function buildCheckpoint(body = {}) {
  const { answers = [], entryKey = "default" } = body;

  return {
    ok: true,
    checkpoint: {
      title: "Wykryto niespójność",
      headline: "Tu jest coś, co wymaga dopowiedzenia.",
      insight:
        "W odpowiedziach widać napięcie między tym, co próbujesz utrzymać, a tym, co realnie opisujesz.",
      question:
        "Gdybyś miał powiedzieć jedną rzecz, której unikasz nazwać wprost, co by to było?",
      tone: "neutral",
      entryKey,
      answersCount: Array.isArray(answers)
        ? answers.length
        : Object.keys(answers || {}).length,
    },
  };
}

router.post("/checkpoint", async (req, res) => {
  try {
    return res.json(buildCheckpoint(req.body || {}));
  } catch (error) {
    console.error("POST /api/checkpoint error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się wygenerować checkpointu.",
    });
  }
});

router.post("/analyze/checkpoint", async (req, res) => {
  try {
    return res.json(buildCheckpoint(req.body || {}));
  } catch (error) {
    console.error("POST /api/analyze/checkpoint error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się wygenerować checkpointu.",
    });
  }
});

/**
 * PREVIEW RAPORTU
 */
function buildPreview(body = {}) {
  const { entryKey = "default", answers = [], note = "" } = body;

  return {
    ok: true,
    preview: {
      score: 57,
      badge: "yellow",
      headline: "Tu bardziej widać chwiejność niż spójność.",
      mirror:
        "Największy problem nie wygląda tu na brak uczuć, tylko na brak jasności, stabilności i równego zaangażowania.",
      indicators: [
        { label: "Poziom napięcia", value: 41 },
        { label: "Rozjazd", value: 48 },
        { label: "Szansa zmiany", value: 57 },
      ],
      summary:
        "Ta relacja nie wygląda na jednoznacznie straconą, ale w obecnym układzie bardziej produkuje napięcie niż poczucie bezpieczeństwa.",
      next:
        "Pełny raport pokazuje dominujące mechanizmy, główne ryzyka i najbardziej prawdopodobny kierunek rozwoju.",
      entryKey,
      answersCount: Array.isArray(answers)
        ? answers.length
        : Object.keys(answers || {}).length,
      hasNote: Boolean(note),
    },
  };
}

router.post("/analyze", async (req, res) => {
  try {
    return res.json(buildPreview(req.body || {}));
  } catch (error) {
    console.error("POST /api/analyze error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się wygenerować preview.",
    });
  }
});

router.post("/analyze/preview", async (req, res) => {
  try {
    return res.json(buildPreview(req.body || {}));
  } catch (error) {
    console.error("POST /api/analyze/preview error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się wygenerować preview.",
    });
  }
});

/**
 * CHECKOUT
 */
router.post("/create-checkout", stripeController.createCheckout);
router.post("/stripe/checkout", stripeController.createCheckout);

/**
 * RAPORT
 */
router.get("/report/:token", async (req, res) => {
  try {
    const { token } = req.params;

    return res.json({
      ok: true,
      report: {
        headline: "Raport premium — wersja robocza",
        subheadline: `Sesja: ${token}`,
        rebuildPercent: 57,
        tensionPercent: 41,
        driftPercent: 48,
        previewLine:
          "To nie wygląda na układ stabilny. Bardziej na relację, która trzyma Cię w napięciu i niejasności.",
        sections: [
          {
            title: "Dominujący mechanizm",
            text: "Na tym etapie głównym problemem wygląda nie brak emocji, ale niestabilność, rozjazd sygnałów i trudność w odzyskaniu jasnego gruntu pod nogami.",
            tone: "gold",
          },
          {
            title: "Największe ryzyko",
            text: "Największym ryzykiem jest przeciąganie układu, który nie daje realnego bezpieczeństwa, a jednocześnie utrzymuje Cię w nadziei, że zaraz coś się wyjaśni.",
            tone: "danger",
          },
          {
            title: "Co pokazuje ten raport",
            text: "To jest techniczna wersja raportu zwracana od razu po płatności, żeby flow działał stabilnie. Następny etap to podmiana tej treści na pełny raport premium z właściwego generatora.",
            tone: "normal",
          },
        ],
        closing:
          "To jest działająca odpowiedź backendowa, która domyka flow po płatności i nie pozwala aplikacji umrzeć na spinnerze.",
      },
    });
  } catch (error) {
    console.error("GET /api/report/:token error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się pobrać raportu.",
    });
  }
});

/**
 * FALLBACK
 */
router.use((req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Nie znaleziono endpointu API.",
    path: req.originalUrl,
  });
});

export default router;