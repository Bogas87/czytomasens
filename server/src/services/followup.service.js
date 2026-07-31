"use strict";

const crypto = require("crypto");
const prisma = require("../db/prisma");
const caseReasoning = require("./case_reasoning.service.js");

let schemaReadyPromise = null;

function hashToken(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function newRecoveryToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function publicUrl(token) {
  const base = (process.env.CLIENT_URL || "https://www.czytomasens.pl").replace(/\/$/, "");
  return `${base}/?recovery=${encodeURIComponent(token)}`;
}

function safeJson(value, fallback = {}) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function isNonEmptyObject(value) {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}

async function ensureFollowupSchema() {
  if (schemaReadyPromise) return schemaReadyPromise;

  schemaReadyPromise = (async () => {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ctms_anonymous_profiles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token text NOT NULL UNIQUE,
        local_id text,
        recovery_token_hash text NOT NULL UNIQUE,
        email text,
        selected_path text,
        baseline jsonb NOT NULL DEFAULT '{}'::jsonb,
        full_report jsonb NOT NULL DEFAULT '{}'::jsonb,
        case_state jsonb NOT NULL DEFAULT '{}'::jsonb,
        case_version integer NOT NULL DEFAULT 0,
        case_updated_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        reminder_due_at timestamptz,
        reminder_sent_at timestamptz,
        reminder_consent boolean NOT NULL DEFAULT false
      )
    `);

    await prisma.$executeRawUnsafe(`ALTER TABLE ctms_anonymous_profiles ADD COLUMN IF NOT EXISTS case_state jsonb NOT NULL DEFAULT '{}'::jsonb`);
    await prisma.$executeRawUnsafe(`ALTER TABLE ctms_anonymous_profiles ADD COLUMN IF NOT EXISTS case_version integer NOT NULL DEFAULT 0`);
    await prisma.$executeRawUnsafe(`ALTER TABLE ctms_anonymous_profiles ADD COLUMN IF NOT EXISTS case_updated_at timestamptz`);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS ctms_anonymous_profiles_due_idx
      ON ctms_anonymous_profiles (reminder_due_at)
      WHERE reminder_consent = true AND reminder_sent_at IS NULL
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ctms_followup_reminders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid NOT NULL REFERENCES ctms_anonymous_profiles(id) ON DELETE CASCADE,
        stage_days integer NOT NULL,
        due_at timestamptz NOT NULL,
        sent_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(profile_id, stage_days, due_at)
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS ctms_followup_reminders_due_idx
      ON ctms_followup_reminders (due_at)
      WHERE sent_at IS NULL
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO ctms_followup_reminders (profile_id, stage_days, due_at)
      SELECT id,
             GREATEST(1, ROUND(EXTRACT(EPOCH FROM (reminder_due_at - updated_at)) / 86400)::integer),
             reminder_due_at
      FROM ctms_anonymous_profiles
      WHERE reminder_consent=true AND reminder_sent_at IS NULL AND reminder_due_at IS NOT NULL
      ON CONFLICT DO NOTHING
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ctms_followup_checkins (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid NOT NULL REFERENCES ctms_anonymous_profiles(id) ON DELETE CASCADE,
        elapsed_days integer NOT NULL DEFAULT 0,
        answers jsonb NOT NULL DEFAULT '{}'::jsonb,
        result jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS ctms_followup_checkins_profile_idx
      ON ctms_followup_checkins (profile_id, created_at DESC)
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ctms_case_snapshots (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid NOT NULL REFERENCES ctms_anonymous_profiles(id) ON DELETE CASCADE,
        version integer NOT NULL,
        trigger text NOT NULL,
        state jsonb NOT NULL DEFAULT '{}'::jsonb,
        source_session_token text,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(profile_id, version)
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS ctms_case_snapshots_profile_idx
      ON ctms_case_snapshots (profile_id, version DESC)
    `);

    console.log("[FollowUp] Tabele i pamięć przypadku gotowe.");
  })().catch((error) => {
    schemaReadyPromise = null;
    throw error;
  });

  return schemaReadyPromise;
}

async function sessionCaseState(sessionToken) {
  if (!sessionToken) return {};
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionToken },
      select: { payload: true },
    });
    return safeJson(session?.payload, {})?.caseState || {};
  } catch {
    return {};
  }
}

async function createInitialSnapshotIfNeeded(profileId, state, sourceSessionToken) {
  if (!profileId || !caseReasoning.hasMeaningfulCaseState(state)) return null;

  const existing = await prisma.$queryRawUnsafe(
    `SELECT version FROM ctms_case_snapshots WHERE profile_id=$1 ORDER BY version DESC LIMIT 1`,
    profileId
  );
  if (existing?.length) return existing[0];

  await prisma.$executeRawUnsafe(
    `
      UPDATE ctms_anonymous_profiles
      SET case_state=$2::jsonb,
          case_version=CASE WHEN case_version < 1 THEN 1 ELSE case_version END,
          case_updated_at=now(),
          updated_at=now()
      WHERE id=$1
    `,
    profileId,
    JSON.stringify(state)
  );

  const rows = await prisma.$queryRawUnsafe(
    `
      INSERT INTO ctms_case_snapshots (profile_id, version, trigger, state, source_session_token)
      VALUES ($1,1,'initial_report',$2::jsonb,$3)
      ON CONFLICT (profile_id, version) DO NOTHING
      RETURNING version, created_at
    `,
    profileId,
    JSON.stringify(state),
    sourceSessionToken || null
  );

  return rows[0] || { version: 1 };
}

async function upsertProfile(payload) {
  await ensureFollowupSchema();

  const recoveryToken = newRecoveryToken();
  const hash = hashToken(recoveryToken);
  const storedSessionState = await sessionCaseState(payload.sessionToken);
  const caseState = caseReasoning.normalizeCaseState(
    payload.caseState || storedSessionState || {},
    payload.caseState || storedSessionState || {},
    "profile_upsert"
  );

  const rows = await prisma.$queryRawUnsafe(
    `
      INSERT INTO ctms_anonymous_profiles
        (session_token, local_id, recovery_token_hash, email, selected_path, baseline, full_report, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,now())
      ON CONFLICT (session_token) DO UPDATE SET
        local_id = COALESCE(EXCLUDED.local_id, ctms_anonymous_profiles.local_id),
        recovery_token_hash = EXCLUDED.recovery_token_hash,
        email = COALESCE(EXCLUDED.email, ctms_anonymous_profiles.email),
        selected_path = COALESCE(EXCLUDED.selected_path, ctms_anonymous_profiles.selected_path),
        baseline = CASE WHEN EXCLUDED.baseline = '{}'::jsonb THEN ctms_anonymous_profiles.baseline ELSE EXCLUDED.baseline END,
        full_report = CASE WHEN EXCLUDED.full_report = '{}'::jsonb THEN ctms_anonymous_profiles.full_report ELSE EXCLUDED.full_report END,
        updated_at = now()
      RETURNING id, session_token, email, selected_path, created_at, reminder_due_at, case_version
    `,
    payload.sessionToken,
    payload.localId || null,
    hash,
    payload.email || null,
    payload.selectedPath || null,
    JSON.stringify(payload.baseline || {}),
    JSON.stringify(payload.fullReport || {}),
    payload.createdAt ? new Date(payload.createdAt) : new Date()
  );

  const row = rows[0] || {};
  if (row.id && caseReasoning.hasMeaningfulCaseState(caseState)) {
    await createInitialSnapshotIfNeeded(row.id, caseState, payload.sessionToken);
  }

  return {
    recoveryToken,
    recoveryUrl: publicUrl(recoveryToken),
    email: row.email || "",
    createdAt: row.created_at,
    dueAt: row.reminder_due_at,
    caseVersion: Math.max(1, Number(row.case_version || 0)),
  };
}

async function profileByRecoveryToken(token) {
  await ensureFollowupSchema();

  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT id, session_token, email, selected_path, baseline, full_report,
             case_state, case_version, case_updated_at, created_at, reminder_due_at
      FROM ctms_anonymous_profiles
      WHERE recovery_token_hash = $1
      LIMIT 1
    `,
    hashToken(token)
  );

  return rows[0] || null;
}

async function scheduleReminder(token, email, days) {
  await ensureFollowupSchema();

  const requestedDays = Array.isArray(days) ? days : [days || 7];
  const safeDays = [...new Set(requestedDays.map((value) => Math.max(1, Math.min(60, Number(value || 7)))))]
    .filter(Number.isFinite)
    .sort((a, b) => a - b)
    .slice(0, 4);
  const plan = safeDays.length ? safeDays : [7, 21];
  const firstDueAt = new Date(Date.now() + plan[0] * 86400000);

  const rows = await prisma.$queryRawUnsafe(
    `
      UPDATE ctms_anonymous_profiles
      SET email=$2, reminder_due_at=$3, reminder_sent_at=NULL,
          reminder_consent=true, updated_at=now()
      WHERE recovery_token_hash=$1
      RETURNING id, email, reminder_due_at
    `,
    hashToken(token),
    email,
    firstDueAt
  );

  const profile = rows[0];
  if (!profile) return null;

  await prisma.$executeRawUnsafe(
    `DELETE FROM ctms_followup_reminders WHERE profile_id=$1 AND sent_at IS NULL`,
    profile.id
  );

  for (const stageDays of plan) {
    const dueAt = new Date(Date.now() + stageDays * 86400000);
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO ctms_followup_reminders (profile_id, stage_days, due_at)
        VALUES ($1,$2,$3)
        ON CONFLICT DO NOTHING
      `,
      profile.id,
      stageDays,
      dueAt
    );
  }

  return { ...profile, scheduleDays: plan };
}

async function saveCheckin(token, elapsedDays, answers, result) {
  await ensureFollowupSchema();

  const profile = await profileByRecoveryToken(token);
  if (!profile) return null;

  const rows = await prisma.$queryRawUnsafe(
    `
      INSERT INTO ctms_followup_checkins
        (profile_id, elapsed_days, answers, result)
      VALUES ($1,$2,$3::jsonb,$4::jsonb)
      RETURNING id, created_at
    `,
    profile.id,
    Math.max(0, Number(elapsedDays || 0)),
    JSON.stringify(answers || {}),
    JSON.stringify(result || {})
  );

  return rows[0] || null;
}

async function updateCaseStateByRecoveryToken(token, state, options = {}) {
  await ensureFollowupSchema();
  const profile = await profileByRecoveryToken(token);
  if (!profile) return null;

  const normalized = caseReasoning.normalizeCaseState(state, profile.case_state || {}, options.source || "case_update");

  if (options.createSnapshot) {
    const rows = await prisma.$queryRawUnsafe(
      `
        WITH updated AS (
          UPDATE ctms_anonymous_profiles
          SET case_state=$2::jsonb,
              case_version=case_version+1,
              case_updated_at=now(),
              updated_at=now()
          WHERE id=$1
          RETURNING case_version
        )
        INSERT INTO ctms_case_snapshots (profile_id, version, trigger, state, source_session_token)
        SELECT $1, case_version, $3, $2::jsonb, $4 FROM updated
        RETURNING version, created_at
      `,
      profile.id,
      JSON.stringify(normalized),
      options.trigger || "case_update",
      options.sourceSessionToken || null
    );

    return { state: normalized, version: rows[0]?.version || Number(profile.case_version || 0) + 1 };
  }

  const rows = await prisma.$queryRawUnsafe(
    `
      UPDATE ctms_anonymous_profiles
      SET case_state=$2::jsonb, case_updated_at=now(), updated_at=now()
      WHERE id=$1
      RETURNING case_version, case_updated_at
    `,
    profile.id,
    JSON.stringify(normalized)
  );

  return { state: normalized, version: rows[0]?.case_version || Number(profile.case_version || 0) };
}

async function saveCaseSnapshotByRecoveryToken(token, state, options = {}) {
  return updateCaseStateByRecoveryToken(token, state, {
    ...options,
    createSnapshot: true,
  });
}

async function dueReminders(limit = 100) {
  await ensureFollowupSchema();

  return prisma.$queryRawUnsafe(
    `
      SELECT r.id AS reminder_id,
             r.profile_id,
             r.stage_days,
             r.due_at AS reminder_due_at,
             p.email
      FROM ctms_followup_reminders r
      JOIN ctms_anonymous_profiles p ON p.id=r.profile_id
      WHERE r.sent_at IS NULL
        AND r.due_at <= now()
        AND p.reminder_consent=true
        AND p.email IS NOT NULL
        AND p.email <> ''
      ORDER BY r.due_at ASC
      LIMIT $1
    `,
    Number(limit)
  );
}

async function markReminderSent(reminderId, profileId) {
  await ensureFollowupSchema();
  await prisma.$executeRawUnsafe(
    `UPDATE ctms_followup_reminders SET sent_at=now() WHERE id=$1`,
    reminderId
  );
  await prisma.$executeRawUnsafe(
    `
      UPDATE ctms_anonymous_profiles p
      SET reminder_sent_at=CASE
            WHEN EXISTS (SELECT 1 FROM ctms_followup_reminders r WHERE r.profile_id=p.id AND r.sent_at IS NULL)
            THEN NULL ELSE now() END,
          updated_at=now()
      WHERE p.id=$1
    `,
    profileId
  );
}

async function issueRecoveryTokenForProfile(id) {
  await ensureFollowupSchema();

  const token = newRecoveryToken();
  await prisma.$executeRawUnsafe(
    `UPDATE ctms_anonymous_profiles SET recovery_token_hash=$2, updated_at=now() WHERE id=$1`,
    id,
    hashToken(token)
  );
  return token;
}

async function historyByRecoveryToken(token) {
  await ensureFollowupSchema();
  const profile = await profileByRecoveryToken(token);
  if (!profile) return null;

  const checkins = await prisma.$queryRawUnsafe(
    `
      SELECT elapsed_days, answers, result, created_at
      FROM ctms_followup_checkins
      WHERE profile_id=$1
      ORDER BY created_at ASC
      LIMIT 50
    `,
    profile.id
  );

  const snapshots = await prisma.$queryRawUnsafe(
    `
      SELECT version, trigger, state, source_session_token, created_at
      FROM ctms_case_snapshots
      WHERE profile_id=$1
      ORDER BY version ASC
      LIMIT 30
    `,
    profile.id
  );

  const safeCheckins = checkins || [];
  const lastCheckin = safeCheckins.length ? safeCheckins[safeCheckins.length - 1] : null;
  const lastSnapshot = snapshots?.length ? snapshots[snapshots.length - 1] : null;
  const lastActivityAt = lastCheckin?.created_at || lastSnapshot?.created_at || profile.case_updated_at || profile.created_at;
  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 86400000)
  );

  const rawCaseState = isNonEmptyObject(profile.case_state)
    ? profile.case_state
    : lastSnapshot?.state || {};

  return {
    profile: {
      id: profile.id,
      sessionToken: profile.session_token,
      email: profile.email,
      selectedPath: profile.selected_path,
      baseline: profile.baseline || {},
      fullReport: profile.full_report || {},
      createdAt: profile.created_at,
    },
    caseState: caseReasoning.normalizeCaseState(rawCaseState, rawCaseState, "history_load"),
    caseVersion: Number(profile.case_version || 0),
    caseUpdatedAt: profile.case_updated_at || null,
    snapshots: snapshots || [],
    checkins: safeCheckins,
    lastActivityAt,
    elapsedDays,
  };
}

module.exports = {
  ensureFollowupSchema,
  upsertProfile,
  profileByRecoveryToken,
  scheduleReminder,
  saveCheckin,
  updateCaseStateByRecoveryToken,
  saveCaseSnapshotByRecoveryToken,
  dueReminders,
  markReminderSent,
  issueRecoveryTokenForProfile,
  publicUrl,
  historyByRecoveryToken,
};
