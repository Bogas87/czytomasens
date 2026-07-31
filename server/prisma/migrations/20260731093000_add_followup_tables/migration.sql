CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
);

ALTER TABLE ctms_anonymous_profiles
ADD COLUMN IF NOT EXISTS case_state jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE ctms_anonymous_profiles
ADD COLUMN IF NOT EXISTS case_version integer NOT NULL DEFAULT 0;

ALTER TABLE ctms_anonymous_profiles
ADD COLUMN IF NOT EXISTS case_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS ctms_anonymous_profiles_due_idx
ON ctms_anonymous_profiles (reminder_due_at)
WHERE reminder_consent = true AND reminder_sent_at IS NULL;

CREATE TABLE IF NOT EXISTS ctms_followup_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES ctms_anonymous_profiles(id) ON DELETE CASCADE,
  elapsed_days integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ctms_followup_checkins_profile_idx
ON ctms_followup_checkins (profile_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ctms_case_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES ctms_anonymous_profiles(id) ON DELETE CASCADE,
  version integer NOT NULL,
  trigger text NOT NULL,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_session_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, version)
);

CREATE INDEX IF NOT EXISTS ctms_case_snapshots_profile_idx
ON ctms_case_snapshots (profile_id, version DESC);