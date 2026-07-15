"use strict";

/**
 * INTERVIEW CONTROLLER
 * Obsługuje dynamiczny wywiad AI — zastępuje statyczne pytania
 * konwersacją w której AI schodzi głębiej na podstawie odpowiedzi.
 *
 * Nowe endpointy:
 *   POST /api/interview/start      — pierwsze pytanie otwierające
 *   POST /api/interview/next       — następne pytanie na podstawie odpowiedzi
 *   POST /api/interview/finish     — podsumowanie wywiadu, gotowe do analizy
 */

const prisma = require("../db/prisma.js");
const interviewService = require("../services/ai_interview_service.js");

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid || "");
}

const VALID_PATHS = ["betrayal", "uncertain", "stagnation", "returning", "triangle", "loop"];

// ─── START WYWIADU ────────────────────────────────────────────────────────────

/**
 * POST /api/interview/start
 * Body: { token, path, initialContext }
 * Zwraca pierwsze pytanie AI.
 */
exports.startInterview = async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "");
    const path = normalizeText(req.body.path || "");
    const initialContext = normalizeText(req.body.initialContext || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    if (!VALID_PATHS.includes(path)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowa ścieżka analizy." });
    }

    const opening = await interviewService.getOpeningQuestion({ path, initialContext });

    // Zapisz stan wywiadu w sesji
    await prisma.session.update({
      where: { id: token },
      data: {
        interview_state: {
          path,
          initialContext,
          history: [],
          currentQuestion: opening.question,
          depth: 1,
          startedAt: new Date().toISOString(),
        },
      },
    });

    return res.json({
      ok: true,
      question: opening.question,
      lead: opening.lead,
      observation: opening.observation,
      depth: 1,
      exchangeIndex: 0,
    });
  } catch (error) {
    console.error("[Interview] Start error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd inicjalizacji wywiadu." });
  }
};

// ─── NASTĘPNE PYTANIE ─────────────────────────────────────────────────────────

/**
 * POST /api/interview/next
 * Body: { token, userAnswer }
 * Zwraca następne pytanie AI lub sygnał zakończenia.
 */
exports.nextQuestion = async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "");
    const userAnswer = normalizeText(req.body.userAnswer || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    if (!userAnswer || userAnswer.length < 5) {
      return res.status(400).json({ ok: false, message: "Za krótka odpowiedź." });
    }

    if (userAnswer.length > 5000) {
      return res.status(400).json({ ok: false, message: "Odpowiedź zbyt długa (max 5000 znaków)." });
    }

    // Pobierz stan wywiadu
    const session = await prisma.session.findUnique({
      where: { id: token },
      select: { interview_state: true },
    });

    if (!session?.interview_state) {
      return res.status(400).json({ ok: false, message: "Brak aktywnego wywiadu. Zacznij od /interview/start." });
    }

    const state = typeof session.interview_state === "string"
      ? JSON.parse(session.interview_state)
      : session.interview_state;

    // Dodaj odpowiedź użytkownika do historii
    const updatedHistory = [
      ...state.history,
      { ai: state.currentQuestion, user: userAnswer },
    ];

    // Zapytaj AI o następne pytanie
    const next = await interviewService.getNextQuestion({
      path: state.path,
      history: updatedHistory,
      latestUserAnswer: userAnswer,
      initialContext: state.initialContext,
    });

    // Obsługa kryzysu
    if (next.stopReason === "crisis") {
      await prisma.session.update({
        where: { id: token },
        data: {
          interview_state: {
            ...state,
            history: updatedHistory,
            finished: true,
            finishReason: "crisis",
          },
        },
      });
      return res.json({ ok: true, crisis: true });
    }

    // Zapisz nowy stan
    const newState = {
      ...state,
      history: updatedHistory,
      currentQuestion: next.shouldStop ? null : next.question,
      depth: next.depth,
      finished: next.shouldStop,
      finishReason: next.shouldStop ? (next.stopReason || "complete") : null,
    };

    await prisma.session.update({
      where: { id: token },
      data: { interview_state: newState },
    });

    if (next.shouldStop) {
      return res.json({
        ok: true,
        finished: true,
        exchangeCount: updatedHistory.length,
        message: "Wywiad zakończony. Przejdź do /interview/finish po podsumowanie.",
      });
    }

    return res.json({
      ok: true,
      question: next.question,
      lead: next.lead,
      observation: next.observation,
      depth: next.depth,
      exchangeIndex: updatedHistory.length,
      finished: false,
    });
  } catch (error) {
    console.error("[Interview] Next question error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd generowania pytania." });
  }
};

// ─── ZAKOŃCZENIE I PODSUMOWANIE ───────────────────────────────────────────────

/**
 * POST /api/interview/finish
 * Body: { token }
 * Zwraca podsumowanie wzorców gotowe do przekazania do głównej analizy.
 */
exports.finishInterview = async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    const session = await prisma.session.findUnique({
      where: { id: token },
      select: { interview_state: true },
    });

    if (!session?.interview_state) {
      return res.status(400).json({ ok: false, message: "Brak wywiadu do podsumowania." });
    }

    const state = typeof session.interview_state === "string"
      ? JSON.parse(session.interview_state)
      : session.interview_state;

    if (!state.history || state.history.length === 0) {
      return res.status(400).json({ ok: false, message: "Brak odpowiedzi do analizy." });
    }

    // Podsumuj wywiad
    const summary = await interviewService.summarizeInterview({
      path: state.path,
      history: state.history,
      initialContext: state.initialContext,
    });

    // Zapisz podsumowanie w sesji (będzie użyte przez główną analizę)
    await prisma.session.update({
      where: { id: token },
      data: {
        interview_state: { ...state, summary, finished: true },
        patterns: [
          summary.riskLevel === "critical" ? "critical_risk" : null,
          summary.riskLevel === "high" ? "high_risk" : null,
          state.path,
        ].filter(Boolean),
      },
    });

    return res.json({
      ok: true,
      summary,
      exchangeCount: state.history.length,
      path: state.path,
      interviewTranscript: state.history,
    });
  } catch (error) {
    console.error("[Interview] Finish error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd podsumowania wywiadu." });
  }
};
