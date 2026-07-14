"use strict";

const crypto = require("crypto");
const prisma = require("../db/prisma");

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
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        reminder_due_at timestamptz,
        reminder_sent_at timestamptz,
        reminder_consent boolean NOT NULL DEFAULT false
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS ctms_anonymous_profiles_due_idx
      ON ctms_anonymous_profiles (reminder_due_at)
      WHERE reminder_consent = true AND reminder_sent_at IS NULL
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

    console.log("[FollowUp] Tabele gotowe.");
  })().catch((error) => {
    schemaReadyPromise = null;
    throw error;
  });

  return schemaReadyPromise;
}

async function upsertProfile(payload) {
  await ensureFollowupSchema();

  const recoveryToken = newRecoveryToken();
  const hash = hashToken(recoveryToken);

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
      RETURNING id, session_token, email, selected_path, created_at, reminder_due_at
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
  return {
    recoveryToken,
    recoveryUrl: publicUrl(recoveryToken),
    email: row.email || "",
    createdAt: row.created_at,
    dueAt: row.reminder_due_at,
  };
}

async function profileByRecoveryToken(token) {
  await ensureFollowupSchema();

  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT id, session_token, email, selected_path, baseline, full_report, created_at, reminder_due_at
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

  const safeDays = Math.max(1, Math.min(60, Number(days || 7)));
  const dueAt = new Date(Date.now() + safeDays * 86400000);

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
    dueAt
  );

  return rows[0] || null;
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

async function dueReminders(limit = 100) {
  await ensureFollowupSchema();

  return prisma.$queryRawUnsafe(
    `
      SELECT id, email, reminder_due_at
      FROM ctms_anonymous_profiles
      WHERE reminder_consent=true
        AND reminder_sent_at IS NULL
        AND reminder_due_at IS NOT NULL
        AND reminder_due_at <= now()
        AND email IS NOT NULL
        AND email <> ''
      ORDER BY reminder_due_at ASC
      LIMIT $1
    `,
    Number(limit)
  );
}

async function markReminderSent(id) {
  await ensureFollowupSchema();
  await prisma.$executeRawUnsafe(
    `UPDATE ctms_anonymous_profiles SET reminder_sent_at=now(), updated_at=now() WHERE id=$1`,
    id
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

module.exports = {
  ensureFollowupSchema,
  upsertProfile,
  profileByRecoveryToken,
  scheduleReminder,
  saveCheckin,
  dueReminders,
  markReminderSent,
  issueRecoveryTokenForProfile,
  publicUrl,
};
