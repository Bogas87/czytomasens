"use strict";

const express = require("express");
const {
  upsertProfile,
  profileByRecoveryToken,
  scheduleReminder,
  saveCheckin,
  historyByRecoveryToken,
  updateCaseStateByRecoveryToken,
} = require("../services/followup.service.js");
const caseReasoning = require("../services/case_reasoning.service.js");

const router = express.Router();

router.post("/profile", async (req, res) => {
  try {
    if (!req.body?.sessionToken) return res.status(400).json({ error: "Brak tokenu sesji." });
    const profile = await upsertProfile(req.body);
    return res.json(profile);
  } catch (error) {
    console.error("[FollowUp] profile:", error);
    return res.status(500).json({ error: "Nie udało się utworzyć anonimowego profilu." });
  }
});

router.get("/recover/:token", async (req, res) => {
  try {
    const profile = await profileByRecoveryToken(req.params.token);
    if (!profile) return res.status(404).json({ error: "Link powrotu jest nieprawidłowy albo wygasł." });
    return res.json({
      profile: {
        sessionToken: profile.session_token,
        email: profile.email,
        selectedPath: profile.selected_path,
        baseline: profile.baseline,
        fullReport: profile.full_report,
        createdAt: profile.created_at,
        reminderDueAt: profile.reminder_due_at,
        caseVersion: Number(profile.case_version || 0),
      },
    });
  } catch (error) {
    console.error("[FollowUp] recover:", error);
    return res.status(500).json({ error: "Nie udało się przywrócić analizy." });
  }
});

router.post("/reminder", async (req, res) => {
  try {
    const { recoveryToken, email, days } = req.body || {};
    if (!recoveryToken || !email) return res.status(400).json({ error: "Podaj e-mail i token powrotu." });
    const saved = await scheduleReminder(recoveryToken, String(email).trim(), days);
    if (!saved) return res.status(404).json({ error: "Nie znaleziono anonimowego profilu." });
    return res.json({ ok: true, dueAt: saved.reminder_due_at });
  } catch (error) {
    console.error("[FollowUp] reminder:", error);
    return res.status(500).json({ error: "Nie udało się ustawić przypomnienia." });
  }
});

router.post("/checkin", async (req, res) => {
  try {
    const { recoveryToken, elapsedDays, answers, result } = req.body || {};
    if (!recoveryToken) return res.status(400).json({ error: "Brak tokenu powrotu." });
    const saved = await saveCheckin(recoveryToken, elapsedDays, answers, result);
    if (!saved) return res.status(404).json({ error: "Nie znaleziono anonimowego profilu." });
    return res.json({ ok: true, checkinId: saved.id, createdAt: saved.created_at });
  } catch (error) {
    console.error("[FollowUp] checkin:", error);
    return res.status(500).json({ error: "Nie udało się zapisać porównania." });
  }
});

async function hydrateState(context, recoveryToken) {
  let state = context.caseState;
  if (caseReasoning.hasMeaningfulCaseState(state)) return state;

  state = await caseReasoning.updateCaseState({
    previousState: state,
    source: "followup_legacy_hydration",
    context: caseReasoning.compactHistoryContext(context),
  });

  await updateCaseStateByRecoveryToken(recoveryToken, state, {
    source: "followup_legacy_hydration",
  });

  return state;
}

router.post("/start", async (req, res) => {
  try {
    const { recoveryToken } = req.body || {};
    if (!recoveryToken) return res.status(400).json({ error: "Brak tokenu powrotu." });

    const context = await historyByRecoveryToken(recoveryToken);
    if (!context) return res.status(404).json({ error: "Nie znaleziono historii analizy." });

    const state = await hydrateState(context, recoveryToken);
    const intervention = caseReasoning.routeIntervention(state, { history: [] });

    if (intervention.decision === "SAFETY_STOP") {
      return res.json({
        ok: true,
        crisis: true,
        safetyLevel: intervention.safetyLevel,
        message: intervention.reason,
      });
    }

    const question = await caseReasoning.generateNextQuestion({
      state,
      intervention,
      history: [],
      path: context.profile?.selectedPath || "",
      context: caseReasoning.compactHistoryContext(context),
    });

    const stateAfterQuestion = caseReasoning.markQuestionAsked(state, intervention, question.question);
    await updateCaseStateByRecoveryToken(recoveryToken, stateAfterQuestion, {
      source: "followup_question",
    });

    const elapsedDays = Math.max(0, Number(context.elapsedDays || 0));
    const referenceLabel = context.checkins?.length ? "poprzedniego odczytu" : "pierwszego odczytu";

    return res.json({
      ok: true,
      elapsedDays,
      intro: `Minęło ${elapsedDays} dni od ${referenceLabel}. Nie zaczynamy od zera — sprawdzamy, co wydarzyło się od tamtej pory.`,
      lead: question.lead,
      question: question.question,
      observation: question.observation,
      open: question.open,
      options: question.options,
      finished: false,
    });
  } catch (error) {
    console.error("[FollowUp] start:", error);
    return res.status(500).json({ error: "Nie udało się rozpocząć ponownego odczytu." });
  }
});

router.post("/next", async (req, res) => {
  try {
    const { recoveryToken, conversation, latestAnswer } = req.body || {};
    if (!recoveryToken) return res.status(400).json({ error: "Brak tokenu powrotu." });

    const context = await historyByRecoveryToken(recoveryToken);
    if (!context) return res.status(404).json({ error: "Nie znaleziono historii analizy." });

    const safeConversation = Array.isArray(conversation) ? conversation.slice(0, 12) : [];
    const state = await caseReasoning.updateCaseState({
      previousState: context.caseState,
      latestInput: String(latestAnswer || "").trim(),
      source: "followup_interview",
      context: {
        ...caseReasoning.compactHistoryContext(context),
        conversation: safeConversation,
      },
    });

    await updateCaseStateByRecoveryToken(recoveryToken, state, {
      source: "followup_interview",
    });

    const intervention = caseReasoning.routeIntervention(state, {
      latestInput: latestAnswer,
      history: safeConversation,
    });

    if (intervention.decision === "SAFETY_STOP") {
      return res.json({
        ok: true,
        crisis: true,
        safetyLevel: intervention.safetyLevel,
        message: intervention.reason,
      });
    }

    if (caseReasoning.isAnalysisReady(state, safeConversation.length, 6)) {
      return res.json({
        ok: true,
        finished: true,
        teaser: caseReasoning.buildPrivateTeaser(),
      });
    }

    const question = await caseReasoning.generateNextQuestion({
      state,
      intervention,
      history: safeConversation,
      latestInput: String(latestAnswer || "").trim(),
      path: context.profile?.selectedPath || "",
      context: caseReasoning.compactHistoryContext(context),
    });

    if (question.shouldStop) {
      return res.json({
        ok: true,
        finished: true,
        teaser: caseReasoning.buildPrivateTeaser(),
      });
    }

    const stateAfterQuestion = caseReasoning.markQuestionAsked(state, intervention, question.question);
    await updateCaseStateByRecoveryToken(recoveryToken, stateAfterQuestion, {
      source: "followup_question",
    });

    return res.json({
      ok: true,
      lead: question.lead,
      question: question.question,
      observation: question.observation,
      open: question.open,
      options: question.options,
      finished: false,
    });
  } catch (error) {
    console.error("[FollowUp] next:", error);
    return res.status(500).json({ error: "Nie udało się wygenerować kolejnego pytania." });
  }
});

module.exports = router;
