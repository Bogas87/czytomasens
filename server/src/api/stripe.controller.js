import Stripe from "stripe";

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
  apiVersion: "2024-06-20",
});

function normalizeText(value) {
  return String(value || "").trim();
}

export async function createCheckout(req, res) {
  try {
    const token = normalizeText(req.body?.token || req.body?.sessionToken || "");
    const email = normalizeText(req.body?.email || "");
    const consentAcceptedAt = normalizeText(
      req.body?.consentAcceptedAt || new Date().toISOString()
    );
    const payload = req.body?.payload || {};

    if (!token) {
      return res.status(400).json({
        ok: false,
        error: "Brak tokenu sesji.",
      });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        ok: false,
        error: "Nieprawidłowy adres e-mail.",
      });
    }

    const ipAddress =
      normalizeText(req.headers["x-forwarded-for"] || "")
        .split(",")[0]
        ?.trim() || normalizeText(req.ip || "");

    const userAgent = normalizeText(req.headers["user-agent"] || "");

    const successUrl = `${process.env.CLIENT_URL}?success=1&token=${encodeURIComponent(token)}`;
    const cancelUrl = `${process.env.CLIENT_URL}?cancelled=1`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: 1500,
            product_data: {
              name: "CzyToMaSens — pełny raport premium",
              description: "Dogłębna analiza relacji i pełny raport premium",
            },
          },
        },
      ],
      metadata: {
        token,
        email,
        consentAcceptedAt,
        ipAddress: ipAddress.slice(0, 200),
        userAgent: userAgent.slice(0, 500),
        entryKey: normalizeText(payload?.entryKey || ""),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.json({
      ok: true,
      url: session.url,
      checkoutUrl: session.url,
      sessionId: session.id,
      token,
    });
  } catch (error) {
    console.error("POST /api/create-checkout error:", error);
    return res.status(500).json({
      ok: false,
      error: "Błąd inicjalizacji płatności.",
    });
  }
}

export default { createCheckout };