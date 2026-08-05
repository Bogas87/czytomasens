CREATE TYPE "V3ProtocolStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TABLE "ctms_v3_cases" (
  "id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "recovery_hash" TEXT NOT NULL,
  "current_state" JSONB,
  "boundaries" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ctms_v3_cases_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ctms_v3_analyses" (
  "id" TEXT NOT NULL,
  "case_id" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "case_model" JSONB NOT NULL,
  "preview" JSONB NOT NULL,
  "report" JSONB,
  "paid_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_v3_analyses_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ctms_v3_protocols" (
  "id" TEXT NOT NULL,
  "case_id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "protocol" JSONB NOT NULL,
  "result" JSONB,
  "status" "V3ProtocolStatus" NOT NULL DEFAULT 'ACTIVE',
  "due_at" TIMESTAMP(3) NOT NULL,
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_v3_protocols_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ctms_v3_checkins" (
  "id" TEXT NOT NULL,
  "case_id" TEXT NOT NULL,
  "protocol_id" TEXT,
  "kind" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "result" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_v3_checkins_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ctms_v3_cases_session_id_key" ON "ctms_v3_cases"("session_id");
CREATE UNIQUE INDEX "ctms_v3_cases_recovery_hash_key" ON "ctms_v3_cases"("recovery_hash");
CREATE INDEX "ctms_v3_cases_path_created_at_idx" ON "ctms_v3_cases"("path", "created_at");
CREATE INDEX "ctms_v3_analyses_case_id_created_at_idx" ON "ctms_v3_analyses"("case_id", "created_at");
CREATE INDEX "ctms_v3_protocols_case_id_status_idx" ON "ctms_v3_protocols"("case_id", "status");
CREATE INDEX "ctms_v3_checkins_case_id_created_at_idx" ON "ctms_v3_checkins"("case_id", "created_at");
ALTER TABLE "ctms_v3_cases" ADD CONSTRAINT "ctms_v3_cases_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_v3_analyses" ADD CONSTRAINT "ctms_v3_analyses_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "ctms_v3_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_v3_protocols" ADD CONSTRAINT "ctms_v3_protocols_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "ctms_v3_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_v3_checkins" ADD CONSTRAINT "ctms_v3_checkins_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "ctms_v3_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ctms_v3_checkins" ADD CONSTRAINT "ctms_v3_checkins_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "ctms_v3_protocols"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ctms_v3_product_events" (
  "id" TEXT NOT NULL,
  "case_id" TEXT,
  "name" TEXT NOT NULL,
  "properties" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ctms_v3_product_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ctms_v3_product_events_name_created_at_idx" ON "ctms_v3_product_events"("name", "created_at");
CREATE INDEX "ctms_v3_product_events_case_id_created_at_idx" ON "ctms_v3_product_events"("case_id", "created_at");
ALTER TABLE "ctms_v3_product_events" ADD CONSTRAINT "ctms_v3_product_events_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "ctms_v3_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
