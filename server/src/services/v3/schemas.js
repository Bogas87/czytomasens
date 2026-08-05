"use strict";

const confidence = { type: "string", enum: ["low", "medium", "high"] };
const safety = {
  type: "object", additionalProperties: false,
  required: ["level", "signals", "protocolAllowed", "message"],
  properties: {
    level: { type: "string", enum: ["clear", "caution", "high-risk"] },
    signals: { type: "array", items: { type: "string" }, maxItems: 8 },
    protocolAllowed: { type: "boolean" },
    message: { type: "string" },
  },
};
const segment = {
  type: "object", additionalProperties: false,
  required: ["text", "category", "cameraObservable", "confidence", "note"],
  properties: {
    text: { type: "string" },
    category: { type: "string", enum: ["event", "interpretation", "emotion", "prediction", "assumption", "justification", "need", "mixed", "unknown"] },
    cameraObservable: { type: "boolean" },
    confidence,
    note: { type: "string" },
  },
};
const discrepancy = {
  type: "object", additionalProperties: false,
  required: ["userMeaning", "observedMaterial", "unknown", "importance"],
  properties: {
    userMeaning: { type: "string" }, observedMaterial: { type: "string" }, unknown: { type: "string" },
    importance: { type: "string", enum: ["supporting", "important", "critical"] },
  },
};
const hypothesis = {
  type: "object", additionalProperties: false,
  required: ["title", "explanation", "evidence", "limits", "confidence"],
  properties: {
    title: { type: "string" }, explanation: { type: "string" },
    evidence: { type: "array", items: { type: "string" }, maxItems: 8 },
    limits: { type: "array", items: { type: "string" }, maxItems: 6 }, confidence,
  },
};
const burden = {
  type: "object", additionalProperties: false,
  required: ["level", "mainSource", "processes", "spillover", "evidence"],
  properties: {
    level: { type: "string", enum: ["low", "moderate", "high", "overloading"] },
    mainSource: { type: "string" }, processes: { type: "array", items: { type: "string" }, maxItems: 8 },
    spillover: { type: "string" }, evidence: { type: "array", items: { type: "string" }, maxItems: 8 },
  },
};
const mirror = {
  type: "object", additionalProperties: false,
  required: ["headline", "observation", "unknown", "nextFocus"],
  properties: { headline: { type: "string" }, observation: { type: "string" }, unknown: { type: "string" }, nextFocus: { type: "string" } },
};
const preview = {
  type: "object", additionalProperties: false,
  required: ["version", "headline", "essence", "observedSignal", "unknown", "verify", "premiumPromise", "discrepancySample", "confidence", "safety"],
  properties: {
    version: { type: "string", const: "3.0" }, headline: { type: "string" }, essence: { type: "string" },
    observedSignal: { type: "string" }, unknown: { type: "string" }, verify: { type: "string" }, premiumPromise: { type: "string" },
    discrepancySample: { type: "array", items: discrepancy, minItems: 1, maxItems: 3 }, confidence, safety,
  },
};
const caseModel = {
  type: "object", additionalProperties: false,
  required: ["version", "safety", "statements", "events", "discrepancies", "unknowns", "mainHypothesis", "counterHypothesis", "burden", "mirror", "preview", "recommendedProtocol"],
  properties: {
    version: { type: "string", const: "3.0" }, safety,
    statements: { type: "array", maxItems: 28, items: { type: "object", additionalProperties: false, required: ["sourceText", "segments"], properties: { sourceText: { type: "string" }, segments: { type: "array", items: segment, minItems: 1 } } } },
    events: { type: "array", maxItems: 16, items: { type: "object", additionalProperties: false, required: ["what", "when", "frequency", "actor", "evidence", "confidence"], properties: { what: { type: "string" }, when: { type: "string" }, frequency: { type: "string" }, actor: { type: "string", enum: ["user", "other", "both", "unknown"] }, evidence: { type: "string" }, confidence } } },
    discrepancies: { type: "array", items: discrepancy, minItems: 1, maxItems: 8 },
    unknowns: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
    mainHypothesis: hypothesis, counterHypothesis: hypothesis, burden, mirror, preview,
    recommendedProtocol: { type: "object", additionalProperties: false, required: ["key", "title", "reason"], properties: { key: { type: "string" }, title: { type: "string" }, reason: { type: "string" } } },
  },
};
const report = {
  type: "object",
  additionalProperties: false,
  required: [
    "version", "safety", "headline", "subheadline", "confidence", "essence", "whatWeKnow", "unknowns",
    "discrepancyMap", "mainHypothesis", "counterHypothesis", "evidenceFor", "evidenceAgainst",
    "blindSpot", "burdenProfile", "boundaries", "changeConditions", "recommendedProtocol",
    "nextMove", "reviewAt", "closing"
  ],
  properties: {
    version: { type: "string", const: "3.0" },
    safety,
    headline: { type: "string" },
    subheadline: { type: "string" },
    confidence,
    essence: { type: "string" },
    whatWeKnow: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 8 },
    unknowns: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
    discrepancyMap: { type: "array", items: discrepancy, minItems: 1, maxItems: 8 },
    mainHypothesis: hypothesis,
    counterHypothesis: hypothesis,
    evidenceFor: { type: "array", items: { type: "string" }, maxItems: 8 },
    evidenceAgainst: { type: "array", items: { type: "string" }, maxItems: 8 },
    blindSpot: { type: "string" },
    burdenProfile: burden,
    boundaries: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value", "status"],
        properties: {
          label: { type: "string" },
          value: { type: "string" },
          status: { type: "string", enum: ["declared", "unclear", "not-set"] }
        }
      }
    },
    changeConditions: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
    recommendedProtocol: {
      type: "object",
      additionalProperties: false,
      required: ["key", "title", "hypothesis", "action", "dontDo", "observe", "durationDays", "outcomes", "safetyNote"],
      properties: {
        key: { type: "string" },
        title: { type: "string" },
        hypothesis: { type: "string" },
        action: { type: "string" },
        dontDo: { type: "array", items: { type: "string" } },
        observe: { type: "array", items: { type: "string" } },
        durationDays: { type: "integer", minimum: 1, maximum: 30 },
        outcomes: { type: "array", items: { type: "string" } },
        safetyNote: { type: "string" }
      }
    },
    nextMove: { type: "string" },
    reviewAt: { type: "string" },
    closing: { type: "string" }
  }
};
module.exports = { mirror, caseModel, report };
