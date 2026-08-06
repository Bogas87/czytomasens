"use strict";

const OpenAI = require("openai");
const crypto = require("crypto");

let client;

function getClient() {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) throw new Error("Brak OPENAI_API_KEY.");
  if (!client) {
    client = new OpenAI({ apiKey, maxRetries: 1 });
  }
  return client;
}

function outputText(response) {
  if (response?.output_text) return response.output_text;
  for (const item of response?.output || []) {
    for (const part of item?.content || []) {
      if (part?.text) return part.text;
    }
  }
  return "";
}

function isAbort(error, signal) {
  return Boolean(
    signal?.aborted
    || error?.name === "AbortError"
    || error?.name === "TimeoutError"
    || /aborted|timeout|timed out/i.test(String(error?.message || ""))
  );
}

async function structured({
  name,
  schema,
  system,
  user,
  model,
  effort = "medium",
  safetyId = "anonymous",
  timeoutMs = 60000,
}) {
  const resolvedModel = String(
    model || process.env.OPENAI_REPORT_MODEL || process.env.OPENAI_MODEL || ""
  ).trim();
  if (!resolvedModel) {
    throw new Error("Brak OPENAI_MODEL lub OPENAI_REPORT_MODEL.");
  }

  const api = getClient();
  const identifier = crypto
    .createHash("sha256")
    .update(String(safetyId))
    .digest("hex")
    .slice(0, 32);

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new Error(`OpenAI timeout after ${timeoutMs} ms`));
  }, timeoutMs);

  try {
    try {
      const response = await api.responses.create(
        {
          model: resolvedModel,
          store: false,
          safety_identifier: identifier,
          reasoning: { effort },
          input: [
            { role: "system", content: [{ type: "input_text", text: system }] },
            { role: "user", content: [{ type: "input_text", text: user }] },
          ],
          text: {
            format: {
              type: "json_schema",
              name,
              strict: true,
              schema,
            },
          },
        },
        { signal: controller.signal }
      );

      const text = outputText(response);
      if (!text) throw new Error("Model nie zwrócił treści.");
      return JSON.parse(text);
    } catch (error) {
      if (isAbort(error, controller.signal)) throw error;
      if (!api.chat?.completions?.create) throw error;

      const fallback = await api.chat.completions.create(
        {
          model: resolvedModel,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name, strict: true, schema },
          },
        },
        { signal: controller.signal }
      );

      const content = fallback.choices?.[0]?.message?.content || "";
      if (!content) throw new Error("Model nie zwrócił treści.");
      return JSON.parse(content);
    }
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { structured };
