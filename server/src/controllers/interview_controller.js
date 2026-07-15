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
  const startedAt = Date.now();
  try {
    const token = normalizeText(req.body.token || "");
    const path = normalizeText(req.body.path || "");
    const initialContext = normalizeText(req.body.initialContext || "");
    const initialData = req.body?.initialData && typeof req.body.initialData === "object" ? req.body.initialData : {};

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

    const existingPayload = safeJson(existing.payload, {});
    const previousInterview = safeJson(existing.interview_state, {});
    const previousCaseState = previousInterview.caseState || existingPayload.caseState || null;
    const baseCaseState = caseReasoning.normalizeCaseState(
      previousCaseState || caseReasoning.createEmptyCaseState({ path, source: "initial_assessment" }),
      previousCaseState,
      "initial_assessment"
    );

    // Jedno wywołanie AI zamiast: pełna aktualizacja Case State + osobne generowanie pytania.
    const turn = await caseReasoning.processInterviewTurn({
      previousState: baseCaseState,
      latestInput: initialContext,
      source: "initial_assessment",
      history: [],
      path,
      openingQuestion: true,
      context: {
        initialData,
        initialContext,
        openingQuestion: true,
      },
    });

    const caseState = turn.caseState;
    const intervention = turn.intervention;

    if (intervention?.decision === "SAFETY_STOP" || turn.question?.shouldStop) {
      await prisma.session.update({
        where: { id: token },
        data: {
          interview_state: {
            path,
            initialContext,
            initialData,
            history: [],
            currentQuestion: null,
            currentLead: "",
            currentObservation: turn.question?.observation || intervention?.reason || "",
            depth: 0,
            startedAt: new Date().toISOString(),
            finished: true,
            finishReason: turn.question?.stopReason || (intervention?.safetyLevel >= 3 ? "immediate_danger" : "safety"),
            caseState,
          },
          payload: {
            ...existingPayload,
            path,
            initialAssessment: initialData,
            caseState,
          },
        },
      });

      console.info(`[Interview] start ${Date.now() - startedAt}ms source=${turn.source || "unknown"} safety`);
      return res.json({
        ok: true,
        crisis: true,
        safetyLevel: intervention?.safetyLevel || 2,
        message: turn.question?.observation || intervention?.reason || "Priorytetem jest bezpieczeństwo.",
      });
    }

    let opening = turn.question;
    if (!opening?.question) {
      // Awaryjnie tylko wtedy wykonujemy starszy generator.
      opening = await interviewService.getOpeningQuestion({ path, initialContext, initialData });
    }

    const stateAfterQuestion = caseReasoning.markQuestionAsked(
      caseState,
      intervention,
      opening.question
    );

    await prisma.session.update({
      where: { id: token },
      data: {
        interview_state: {
          path,
          initialContext,
          initialData,
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
          initialAssessment: initialData,
          caseState: stateAfterQuestion,
        },
      },
    });

    const latencyMs = Date.now() - startedAt;
    console.info(`[Interview] start ${latencyMs}ms source=${turn.source || "unknown"}`);
    return res.json({
      ok: true,
      question: opening.question,
      lead: opening.lead,
      observation: opening.observation,
      depth: 1,
      exchangeIndex: 0,
      latencyMs,
    });
  } catch (error) {
    console.error("[Interview] Start error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd inicjalizacji wywiadu." });
  }
};

exports.nextQuestion = async (req, res) => {
  const startedAt = Date.now();
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

    // Po piątej odpowiedzi nie generujemy niepotrzebnego szóstego pytania.
    if (updatedHistory.length >= 5) {
      const caseState = caseReasoning.fastIngestCaseState(
        state.caseState || existingPayload.caseState,
        { latestInput: userAnswer, source: "open_interview" }
      );

      await prisma.session.update({
        where: { id: token },
        data: {
          interview_state: {
            ...state,
            history: updatedHistory,
            currentQuestion: null,
            currentLead: "",
            currentObservation: "",
            depth: 5,
            finished: true,
            finishReason: "max_questions",
            caseState,
          },
          payload: { ...existingPayload, caseState },
        },
      });

      const latencyMs = Date.now() - startedAt;
      console.info(`[Interview] next ${latencyMs}ms source=local_final_ingest`);
      return res.json({
        ok: true,
        finished: true,
        exchangeCount: updatedHistory.length,
        message: "Wywiad zebrał pełny materiał do dalszej analizy.",
        latencyMs,
      });
    }

    // Jedna tura = jedno wywołanie AI: aktualizacja delty stanu + następne pytanie.
    const turn = await caseReasoning.processInterviewTurn({
      previousState: state.caseState || existingPayload.caseState,
      latestInput: userAnswer,
      source: "open_interview",
      history: updatedHistory,
      path: state.path,
      context: {
        initialContext: state.initialContext,
        initialData: state.initialData || existingPayload.initialAssessment || {},
      },
    });

    const caseState = turn.caseState;
    const intervention = turn.intervention;
    const next = turn.question;

    if (intervention?.decision === "SAFETY_STOP" || next?.stopReason === "safety" || next?.stopReason === "immediate_danger") {
      await prisma.session.update({
        where: { id: token },
        data: {
          interview_state: {
            ...state,
            history: updatedHistory,
            finished: true,
            finishReason: next?.stopReason || (intervention?.safetyLevel >= 3 ? "immediate_danger" : "safety"),
            caseState,
          },
          payload: { ...existingPayload, caseState },
        },
      });

      console.info(`[Interview] next ${Date.now() - startedAt}ms source=${turn.source || "unknown"} safety`);
      return res.json({
        ok: true,
        crisis: true,
        safetyLevel: intervention?.safetyLevel || 2,
        message: next?.observation || intervention?.reason || "Priorytetem jest bezpieczeństwo.",
      });
    }

    const analysisReady = caseReasoning.isAnalysisReady(caseState, updatedHistory.length, 5);
    if (analysisReady || next?.shouldStop) {
      await prisma.session.update({
        where: { id: token },
        data: {
          interview_state: {
            ...state,
            history: updatedHistory,
            currentQuestion: null,
            currentLead: "",
            currentObservation: "",
            finished: true,
            finishReason: next?.stopReason || "analysis_ready",
            caseState,
          },
          payload: { ...existingPayload, caseState },
        },
      });

      const latencyMs = Date.now() - startedAt;
      console.info(`[Interview] next ${latencyMs}ms source=${turn.source || "unknown"} finished`);
      return res.json({
        ok: true,
        finished: true,
        exchangeCount: updatedHistory.length,
        message: "Wywiad zebrał wystarczający materiał do dalszej analizy.",
        latencyMs,
      });
    }

    let nextQuestion = next;
    if (!nextQuestion?.question) {
      // Awaryjnie tylko przy niepoprawnej odpowiedzi nowego mechanizmu.
      nextQuestion = await interviewService.getNextQuestion({
        path: state.path,
        history: updatedHistory,
        latestUserAnswer: userAnswer,
        initialContext: state.initialContext,
        initialData: state.initialData || existingPayload.initialAssessment || {},
      });
    }

    const stateAfterQuestion = caseReasoning.markQuestionAsked(
      caseState,
      intervention,
      nextQuestion.question
    );

    const newState = {
      ...state,
      history: updatedHistory,
      currentQuestion: nextQuestion.question,
      currentLead: nextQuestion.lead || "",
      currentObservation: nextQuestion.observation || "",
      depth: Math.min(5, updatedHistory.length + 1),
      finished: false,
      finishReason: null,
      caseState: stateAfterQuestion,
    };

    await prisma.session.update({
      where: { id: token },
      data: {
        interview_state: newState,
        payload: { ...existingPayload, caseState: stateAfterQuestion },
      },
    });

    const latencyMs = Date.now() - startedAt;
    console.info(`[Interview] next ${latencyMs}ms source=${turn.source || "unknown"}`);
    return res.json({
      ok: true,
      question: nextQuestion.question,
      lead: nextQuestion.lead,
      observation: nextQuestion.observation,
      depth: Math.min(5, updatedHistory.length + 1),
      exchangeIndex: updatedHistory.length,
      finished: false,
      latencyMs,
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
