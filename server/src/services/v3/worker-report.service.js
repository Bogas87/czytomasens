"use strict";

const prisma = require("../../db/prisma");
const v3Controller = require("../../controllers/v3.controller");
const history = require("./history.service");
const methodology = require("./methodology.service");

async function ensureV3Case(session, payload) {
  let item = await prisma.v3Case.findUnique({
    where: { session_id: session.id },
    select: { id: true, current_state: true },
  });
  if (item) return item;

  const path = payload?.input?.path || payload?.entryKey || payload?.path || "unease";
  const recoveryToken = String(payload?.recoveryToken || history.newToken());
  const input = payload?.input || {
    path,
    answers: [],
    context: {},
    interview: [],
    finalContext: "",
  };
  const caseModel = payload?.caseModel || await methodology.analyzeCaseFast({ input });

  item = await prisma.v3Case.create({
    data: {
      session_id: session.id,
      path,
      recovery_hash: history.tokenHash(recoveryToken),
      current_state: caseModel,
      boundaries: payload?.boundaries || {},
    },
    select: { id: true, current_state: true },
  });

  await prisma.v3Analysis.create({
    data: {
      case_id: item.id,
      input,
      case_model: caseModel,
      preview: caseModel.preview,
    },
  });

  return item;
}

async function generateV3WorkerReport({ session, payload }) {
  if (!session?.id) throw new Error("Brak sesji V3 w workerze.");

  await ensureV3Case(session, payload || {});
  const fullReport = await v3Controller.generateReportForWorker(session);
  const item = await prisma.v3Case.findUnique({
    where: { session_id: session.id },
    select: { current_state: true },
  });

  const finalCaseState = item?.current_state || payload?.caseModel || null;
  return {
    fullReport,
    finalCaseState,
    nextPayload: {
      ...(payload || {}),
      analysisVersion: "3.0",
      ...(finalCaseState ? { caseModel: finalCaseState } : {}),
    },
  };
}

module.exports = { generateV3WorkerReport };
