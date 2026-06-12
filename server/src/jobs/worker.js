"use strict";

const crypto = require("crypto");
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

const resendApiKey = (process.env.RESEND_API_KEY || "").trim();
const resendFromEmail = (process.env.RESEND_FROM_EMAIL || "").trim();
const clientUrl = (process.env.CLIENT_URL || "https://www.czytomasens.pl").replace(/\/$/, "");

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const LOCK_STALE_MS = 10 * 60 * 1000;

function getSignedSecret() {
  return (
    process.env.REPORT_LINK_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.OPENAI_API_KEY ||
    "ctms-dev-secret"
  );
}

function createSignedAccess(token, ttlMs = 1000 * 60 * 60 * 48) {
  const exp = String(Date.now() + ttlMs);
  const sig = crypto
    .createHmac("sha256", getSignedSecret())
    .update(`${token}.${exp}`)
    .digest("hex");

  return { token, exp, sig };
}

function buildReportUrl(token) {
  const access = createSignedAccess(token);
  return `${clientUrl}?access_token=${encodeURIComponent(access.token)}&exp=${encodeURIComponent(access.exp)}&sig=${encodeURIComponent(access.sig)}`;
}

function safeJson(value, fallback) {
  if (!value) return fallback;

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildEmailHtml(reportUrl) {
  const safeUrl = escapeHtml(reportUrl);

  return `
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <title>Twój raport CzyToMaSens jest gotowy</title>
  </head>
  <body style="margin:0;padding:0;background:#0b0b0b;color:#f5f1ea;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#151515;border:1px solid rgba(255,255,255,0.10);border-radius:22px;overflow:hidden;">
            <tr>
              <td style="padding:34px 30px 22px 30px;">
                <div style="font-size:13px;letter-spacing:0.28em;color:#c5a059;text-transform:uppercase;margin-bottom:16px;">
                  CzyToMaSens
                </div>

                <h1 style="margin:0 0 14px 0;font-size:30px;line-height:1.12;color:#f5f1ea;">
                  Twój raport premium jest gotowy.
                </h1>

                <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;color:#cfc8bd;">
                  System zakończył analizę. Raport możesz otworzyć przez bezpieczny link poniżej.
                </p>

                <p style="margin:0 0 26px 0;font-size:15px;line-height:1.7;color:#a8a099;">
                  Link jest ważny 48 godzin. Raport możesz otworzyć na telefonie, komputerze albo wrócić do niego później z tej wiadomości.
                </p>

                <a href="${safeUrl}" style="display:inline-block;background:#c5a059;color:#111111;text-decoration:none;font-weight:700;border-radius:999px;padding:15px 24px;font-size:15px;">
                  Otwórz raport
                </a>

                <p style="margin:28px 0 0 0;font-size:13px;line-height:1.7;color:#827b72;">
                  Jeśli przycisk nie działa, skopiuj ten link do przeglądarki:<br />
                  <span style="word-break:break-all;color:#c5a059;">${safeUrl}</span>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 30px 30px 30px;border-top:1px solid rgba(255,255,255,0.08);">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#777;">
                  To automatyczna wiadomość z serwisu CzyToMaSens. Raport ma charakter informacyjny i refleksyjny. Nie zastępuje pomocy psychologicznej, prawnej ani medycznej.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

function buildEmailText(reportUrl) {
  return `Twój raport CzyToMaSens jest gotowy.

Otwórz raport:
${reportUrl}

Link jest ważny 48 godzin.

Raport ma charakter informacyjny i refleksyjny. Nie zastępuje pomocy psychologicznej, prawnej ani medycznej.`;
}

async function markEmailFailure(token, message) {
  await prisma.session.update({
    where: { id: token },
    data: {
      email_status: "FAILED",
      last_error: `EMAIL: ${message}`,
    },
  });
}

async function sendReportEmail({ token, email }) {
  if (!email) {
    await prisma.session.update({
      where: { id: token },
      data: {
        email_status: "NONE",
      },
    });
    console.log(`[Worker] Brak adresu e-mail dla ${token}. Pomijam wysyłkę.`);
    return;
  }

  if (!resendApiKey || !resend) {
    await markEmailFailure(token, "Brak RESEND_API_KEY w zmiennych środowiskowych.");
    console.error(`[Worker] Nie wysłano e-maila dla ${token}: brak RESEND_API_KEY.`);
    return;
  }

  if (!resendFromEmail) {
    await markEmailFailure(token, "Brak RESEND_FROM_EMAIL w zmiennych środowiskowych.");
    console.error(`[Worker] Nie wysłano e-maila dla ${token}: brak RESEND_FROM_EMAIL.`);
    return;
  }

  const reportUrl = buildReportUrl(token);

  await prisma.session.update({
    where: { id: token },
    data: {
      email_status: "PENDING",
    },
  });

  try {
    const result = await resend.emails.send({
      from: resendFromEmail,
      to: email,
      subject: "Twój raport CzyToMaSens jest gotowy",
      html: buildEmailHtml(reportUrl),
      text: buildEmailText(reportUrl),
    });

    await prisma.session.update({
      where: { id: token },
      data: {
        email_status: "SENT",
        email_sent_at: new Date(),
        last_error: null,
      },
    });

    console.log(`[Worker] E-mail wysłany dla ${token}. Resend ID: ${result?.data?.id || "brak-id"}`);
  } catch (error) {
    console.error(`[Worker] Błąd e-maila dla ${token}:`, error.message);
    await markEmailFailure(token, error.message);
  }
}

console.log("Worker uruchomiony. Oczekuję na zadania...");

const reportWorker = new Worker(
  "reports",
  async (job) => {
    const { token } = job.data;

    if (!token) {
      throw new UnrecoverableError("Brak tokenu w jobie.");
    }

    console.log(`[Worker] Start zadania ${token} | próba ${job.attemptsMade + 1}/${job.opts.attempts}`);

    const staleBefore = new Date(Date.now() - LOCK_STALE_MS);

    const lockResult = await prisma.session.updateMany({
      where: {
        id: token,
        payment_status: "PAID",
        OR: [
          { report_status: "QUEUED" },
          {
            report_status: "PROCESSING",
            worker_locked_at: { lt: staleBefore },
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
        throw new UnrecoverableError(`Sesja ${token} nie jest opłacona.`);
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
      const payload = safeJson(session.payload, {});
      const patterns = safeJson(session.patterns, []);

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
          email_status: session.email ? "PENDING" : "NONE",
        },
      });

      console.log(`[Worker] Raport dla ${token} zapisany.`);

      await sendReportEmail({
        token,
        email: session.email,
      });
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

        console.log(`[Worker] ${token} wraca do kolejki po błędzie.`);
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