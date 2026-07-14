"use strict";

const express = require("express");
const {
  upsertProfile,
  profileByRecoveryToken,
  scheduleReminder,
  saveCheckin,
} = require("../services/followup.service.js");

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

module.exports = router;
