"use strict";

const { Router } = require("express");
const analyzeController = require("./analyze.controller.js");
const stripeController = require("./stripe.controller.js");

const router = Router();

router.get("/health", (_req, res) => {
  return res.json({
    ok: true,
    service: "CzyToMaSens API",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    timestamp: new Date().toISOString(),
  });
});

router.post("/session/create", analyzeController.createSession);
router.post("/session/update", analyzeController.updateSession);
router.post("/session/save", analyzeController.updateSession);

router.post("/capture-email", analyzeController.captureEmail);

router.post("/analyze", analyzeController.analyzeText);
router.post("/analyze/preview", analyzeController.analyzeText);

router.post("/checkpoint", analyzeController.generateCheckpoint);
router.post("/analyze/checkpoint", analyzeController.generateCheckpoint);

router.post("/create-checkout", stripeController.createCheckout);
router.post("/stripe/checkout", stripeController.createCheckout);

router.get("/report/signed", analyzeController.getSignedReport);
router.get("/report/:token", analyzeController.getReport);
router.get("/session/:token", analyzeController.getSessionData);

router.use((req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Nie znaleziono endpointu API.",
    path: req.originalUrl,
  });
});

module.exports = router;
