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

module.exports = { randomToken, hash, newId, inviteCode, normalizeInvite, answerMap, safetyFromScreen, dueDate };
