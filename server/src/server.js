"use strict";

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const routes = require("./api/routes.js");
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
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      if (!stripe || !webhookSecret) {
        return res.status(400).json({ ok: false, error: "Brak konfiguracji Stripe webhook." });
      }

      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return res.status(400).json({ ok: false, error: "Brak stripe-signature." });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      } catch (err) {
        console.error("[WEBHOOK] Błąd weryfikacji podpisu:", err.message);
        return res.status(400).json({ ok: false, error: "Nieprawidłowa sygnatura webhooka." });
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const token = session?.metadata?.token || null;
        const email = session?.metadata?.email || session?.customer_email || null;

        try {
          const alreadyProcessed = await prisma.processedStripeEvent.findUnique({
            where: { event_id: event.id },
          });

          if (alreadyProcessed) {
            console.log(`[WEBHOOK] Event ${event.id} już przetworzony. Pomijam.`);
            return res.status(200).json({ ok: true });
          }

          await prisma.processedStripeEvent.create({
            data: {
              event_id: event.id,
              event_type: event.type,
              session_id: token || null,
            },
          });
        } catch (dedupErr) {
          console.error("[WEBHOOK] Błąd deduplicacji eventu:", dedupErr.message);
          return res.status(200).json({ ok: true });
        }

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
            const queueModule = require("./jobs/queue.js");
            if (typeof queueModule.enqueueReport === "function") {
              await queueModule.enqueueReport(token);
              console.log(`[WEBHOOK] Raport zakolejkowany: ${token}`);
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

// SEO — sitemap i robots
app.get("/sitemap.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.czytomasens.pl/</loc>
    <lastmod>2026-06-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

app.get("/robots.txt", (req, res) => {
  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *\nAllow: /\n\nSitemap: https://www.czytomasens.pl/sitemap.xml`);
});

app.use("/api", routes);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "CzyToMaSens API",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    price: process.env.PRICE_AMOUNT_GR || "2900",
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Route not found", path: req.originalUrl });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`CzyToMaSens API działa na porcie ${PORT}`);
});
