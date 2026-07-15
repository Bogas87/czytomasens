"use strict";

/**
 * Dynamiczny wywiad CzyToMaSens.
 * Stan rozmowy zawiera również strukturyzowany caseState, który jest aktualizowany
 * po każdej odpowiedzi i później trafia do płatnego raportu przez updateSession().
 */

const prisma = require("../db/prisma.js");
const interviewService = require("../services/ai_interview_service.js");
const caseReasoning = require("../services/case_reasoning.service.js");

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid || "");
}

function safeJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const VALID_PATHS = [
  "unease",
  "betrayal",
  "uncertain",
  "asymmetry",
  "conflict",
  "stagnation",
  "returning",
  "triangle",
  "loop",
];

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

    const existing = await prisma.session.findUnique({
      where: { id: token },
      select: { payload: true, interview_state: true },
    });
    if (!existing) {
      return res.status(404).json({ ok: false, message: "Nie znaleziono sesji." });
    }

    const opening = await interviewService.getOpeningQuestion({ path, initialContext });
    const existingPayload = safeJson(existing.payload, {});
    const previousInterview = safeJson(existing.interview_state, {});
    const caseState = caseReasoning.normalizeCaseState(
      previousInterview.caseState || existingPayload.caseState || caseReasoning.createEmptyCaseState({ path, initialContext, source: "open_interview" }),
      previousInterview.caseState || existingPayload.caseState || null,
      "open_interview"
    );

    const stateAfterQuestion = caseReasoning.markQuestionAsked(
      caseState,
      { decision: "CLARIFY_FACT", target: "opening_fact" },
      opening.question
    );

    await prisma.session.update({
      where: { id: token },
      data: {
        interview_state: {
          path,
          initialContext,
          history: [],
          currentQuestion: opening.question,
          currentLead: opening.lead,
          currentObservation: opening.observation,
          depth: 1,
          startedAt: new Date().toISOString(),
          finished: false,
          caseState: stateAfterQuestion,
        },
        payload: {
          ...existingPayload,
          path,
          caseState: stateAfterQuestion,
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
      select: { interview_state: true, payload: true },
    });

    if (!session?.interview_state) {
      return res.status(400).json({ ok: false, message: "Brak aktywnego wywiadu. Zacznij od /interview/start." });
    }

    const state = safeJson(session.interview_state, {});
    const existingPayload = safeJson(session.payload, {});
    const updatedHistory = [
      ...(Array.isArray(state.history) ? state.history : []),
      {
        ai: state.currentQuestion,
        user: userAnswer,
        lead: state.currentLead || "",
        observation: state.currentObservation || "",
      },
    ];

    const caseState = await caseReasoning.updateCaseState({
      previousState: state.caseState || existingPayload.caseState,
      latestInput: userAnswer,
      source: "open_interview",
      context: {
        path: state.path,
        initialContext: state.initialContext,
        history: updatedHistory,
      },
    });

    const intervention = caseReasoning.routeIntervention(caseState, {
      latestInput: userAnswer,
      history: updatedHistory,
    });

    if (intervention.decision === "SAFETY_STOP") {
      await prisma.session.update({
        where: { id: token },
        data: {
          interview_state: {
            ...state,
            history: updatedHistory,
            finished: true,
            finishReason: intervention.safetyLevel >= 3 ? "immediate_danger" : "safety",
            caseState,
          },
          payload: { ...existingPayload, caseState },
        },
      });

      return res.json({
        ok: true,
        crisis: true,
        safetyLevel: intervention.safetyLevel,
        message: intervention.reason,
      });
    }

    const shouldFinishBeforeQuestion = caseReasoning.isAnalysisReady(caseState, updatedHistory.length, 5);
    if (shouldFinishBeforeQuestion) {
      await prisma.session.update({
        where: { id: token },
        data: {
          interview_state: {
            ...state,
            history: updatedHistory,
            currentQuestion: null,
            finished: true,
            finishReason: "analysis_ready",
            caseState,
          },
          payload: { ...existingPayload, caseState },
        },
      });

      return res.json({
        ok: true,
        finished: true,
        exchangeCount: updatedHistory.length,
        message: "Wywiad zebrał wystarczający materiał do dalszej analizy.",
      });
    }

    let next;
    try {
      next = await caseReasoning.generateNextQuestion({
        state: caseState,
        intervention,
        history: updatedHistory,
        latestInput: userAnswer,
        path: state.path,
        context: { initialContext: state.initialContext },
      });
    } catch (error) {
      console.warn("[Interview] Case router fallback:", error.message);
      next = await interviewService.getNextQuestion({
        path: state.path,
        history: updatedHistory,
        latestUserAnswer: userAnswer,
        initialContext: state.initialContext,
      });
    }

    const finished = Boolean(next.shouldStop) || updatedHistory.length >= 5;
    const stateAfterQuestion = finished
      ? caseState
      : caseReasoning.markQuestionAsked(caseState, intervention, next.question);

    const newState = {
      ...state,
      history: updatedHistory,
      currentQuestion: finished ? null : next.question,
      currentLead: finished ? "" : (next.lead || ""),
      currentObservation: finished ? "" : (next.observation || ""),
      depth: Math.min(5, updatedHistory.length + 1),
      finished,
      finishReason: finished ? (next.stopReason || "complete") : null,
      caseState: stateAfterQuestion,
    };

    await prisma.session.update({
      where: { id: token },
      data: {
        interview_state: newState,
        payload: { ...existingPayload, caseState: stateAfterQuestion },
      },
    });

    if (finished) {
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
      depth: Math.min(5, updatedHistory.length + 1),
      exchangeIndex: updatedHistory.length,
      finished: false,
    });
  } catch (error) {
    console.error("[Interview] Next question error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd generowania pytania." });
  }
};

exports.finishInterview = async (req, res) => {
  try {
    const token = normalizeText(req.body.token || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy token." });
    }

    const session = await prisma.session.findUnique({
      where: { id: token },
      select: { interview_state: true, payload: true, patterns: true },
    });

    if (!session?.interview_state) {
      return res.status(400).json({ ok: false, message: "Brak wywiadu do podsumowania." });
    }

    const state = safeJson(session.interview_state, {});
    const existingPayload = safeJson(session.payload, {});
    const currentPatterns = Array.isArray(session.patterns) ? session.patterns : safeJson(session.patterns, []);

    if (!state.history || state.history.length === 0) {
      return res.status(400).json({ ok: false, message: "Brak odpowiedzi do analizy." });
    }

    const summary = await interviewService.summarizeInterview({
      path: state.path,
      history: state.history,
      initialContext: state.initialContext,
      caseState: state.caseState,
    });

    const finalCaseState = await caseReasoning.updateCaseState({
      previousState: state.caseState || existingPayload.caseState,
      source: "open_interview_summary",
      context: {
        path: state.path,
        history: state.history,
        summary,
      },
    });

    const nextPatterns = [...new Set([
      ...currentPatterns,
      summary.riskLevel === "critical" ? "critical_risk" : null,
      summary.riskLevel === "high" ? "high_risk" : null,
      state.path,
    ].filter(Boolean))];

    await prisma.session.update({
      where: { id: token },
      data: {
        interview_state: { ...state, summary, finished: true, caseState: finalCaseState },
        payload: { ...existingPayload, caseState: finalCaseState, interviewSummary: summary },
        patterns: nextPatterns,
      },
    });

    return res.json({
      ok: true,
      summary,
      exchangeCount: state.history.length,
      path: state.path,
      interviewTranscript: state.history,
      caseStateVersion: "session",
    });
  } catch (error) {
    console.error("[Interview] Finish error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd podsumowania wywiadu." });
  }
};
