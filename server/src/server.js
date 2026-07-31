"use strict";

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const Stripe = require("stripe");
const routes = require("./api/routes.js");
const followupRoutes = require("./routes/followup.routes.js");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const stripeSecret = (process.env.STRIPE_SECRET_KEY || "").trim();
const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

app.set("trust proxy", 1);

const ALLOWED_ORIGINS = [
  "https://czytomasens.pl",
  "https://www.czytomasens.pl",
  process.env.CLIENT_URL,
  process.env.DEV_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// WEBHOOK MUSI BYĆ PRZED express.json()
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
    console.log(`[WEBHOOK] Event ${event.id} już przetworzony. Pomijam.`);
    return { ok: true, duplicate: true };
  }

  // Nie generujemy raportu, dopóki Stripe nie potwierdzi realnie opłaconej sesji.
  if (checkout?.payment_status && checkout.payment_status !== "paid") {
    console.log(`[WEBHOOK] Checkout ${checkout.id} nie ma statusu paid. Oczekuję na potwierdzenie płatności.`);
    return { ok: true, pending: true };
  }

  const existingSession = await prisma.session.findUnique({
    where: { id: token },
    select: {
      id: true,
      report_status: true,
      payment_status: true,
    },
  });

  if (!existingSession) {
    // 500 powoduje ponowienie webhooka przez Stripe; nie tworzymy pustej sesji bez danych raportu.
    throw new Error(`Nie znaleziono sesji ${token} powiązanej z opłaconą płatnością.`);
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
    },
  });

  if (existingSession.report_status !== "READY") {
    const queueModule = require("./jobs/queue.js");
    if (typeof queueModule.enqueueReport !== "function") {
      throw new Error("Brak funkcji enqueueReport w module kolejki.");
    }

    // Job ma stałe jobId report-${token}, więc ponowiony webhook nie wygeneruje równoległego duplikatu.
    await queueModule.enqueueReport(token);
    console.log(`[WEBHOOK] Raport zakolejkowany: ${token}`);
  }

  // Event oznaczamy jako zakończony dopiero PO zapisie płatności i skutecznym dodaniu joba.
  // Jeżeli baza albo Redis chwilowo padną wcześniej, zwracamy 500 i Stripe ponowi webhook.
  await markStripeEventProcessed(event, token);

  return { ok: true };
}

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
            data: { payment_status: "FAILED", last_error: "Stripe: płatność nie została potwierdzona." },
          });
        }
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      // Nie potwierdzamy błędnie obsłużonego opłaconego eventu.
      // Stripe może wtedy bezpiecznie ponowić dostarczenie webhooka.
      console.error("[WEBHOOK] Błąd przetwarzania:", error.message);
      return res.status(500).json({ ok: false, error: "Webhook nie został jeszcze poprawnie przetworzony." });
    }
  }
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const followupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Zbyt wiele zapytań. Poczekaj chwilę i spróbuj ponownie." },
});

// Anonimowy powrót, przypomnienia i ponowny odczyt — bez kont użytkowników.
app.use("/api/followup", followupLimiter, followupRoutes);

app.use("/api", routes);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "CzyToMaSens API",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    price: process.env.INITIAL_PRICE_AMOUNT_GR || "1999",
    followupPrice: process.env.FOLLOWUP_PRICE_AMOUNT_GR || "999",
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Route not found", path: req.originalUrl });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`CzyToMaSens API działa na porcie ${PORT}`);
});
