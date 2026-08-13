"use strict";

const Stripe = require("stripe");
const prisma = require("../db/prisma.js");
const { createSignedAccess } = require("../security/report-access.js");

const CONSENT_VERSION = "2026-07-31";

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
  try { return JSON.parse(value); } catch { return fallback; }
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeText(value));
}
function parsePrice(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function getCheckoutKind(payload) {
  const kind = normalizeText(payload?.reportKind);
  if (kind === "followup") return "followup";
  if (kind === "couple") return "couple";
  return "initial";
}
async function existingOpenCheckout(session) {
  if (!stripe || !session?.stripe_session_id || session.payment_status === "PAID") return null;
  try {
    const checkout = await stripe.checkout.sessions.retrieve(session.stripe_session_id);
    if (checkout?.status === "open" && checkout?.url && checkout?.metadata?.consentVersion === CONSENT_VERSION) return checkout;
  } catch (error) {
    console.warn("[Stripe] Nie udało się odczytać poprzedniej sesji checkout:", error.message);
  }
  return null;
}

exports.createCheckout = async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ ok: false, error: "Płatności są chwilowo niedostępne." });

    const token = normalizeText(req.body?.token || req.body?.sessionToken || "");
    const email = normalizeText(req.body?.email || "");
    const consentAcceptedAt = normalizeText(req.body?.consentAcceptedAt || "");
    const consentAccepted = req.body?.consentAccepted === true;
    const consentVersion = normalizeText(req.body?.consentVersion || "");
    if (!token || !isValidUUID(token)) return res.status(400).json({ ok: false, error: "Nieprawidłowy token sesji." });
    if (!validEmail(email)) return res.status(400).json({ ok: false, error: "Nieprawidłowy adres e-mail." });
    if (!consentAccepted || consentVersion !== CONSENT_VERSION || !consentAcceptedAt || Number.isNaN(Date.parse(consentAcceptedAt))) {
      return res.status(400).json({
        ok: false,
        error: "Potwierdź rozpoczęcie realizacji usługi cyfrowej i utratę prawa odstąpienia po rozpoczęciu generowania raportu.",
      });
    }

    const dbSession = await prisma.session.findUnique({
      where: { id: token },
      select: { id: true, email: true, payload: true, payment_status: true, report_status: true, stripe_session_id: true },
    });
    if (!dbSession) return res.status(404).json({ ok: false, error: "Nie znaleziono sesji analizy." });
    if (dbSession.payment_status === "PAID") {
      return res.status(409).json({ ok: false, error: "Ta sesja została już opłacona. Nie płać drugi raz — wróć do raportu." });
    }

    const payload = safeJson(dbSession.payload, {});
    const kind = getCheckoutKind(payload);
    if (kind === "followup") {
      if (!normalizeText(payload?.recoveryToken)) return res.status(400).json({ ok: false, error: "Brak danych poprzedniej analizy dla raportu porównawczego." });
      if (!Array.isArray(payload?.followUpHistory) || payload.followUpHistory.length === 0) return res.status(400).json({ ok: false, error: "Brak odpowiedzi z ponownego odczytu." });
    }
    if (kind === "couple" && !normalizeText(payload?.coupleId)) {
      return res.status(400).json({ ok: false, error: "Brak danych wspólnej analizy dla dwojga." });
    }

    const previousCheckout = await existingOpenCheckout(dbSession);
    if (previousCheckout) {
      return res.json({ ok: true, url: previousCheckout.url, checkoutUrl: previousCheckout.url, sessionId: previousCheckout.id, token, reused: true });
    }

    const initialPriceAmountGr = parsePrice(process.env.INITIAL_PRICE_AMOUNT_GR, 1999);
    const followupPriceAmountGr = parsePrice(process.env.FOLLOWUP_PRICE_AMOUNT_GR, 999);
    const couplePriceAmountGr = parsePrice(process.env.COUPLE_PRICE_AMOUNT_GR, 3999);
    const priceAmountGr = kind === "followup" ? followupPriceAmountGr : kind === "couple" ? couplePriceAmountGr : initialPriceAmountGr;
    const clientUrl = normalizeText(process.env.CLIENT_URL || "https://czytomasens.pl").replace(/\/$/, "");

    let successUrl;
    let cancelUrl;
    if (kind === "couple") {
      successUrl = `${clientUrl}/dla-par?couple_payment=success`;
      cancelUrl = `${clientUrl}/dla-par?couple_payment=cancel`;
    } else {
      const access = createSignedAccess(token);
      successUrl = `${clientUrl}?success=1&access_token=${encodeURIComponent(access.token)}&exp=${encodeURIComponent(access.exp)}&sig=${encodeURIComponent(access.sig)}`;
      cancelUrl = `${clientUrl}?cancel=1`;
    }

    const ipAddress = normalizeText(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim() || normalizeText(req.ip || "");
    const userAgent = normalizeText(req.headers["user-agent"] || "");
    const productName = kind === "followup"
      ? "CzyToMaSens — raport porównawczy"
      : kind === "couple"
        ? "CzyToMaSens — Dwa Spojrzenia Premium"
        : "CzyToMaSens — pełny raport premium";
    const productDescription = kind === "followup"
      ? "Porównanie zmian z całą historią wcześniejszych odczytów."
      : kind === "couple"
        ? "Pełna wspólna analiza dwóch perspektyw, moderowane odniesienie, wspólna synteza i eksperyment relacyjny dla całej pary."
        : "Indywidualny raport analityczny przygotowany na podstawie Twoich odpowiedzi.";

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      payment_method_types: ["card", "blik"],
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "pln",
          unit_amount: priceAmountGr,
          product_data: { name: productName, description: productDescription },
        },
      }],
      metadata: {
        token,
        email: email.slice(0, 450),
        consentAcceptedAt,
        consentAccepted: "true",
        consentVersion,
        consentScope: "immediate_digital_content_and_withdrawal_acknowledgement",
        ipAddress: ipAddress.slice(0, 200),
        userAgent: userAgent.slice(0, 450),
        entryKey: normalizeText(payload?.entryKey || payload?.path || payload?.coupleId || "").slice(0, 450),
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
        payload: {
          ...payload,
          purchaseConsent: { accepted: true, acceptedAt: consentAcceptedAt, version: consentVersion },
        },
      },
    });

    return res.json({ ok: true, url: checkout.url, checkoutUrl: checkout.url, sessionId: checkout.id, token, reportKind: kind, amountGr: priceAmountGr });
  } catch (error) {
    console.error("POST /api/create-checkout error:", error);
    return res.status(500).json({ ok: false, error: "Błąd inicjalizacji płatności." });
  }
};
