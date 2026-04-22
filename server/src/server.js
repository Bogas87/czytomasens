import express from "express";
import cors from "cors";
import Stripe from "stripe";
import routes from "./api/routes.js";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const stripeSecret = (process.env.STRIPE_SECRET_KEY || "").trim();
const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// WEBHOOK MUSI BYĆ PRZED express.json()
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      if (!stripe || !webhookSecret) {
        return res.status(400).json({
          ok: false,
          error: "Brak konfiguracji Stripe webhook.",
        });
      }

      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return res.status(400).json({
          ok: false,
          error: "Brak stripe-signature.",
        });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.error("[WEBHOOK] Błąd weryfikacji podpisu:", err.message);
        return res.status(400).json({
          ok: false,
          error: "Nieprawidłowa sygnatura webhooka.",
        });
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const token = session?.metadata?.token || null;
        const email = session?.metadata?.email || session?.customer_email || null;

        if (!token) {
          console.error("[WEBHOOK] Brak tokenu w metadata.");
          return res.status(200).json({ ok: true });
        }

        try {
          await prisma.session.upsert({
            where: { id: token },
            update: {
              payment_status: "PAID",
              report_status: "QUEUED",
              email,
              stripe_session_id: session.id,
              paid_at: new Date(),
            },
            create: {
              id: token,
              email,
              payment_status: "PAID",
              report_status: "QUEUED",
              stripe_session_id: session.id,
              paid_at: new Date(),
            },
          });

          try {
            const queueModule = await import("./jobs/queue.js");
            if (typeof queueModule.enqueueReport === "function") {
              await queueModule.enqueueReport(token);
              console.log(`[WEBHOOK] Raport zakolejkowany dla tokenu: ${token}`);
            } else {
              console.warn("[WEBHOOK] enqueueReport nie znaleziony w ./jobs/queue.js");
            }
          } catch (queueErr) {
            console.error("[WEBHOOK] Błąd kolejki:", queueErr.message);
          }
        } catch (dbErr) {
          console.error("[WEBHOOK] Błąd zapisu płatności:", dbErr.message);
        }
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[WEBHOOK] Błąd ogólny:", err.message);
      return res.status(200).json({ ok: true });
    }
  }
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "CzyToMaSens API",
    model: process.env.OPENAI_MODEL || "gpt-4o",
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`CzyToMaSens API działa na porcie ${PORT}`);
});