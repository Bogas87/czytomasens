"use strict";

const express = require("express");
const rateLimit = require("express-rate-limit");
const c = require("../controllers/couple.controller");

const router = express.Router();
const normal = rateLimit({ windowMs: 10 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: { ok: false, error: "Zbyt wiele zapytań. Poczekaj chwilę." } });
const ai = rateLimit({ windowMs: 10 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { ok: false, error: "Limit analizy został chwilowo osiągnięty." } });

router.post("/create", normal, c.create);
router.post("/join", normal, c.join);
router.get("/state/:token", normal, c.state);
router.post("/answer", ai, c.answer);
router.post("/intake/complete", ai, c.completeIntake);
router.post("/share/approve", ai, c.approveShare);
router.post("/reflection", ai, c.reflection);
router.post("/experiment/accept", normal, c.experimentAccept);
router.post("/experiment/checkin", ai, c.experimentCheckin);

module.exports = router;
