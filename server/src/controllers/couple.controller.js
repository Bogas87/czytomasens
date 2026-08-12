"use strict";

const { z } = require("zod");
const prisma = require("../db/prisma");
const ai = require("../services/couple/couple-ai.service");
const util = require("../services/couple/couple.service");

const participantTokenSchema = z.string().min(30).max(200);
const shortText = z.string().trim().max(12000);
const shareSchema = z.object({
  summary: shortText.min(4),
  whatISee: shortText.min(4),
  whatMatters: shortText.min(4),
  whatINeed: shortText.min(4),
  whatIDontKnow: shortText.min(4),
});

function asyncHandler(fn) { return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); }
function bad(res, message, status = 400) { return res.status(status).json({ ok: false, error: message }); }

async function participantByToken(rawToken) {
  return prisma.coupleParticipant.findUnique({
    where: { token_hash: util.hash(rawToken) },
    include: {
      couple: {
        include: {
          participants: { include: { answers: { orderBy: { created_at: "asc" } }, reflections: { orderBy: { created_at: "asc" } } } },
          comparisons: { orderBy: { revision: "desc" }, take: 1 },
          experiments: { orderBy: { created_at: "desc" }, take: 1, include: { checkins: true } },
        },
      },
      answers: { orderBy: { created_at: "asc" } },
      reflections: { orderBy: { created_at: "asc" } },
    },
  });
}

function latestComparison(couple) {
  return couple?.comparisons?.[0] || null;
}

function approvedParticipants(couple) {
  return (couple?.participants || []).filter((p) => p.share_approved);
}

function publicComparisonFor(slot, comparison) {
  if (!comparison?.model) return null;
  const model = comparison.model;
  return {
    sharedReality: model.sharedReality || [],
    perceptionGaps: model.perceptionGaps || [],
    disputedClaims: model.disputedClaims || [],
    predictionChecks: model.predictionChecks || [],
    cycleHypothesis: model.cycleHypothesis || { label: "", sequence: [], confidence: "low", question: "" },
    resources: model.resources || [],
    unknowns: model.unknowns || [],
    crossQuestions: slot === "A" ? (model.crossQuestionsA || []) : (model.crossQuestionsB || []),
  };
}

function mapExperiment(participant, experiment) {
  if (!experiment) return null;
  const myCheckin = experiment.checkins?.find((c) => c.participant_id === participant.id) || null;
  const partnerCheckedIn = experiment.checkins?.some((c) => c.participant_id !== participant.id) || false;
  return {
    id: experiment.id,
    status: experiment.status,
    title: experiment.title,
    plan: experiment.plan,
    acceptances: experiment.acceptances || {},
    dueAt: experiment.due_at,
    myCheckin: myCheckin?.input || null,
    partnerCheckedIn,
    result: experiment.result || null,
  };
}

function mapState(participant) {
  const couple = participant.couple;
  const partner = couple.participants.find((p) => p.id !== participant.id) || null;
  const comparison = latestComparison(couple);
  const bothApproved = approvedParticipants(couple).length === 2;
  const model = comparison?.model || {};
  const ownPerspective = participant.perspective || null;
  return {
    pairId: couple.id,
    pairStatus: couple.status,
    participant: {
      id: participant.id,
      slot: participant.slot,
      status: participant.status,
      displayName: participant.display_name || `Perspektywa ${participant.slot}`,
      answers: util.answerMap(participant.answers),
      shareDraft: participant.share_draft || null,
      shareApproved: participant.share_approved || null,
      privatePerspective: ownPerspective ? {
        summary: ownPerspective.summary || "",
        narrativeFlags: ownPerspective.narrativeFlags || [],
        safety: ownPerspective.safety || { level: "clear", signals: [], protocolAllowed: true },
      } : null,
      reflectionSubmitted: participant.reflections.some((r) => r.kind === "cross"),
    },
    partner: {
      joined: Boolean(partner),
      status: partner?.status || "NOT_JOINED",
      displayName: partner?.display_name || (partner ? `Perspektywa ${partner.slot}` : "Druga osoba"),
      shareApproved: bothApproved ? (partner?.share_approved || null) : null,
    },
    comparison: bothApproved ? publicComparisonFor(participant.slot, comparison) : null,
    finalSynthesis: bothApproved ? (model.finalSynthesis || null) : null,
    experiment: mapExperiment(participant, couple.experiments?.[0] || null),
    safetyStopped: couple.status === "SAFETY_STOP" || participant.status === "SAFETY_STOP",
  };
}

async function refreshed(rawToken) {
  return participantByToken(rawToken);
}

async function buildComparisonIfReady(coupleId) {
  const couple = await prisma.coupleSession.findUnique({
    where: { id: coupleId },
    include: { participants: true, comparisons: { orderBy: { revision: "desc" }, take: 1 } },
  });
  if (!couple || couple.status === "SAFETY_STOP") return null;
  const a = couple.participants.find((p) => p.slot === "A");
  const b = couple.participants.find((p) => p.slot === "B");
  if (!a?.perspective || !b?.perspective) return null;
  if (couple.comparisons?.[0]) return couple.comparisons[0];
  const model = await ai.comparePerspectives({ pairId: couple.id, a: a.perspective, b: b.perspective });
  if (model?.safety?.protocolAllowed === false || model?.safety?.level === "high") {
    await prisma.$transaction([
      prisma.coupleSession.update({ where: { id: couple.id }, data: { status: "SAFETY_STOP" } }),
      prisma.coupleParticipant.updateMany({ where: { couple_id: couple.id }, data: { status: "SAFETY_STOP" } }),
    ]);
    return null;
  }
  return prisma.coupleComparison.create({ data: { id: util.newId(), couple_id: couple.id, revision: 1, model, status: "PRIVATE_COMPARISON" } });
}

exports.create = asyncHandler(async (req, res) => {
  const data = z.object({
    displayName: z.string().trim().max(40).optional().default(""),
    consentAcceptedAt: z.string().datetime(),
    consentVersion: z.string().min(5).max(80),
  }).parse(req.body || {});
  const pairId = util.newId();
  const participantId = util.newId();
  const participantToken = util.randomToken();
  const inviteCode = util.inviteCode();
  await prisma.coupleSession.create({
    data: {
      id: pairId,
      invite_hash: util.hash(inviteCode),
      status: "WAITING_PARTNER",
      version: "couple-1",
      participants: {
        create: {
          id: participantId,
          slot: "A",
          token_hash: util.hash(participantToken),
          display_name: data.displayName || "Perspektywa A",
          status: "INTAKE",
          consent: { acceptedAt: data.consentAcceptedAt, version: data.consentVersion },
        },
      },
    },
  });
  const state = mapState(await refreshed(participantToken));
  res.json({ ok: true, pairId, participantToken, inviteCode, state });
});

exports.join = asyncHandler(async (req, res) => {
  const data = z.object({
    inviteCode: z.string().min(6).max(20),
    displayName: z.string().trim().max(40).optional().default(""),
    consentAcceptedAt: z.string().datetime(),
    consentVersion: z.string().min(5).max(80),
  }).parse(req.body || {});
  const normalized = util.normalizeInvite(data.inviteCode);
  const couple = await prisma.coupleSession.findUnique({ where: { invite_hash: util.hash(normalized) }, include: { participants: true } });
  if (!couple) return bad(res, "Kod zaproszenia jest nieprawidłowy albo wygasł.", 404);
  if (couple.status === "SAFETY_STOP") return bad(res, "Ta wspólna analiza została zamknięta.", 409);
  if (couple.participants.some((p) => p.slot === "B")) return bad(res, "Ten kod został już wykorzystany przez drugą osobę.", 409);
  const participantToken = util.randomToken();
  await prisma.$transaction([
    prisma.coupleParticipant.create({ data: {
      id: util.newId(), couple_id: couple.id, slot: "B", token_hash: util.hash(participantToken),
      display_name: data.displayName || "Perspektywa B", status: "INTAKE",
      consent: { acceptedAt: data.consentAcceptedAt, version: data.consentVersion },
    } }),
    prisma.coupleSession.update({ where: { id: couple.id }, data: { status: "INTAKE" } }),
  ]);
  res.json({ ok: true, pairId: couple.id, participantToken, state: mapState(await refreshed(participantToken)) });
});

exports.state = asyncHandler(async (req, res) => {
  const token = participantTokenSchema.parse(req.params.token);
  const participant = await participantByToken(token);
  if (!participant) return bad(res, "Nie znaleziono prywatnej części analizy.", 404);
  res.json({ ok: true, state: mapState(participant) });
});

exports.answer = asyncHandler(async (req, res) => {
  const data = z.object({
    participantToken: participantTokenSchema,
    questionId: z.string().regex(/^[a-z0-9_:-]{2,80}$/),
    question: z.string().trim().min(2).max(1000),
    answer: z.any(),
    phase: z.string().trim().max(40).optional().default("intake"),
  }).parse(req.body || {});
  const participant = await participantByToken(data.participantToken);
  if (!participant) return bad(res, "Nie znaleziono prywatnej części analizy.", 404);
  if (participant.couple.status === "SAFETY_STOP") return bad(res, "Wspólna analiza została zatrzymana ze względów bezpieczeństwa.", 409);

  let coach = null;
  if (data.questionId === "safety_screen") {
    const safety = util.safetyFromScreen(data.answer);
    await prisma.coupleAnswer.upsert({
      where: { participant_id_phase_question_id: { participant_id: participant.id, phase: data.phase, question_id: data.questionId } },
      create: { id: util.newId(), participant_id: participant.id, phase: data.phase, question_id: data.questionId, question: data.question, answer: data.answer },
      update: { answer: data.answer, question: data.question },
    });
    if (safety.high) {
      await prisma.$transaction([
        prisma.coupleParticipant.update({ where: { id: participant.id }, data: { status: "SAFETY_STOP" } }),
        prisma.coupleSession.update({ where: { id: participant.couple_id }, data: { status: "SAFETY_STOP" } }),
      ]);
      return res.json({ ok: true, coach: null, state: mapState(await refreshed(data.participantToken)) });
    }
  } else {
    const recent = participant.answers.slice(-4).map((row) => ({ questionId: row.question_id, answer: row.answer, aiNote: row.ai_note }));
    const answerText = typeof data.answer === "string" ? data.answer : JSON.stringify(data.answer);
    if (answerText.length >= 18 && ["why_now","concrete_event","meaning","emotion_need","big_unknown","own_response","predict_partner","resource","change_evidence"].includes(data.questionId)) {
      try {
        coach = await ai.analyzeTurn({ participantId: participant.id, questionId: data.questionId, question: data.question, answer: data.answer, context: recent });
      } catch (error) {
        console.error("[COUPLE] analyzeTurn fallback:", error.message);
      }
    }
    await prisma.coupleAnswer.upsert({
      where: { participant_id_phase_question_id: { participant_id: participant.id, phase: data.phase, question_id: data.questionId } },
      create: { id: util.newId(), participant_id: participant.id, phase: data.phase, question_id: data.questionId, question: data.question, answer: data.answer, ai_note: coach },
      update: { answer: data.answer, question: data.question, ai_note: coach },
    });
    if (coach?.safety?.level === "high" || coach?.safety?.protocolAllowed === false) {
      await prisma.$transaction([
        prisma.coupleParticipant.update({ where: { id: participant.id }, data: { status: "SAFETY_STOP" } }),
        prisma.coupleSession.update({ where: { id: participant.couple_id }, data: { status: "SAFETY_STOP" } }),
      ]);
    }
  }
  res.json({ ok: true, coach, state: mapState(await refreshed(data.participantToken)) });
});

exports.completeIntake = asyncHandler(async (req, res) => {
  const { participantToken } = z.object({ participantToken: participantTokenSchema }).parse(req.body || {});
  const participant = await participantByToken(participantToken);
  if (!participant) return bad(res, "Nie znaleziono prywatnej części analizy.", 404);
  if (participant.couple.status === "SAFETY_STOP") return bad(res, "Wspólna analiza została zatrzymana.", 409);
  const required = ["safety_screen","why_now","desired_direction","relationship_pulse","main_topic","concrete_event","meaning","emotion_need","big_unknown","own_response","predict_partner","resource","change_evidence"];
  const answers = util.answerMap(participant.answers);
  const missing = required.filter((id) => answers[id] == null);
  if (missing.length) return bad(res, `Brakuje odpowiedzi: ${missing.join(", ")}.`, 409);

  const perspective = await ai.buildPerspective({
    participantId: participant.id,
    slot: participant.slot,
    answers: participant.answers.map((row) => ({ questionId: row.question_id, question: row.question, answer: row.answer, aiNote: row.ai_note })),
  });
  if (perspective?.safety?.level === "high" || perspective?.safety?.protocolAllowed === false) {
    await prisma.$transaction([
      prisma.coupleParticipant.update({ where: { id: participant.id }, data: { perspective, share_draft: perspective.shareDraft, status: "SAFETY_STOP" } }),
      prisma.coupleSession.update({ where: { id: participant.couple_id }, data: { status: "SAFETY_STOP" } }),
    ]);
    return res.json({ ok: true, state: mapState(await refreshed(participantToken)) });
  }
  await prisma.coupleParticipant.update({ where: { id: participant.id }, data: { perspective, share_draft: perspective.shareDraft, status: "REVIEW_SHARE" } });
  await buildComparisonIfReady(participant.couple_id);
  res.json({ ok: true, state: mapState(await refreshed(participantToken)) });
});

exports.approveShare = asyncHandler(async (req, res) => {
  const { participantToken, share } = z.object({ participantToken: participantTokenSchema, share: shareSchema }).parse(req.body || {});
  const participant = await participantByToken(participantToken);
  if (!participant) return bad(res, "Nie znaleziono prywatnej części analizy.", 404);
  if (!participant.perspective) return bad(res, "Najpierw zakończ własną część analizy.", 409);
  await prisma.coupleParticipant.update({ where: { id: participant.id }, data: { share_approved: share, status: "WAITING_SHARE" } });
  await buildComparisonIfReady(participant.couple_id);

  const couple = await prisma.coupleSession.findUnique({ where: { id: participant.couple_id }, include: { participants: true, comparisons: { orderBy: { revision: "desc" }, take: 1 } } });
  const bothApproved = approvedParticipants(couple).length === 2;
  if (bothApproved && couple.comparisons?.[0]) {
    await prisma.$transaction([
      prisma.coupleSession.update({ where: { id: couple.id }, data: { status: "CROSS_REFLECTION" } }),
      prisma.coupleParticipant.updateMany({ where: { couple_id: couple.id }, data: { status: "CROSS_REFLECTION" } }),
      prisma.coupleComparison.update({ where: { id: couple.comparisons[0].id }, data: { status: "SHARED_COMPARISON" } }),
    ]);
  }
  res.json({ ok: true, state: mapState(await refreshed(participantToken)) });
});

exports.reflection = asyncHandler(async (req, res) => {
  const { participantToken, input } = z.object({ participantToken: participantTokenSchema, input: z.record(z.string().trim().max(12000)) }).parse(req.body || {});
  const participant = await participantByToken(participantToken);
  if (!participant) return bad(res, "Nie znaleziono prywatnej części analizy.", 404);
  if (participant.couple.status !== "CROSS_REFLECTION") return bad(res, "Ta faza nie jest jeszcze dostępna.", 409);
  const comparison = latestComparison(participant.couple);
  if (!comparison) return bad(res, "Brak porównania dwóch perspektyw.", 409);
  await prisma.coupleReflection.upsert({
    where: { participant_id_comparison_id_kind: { participant_id: participant.id, comparison_id: comparison.id, kind: "cross" } },
    create: { id: util.newId(), participant_id: participant.id, comparison_id: comparison.id, kind: "cross", input },
    update: { input, comparison_id: comparison.id },
  });
  await prisma.coupleParticipant.update({ where: { id: participant.id }, data: { status: "WAITING_SHARE" } });

  const couple = await prisma.coupleSession.findUnique({
    where: { id: participant.couple_id },
    include: { participants: { include: { reflections: true } }, comparisons: { orderBy: { revision: "desc" }, take: 1 } },
  });
  const a = couple.participants.find((p) => p.slot === "A");
  const b = couple.participants.find((p) => p.slot === "B");
  const comp = couple.comparisons[0];
  const ra = a?.reflections.find((r) => r.kind === "cross" && r.comparison_id === comp?.id);
  const rb = b?.reflections.find((r) => r.kind === "cross" && r.comparison_id === comp?.id);
  if (a?.share_approved && b?.share_approved && ra && rb && comp) {
    const finalSynthesis = await ai.buildFinalSynthesis({
      pairId: couple.id,
      comparison: comp.model,
      shareA: a.share_approved,
      shareB: b.share_approved,
      reflectionA: ra.input,
      reflectionB: rb.input,
    });
    if (finalSynthesis.safety?.protocolAllowed === false || finalSynthesis.safety?.level === "high") {
      await prisma.$transaction([
        prisma.coupleComparison.update({ where: { id: comp.id }, data: { model: { ...comp.model, finalSynthesis }, status: "FINAL" } }),
        prisma.coupleSession.update({ where: { id: couple.id }, data: { status: "SAFETY_STOP" } }),
        prisma.coupleParticipant.updateMany({ where: { couple_id: couple.id }, data: { status: "SAFETY_STOP" } }),
      ]);
    } else {
      const experimentId = util.newId();
      await prisma.$transaction([
        prisma.coupleComparison.update({ where: { id: comp.id }, data: { model: { ...comp.model, finalSynthesis }, status: "FINAL" } }),
        prisma.coupleSession.update({ where: { id: couple.id }, data: { status: "EXPERIMENT_PROPOSED" } }),
        prisma.coupleParticipant.updateMany({ where: { couple_id: couple.id }, data: { status: "JOINT_REPORT" } }),
        prisma.coupleExperiment.create({ data: {
          id: experimentId, couple_id: couple.id, comparison_id: comp.id, title: finalSynthesis.experiment.title,
          plan: finalSynthesis.experiment, status: "PROPOSED", acceptances: {}, due_at: util.dueDate(finalSynthesis.experiment.durationDays),
        } }),
      ]);
    }
  }
  res.json({ ok: true, state: mapState(await refreshed(participantToken)) });
});

exports.experimentAccept = asyncHandler(async (req, res) => {
  const { participantToken, experimentId, accepted } = z.object({ participantToken: participantTokenSchema, experimentId: z.string().uuid(), accepted: z.boolean() }).parse(req.body || {});
  const participant = await participantByToken(participantToken);
  if (!participant) return bad(res, "Nie znaleziono prywatnej części analizy.", 404);
  const experiment = participant.couple.experiments.find((e) => e.id === experimentId);
  if (!experiment) return bad(res, "Nie znaleziono eksperymentu.", 404);
  const acceptances = { ...(experiment.acceptances || {}), [participant.slot]: accepted };
  let status = "PROPOSED";
  let pairStatus = "EXPERIMENT_PROPOSED";
  if (acceptances.A === false || acceptances.B === false) { status = "DECLINED"; pairStatus = "JOINT_REPORT"; }
  if (acceptances.A === true && acceptances.B === true) { status = "ACTIVE"; pairStatus = "EXPERIMENT_ACTIVE"; }
  const experimentUpdate = { acceptances, status };
  if (status === "ACTIVE") experimentUpdate.due_at = util.dueDate(experiment.plan?.durationDays || 7);
  await prisma.$transaction([
    prisma.coupleExperiment.update({ where: { id: experiment.id }, data: experimentUpdate }),
    prisma.coupleSession.update({ where: { id: participant.couple_id }, data: { status: pairStatus } }),
  ]);
  res.json({ ok: true, state: mapState(await refreshed(participantToken)) });
});

exports.experimentCheckin = asyncHandler(async (req, res) => {
  const { participantToken, experimentId, input } = z.object({ participantToken: participantTokenSchema, experimentId: z.string().uuid(), input: z.record(z.string().trim().max(12000)) }).parse(req.body || {});
  const participant = await participantByToken(participantToken);
  if (!participant) return bad(res, "Nie znaleziono prywatnej części analizy.", 404);
  const experiment = participant.couple.experiments.find((e) => e.id === experimentId);
  if (!experiment || experiment.status !== "ACTIVE") return bad(res, "Eksperyment nie jest aktywny.", 409);
  await prisma.coupleExperimentCheckin.upsert({
    where: { experiment_id_participant_id: { experiment_id: experiment.id, participant_id: participant.id } },
    create: { id: util.newId(), experiment_id: experiment.id, participant_id: participant.id, input },
    update: { input },
  });
  const refreshedExperiment = await prisma.coupleExperiment.findUnique({ where: { id: experiment.id }, include: { checkins: true } });
  if (refreshedExperiment.checkins.length >= 2) {
    const a = participant.couple.participants.find((p) => p.slot === "A");
    const b = participant.couple.participants.find((p) => p.slot === "B");
    const ca = refreshedExperiment.checkins.find((c) => c.participant_id === a?.id);
    const cb = refreshedExperiment.checkins.find((c) => c.participant_id === b?.id);
    if (ca && cb) {
      const result = await ai.evaluateExperiment({ pairId: participant.couple_id, plan: refreshedExperiment.plan, checkinA: ca.input, checkinB: cb.input });
      await prisma.$transaction([
        prisma.coupleExperiment.update({ where: { id: refreshedExperiment.id }, data: { result, status: "COMPLETED", completed_at: new Date() } }),
        prisma.coupleSession.update({ where: { id: participant.couple_id }, data: { status: "FOLLOWUP_COMPLETE" } }),
        prisma.coupleParticipant.updateMany({ where: { couple_id: participant.couple_id }, data: { status: "FOLLOWUP_COMPLETE" } }),
      ]);
    }
  }
  res.json({ ok: true, state: mapState(await refreshed(participantToken)) });
});
