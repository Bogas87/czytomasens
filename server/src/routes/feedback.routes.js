"use strict";

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const ALLOWED_RATINGS = new Set([1, 3, 5]);

async function ensureFeedbackSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ctms_report_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_token TEXT NOT NULL,
      report_kind TEXT NOT NULL DEFAULT 'full_report',
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT ctms_feedback_rating_check CHECK (rating IN (1, 3, 5))
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS ctms_report_feedback_session_idx
    ON ctms_report_feedback (session_token, created_at DESC)
  `);
}

router.post("/", async (req, res) => {
  try {
    const sessionToken = String(req.body?.sessionToken || "").trim();
    const reportKind = String(req.body?.reportKind || "full_report").trim().slice(0, 40);
    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment || "").trim().slice(0, 1000) || null;

    if (!sessionToken || !ALLOWED_RATINGS.has(rating)) {
      return res.status(400).json({ error: "Brak sesji albo nieprawidłowa ocena." });
    }

    const session = await prisma.session.findUnique({ where: { id: sessionToken }, select: { id: true } });
    if (!session) return res.status(404).json({ error: "Nie znaleziono raportu." });

    await ensureFeedbackSchema();
    await prisma.$executeRawUnsafe(
      `INSERT INTO ctms_report_feedback (session_token, report_kind, rating, comment) VALUES ($1, $2, $3, $4)`,
      sessionToken,
      reportKind,
      rating,
      comment
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error("[Feedback] save:", error);
    return res.status(500).json({ error: "Nie udało się zapisać oceny." });
  }
});

module.exports = router;
