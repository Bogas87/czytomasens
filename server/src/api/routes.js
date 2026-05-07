"use strict";

const crypto = require("crypto");
const { Router } = require("express");
const analyzeController = require("./analyze.controller.js");
const stripeController = require("./stripe.controller.js");

const router = Router();

// ─── HEALTH ──────────────────────────────────────────────────────────────────

router.get("/health", (_req, res) => {
  return res.json({
    ok: true,
    service: "CzyToMaSens API",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    timestamp: new Date().toISOString(),
  });
});

// ─── SESJA ───────────────────────────────────────────────────────────────────

router.post("/session/create", analyzeController.createSession);
router.post("/session/update", analyzeController.updateSession);
router.post("/session/save", analyzeController.updateSession); // stary alias

// ─── EMAIL ───────────────────────────────────────────────────────────────────

router.post("/capture-email", analyzeController.captureEmail);

// ─── ANALIZA / PREVIEW ───────────────────────────────────────────────────────

router.post("/analyze", analyzeController.analyzeText);
router.post("/analyze/preview", analyzeController.analyzeText);

// ─── CHECKPOINT ──────────────────────────────────────────────────────────────

router.post("/checkpoint", analyzeController.generateCheckpoint);
router.post("/analyze/checkpoint", analyzeController.generateCheckpoint);

// ─── CHECKOUT ────────────────────────────────────────────────────────────────

router.post("/create-checkout", stripeController.createCheckout);
router.post("/stripe/checkout", stripeController.createCheckout);

// ─── RAPORT ──────────────────────────────────────────────────────────────────

// UWAGA: "signed" musi być PRZED ":token" — inaczej Express pomyli je ze sobą
router.get("/report/signed", analyzeController.getSignedReport);
router.get("/report/:token", analyzeController.getReport);
router.get("/session/:token", analyzeController.getSessionData);

// ─── FALLBACK ────────────────────────────────────────────────────────────────

router.use((req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Nie znaleziono endpointu API.",
    path: req.originalUrl,
  });
});

module.exports = router;
const interviewController = require("./interview.controller.js");
router.post("/interview/start", interviewController.startInterview);
router.post("/interview/next", interviewController.nextQuestion);
router.post("/interview/finish", interviewController.finishInterview);