import crypto from "node:crypto";
import { Router } from "express";

const router = Router();

/**
 * HEALTH
 */
router.get("/health", (req, res) => {
  return res.json({
    ok: true,
    service: "CzyToMaSens API",
    model: process.env.OPENAI_MODEL || "gpt-4o",
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
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return res.json({
      ok: true,
      token: sessionId,
      sessionId: sessionId,
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
 * ZAPIS ODPOWIEDZI
 */
router.post("/session/save", async (req, res) => {
  try {
    const { sessionId, answers = {}, email = null } = req.body || {};

    if (!sessionId) {
      return res.status(400).json({
        ok: false,
        error: "Brak sessionId.",
      });
    }

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
 * CHECKPOINT / ANALIZA WSTĘPNA
 */
router.post("/analyze/checkpoint", async (req, res) => {
  try {
    const { answers = {}, entryKey = "default" } = req.body || {};

    return res.json({
      ok: true,
      checkpoint: {
        headline: "Tu jest coś, co wymaga dopowiedzenia.",
        question:
          "Gdybyś miał powiedzieć jedną rzecz, której unikasz nazwać wprost, co by to było?",
        tone: "neutral",
        entryKey,
        answersCount: Object.keys(answers || {}).length,
      },
    });
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
router.post("/analyze/preview", async (req, res) => {
  try {
    const { entryKey = "default", answers = {}, note = "" } = req.body || {};

    return res.json({
      ok: true,
      preview: {
        score: 57,
        badge: "yellow",
        headline: "Tu bardziej widać chwiejność niż spójność.",
        mirror:
          "Największy problem nie wygląda tu na brak uczuć, tylko na brak jasności, stabilności i równego zaangażowania.",
        indicators: [
          { label: "Jasność sytuacji", value: 41 },
          { label: "Spójność sygnałów", value: 48 },
          { label: "Szansa na zdrowy kierunek", value: 57 },
        ],
        summary:
          "Ta relacja nie wygląda na jednoznacznie straconą, ale w obecnym układzie bardziej produkuje napięcie niż poczucie bezpieczeństwa.",
        next:
          "Pełny raport pokazuje dominujące mechanizmy, główne ryzyka i najbardziej prawdopodobny kierunek rozwoju.",
        entryKey,
        answersCount: Object.keys(answers || {}).length,
        hasNote: Boolean(note),
      },
    });
  } catch (error) {
    console.error("POST /api/analyze/preview error:", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się wygenerować preview.",
    });
  }
});

export default router;