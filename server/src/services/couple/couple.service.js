"use strict";

const crypto = require("crypto");

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}
function hash(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}
function newId() {
  return crypto.randomUUID();
}
function inviteCode(length = 8) {
  let out = "";
  for (let i = 0; i < length; i += 1) out += INVITE_ALPHABET[crypto.randomInt(0, INVITE_ALPHABET.length)];
  return out;
}
function normalizeInvite(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function answerMap(rows) {
  const out = {};
  for (const row of rows || []) out[row.question_id] = row.answer;
  return out;
}
function safetyFromScreen(answer) {
  const value = answer && typeof answer === "object" && !Array.isArray(answer) ? answer : {};
  const severeKeys = ["physicalViolence","threats","sexualCoercion","coerciveControl"];
  const severe = severeKeys.filter((key) => value[key] === true);
  const fear = value.fearReaction === true;
  return {
    high: severe.length > 0,
    elevated: fear && severe.length === 0,
    signals: [...(fear ? ["fearReaction"] : []), ...severe],
  };
}
function dueDate(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + Math.max(3, Math.min(Number(days || 7), 21)));
  return date;
}
function parsePrice(value, fallback = 3999) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function couplePriceGr() {
  return parsePrice(process.env.COUPLE_PRICE_AMOUNT_GR, 3999);
}

// Lekka, deterministyczna warstwa minimalizacji danych przed wysłaniem treści do modelu.
// Nie udaje pełnego NER: imiona mogą pozostać, dlatego UI dodatkowo prosi, by ich nie wpisywać.
function sanitizeTextForAI(input) {
  let text = String(input ?? "");
  text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[E-MAIL]");
  text = text.replace(/https?:\/\/\S+|www\.\S+/gi, "[LINK]");
  text = text.replace(/\b(?:\d[ -]?){11}\b/g, "[IDENTYFIKATOR]");
  text = text.replace(/\b\d{2}-\d{3}\b/g, "[KOD_POCZTOWY]");
  text = text.replace(/\b(?:\+?48[ -]?)?(?:\d{3}[ -]?\d{3}[ -]?\d{3}|\d{2}[ -]?\d{3}[ -]?\d{2}[ -]?\d{2})\b/g, "[TELEFON]");
  text = text.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[ADRES_IP]");
  return text.slice(0, 12000);
}
function sanitizeForAI(value, depth = 0) {
  if (depth > 8) return "[POMINIĘTO_ZAGNIEŻDŻENIE]";
  if (typeof value === "string") return sanitizeTextForAI(value);
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => sanitizeForAI(item, depth + 1));
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = sanitizeForAI(item, depth + 1);
    return out;
  }
  return value;
}

module.exports = {
  randomToken,
  hash,
  newId,
  inviteCode,
  normalizeInvite,
  answerMap,
  safetyFromScreen,
  dueDate,
  parsePrice,
  couplePriceGr,
  sanitizeTextForAI,
  sanitizeForAI,
};
