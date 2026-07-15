"use strict";

const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const analyzeController = require("../controllers/analyze.controller.js");
const stripeController = require("../controllers/stripe.controller.js");
const interviewController = require("../controllers/interview_controller.js");

const router = Router();

// ─── RATE LIMITY ─────────────────────────────────────────────────────────────
// Ograniczenie dla endpointów AI — każde wywołanie kosztuje pieniądze (OpenAI)
// Limit: 30 zapytań na 10 minut z jednego adresu IP
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minut
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Zbyt wiele zapytań. Poczekaj chwilę i spróbuj ponownie." },
  // Klucz oparty na IP — działa nawet bez nagłówka X-Forwarded-For
  keyGenerator: (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
});

// Łagodniejszy limit dla sesji i płatności — 60 na 10 minut
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Zbyt wiele zapytań. Poczekaj chwilę i spróbuj ponownie." },
  keyGenerator: (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
});

// ─── HEALTH ───────────────────────────────────────────────────────────────────
router.get("/health", (_req, res) => {
  return res.json({
    ok: true,
    service: "CzyToMaSens API",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    timestamp: new Date().toISOString(),
  });
});

// ─── SESJA ────────────────────────────────────────────────────────────────────
router.post("/session/create", generalLimiter, analyzeController.createSession);
router.post("/session/update", generalLimiter, analyzeController.updateSession);
router.post("/session/save", generalLimiter, analyzeController.updateSession);

router.post("/capture-email", generalLimiter, analyzeController.captureEmail);

// ─── ANALIZA AI ───────────────────────────────────────────────────────────────
// Wszystkie endpointy wywołujące OpenAI mają aiLimiter
router.post("/analyze", aiLimiter, analyzeController.analyzeText);
router.post("/analyze/preview", aiLimiter, analyzeController.analyzeText);

router.post("/checkpoint", aiLimiter, analyzeController.generateCheckpoint);
router.post("/analyze/checkpoint", aiLimiter, analyzeController.generateCheckpoint);

// ─── PŁATNOŚCI ────────────────────────────────────────────────────────────────
router.post("/create-checkout", generalLimiter, stripeController.createCheckout);
router.post("/stripe/checkout", generalLimiter, stripeController.createCheckout);

// ─── WYWIAD AI ────────────────────────────────────────────────────────────────
router.post("/interview/start", aiLimiter, interviewController.startInterview);
router.post("/interview/next", aiLimiter, interviewController.nextQuestion);
router.post("/interview/finish", aiLimiter, interviewController.finishInterview);

// ─── RAPORTY ──────────────────────────────────────────────────────────────────
router.get("/report/signed", analyzeController.getSignedReport);
router.get("/report/:token", analyzeController.getReport);
router.get("/session/:token", analyzeController.getSessionData);

// ─── 404 ──────────────────────────────────────────────────────────────────────
router.use((req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Nie znaleziono endpointu API.",
    path: req.originalUrl,
  });
});

module.exports = router;
