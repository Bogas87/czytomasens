"use strict";
const OpenAI = require("openai");
const crypto = require("crypto");
let client;
function getClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error("Brak OPENAI_API_KEY.");
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}
function outputText(response) {
  if (response?.output_text) return response.output_text;
  for (const item of response?.output || []) for (const part of item?.content || []) if (part?.text) return part.text;
  return "";
}
async function structured({ name, schema, system, user, model, effort = "medium", safetyId = "anonymous" }) {
  const api = getClient();
  const resolvedModel = model || process.env.OPENAI_REPORT_MODEL || process.env.OPENAI_MODEL || "gpt-5.6-sol";
  const identifier = crypto.createHash("sha256").update(String(safetyId)).digest("hex").slice(0, 32);
  try {
    const response = await api.responses.create({
      model: resolvedModel,
      store: false,
      safety_identifier: identifier,
      reasoning: { effort },
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "user", content: [{ type: "input_text", text: user }] },
      ],
      text: { format: { type: "json_schema", name, strict: true, schema } },
    });
    const text = outputText(response);
    if (!text) throw new Error("Model nie zwrócił treści.");
    return JSON.parse(text);
  } catch (error) {
    if (!api.chat?.completions?.create) throw error;
    const fallback = await api.chat.completions.create({
      model: resolvedModel,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
    });
    return JSON.parse(fallback.choices?.[0]?.message?.content || "{}");
  }
}
module.exports = { structured };
