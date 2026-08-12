CREATE TABLE "ctms_couple_sessions" (
  "id" TEXT NOT NULL,
  "invite_hash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'WAITING_PARTNER',
  "version" TEXT NOT NULL DEFAULT 'couple-1',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_couple_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ctms_couple_participants" (
  "id" TEXT NOT NULL,
  "couple_id" TEXT NOT NULL,
  "slot" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "display_name" TEXT,
  "status" TEXT NOT NULL DEFAULT 'INTAKE',
  "consent" JSONB,
  "perspective" JSONB,
  "share_draft" JSONB,
  "share_approved" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_couple_participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ctms_couple_answers" (
  "id" TEXT NOT NULL,
  "participant_id" TEXT NOT NULL,
  "phase" TEXT NOT NULL,
  "question_id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" JSONB NOT NULL,
  "ai_note" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_couple_answers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ctms_couple_comparisons" (
  "id" TEXT NOT NULL,
  "couple_id" TEXT NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "model" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PRIVATE_COMPARISON',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_couple_comparisons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ctms_couple_reflections" (
  "id" TEXT NOT NULL,
  "participant_id" TEXT NOT NULL,
  "comparison_id" TEXT,
  "kind" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "ai_note" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_couple_reflections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ctms_couple_experiments" (
  "id" TEXT NOT NULL,
  "couple_id" TEXT NOT NULL,
  "comparison_id" TEXT,
  "title" TEXT NOT NULL,
  "plan" JSONB NOT NULL,
  "acceptances" JSONB,
  "result" JSONB,
  "status" TEXT NOT NULL DEFAULT 'PROPOSED',
  "due_at" TIMESTAMP(3) NOT NULL,
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_couple_experiments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ctms_couple_experiment_checkins" (
  "id" TEXT NOT NULL,
  "experiment_id" TEXT NOT NULL,
  "participant_id" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_couple_experiment_checkins_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ctms_couple_sessions_invite_hash_key" ON "ctms_couple_sessions"("invite_hash");
CREATE INDEX "ctms_couple_sessions_status_created_at_idx" ON "ctms_couple_sessions"("status", "created_at");
CREATE UNIQUE INDEX "ctms_couple_participants_token_hash_key" ON "ctms_couple_participants"("token_hash");
CREATE UNIQUE INDEX "ctms_couple_participants_couple_id_slot_key" ON "ctms_couple_participants"("couple_id", "slot");
CREATE INDEX "ctms_couple_participants_couple_id_status_idx" ON "ctms_couple_participants"("couple_id", "status");
CREATE UNIQUE INDEX "ctms_couple_answers_participant_id_phase_question_id_key" ON "ctms_couple_answers"("participant_id", "phase", "question_id");
CREATE INDEX "ctms_couple_answers_participant_id_created_at_idx" ON "ctms_couple_answers"("participant_id", "created_at");
CREATE UNIQUE INDEX "ctms_couple_comparisons_couple_id_revision_key" ON "ctms_couple_comparisons"("couple_id", "revision");
CREATE INDEX "ctms_couple_comparisons_couple_id_created_at_idx" ON "ctms_couple_comparisons"("couple_id", "created_at");
CREATE UNIQUE INDEX "ctms_couple_reflections_participant_id_comparison_id_kind_key" ON "ctms_couple_reflections"("participant_id", "comparison_id", "kind");
CREATE INDEX "ctms_couple_reflections_comparison_id_created_at_idx" ON "ctms_couple_reflections"("comparison_id", "created_at");
CREATE INDEX "ctms_couple_experiments_couple_id_status_idx" ON "ctms_couple_experiments"("couple_id", "status");
CREATE UNIQUE INDEX "ctms_couple_experiment_checkins_experiment_id_participant_id_key" ON "ctms_couple_experiment_checkins"("experiment_id", "participant_id");
CREATE INDEX "ctms_couple_experiment_checkins_participant_id_created_at_idx" ON "ctms_couple_experiment_checkins"("participant_id", "created_at");

ALTER TABLE "ctms_couple_participants" ADD CONSTRAINT "ctms_couple_participants_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "ctms_couple_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_couple_answers" ADD CONSTRAINT "ctms_couple_answers_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "ctms_couple_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_couple_comparisons" ADD CONSTRAINT "ctms_couple_comparisons_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "ctms_couple_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_couple_reflections" ADD CONSTRAINT "ctms_couple_reflections_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "ctms_couple_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_couple_reflections" ADD CONSTRAINT "ctms_couple_reflections_comparison_id_fkey" FOREIGN KEY ("comparison_id") REFERENCES "ctms_couple_comparisons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ctms_couple_experiments" ADD CONSTRAINT "ctms_couple_experiments_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "ctms_couple_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_couple_experiments" ADD CONSTRAINT "ctms_couple_experiments_comparison_id_fkey" FOREIGN KEY ("comparison_id") REFERENCES "ctms_couple_comparisons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ctms_couple_experiment_checkins" ADD CONSTRAINT "ctms_couple_experiment_checkins_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "ctms_couple_experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_couple_experiment_checkins" ADD CONSTRAINT "ctms_couple_experiment_checkins_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "ctms_couple_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
