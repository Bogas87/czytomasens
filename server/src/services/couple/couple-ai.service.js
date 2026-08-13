"use strict";

const { structured } = require("../v3/openai-json");

const FLAG_TYPES = [
  "none","overinterpretation","mind_reading","generalization","catastrophizing","minimization",
  "rationalization","responsibility_shift","whataboutism","topic_avoidance","unsupported_certainty",
  "devaluation","contradiction","selectivity","empty_apology","double_standard","moving_goalpost"
];

const narrativeFlagSchema = {
  type: "object",
  additionalProperties: false,
  required: ["type","level","observation","question"],
  properties: {
    type: { type: "string", enum: FLAG_TYPES },
    level: { type: "string", enum: ["low","medium","high"] },
    observation: { type: "string" },
    question: { type: "string" },
  },
};

const safetySchema = {
  type: "object",
  additionalProperties: false,
  required: ["level","signals","protocolAllowed"],
  properties: {
    level: { type: "string", enum: ["clear","elevated","high"] },
    signals: { type: "array", items: { type: "string" } },
    protocolAllowed: { type: "boolean" },
  },
};

const SYSTEM_CORE = `
Jesteś silnikiem strukturyzacji relacji CzyToMaSens „Dwa Spojrzenia”. Nie jesteś terapeutą, mediatorem, diagnostą ani arbitrem prawdy.
Twoim zadaniem jest prowadzenie procesu podobnego jakościowo do dobrze moderowanej rozmowy par, ale bez diagnozowania ludzi.

ZASADY BEZWZGLĘDNE:
1. Rozdzielaj: zdarzenie obserwowalne, interpretację, emocję, deklarowaną potrzebę, hipotezę potrzeby i niewiadomą.
2. Nie uznawaj sprzeczności za kłamstwo. Używaj: „wersje są sprzeczne”, „nie da się zweryfikować”, „jedna strona pamięta inaczej”.
3. Nie używaj etykiet osobowości: narcyz, toksyczny, manipulant, unikowy, histeryczny, gaslighter itp.
4. Możesz wykrywać mechanizm w konkretnej wypowiedzi: nadinterpretację, bagatelizowanie, przypisywanie intencji, zmianę tematu, kontratak, generalizację, racjonalizację, nadmierną pewność, pustą odpowiedzialność.
5. Intencja i skutek to dwie różne rzeczy. Wyjaśnienie nie jest automatycznie usprawiedliwieniem.
6. Nie wymuszaj symetrii odpowiedzialności. Przemoc, groźby, przymus, stalking i kontrola mogą wymagać zatrzymania wspólnej konfrontacji.
7. Gdy nie ma danych, powiedz, że nie ma danych.
8. Hipotezy o potrzebach i motywach zawsze oznaczaj jako hipotezy do potwierdzenia przez autora.
9. Pytania mają utrzymywać jeden temat. Jeśli użytkownik otwiera kilka nowych wątków, odłóż je zamiast rozwijać wszystko naraz.
10. Wspólny raport ma pomagać w rozumieniu, sprawdzaniu i zmianie zachowania, a nie wydawać werdykt o związku.
11. Nie przytakuj automatycznie narratorowi. Dla ważnej interpretacji sprawdź, jakie dane ją wspierają, czego brakuje oraz co najmniej dwie rozsądne alternatywne hipotezy, jeśli materiał na nie pozwala.
12. Alternatywna hipoteza nie jest prawdą zastępczą. Oznaczaj ją jako możliwość do sprawdzenia.
13. Nie twórz „wyniku związku”, procentu kompatybilności ani rankingu winy.
14. Raport nie może być bronią przeciw partnerowi. Formułuj różnice jako pytania, obserwacje procesu i rozbieżności perspektyw, nie diagnozy osoby.
`;

function safeText(value) {
  if (typeof value === "string") return value.slice(0, 12000);
  return JSON.stringify(value).slice(0, 12000);
}

async function analyzeTurn({ participantId, questionId, question, answer, context }) {
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["accepted","neutralReflection","groundingIssue","followUpQuestion","shouldFollowUp","flags","safety"],
    properties: {
      accepted: { type: "boolean" },
      neutralReflection: { type: "string" },
      groundingIssue: { type: "string", enum: ["none","too_general","interpretation_as_fact","multiple_topics","evasive","contradictory","too_little_detail"] },
      followUpQuestion: { type: "string" },
      shouldFollowUp: { type: "boolean" },
      flags: { type: "array", maxItems: 5, items: narrativeFlagSchema },
      safety: safetySchema,
    },
  };
  return structured({
    name: "couple_turn_analysis",
    schema,
    system: `${SYSTEM_CORE}\nAnalizujesz wyłącznie jedną odpowiedź autora. Nie porównujesz jej jeszcze z partnerem. Zwróć neutralną refleksję i najwyżej jedno pytanie doprecyzowujące. Nie zawstydzaj autora.`,
    user: JSON.stringify({ questionId, question, answer: safeText(answer), recentContext: context || [] }),
    effort: "low",
    safetyId: participantId,
    timeoutMs: 24000,
  });
}

async function buildPerspective({ participantId, slot, answers }) {
  const shareDraftSchema = {
    type: "object",
    additionalProperties: false,
    required: ["summary","whatISee","whatMatters","whatINeed","whatIDontKnow"],
    properties: {
      summary: { type: "string" },
      whatISee: { type: "string" },
      whatMatters: { type: "string" },
      whatINeed: { type: "string" },
      whatIDontKnow: { type: "string" },
    },
  };
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["summary","facts","interpretations","emotions","declaredNeeds","needHypotheses","unknowns","ownContribution","predictedPartnerView","goals","resources","realityCheck","narrativeFlags","shareDraft","safety"],
    properties: {
      summary: { type: "string" },
      facts: { type: "array", items: { type: "string" } },
      interpretations: { type: "array", items: { type: "string" } },
      emotions: { type: "array", items: { type: "string" } },
      declaredNeeds: { type: "array", items: { type: "string" } },
      needHypotheses: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["need","confidence","confirmQuestion"],
          properties: { need:{type:"string"}, confidence:{type:"string",enum:["low","medium","high"]}, confirmQuestion:{type:"string"} },
        },
      },
      unknowns: { type: "array", items: { type: "string" } },
      ownContribution: { type: "array", items: { type: "string" } },
      predictedPartnerView: { type: "array", items: { type: "string" } },
      goals: { type: "array", items: { type: "string" } },
      resources: { type: "array", items: { type: "string" } },
      realityCheck: {
        type: "object",
        additionalProperties: false,
        required: ["strongestFact","strongestInference","alternativeExplanations","evidenceMissing","certaintyCalibration"],
        properties: {
          strongestFact: { type: "string" },
          strongestInference: { type: "string" },
          alternativeExplanations: { type: "array", maxItems: 3, items: { type: "string" } },
          evidenceMissing: { type: "array", items: { type: "string" } },
          certaintyCalibration: { type: "string" },
        },
      },
      narrativeFlags: { type: "array", maxItems: 12, items: narrativeFlagSchema },
      shareDraft: shareDraftSchema,
      safety: safetySchema,
    },
  };
  return structured({
    name: "couple_private_perspective",
    schema,
    system: `${SYSTEM_CORE}
Tworzysz PRYWATNY model perspektywy jednej osoby (${slot}).
Surowe odpowiedzi NIE trafią do partnera. Przygotuj też shareDraft — neutralne podsumowanie w pierwszej osobie, które autor później może edytować i zatwierdzić.
Nie przemycaj do shareDraft interpretacji jako faktów. NarrativeFlags opisuj językiem obserwacji, np. „wniosek wykracza poza opisany fakt”, a nie „nadinterpretujesz”.
Pracuj logicznie w dwóch krokach: najpierw EKSTRAKCJA (co faktycznie opisano), potem REALITY CHECK (co narrator z tego wnioskuje, jakie są rozsądne alternatywy i czego brakuje do pewności). W realityCheck nie wymyślaj sztucznych kontrhipotez; mają wynikać z materiału albo z typowych, neutralnych możliwości.`,
    user: JSON.stringify({ slot, answers }),
    effort: "medium",
    safetyId: participantId,
    timeoutMs: 50000,
  });
}

async function comparePerspectives({ pairId, a, b }) {
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["sharedReality","perceptionGaps","disputedClaims","predictionChecks","cycleHypothesis","resources","unknowns","crossQuestionsA","crossQuestionsB","metaObservations","safety"],
    properties: {
      sharedReality: { type:"array", items:{ type:"object", additionalProperties:false, required:["topic","agreement"], properties:{topic:{type:"string"},agreement:{type:"string"}} } },
      perceptionGaps: { type:"array", items:{ type:"object", additionalProperties:false, required:["topic","aView","bView","neutralFrame"], properties:{topic:{type:"string"},aView:{type:"string"},bView:{type:"string"},neutralFrame:{type:"string"}} } },
      disputedClaims: { type:"array", items:{ type:"object", additionalProperties:false, required:["claim","status","question"], properties:{claim:{type:"string"},status:{type:"string",enum:["disputed","unverifiable","memory_gap","interpretation_conflict","attribution_conflict"]},question:{type:"string"}} } },
      predictionChecks: { type:"array", items:{ type:"object", additionalProperties:false, required:["slot","predicted","actual","accuracy","comment"], properties:{slot:{type:"string",enum:["A","B"]},predicted:{type:"string"},actual:{type:"string"},accuracy:{type:"string",enum:["close","partial","different","insufficient"]},comment:{type:"string"}} } },
      cycleHypothesis: {
        type:"object", additionalProperties:false, required:["label","sequence","confidence","question"],
        properties:{
          label:{type:"string"},
          sequence:{type:"array",items:{type:"object",additionalProperties:false,required:["actor","trigger","reaction","effect"],properties:{actor:{type:"string",enum:["A","B","BOTH"]},trigger:{type:"string"},reaction:{type:"string"},effect:{type:"string"}}}},
          confidence:{type:"string",enum:["low","medium","high"]},
          question:{type:"string"},
        },
      },
      resources:{type:"array",items:{type:"string"}},
      unknowns:{type:"array",items:{type:"string"}},
      crossQuestionsA:{type:"array",minItems:3,maxItems:5,items:{type:"string"}},
      crossQuestionsB:{type:"array",minItems:3,maxItems:5,items:{type:"string"}},
      metaObservations:{type:"array",items:{type:"object",additionalProperties:false,required:["type","observation"],properties:{type:{type:"string"},observation:{type:"string"}}}},
      safety:safetySchema,
    },
  };
  return structured({
    name: "couple_perspective_comparison",
    schema,
    system: `${SYSTEM_CORE}
Porównujesz dwa PRYWATNE modele perspektyw. Nie ujawniasz surowych tekstów. Nie rozstrzygasz, kto ma rację.
Szukaj wspólnej rzeczywistości, różnicy znaczeń, sporu o fakt, błędnych przewidywań o partnerze, możliwej pętli reakcji i zasobów.
Jeżeli jedna narracja jest bardziej konkretna, możesz napisać, że jest bardziej konkretna — nie że jest prawdziwsza.
Pytania krzyżowe mają być różne dla A i B i wynikać z faktycznej rozbieżności.
Jeśli bezpieczeństwo jest wysokiego ryzyka, protocolAllowed=false i nie twórz pytań nakłaniających do konfrontacji.`,
    user: JSON.stringify({ A: a, B: b }),
    effort: "high",
    safetyId: pairId,
    timeoutMs: 70000,
  });
}

async function buildFinalSynthesis({ pairId, comparison, shareA, shareB, reflectionA, reflectionB }) {
  const schema = {
    type:"object", additionalProperties:false,
    required:["executiveSummary","commonGround","updatedUnderstandingA","updatedUnderstandingB","remainingDisagreements","sharedReality","realityChecks","blindSpots","strengths","repairPriorities","cycle","cycleBreakpoints","conversationProtocol","nextConversationQuestion","humanSupport","experiment","safety"],
    properties:{
      executiveSummary:{type:"string"},
      commonGround:{type:"array",items:{type:"string"}},
      updatedUnderstandingA:{type:"string"},
      updatedUnderstandingB:{type:"string"},
      remainingDisagreements:{type:"array",items:{type:"string"}},
      sharedReality:{type:"array",items:{type:"string"}},
      realityChecks:{type:"array",items:{type:"object",additionalProperties:false,required:["claim","classification","note","question"],properties:{claim:{type:"string"},classification:{type:"string",enum:["shared_fact","disputed","interpretation","unknown"]},note:{type:"string"},question:{type:"string"}}}},
      blindSpots:{type:"array",items:{type:"string"}},
      strengths:{type:"array",items:{type:"string"}},
      repairPriorities:{type:"array",minItems:2,maxItems:5,items:{type:"object",additionalProperties:false,required:["title","why","firstStep"],properties:{title:{type:"string"},why:{type:"string"},firstStep:{type:"string"}}}},
      cycle:{type:"string"},
      cycleBreakpoints:{type:"array",minItems:1,maxItems:4,items:{type:"object",additionalProperties:false,required:["moment","optionA","optionB"],properties:{moment:{type:"string"},optionA:{type:"string"},optionB:{type:"string"}}}},
      conversationProtocol:{type:"object",additionalProperties:false,required:["opening","rules","questionA","questionB","closing"],properties:{opening:{type:"string"},rules:{type:"array",minItems:3,maxItems:6,items:{type:"string"}},questionA:{type:"string"},questionB:{type:"string"},closing:{type:"string"}}},
      nextConversationQuestion:{type:"string"},
      humanSupport:{type:"object",additionalProperties:false,required:["recommended","reason"],properties:{recommended:{type:"boolean"},reason:{type:"string"}}},
      experiment:{
        type:"object", additionalProperties:false,
        required:["title","hypothesis","behaviorA","behaviorB","durationDays","successCriteria"],
        properties:{title:{type:"string"},hypothesis:{type:"string"},behaviorA:{type:"string"},behaviorB:{type:"string"},durationDays:{type:"integer",minimum:3,maximum:21},successCriteria:{type:"array",minItems:2,maxItems:5,items:{type:"string"}}},
      },
      safety:{type:"object",additionalProperties:false,required:["level","protocolAllowed","note"],properties:{level:{type:"string",enum:["clear","elevated","high"]},protocolAllowed:{type:"boolean"},note:{type:"string"}}},
    },
  };
  return structured({
    name:"couple_final_synthesis",
    schema,
    system:`${SYSTEM_CORE}
To DRUGA SYNTEZA — po tym, jak obie osoby przeczytały zatwierdzoną perspektywę partnera i odniosły się do niej.
Najcenniejszą zmianą jest aktualizacja rozumienia, nie zgoda. Dopuszczaj wynik: „rozumiemy się lepiej, ale nadal się nie zgadzamy”.
Pełny raport ma być rozbudowany, ale precyzyjny: oddziel wspólny fakt, spór, interpretację i niewiadomą; pokaż możliwe ślepe punkty, zasoby, priorytety naprawy oraz konkretne miejsca przerwania cyklu.
conversationProtocol ma prowadzić jedną bezpieczną rozmowę: najpierw parafraza i zrozumienie, dopiero potem odpowiedź. Żadnych diagnoz i żadnego wskazywania zwycięzcy.
Eksperyment ma testować jedną hipotezę w realnym zachowaniu. Zachowanie A i B musi być konkretne, małe, niezależne od deklaracji i możliwe do osobnej oceny przez oboje.
Jeśli bezpieczeństwo nie pozwala na wspólny eksperyment, protocolAllowed=false i eksperyment ma być neutralnym zatrzymaniem procesu, bez konfrontacji.`,
    user:JSON.stringify({ comparison, approvedShareA:shareA, approvedShareB:shareB, reflectionA, reflectionB }),
    effort:"high",
    safetyId:pairId,
    timeoutMs:70000,
  });
}

async function evaluateExperiment({ pairId, plan, checkinA, checkinB }) {
  const schema = {
    type:"object", additionalProperties:false,
    required:["whatChanged","agreement","difference","evidence","updatedHypothesis","nextStep"],
    properties:{
      whatChanged:{type:"string"}, agreement:{type:"array",items:{type:"string"}}, difference:{type:"array",items:{type:"string"}},
      evidence:{type:"array",items:{type:"string"}}, updatedHypothesis:{type:"string"}, nextStep:{type:"string"},
    },
  };
  return structured({
    name:"couple_experiment_evaluation",
    schema,
    system:`${SYSTEM_CORE}
Porównujesz DWIE NIEZALEŻNE oceny tego samego eksperymentu relacyjnego. Nie nagradzaj deklaracji; szukaj opisanych zachowań i zgodności obu obserwacji.
Jeśli oceny są sprzeczne, zachowaj rozbieżność zamiast uśredniać.`,
    user:JSON.stringify({ plan, checkinA, checkinB }),
    effort:"medium",
    safetyId:pairId,
    timeoutMs:50000,
  });
}

module.exports = { analyzeTurn, buildPerspective, comparePerspectives, buildFinalSynthesis, evaluateExperiment };
