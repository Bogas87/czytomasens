"use strict";

const crypto = require("crypto");

const DEFAULT_TTL_MS = 48 * 60 * 60 * 1000;

function getSigningSecret() {
  const secret = (
    process.env.REPORT_LINK_SECRET
    || process.env.STRIPE_WEBHOOK_SECRET
    || process.env.OPENAI_API_KEY
    || ""
  ).trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Brak REPORT_LINK_SECRET do podpisywania dostępu do raportu.");
    }
    return "ctms-local-development-secret";
  }

  return secret;
}

function signatureFor(token, exp) {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(`${token}.${exp}`)
    .digest("hex");
}

function createSignedAccess(token, ttlMs = DEFAULT_TTL_MS) {
  const exp = String(Date.now() + ttlMs);
  return { token, exp, sig: signatureFor(token, exp) };
}

function verifySignedAccess(token, exp, sig) {
  const expiresAt = Number(exp);
  if (!token || !Number.isFinite(expiresAt) || expiresAt < Date.now() || !sig) {
    return false;
  }

  const expected = Buffer.from(signatureFor(token, String(exp)));
  const received = Buffer.from(String(sig));
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

module.exports = {
  createSignedAccess,
  verifySignedAccess,
};
