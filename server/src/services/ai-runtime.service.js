"use strict";

const OpenAI = require("openai");
const { zodTextFormat } = require("openai/helpers/zod");

const openai = new OpenAI({
  apiKey: (process.env.OPENAI_API_KEY || "").trim(),
});

const MODEL_DEFAULTS = Object.freeze({
  preview: (process.env.OPENAI_PREVIEW_MODEL || process.env.OPENAI_MODEL || "gpt-5.6-terra").trim(),
  interview: (process.env.OPENAI_INTERVIEW_MODEL || process.env.OPENAI_MODEL || "gpt-5.6-terra").trim(),
  reasoning: (process.env.OPENAI_REASONING_MODEL || process.env.OPENAI_MODEL || "gpt-5.6-terra").trim(),
  report: (process.env.OPENAI_REPORT_MODEL || "gpt-5.6-sol").trim(),
  fallback: (process.env.OPENAI_FALLBACK_MODEL || "gpt-4o").trim(),
});

function hasApiKey() {
  return Boolean((process.env.OPENAI_API_KEY || "").trim());
}

function safeFormatName(name) {
  return String(name || "ctms_output")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 64);
}

function outputText(response) {
  if (response?.output_text) return response.output_text;
  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && content?.text) return content.text;
    }
  }
  return "";
}

function parseJson(text) {
  try {
    return JSON.parse(text || "{}");
  } catch (error) {
    const wrapped = new Error("Model zwrócił nieprawidłowy JSON.");
    wrapped.cause = error;
    throw wrapped;
  }
}

function reasoningConfig(model, effort) {
  if (!effort || !/^gpt-5/i.test(String(model || ""))) return {};
  return { reasoning: { effort } };
}

function mayRetryWithFallback(error, model) {
  if (!MODEL_DEFAULTS.fallback || model === MODEL_DEFAULTS.fallback) return false;
  const status = Number(error?.status || error?.response?.status || 0);
  const code = String(error?.code || error?.error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return [400, 403, 404].includes(status)
    || /model_not_found|unsupported_model|access_denied/.test(code)
    || /model.*(not found|not available|does not exist|access)/.test(message);
}

async function createStructuredResponse({ model, instructions, input, schema, schemaName, maxOutputTokens, reasoningEffort }) {
  return openai.responses.create({
    model,
    store: false,
    instructions,
    input: typeof input === "string" ? input : JSON.stringify(input),
    max_output_tokens: maxOutputTokens,
    text: { format: zodTextFormat(schema, safeFormatName(schemaName)) },
    ...reasoningConfig(model, reasoningEffort),
  });
}

async function callStructured({
  model,
  instructions,
  input,
  schema,
  schemaName,
  maxOutputTokens = 2400,
  reasoningEffort,
}) {
  if (!hasApiKey()) throw new Error("Brak OPENAI_API_KEY.");

  let response;
  try {
    response = await createStructuredResponse({ model, instructions, input, schema, schemaName, maxOutputTokens, reasoningEffort });
  } catch (error) {
    if (!mayRetryWithFallback(error, model)) throw error;
    console.warn(`[AI Runtime] Model ${model} niedostępny. Ponawiam przez ${MODEL_DEFAULTS.fallback}.`);
    response = await createStructuredResponse({
      model: MODEL_DEFAULTS.fallback,
      instructions,
      input,
      schema,
      schemaName: `${schemaName}_fallback`,
      maxOutputTokens,
      reasoningEffort: undefined,
    });
  }

  const parsed = schema.safeParse(parseJson(outputText(response)));
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0];
    throw new Error(`Odpowiedź AI nie pasuje do schematu: ${issue?.path?.join(".") || "root"} ${issue?.message || ""}`.trim());
  }
  return parsed.data;
}

async function callFlexibleJson({
  model,
  instructions,
  input,
  maxOutputTokens = 3000,
  reasoningEffort,
}) {
  if (!hasApiKey()) throw new Error("Brak OPENAI_API_KEY.");

  let response;
  const request = (selectedModel, selectedEffort) => openai.responses.create({
    model: selectedModel,
    store: false,
    instructions,
    input: typeof input === "string" ? input : JSON.stringify(input),
    max_output_tokens: maxOutputTokens,
    text: { format: { type: "json_object" } },
    ...reasoningConfig(selectedModel, selectedEffort),
  });
  try {
    response = await request(model, reasoningEffort);
  } catch (error) {
    if (!mayRetryWithFallback(error, model)) throw error;
    console.warn(`[AI Runtime] Model ${model} niedostępny. Ponawiam przez ${MODEL_DEFAULTS.fallback}.`);
    response = await request(MODEL_DEFAULTS.fallback, undefined);
  }

  return parseJson(outputText(response));
}

module.exports = {
  MODEL_DEFAULTS,
  hasApiKey,
  callStructured,
  callFlexibleJson,
};
