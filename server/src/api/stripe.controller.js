const Stripe = require("stripe");
const { Prisma } = require("@prisma/client");

const prisma = require("../db/prisma");
const { enqueueReport } = require("../jobs/queue");

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim());

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid || ""
  );
}

function isValidEmail(email) {
  const e = normalizeText(email);
  return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

exports.createCheckout = async (req, res) => {
  try {
    const email = normalizeText(req.body.email || "");
    const payload = req.body.payload || {};
    const tokenFromBody = normalizeText(req.body.token || "");

    const customDescription = normalizeText(
      payload.customDescription || payload.customText || payload.input || ""
    );

    if (!customDescription || customDescription.length < 10) {
      return res.status(400).json({ ok: false, message: "Brak treści do analizy." });
    }

    if (customDescription.length > 20000) {
      return res.status(400).json({ ok: false, message: "Opis jest zbyt długi." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Nieprawidłowy adres e-mail." });
    }

    let sessionRecord = null;

    if (tokenFromBody && isValidUUID(tokenFromBody)) {
      sessionRecord = await prisma.session.findUnique({
        where: { id: tokenFromBody },
      });
    }

    if (sessionRecord) {
      sessionRecord = await prisma.session.update({
        where: { id: sessionRecord.id },
        data: {
          email: email || null,
          payload,
        },
      });
    } else {
      sessionRecord = await prisma.session.create({
        data: {
          id: tokenFromBody && isValidUUID(tokenFromBody) ? tokenFromBody : undefined,
          email: email || null,
          payload,
        },
      });
    }

    const stripeSession = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: "pln",
              product_data: {
                name: "CzyToMaSens – pełny raport",
                description: "Rozszerzona analiza wzorców relacyjnych",
              },
              unit_amount: 4900,
            },
            quantity: 1,
          },
        ],
        metadata: { token: sessionRecord.id },
        client_reference_id: sessionRecord.id,
        success_url: `${process.env.CLIENT_URL}?success=1&token=${sessionRecord.id}`,
        cancel_url: `${process.env.CLIENT_URL}?cancel=1`,
      },
      {
        idempotencyKey: `checkout_${sessionRecord.id}`,
      }
    );

    await prisma.session.update({
      where: { id: sessionRecord.id },
      data: {
        stripe_session_id: stripeSession.id,
      },
    });

    return res.json({
      ok: true,
      checkoutUrl: stripeSession.url,
      token: sessionRecord.id,
    });
  } catch (error) {
    console.error("[Stripe API] Checkout error:", error.message);
    return res.status(500).json({ ok: false, message: "Błąd tworzenia płatności." });
  }
};

exports.handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("Brak webhook secret.");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  res.json({ received: true });

  void processWebhookEvent(event).catch((error) => {
    console.error("[Webhook] Nieobsłużony błąd:", error.message);
  });
};

async function processWebhookEvent(event) {
  const stripeEventId = event.id;

  let sessionData = null;
  let paymentAction = "NONE";

  if (event.type === "checkout.session.completed") {
    sessionData = event.data.object;
    if (sessionData.payment_status === "paid") {
      paymentAction = "PAID";
    }
  } else if (event.type === "checkout.session.async_payment_succeeded") {
    sessionData = event.data.object;
    paymentAction = "PAID";
  } else if (event.type === "checkout.session.async_payment_failed") {
    sessionData = event.data.object;
    paymentAction = "FAILED";
  } else {
    return;
  }

  const token = sessionData?.metadata?.token || sessionData?.client_reference_id;

  if (!token || !isValidUUID(token)) {
    return;
  }

  let enqueueNeeded = false;

  try {
    await prisma.$transaction(async (tx) => {
      const dbSession = await tx.session.findUnique({
        where: { id: token },
      });

      await tx.processedStripeEvent.create({
        data: {
          event_id: stripeEventId,
          event_type: event.type,
          session_id: dbSession ? token : null,
        },
      });

      if (!dbSession) {
        return;
      }

      if (paymentAction === "FAILED") {
        if (dbSession.payment_status !== "PAID") {
          await tx.session.update({
            where: { id: token },
            data: {
              payment_status: "FAILED",
              last_error:
                "[STRIPE_ASYNC_FAILED] Płatność opóźniona zakończyła się niepowodzeniem.",
            },
          });
        }
        return;
      }

      if (paymentAction === "PAID" && dbSession.payment_status !== "PAID") {
        await tx.session.update({
          where: { id: token },
          data: {
            payment_status: "PAID",
            report_status: "QUEUED",
            stripe_session_id: sessionData.id || dbSession.stripe_session_id,
            stripe_payment_intent_id:
              sessionData.payment_intent || dbSession.stripe_payment_intent_id,
            paid_at: new Date(),
            last_error: null,
          },
        });

        enqueueNeeded = true;
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      console.log(`[Webhook] Event ${stripeEventId} już był przetworzony.`);
      return;
    }

    throw error;
  }

  if (!enqueueNeeded) {
    return;
  }

  try {
    await enqueueReport(token);
    console.log(`[Webhook] Płatność ${token} zaksięgowana. Job dodany do kolejki.`);
  } catch (queueError) {
    console.error(
      `[Webhook] Zaksięgowano płatność, ale enqueue się nie udał dla ${token}:`,
      queueError.message
    );

    await prisma.session.update({
      where: { id: token },
      data: {
        report_status: "QUEUED",
        last_error: `[ENQUEUE_FAILED] ${queueError.message}`,
      },
    });
  }
}