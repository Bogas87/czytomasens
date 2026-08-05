"use strict";
const { z } = require("zod");
const prisma = require("../db/prisma");
const methodology = require("../services/v3/methodology.service");
const reportService = require("../services/v3/report.service");
const protocols = require("../services/v3/protocols.service");
const history = require("../services/v3/history.service");
const boundariesService = require("../services/v3/boundaries.service");

const PATHS = ["unease","betrayal","uncertain","asymmetry","conflict","stagnation","returning","triangle","loop"];
const pathSchema = z.enum(PATHS);
const tokenSchema = z.string().uuid();
const recoverySchema = z.string().min(24).max(180);
const text = z.string().trim().max(12000);

function asyncHandler(fn) { return (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next); }
function bad(res, message, status=400) { return res.status(status).json({ ok:false, error:message }); }
async function getCaseBySession(sessionToken) {
  return prisma.v3Case.findUnique({ where:{ session_id:sessionToken }, include:{ analyses:{ orderBy:{ created_at:"desc" } }, protocols:{ orderBy:{ created_at:"desc" } }, checkins:{ orderBy:{ created_at:"desc" } } } });
}
async function getCaseByRecovery(rawToken) {
  return prisma.v3Case.findUnique({ where:{ recovery_hash:history.tokenHash(rawToken) }, include:{ analyses:{ orderBy:{ created_at:"desc" } }, protocols:{ orderBy:{ created_at:"desc" } }, checkins:{ orderBy:{ created_at:"desc" } } } });
}
function mapCase(item) {
  const active = item.protocols?.find((p)=>p.status === "ACTIVE") || null;
  return {
    caseId:item.id, path:item.path, createdAt:item.created_at, updatedAt:item.updated_at,
    currentState:item.current_state || null, boundaries:item.boundaries || null,
    analyses:(item.analyses||[]).map(a=>({ id:a.id, createdAt:a.created_at, preview:a.preview || null, report:a.report || null })),
    activeProtocol:active ? { id:active.id, title:active.title, dueAt:active.due_at, status:active.status, protocol:active.protocol } : null,
    checkins:(item.checkins||[]).map(c=>({ id:c.id, createdAt:c.created_at, kind:c.kind, input:c.input, result:c.result || null })),
    earlyWarning:history.earlyWarning(item.checkins || []),
  };
}

exports.start = asyncHandler(async (req,res) => {
  const path = pathSchema.parse(req.body?.path);
  const recoveryToken = history.newToken();
  const session = await prisma.session.create({ data:{ payload:{ analysisVersion:"3.0", path }, patterns:[] } });
  const item = await prisma.v3Case.create({ data:{ session_id:session.id, path, recovery_hash:history.tokenHash(recoveryToken), current_state:null } });
  res.json({ ok:true, sessionToken:session.id, recoveryToken, caseId:item.id });
});

exports.mirror = asyncHandler(async (req,res) => {
  const schema = z.object({ sessionToken:tokenSchema, path:pathSchema, answers:z.array(z.object({ question:text, answer:text, score:z.number().min(0).max(3) })).max(40) });
  const payload = schema.parse(req.body);
  if (!await getCaseBySession(payload.sessionToken)) return bad(res,"Nie znaleziono sprawy.",404);
  res.json({ ok:true, mirror:await methodology.generateMirror(payload) });
});

exports.nextQuestion = asyncHandler(async (req,res) => {
  const schema = z.object({ sessionToken:tokenSchema, path:pathSchema, step:z.number().int().min(0).max(3), answers:z.array(z.any()).max(50), context:z.record(z.any()), history:z.array(z.any()).max(6) });
  const payload = schema.parse(req.body);
  if (!await getCaseBySession(payload.sessionToken)) return bad(res,"Nie znaleziono sprawy.",404);
  res.json({ ok:true, ...(await methodology.nextInterviewQuestion(payload)) });
});

exports.analyze = asyncHandler(async (req,res) => {
  const schema = z.object({ sessionToken:tokenSchema, input:z.object({ path:pathSchema, answers:z.array(z.any()).max(60), context:z.record(z.any()), interview:z.array(z.any()).max(6), finalContext:text }) });
  const { sessionToken, input } = schema.parse(req.body);
  const item = await getCaseBySession(sessionToken);
  if (!item) return bad(res,"Nie znaleziono sprawy.",404);
  const caseModel = await methodology.analyzeCase({ sessionToken, input });
  const analysis = await prisma.v3Analysis.create({ data:{ case_id:item.id, input, case_model:caseModel, preview:caseModel.preview } });
  await prisma.v3Case.update({ where:{ id:item.id }, data:{ current_state:caseModel } });
  await prisma.session.update({ where:{ id:sessionToken }, data:{ payload:{ analysisVersion:"3.0", path:input.path, input, caseModel, boundaries:item.boundaries || {} }, preview_report:caseModel.preview, patterns:caseModel.discrepancies } });
  res.json({ ok:true, preview:caseModel.preview, caseModel, caseId:item.id, analysisId:analysis.id });
});

exports.boundaries = asyncHandler(async (req,res) => {
  const schema = z.object({ sessionToken:tokenSchema, boundaries:z.object({ improvementProof:text, unacceptableBehavior:text, observationWindow:text, userCommitment:text }) });
  const { sessionToken, boundaries } = schema.parse(req.body);
  const item = await getCaseBySession(sessionToken);
  if (!item) return bad(res,"Nie znaleziono sprawy.",404);
  await prisma.v3Case.update({ where:{ id:item.id }, data:{ boundaries } });
  const session = await prisma.session.findUnique({ where:{ id:sessionToken } });
  await prisma.session.update({ where:{ id:sessionToken }, data:{ payload:{ ...(session?.payload || {}), analysisVersion:"3.0", boundaries } } });
  res.json({ ok:true });
});

exports.startProtocol = asyncHandler(async (req,res) => {
  const schema = z.object({ sessionToken:tokenSchema, report:z.record(z.any()) });
  const { sessionToken, report } = schema.parse(req.body);
  const item = await getCaseBySession(sessionToken);
  if (!item) return bad(res,"Nie znaleziono sprawy.",404);
  const session = await prisma.session.findUnique({ where:{ id:sessionToken } });
  if (session?.payment_status !== "PAID" || session?.report_status !== "READY") return bad(res,"Protokół jest dostępny po przygotowaniu opłaconego raportu.",402);
  if (item.current_state?.safety?.protocolAllowed === false) return bad(res,"W tej sytuacji protokół relacyjny został wyłączony ze względów bezpieczeństwa.",409);
  await prisma.v3Protocol.updateMany({ where:{ case_id:item.id, status:"ACTIVE" }, data:{ status:"CANCELLED", completed_at:new Date() } });
  const chosen = protocols.choose(report?.recommendedProtocol?.key || item.current_state?.recommendedProtocol?.key, item.current_state);
  const dueAt = new Date(Date.now() + chosen.durationDays * 86400000);
  const row = await prisma.v3Protocol.create({ data:{ case_id:item.id, key:chosen.key, title:chosen.title, protocol:chosen, due_at:dueAt } });
  const recoveryToken = history.newToken();
  await prisma.v3Case.update({ where:{ id:item.id }, data:{ recovery_hash:history.tokenHash(recoveryToken) } });
  res.json({ ok:true, recoveryToken, recoveryUrl:history.publicUrl(recoveryToken), dueAt, protocolId:row.id });
});

exports.recover = asyncHandler(async (req,res) => {
  const raw = recoverySchema.parse(req.params.token);
  const item = await getCaseByRecovery(raw);
  if (!item) return bad(res,"Link historii jest nieprawidłowy albo wygasł.",404);
  res.json({ ok:true, case:mapCase(item) });
});

exports.protocolCheckin = asyncHandler(async (req,res) => {
  const schema = z.object({ recoveryToken:recoverySchema, protocolId:z.string().uuid(), result:z.object({ whatHappened:text, initiative:text, repeatedPattern:text, userCost:text, unusualCircumstances:text }) });
  const { recoveryToken, protocolId, result } = schema.parse(req.body);
  const item = await getCaseByRecovery(recoveryToken);
  if (!item) return bad(res,"Nie znaleziono historii.",404);
  const protocol = item.protocols.find(p=>p.id===protocolId && p.status==="ACTIVE");
  if (!protocol) return bad(res,"Nie znaleziono aktywnego protokołu.",404);
  const update = await methodology.analyzeCase({ sessionToken:item.session_id, input:{ path:item.path, answers:[], context:{}, interview:[{ question:`Wynik protokołu ${protocol.title}`, answer:JSON.stringify(result), focus:"reality_test" }], finalContext:JSON.stringify({ previous:item.current_state, protocol:protocol.protocol, result }) } });
  const boundaryComparison = await boundariesService.compare({ caseId:item.id, boundaries:item.boundaries || {}, checkin:result, previousState:item.current_state });
  const summary = boundaryComparison.message || update.preview?.essence || "Zapisano wynik protokołu.";
  await prisma.$transaction([
    prisma.v3Protocol.update({ where:{ id:protocol.id }, data:{ status:"COMPLETED", completed_at:new Date(), result } }),
    prisma.v3Checkin.create({ data:{ case_id:item.id, protocol_id:protocol.id, kind:"protocol", input:result, result:{ updatedCase:update, boundaryComparison, summary } } }),
    prisma.v3Case.update({ where:{ id:item.id }, data:{ current_state:update } }),
  ]);
  res.json({ ok:true, case:mapCase(await getCaseByRecovery(recoveryToken)) });
});

exports.weeklyCheckin = asyncHandler(async (req,res) => {
  const schema = z.object({ recoveryToken:recoverySchema, input:z.object({ concreteEvent:text, repeatedPattern:text, realChange:text, energyCost:text }) });
  const { recoveryToken, input } = schema.parse(req.body);
  const item = await getCaseByRecovery(recoveryToken);
  if (!item) return bad(res,"Nie znaleziono historii.",404);
  const boundaryComparison = await boundariesService.compare({ caseId:item.id, boundaries:item.boundaries || {}, checkin:input, previousState:item.current_state });
  const updatedCase = await methodology.analyzeCase({ sessionToken:item.session_id, input:{ path:item.path, answers:[], context:{}, interview:[{ question:"Cotygodniowy zapis rzeczywistości", answer:JSON.stringify(input), focus:"change_over_time" }], finalContext:JSON.stringify({ previous:item.current_state, boundaries:item.boundaries || {}, weeklyCheckin:input }) } });
  const summary = boundaryComparison.message || updatedCase.preview?.essence || "Zapisano tygodniową aktualizację.";
  await prisma.$transaction([
    prisma.v3Checkin.create({ data:{ case_id:item.id, kind:"weekly", input, result:{ updatedCase, boundaryComparison, summary } } }),
    prisma.v3Case.update({ where:{ id:item.id }, data:{ current_state:updatedCase } }),
  ]);
  res.json({ ok:true, case:mapCase(await getCaseByRecovery(recoveryToken)) });
});

exports.remove = asyncHandler(async (req,res) => {
  const { recoveryToken } = z.object({ recoveryToken:recoverySchema }).parse(req.body);
  const item = await getCaseByRecovery(recoveryToken);
  if (!item) return bad(res,"Nie znaleziono historii.",404);
  await prisma.session.delete({ where:{ id:item.session_id } });
  res.json({ ok:true });
});


exports.event = asyncHandler(async (req,res) => {
  const schema = z.object({ caseId:z.string().uuid().optional().nullable(), name:z.string().regex(/^[a-z0-9_:-]{2,80}$/), properties:z.record(z.any()).optional() });
  const data = schema.parse(req.body);
  await prisma.v3ProductEvent.create({ data:{ case_id:data.caseId || null, name:data.name, properties:data.properties || {} } });
  res.json({ ok:true });
});

exports.generateReportForWorker = async function(session) {
  const payload = session.payload || {};
  const item = await getCaseBySession(session.id);
  if (!item?.current_state) throw new Error("Brak modelu sprawy V3.");
  const report = await reportService.generateV3FullReport({ sessionToken:session.id, input:payload.input || {}, caseModel:item.current_state, boundaries:item.boundaries || payload.boundaries || {} });
  const latest = item.analyses?.[0];
  if (latest) await prisma.v3Analysis.update({ where:{ id:latest.id }, data:{ report, paid_at:new Date() } });
  return report;
};
