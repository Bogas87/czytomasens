"use strict";

const prisma = require("../db/prisma.js");
const interviewService = require("../services/ai_interview_service.js");

const MAX_EXCHANGES = 5; // Twarda granica — po 5 wymianach wywiad kończy się automatycznie

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid || "");
}

const VALID_PATHS = ["betrayal", "uncertain", "stagnation", "returning", "triangle", "loop"];

// ─── START ────────────────────────────────────────────────────────────────────

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

    const session = await prisma.session.findUnique({
      where: { id: token },
      select: { interview_state: true },
    });

    if (!session?.interview_state) {
      return res.status(400).json({ ok: false, message: "Brak aktywnego wywiadu." });
    }

    const state = typeof session.interview_state === "string"
      ? JSON.parse(session.interview_state)
      : session.interview_state;

    const updatedHistory = [
      ...state.history,
      { ai: state.currentQuestion, user: userAnswer },
    ];

    // TWARDA GRANICA — po MAX_EXCHANGES wymianach kończymy bez pytania AI
    if (updatedHistory.length >= MAX_EXCHANGES) {
      await prisma.session.update({
        where: { id: token },
        data: {
          interview_state: {
            ...state,
            history: updatedHistory,
            finished: true,
            finishReason: "complete",
          },
        },
      });
      return res.json({
        ok: true,
        finished: true,
        exchangeCount: updatedHistory.length,
      });
    }

    // Zapytaj AI o następne pytanie
    const next = await interviewService.getNextQuestion({
      path: state.path,
      history: updatedHistory,
      latestUserAnswer: userAnswer,
      initialContext: state.initialContext,
    });

    // Kryzys
    if (next.stopReason === "crisis") {
      await prisma.session.update({
        where: { id: token },
        data: { interview_state: { ...state, history: updatedHistory, finished: true, finishReason: "crisis" } },
      });
      return res.json({ ok: true, crisis: true });
    }

    // AI chce zatrzymać LUB osiągnęliśmy głębokość 5
    const shouldStop = next.shouldStop || next.depth >= 5;

    const newState = {
      ...state,
      history: updatedHistory,
      currentQuestion: shouldStop ? null : next.question,
      depth: Math.min(next.depth, 5),
      finished: shouldStop,
      finishReason: shouldStop ? (next.stopReason || "complete") : null,
    };

    await prisma.session.update({
      where: { id: token },
      data: { interview_state: newState },
    });

    if (shouldStop) {
      return res.json({ ok: true, finished: true, exchangeCount: updatedHistory.length });
    }

    return res.json({
      ok: true,
      question: next.question,
      lead: next.lead,
      observation: next.observation,
      depth: Math.min(next.depth, 5),
      exchangeIndex: updatedHistory.length,
      finished: false,
    });
  } catch (error) {
    console.error("[Interview] Next question error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd generowania pytania." });
  }
};

// ─── FINISH ───────────────────────────────────────────────────────────────────

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

    const summary = await interviewService.summarizeInterview({
      path: state.path,
      history: state.history,
      initialContext: state.initialContext,
    });

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
