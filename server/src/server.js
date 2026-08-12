"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const Stripe = require("stripe");
const { ZodError } = require("zod");

const prisma = require("./db/prisma");
const routes = require("./api/routes.js");
const followupRoutes = require("./routes/followup.routes.js");
const feedbackRoutes = require("./routes/feedback.routes.js");
const v3Routes = require("./routes/v3.routes.js");
const coupleRoutes = require("./routes/couple.routes.js");

const app = express();
const stripeSecret = String(process.env.STRIPE_SECRET_KEY || "").trim();
const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" }) : null;

app.disable("x-powered-by");
app.set("trust proxy", 1);

const ALLOWED_ORIGINS = [
  "https://czytomasens.pl",
  "https://www.czytomasens.pl",
  process.env.CLIENT_URL,
  process.env.DEV_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== "production") return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

function isUniqueConstraintError(error) {
  return error?.code === "P2002" || /unique constraint/i.test(String(error?.message || ""));
}

async function markStripeEventProcessed(event, token) {
  try {
    await prisma.processedStripeEvent.create({
      data: {
        event_id: event.id,
        event_type: event.type,
        session_id: token,
      },
    });
    return true;
  } catch (error) {
    if (isUniqueConstraintError(error)) return true;
    throw error;
  }
}

async function processPaidCheckoutEvent(event) {
  const checkout = event.data.object;
  const token = checkout?.metadata?.token || null;
  const email = checkout?.metadata?.email || checkout?.customer_email || null;

  if (!token) {
    console.error("[WEBHOOK] Brak tokenu w metadata Stripe.");
    return { ok: true, ignored: true };
  }

  const alreadyProcessed = await prisma.processedStripeEvent.findUnique({
    where: { event_id: event.id },
  });
  if (alreadyProcessed) {
    console.log(`[WEBHOOK] Event ${event.id} już przetworzony.`);
    return { ok: true, duplicate: true };
  }

  if (checkout?.payment_status && checkout.payment_status !== "paid") {
    console.log(`[WEBHOOK] Checkout ${checkout.id} nie ma jeszcze statusu paid.`);
    return { ok: true, pending: true };
  }

  const existingSession = await prisma.session.findUnique({
    where: { id: token },
    select: { id: true, report_status: true, payment_status: true },
  });
  if (!existingSession) {
    throw new Error(`Nie znaleziono sesji ${token} powiązanej z płatnością.`);
  }

  const paymentIntentId = typeof checkout?.payment_intent === "string"
    ? checkout.payment_intent
    : checkout?.payment_intent?.id || null;

  await prisma.session.update({
    where: { id: token },
    data: {
      payment_status: "PAID",
      report_status: existingSession.report_status === "READY" ? "READY" : "QUEUED",
      email,
      stripe_session_id: checkout.id,
      ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
      paid_at: new Date(),
      last_error: null,
    },
  });

  if (existingSession.report_status !== "READY") {
    const queueModule = require("./jobs/queue.js");
    if (typeof queueModule.enqueueReport !== "function") {
      throw new Error("Brak funkcji enqueueReport w module kolejki.");
    }
    await queueModule.enqueueReport(token);
    console.log(`[WEBHOOK] Raport zakolejkowany: ${token}`);
  }

  await markStripeEventProcessed(event, token);
  return { ok: true };
}

// Stripe wymaga surowego body. Ta trasa musi pozostać przed express.json().
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      if (!stripe || !webhookSecret) {
        return res.status(503).json({ ok: false, error: "Brak konfiguracji Stripe webhook." });
      }
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return res.status(400).json({ ok: false, error: "Brak stripe-signature." });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      } catch (error) {
        console.error("[WEBHOOK] Błąd weryfikacji podpisu:", error.message);
        return res.status(400).json({ ok: false, error: "Nieprawidłowa sygnatura webhooka." });
      }

      if (
        event.type === "checkout.session.completed"
        || event.type === "checkout.session.async_payment_succeeded"
      ) {
        await processPaidCheckoutEvent(event);
      }

      if (event.type === "checkout.session.async_payment_failed") {
        const checkout = event.data.object;
        const token = checkout?.metadata?.token || null;
        if (token) {
          await prisma.session.updateMany({
            where: { id: token, payment_status: "PENDING" },
            data: {
              payment_status: "FAILED",
              last_error: "Stripe: płatność nie została potwierdzona.",
            },
          });
        }
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("[WEBHOOK] Błąd przetwarzania:", error.message);
      return res.status(500).json({
        ok: false,
        error: "Webhook nie został jeszcze poprawnie przetworzony.",
      });
    }
  }
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const standardLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Zbyt wiele zapytań. Poczekaj chwilę i spróbuj ponownie." },
});

// V3 musi być zamontowane przed ogólnym routerem /api.
app.use("/api/couple", standardLimiter, coupleRoutes);
app.use("/api/v3", standardLimiter, v3Routes);
app.use("/api/followup", standardLimiter, followupRoutes);
app.use("/api/feedback", standardLimiter, feedbackRoutes);
app.use("/api", routes);

app.get("/api/health", async (req, res) => {
  let database = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "ok";
  } catch {
    database = "error";
  }

  res.status(database === "ok" ? 200 : 503).json({
    ok: database === "ok",
    service: "CzyToMaSens API",
    version: "3.1.0",
    database,
    v3: true,
    modelConfigured: Boolean(String(process.env.OPENAI_MODEL || "").trim()),
    reportModelConfigured: Boolean(String(process.env.OPENAI_REPORT_MODEL || process.env.OPENAI_MODEL || "").trim()),
    redisConfigured: Boolean(String(process.env.REDIS_URL || "").trim()),
    stripeConfigured: Boolean(stripeSecret && webhookSecret),
    price: process.env.INITIAL_PRICE_AMOUNT_GR || "1999",
    followupPrice: process.env.FOLLOWUP_PRICE_AMOUNT_GR || "999",
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Route not found", path: req.originalUrl });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: "Nieprawidłowe dane wejściowe.",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (/CORS:/.test(String(error?.message || ""))) {
    return res.status(403).json({ ok: false, error: "Origin not allowed" });
  }

  console.error("[API] Nieobsłużony błąd:", error);
  return res.status(error?.status || 500).json({
    ok: false,
    error: process.env.NODE_ENV === "production"
      ? "Wystąpił błąd serwera. Spróbuj ponownie."
      : String(error?.message || "Wystąpił błąd serwera."),
  });
});

const PORT = Number(process.env.PORT || 8080);
const server = app.listen(PORT, () => {
  console.log(`CzyToMaSens API 3.1 działa na porcie ${PORT}`);
});

async function shutdown(signal) {
  console.log(`[API] ${signal}: zamykanie procesu.`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(0);
    }
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
