const { Worker, UnrecoverableError } = require("bullmq");
const Redis = require("ioredis");
const { Resend } = require("resend");

const prisma = require("../db/prisma");
const openaiService = require("../services/openai.service");

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("Brak REDIS_URL w zmiennych środowiskowych.");
}

const workerRedis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

workerRedis.on("error", (err) => {
  console.error("[Redis Worker] Błąd połączenia:", err.message);
});

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const LOCK_STALE_MS = 10 * 60 * 1000;

console.log("Worker uruchomiony. Oczekuję na zadania...");

const reportWorker = new Worker(
  "reports",
  async (job) => {
    const { token } = job.data;

    if (!token) {
      throw new UnrecoverableError("Brak tokenu w jobie.");
    }

    console.log(
      `[Worker] Start zadania ${token} | próba ${job.attemptsMade + 1}/${job.opts.attempts}`
    );

    const staleBefore = new Date(Date.now() - LOCK_STALE_MS);

    const lockResult = await prisma.session.updateMany({
      where: {
        id: token,
        payment_status: "PAID",
        OR: [
          {
            report_status: "QUEUED",
          },
          {
            report_status: "PROCESSING",
            worker_locked_at: {
              lt: staleBefore,
            },
          },
        ],
      },
      data: {
        report_status: "PROCESSING",
        worker_locked_at: new Date(),
      },
    });

    if (lockResult.count === 0) {
      const current = await prisma.session.findUnique({
        where: { id: token },
        select: {
          id: true,
          payment_status: true,
          report_status: true,
          worker_locked_at: true,
        },
      });

      if (!current) {
        throw new UnrecoverableError(`Brak sesji dla tokena ${token}`);
      }

      if (current.payment_status !== "PAID") {
        throw new UnrecoverableError(`Sesja ${token} nie jest opłacona`);
      }

      if (current.report_status === "READY") {
        console.log(`[Worker] Raport ${token} już jest gotowy. Pomijam.`);
        return;
      }

      if (current.report_status === "FAILED") {
        console.log(`[Worker] Raport ${token} ma status FAILED. Pomijam.`);
        return;
      }

      console.log(`[Worker] Zadanie ${token} ma już aktywne przetwarzanie. Pomijam.`);
      return;
    }

    const session = await prisma.session.findUnique({
      where: { id: token },
      select: {
        id: true,
        email: true,
        payload: true,
        patterns: true,
        payment_status: true,
      },
    });

    if (!session) {
      throw new UnrecoverableError(`Nie znaleziono sesji po przejęciu locka: ${token}`);
    }

    try {
      const payload =
        typeof session.payload === "string"
          ? JSON.parse(session.payload)
          : session.payload;

      const patterns =
        typeof session.patterns === "string"
          ? JSON.parse(session.patterns)
          : session.patterns;

      const fullReport = await openaiService.generateFullReport({
        ...payload,
        patterns,
      });

      await prisma.session.update({
        where: { id: token },
        data: {
          full_report: fullReport,
          report_status: "READY",
          report_ready_at: new Date(),
          worker_locked_at: null,
          last_error: null,
          email_status: session.email && resend ? "PENDING" : "NONE",
        },
      });

      console.log(`[Worker] Raport dla ${token} zapisany.`);

      if (session.email && resend) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: session.email,
            subject: "Twój raport CzyToMaSens jest gotowy",
            html: `<div><h2>Raport jest gotowy</h2><p><a href="${process.env.CLIENT_URL}?success=1&token=${token}">Otwórz raport</a></p></div>`,
          });

          await prisma.session.update({
            where: { id: token },
            data: {
              email_status: "SENT",
              email_sent_at: new Date(),
            },
          });

          console.log(`[Worker] E-mail wysłany dla ${token}.`);
        } catch (emailError) {
          console.error(`[Worker] Błąd e-maila dla ${token}:`, emailError.message);

          await prisma.session.update({
            where: { id: token },
            data: {
              email_status: "FAILED",
              last_error: `EMAIL: ${emailError.message}`,
            },
          });
        }
      }
    } catch (error) {
      console.error(`[Worker] Błąd analizy dla ${token}:`, error.message);

      const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts || 1);

      if (isLastAttempt) {
        await prisma.session.update({
          where: { id: token },
          data: {
            report_status: "FAILED",
            last_error: error.message,
            retry_count: { increment: 1 },
            worker_locked_at: null,
          },
        });

        console.log(`[Worker] ${token} oznaczono jako FAILED.`);
      } else {
        await prisma.session.update({
          where: { id: token },
          data: {
            report_status: "QUEUED",
            last_error: `Próba ${job.attemptsMade + 1}: ${error.message}`,
            retry_count: { increment: 1 },
            worker_locked_at: null,
          },
        });
      }

      throw error;
    }
  },
  {
    connection: workerRedis,
    concurrency: 1,
  }
);

reportWorker.on("error", (err) => {
  console.error("[BullMQ Worker] Błąd instancji workera:", err.message);
});

reportWorker.on("failed", (job, err) => {
  console.error(`[BullMQ Worker] Job failed ${job?.id || "unknown"}:`, err.message);
});

reportWorker.on("completed", (job) => {
  console.log(`[BullMQ Worker] Job completed ${job.id}`);
});

async function shutdown(signal) {
  console.log(`\n[Worker] Otrzymano ${signal}. Zamykanie procesu...`);

  try {
    await reportWorker.close();
    console.log("[Worker] Worker zamknięty.");

    await prisma.$disconnect();
    console.log("[Worker] Prisma rozłączona.");

    await workerRedis.quit();
    console.log("[Worker] Redis rozłączony.");

    process.exit(0);
  } catch (error) {
    console.error("[Worker] Błąd przy zamykaniu:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));