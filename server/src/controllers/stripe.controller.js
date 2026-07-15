"use strict";

const Stripe = require("stripe");
const prisma = require("../db/prisma.js");

const stripeSecret = (process.env.STRIPE_SECRET_KEY || "").trim();
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid || "");
}

function safeJson(value, fallback = {}) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeText(value));
}

function parsePrice(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getCheckoutKind(payload) {
  return normalizeText(payload?.reportKind) === "followup" ? "followup" : "initial";
}

async function existingOpenCheckout(session) {
  if (!stripe || !session?.stripe_session_id || session.payment_status === "PAID") return null;
  try {
    const checkout = await stripe.checkout.sessions.retrieve(session.stripe_session_id);
    if (checkout?.status === "open" && checkout?.url) return checkout;
  } catch (error) {
    console.warn("[Stripe] Nie udało się odczytać poprzedniej sesji checkout:", error.message);
  }
  return null;
}

exports.createCheckout = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ ok: false, error: "Płatności są chwilowo niedostępne." });
    }

    const token = normalizeText(req.body?.token || req.body?.sessionToken || "");
    const email = normalizeText(req.body?.email || "");
    const consentAcceptedAt = normalizeText(req.body?.consentAcceptedAt || "");

    if (!token || !isValidUUID(token)) {
      return res.status(400).json({ ok: false, error: "Nieprawidłowy token sesji." });
    }
    if (!validEmail(email)) {
      return res.status(400).json({ ok: false, error: "Nieprawidłowy adres e-mail." });
    }
    if (!consentAcceptedAt || Number.isNaN(Date.parse(consentAcceptedAt))) {
      return res.status(400).json({ ok: false, error: "Brak prawidłowej zgody na rozpoczęcie realizacji usługi." });
    }

    const dbSession = await prisma.session.findUnique({
      where: { id: token },
      select: {
        id: true,
        email: true,
        payload: true,
        payment_status: true,
        report_status: true,
        stripe_session_id: true,
      },
    });

    if (!dbSession) {
      return res.status(404).json({ ok: false, error: "Nie znaleziono sesji analizy." });
    }

    if (dbSession.payment_status === "PAID") {
      return res.status(409).json({
        ok: false,
        error: "Ta sesja została już opłacona. Nie płać drugi raz — wróć do raportu.",
      });
    }

    const payload = safeJson(dbSession.payload, {});
    const kind = getCheckoutKind(payload);

    if (kind === "followup") {
      if (!normalizeText(payload?.recoveryToken)) {
        return res.status(400).json({ ok: false, error: "Brak danych poprzedniej analizy dla raportu porównawczego." });
      }
      if (!Array.isArray(payload?.followUpHistory) || payload.followUpHistory.length === 0) {
        return res.status(400).json({ ok: false, error: "Brak odpowiedzi z ponownego odczytu." });
      }
    }

    const previousCheckout = await existingOpenCheckout(dbSession);
    if (previousCheckout) {
      return res.json({
        ok: true,
        url: previousCheckout.url,
        checkoutUrl: previousCheckout.url,
        sessionId: previousCheckout.id,
        token,
        reused: true,
      });
    }

    // Nowe nazwy zmiennych celowo nie korzystają z dawnego PRICE_AMOUNT_GR,
    // żeby stara wartość 2900 na Railway nie nadpisywała nowej ceny 19,99 zł.
    const initialPriceAmountGr = parsePrice(process.env.INITIAL_PRICE_AMOUNT_GR, 1999);
    const followupPriceAmountGr = parsePrice(process.env.FOLLOWUP_PRICE_AMOUNT_GR, 999);
    const priceAmountGr = kind === "followup" ? followupPriceAmountGr : initialPriceAmountGr;

    const clientUrl = normalizeText(process.env.CLIENT_URL || "https://czytomasens.pl").replace(/\/$/, "");
    const successUrl = `${clientUrl}?success=1&token=${encodeURIComponent(token)}`;
    const cancelUrl = `${clientUrl}?cancel=1`;

    const ipAddress = normalizeText(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim()
      || normalizeText(req.ip || "");
    const userAgent = normalizeText(req.headers["user-agent"] || "");

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      payment_method_types: ["card", "blik"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: priceAmountGr,
            product_data: {
              name: kind === "followup"
                ? "CzyToMaSens — raport porównawczy"
                : "CzyToMaSens — pełny raport premium",
              description: kind === "followup"
                ? "Porównanie zmian z całą historią wcześniejszych odczytów."
                : "Indywidualny raport analityczny przygotowany na podstawie Twoich odpowiedzi.",
            },
          },
        },
      ],
      metadata: {
        token,
        email: email.slice(0, 450),
        consentAcceptedAt,
        ipAddress: ipAddress.slice(0, 200),
        userAgent: userAgent.slice(0, 450),
        entryKey: normalizeText(payload?.entryKey || payload?.path || "").slice(0, 450),
        reportKind: kind,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    await prisma.session.update({
      where: { id: token },
      data: {
        email,
        stripe_session_id: checkout.id,
      },
    });

    return res.json({
      ok: true,
      url: checkout.url,
      checkoutUrl: checkout.url,
      sessionId: checkout.id,
      token,
      reportKind: kind,
      amountGr: priceAmountGr,
    });
  } catch (error) {
    console.error("POST /api/create-checkout error:", error);
    return res.status(500).json({ ok: false, error: "Błąd inicjalizacji płatności." });
  }
};
