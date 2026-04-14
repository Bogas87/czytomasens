-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NONE', 'QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('NONE', 'PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "patterns" JSONB NOT NULL DEFAULT '[]',
    "preview_report" JSONB,
    "full_report" JSONB,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "report_status" "ReportStatus" NOT NULL DEFAULT 'NONE',
    "email_status" "EmailStatus" NOT NULL DEFAULT 'NONE',
    "stripe_session_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "last_error" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "worker_locked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "report_ready_at" TIMESTAMP(3),
    "email_sent_at" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedStripeEvent" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedStripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_stripe_session_id_key" ON "Session"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Session_stripe_payment_intent_id_key" ON "Session"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "Session_payment_status_report_status_idx" ON "Session"("payment_status", "report_status");

-- CreateIndex
CREATE INDEX "Session_report_status_worker_locked_at_idx" ON "Session"("report_status", "worker_locked_at");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedStripeEvent_event_id_key" ON "ProcessedStripeEvent"("event_id");

-- CreateIndex
CREATE INDEX "ProcessedStripeEvent_session_id_idx" ON "ProcessedStripeEvent"("session_id");

-- AddForeignKey
ALTER TABLE "ProcessedStripeEvent" ADD CONSTRAINT "ProcessedStripeEvent_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
