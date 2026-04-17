const express = require("express");
const rateLimit = require("express-rate-limit");

const analyzeController = require("./analyze.controller");
const stripeController = require("./stripe.controller");

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Za dużo zapytań. Spróbuj później." },
});

router.use(apiLimiter);

router.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

router.post("/session/create", analyzeController.createSession);
router.post("/session/update", analyzeController.updateSession);
router.post("/capture-email", analyzeController.captureEmail);
router.post("/analyze", analyzeController.analyzeText);
router.post("/checkpoint", analyzeController.generateCheckpoint);

router.post("/create-checkout", stripeController.createCheckout);

router.get("/report/:token", analyzeController.getReport);
router.get("/report", analyzeController.getReport);
router.get("/report-access", analyzeController.getSignedReport);
router.get("/session/:token", analyzeController.getSessionData);

router.use((_req, res) => {
  res.status(404).json({ ok: false, message: "Nie znaleziono endpointu API." });
});

module.exports = router;