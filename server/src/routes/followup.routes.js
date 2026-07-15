"use strict";

const express = require("express");
const {
  upsertProfile,
  profileByRecoveryToken,
  scheduleReminder,
  saveCheckin,
  historyByRecoveryToken,
} = require("../services/followup.service.js");
const openaiService = require("../services/openai.service.js");

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


router.post("/start", async (req, res) => {
  try {
    const { recoveryToken } = req.body || {};
    if (!recoveryToken) return res.status(400).json({ error: "Brak tokenu powrotu." });
    const context = await historyByRecoveryToken(recoveryToken);
    if (!context) return res.status(404).json({ error: "Nie znaleziono historii analizy." });
    const elapsedDays = Math.max(0, Number(context.elapsedDays || 0));
    const question = await openaiService.generateDynamicFollowup({ context: { ...context, elapsedDays }, conversation: [], step: 1 });
    const referenceLabel = context.checkins?.length ? "poprzedniego odczytu" : "pierwszego odczytu";
    return res.json({ ok: true, elapsedDays, intro: `Minęło ${elapsedDays} dni od ${referenceLabel}. Nie zaczynamy od zera — sprawdzamy, co wydarzyło się od tamtej pory.`, ...question });
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
    const result = await openaiService.generateDynamicFollowup({ context, conversation: safeConversation, latestAnswer, step: safeConversation.length + 1 });
    return res.json({ ok: true, ...result });
  } catch (error) {
    console.error("[FollowUp] next:", error);
    return res.status(500).json({ error: "Nie udało się wygenerować kolejnego pytania." });
  }
});

module.exports = router;
