"use strict";

const prisma = require("../../db/prisma");

function retentionDays() {
  const raw = Number(process.env.DATA_RETENTION_DAYS || 90);
  return Number.isFinite(raw) ? Math.max(7, Math.min(3650, Math.round(raw))) : 90;
}

async function cleanupExpiredCases() {
  const cutoff = new Date(Date.now() - retentionDays() * 86400000);
  const expired = await prisma.v3Case.findMany({
    where: { updated_at: { lt: cutoff } },
    select: { session_id: true },
    take: 500,
  });
  if (!expired.length) return { removed: 0, cutoff };

  const sessionIds = expired.map((item) => item.session_id);
  await prisma.$transaction([
    prisma.v3Case.deleteMany({ where: { session_id: { in: sessionIds } } }),
    prisma.session.updateMany({
      where: { id: { in: sessionIds } },
      data: {
        email: null,
        payload: {},
        patterns: [],
        preview_report: null,
        full_report: null,
        interview_state: null,
        last_error: null,
      },
    }),
  ]);
  return { removed: sessionIds.length, cutoff };
}

module.exports = { cleanupExpiredCases, retentionDays };
