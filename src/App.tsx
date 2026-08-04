import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArticlesSection, ARTICLES } from "./ArticlesSection";

function readApiBase(): string {
  try {
    const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any)?.env : undefined;
    const value = metaEnv?.VITE_API_BASE;
    if (typeof value === "string" && value.startsWith("http")) return value.replace(/\/$/, "");
  } catch {}
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "https://czytomasens-production-47e0.up.railway.app"; 
  }
  return "http://localhost:8080";
}

const API_BASE = readApiBase();
const OPEN_INTERVIEW_LIMIT = 3;

const BRAND = {
  gold: "#C5A059",
  goldSoft: "#D7B978",
  text: "#F5F1EA",
  muted: "#A8A099",
  border: "rgba(255,255,255,0.08)",
  panel: "rgba(255,255,255,0.03)",
  panelStrong: "rgba(255,255,255,0.05)",
  danger: "#E2A5A5",
  success: "#B7D1B0",
};

type Stage =
  | "landing"
  | "entry"
  | "questions"
  | "checkpoint"
  | "question_signal"
  | "force_map"
  | "force_signal"
  | "burdens"
  | "burden_signal"
  | "emotions"
  | "mid_reflection"
  | "truth_cards"
  | "truth_signal"
  | "short_note"
  | "map_summary"
  | "clarification"
  | "interview"
  | "open_text"
  | "preview"
  | "processing"
  | "paid"
  | "crisis"
  | "error";

type EntryKey = "unease" | "betrayal" | "uncertain" | "asymmetry" | "conflict" | "stagnation" | "returning" | "triangle" | "loop";
type Option = { id: string; label: string; score: number };
type Question = { id: string; lead: string; text: string; options: Option[] };
type AnswerMap = Record<string, string>;
type ForceMapKey = "contactInitiative" | "repairAfterConflict" | "emotionalLabor" | "avoidance" | "fearOfLoss";
type ForceValue = "definitely_me" | "mostly_me" | "balanced" | "mostly_other" | "definitely_other";
type ForceMap = Partial<Record<ForceMapKey, ForceValue>>;
type BurdenItem = { label: string; rank: number };
type EmotionItem = { label: string; rank: number };
type ClarificationQuestion = { id: string; lead: string; text: string; signal: string };
type ClarificationAnswerMap = Record<string, string>;
type MapSignal = { label: string; value: string; tone: "normal" | "gold" | "danger" };
type RelationshipMapPayload = {
  forceMap: ForceMap;
  burdens: BurdenItem[];
  emotions: EmotionItem[];
  truthCards: string[];
  userNote: string;
  clarificationAnswers?: { question: string; answer: string; signal: string }[];
};
type LegalKey = "regulamin" | "prywatnosc" | "rodo" | "kontakt" | null;

type EntryConfig = {
  key: EntryKey;
  title: string;
  subtitle: string;
  quote: string;
  intro: string;
  duration: string;
  questions: Question[];
  checkpoint: { title: string; text: string; options: Option[] };
  openPrompt: string;
};

type MidwayReflection = {
  kicker: string;
  title: string;
  quote: string;
  signal: string;
  next: string;
};

type FinalContextConfig = {
  eyebrow: string;
  title: string;
  lead: string;
  placeholder: string;
  prompts: [string, string, string];
};

type Preview = {
  chance: number; tension: number; asymmetry: number; change: number;
  badge: string; headline: string; truth: string; mirror: string;
  summary: string; paidTease: string; tone: "red" | "yellow" | "green";
  whatUserKnows?: string;
  hiddenInsight?: string;
  contradiction?: string;
  concreteConclusion?: string;
  tensionMeaning?: string;
  asymmetryMeaning?: string;
  changeMeaning?: string;
  premiumSpecific?: string;
};

type ReportConfidence = "low" | "medium" | "high";
type FullReportSection = {
  key?: string;
  title: string;
  text: string;
  tone?: "normal" | "gold" | "danger";
  confidence?: ReportConfidence;
  evidence?: string[];
  counterSignal?: string;
  whatCouldChange?: string;
};

type FollowUpOption = { id: string; label: string; score: number };
type FollowUpQuestion = { id: string; lead: string; text: string; options?: FollowUpOption[]; open?: boolean };
type FollowUpAnswerMap = Record<string, string>;
type FollowUpResult = {
  trend: "improved" | "stable" | "worse";
  elapsedDays: number;
  headline: string;
  summary: string;
  improved: string[];
  unchanged: string[];
  warning: string[];
  current: { tension: number; drift: number; rebuild: number };
  delta: { tension: number; drift: number; rebuild: number };
  note?: string;
};

type DynamicFollowUpQuestion = {
  lead: string;
  question: string;
  open: boolean;
  options: Array<{ id: string; label: string }>;
  finished?: boolean;
  teaser?: string;
};

type DynamicFollowUpExchange = {
  question: string;
  answer: string;
};
type AnonymousProfile = {
  recoveryToken: string;
  recoveryUrl?: string;
  createdAt?: string;
  dueAt?: string;
  email?: string;
};

type PortraitState = "balanced" | "user_heavy" | "other_heavy" | "strained" | "suspended" | "reciprocal" | "mixed" | "weak" | "coherent" | "forward" | "stalled" | "backward";
type RelationshipPortrait = {
  forceField: {
    headline: string;
    userState: PortraitState;
    otherState: PortraitState;
    relationState: PortraitState;
    userLabel: string;
    otherLabel: string;
    relationLabel: string;
    insight: string;
  };
  truthLine: {
    headline: string;
    declarationsState: PortraitState;
    behaviorState: PortraitState;
    directionState: PortraitState;
    declarationsLabel: string;
    behaviorLabel: string;
    directionLabel: string;
    insight: string;
  };
};

type FullReport = {
  headline?: string; subheadline?: string; previewLine?: string;
  tensionPercent?: number; driftPercent?: number; rebuildPercent?: number;
  overallConfidence?: ReportConfidence;
  evidenceSummary?: string[];
  sections?: FullReportSection[]; closing?: string;
  portrait?: RelationshipPortrait;
};

type InterviewExchange = { ai: string; user: string; lead?: string; observation?: string };
type LocalInterviewQuestion = { lead: string; question: string; observation?: string };
type InterviewState = {
  path: EntryKey; currentQuestion: string; currentLead: string;
  currentObservation: string; history: InterviewExchange[];
  depth: number; finished: boolean; exchangeIndex: number;
  source?: "api" | "local"; localQuestions?: LocalInterviewQuestion[]; localIndex?: number;
};

type InterviewChapter = {
  number: string;
  eyebrow: string;
  title: string;
  purpose: string;
  writingLabel: string;
};

const INTERVIEW_CHAPTERS: InterviewChapter[] = [
  {
    number: "01",
    eyebrow: "KADR ZDARZENIA",
    title: "Zatrzymaj jeden moment",
    purpose: "Nie oceniaj całej relacji. Odtwórz jedną scenę tak, jak zobaczyłaby ją osoba stojąca obok.",
    writingLabel: "ZAPIS SCENY",
  },
  {
    number: "02",
    eyebrow: "RUCH POD SPODEM",
    title: "Zobacz, co uruchamia ten układ",
    purpose: "Drugie pytanie bierze konkretny fragment Twojej odpowiedzi i sprawdza, kto wykonuje kolejny ruch oraz jaki ma on koszt.",
    writingLabel: "CO DZIEJE SIĘ DALEJ",
  },
  {
    number: "03",
    eyebrow: "PRÓBA PRAWDY",
    title: "Sprawdź, co zostaje bez tłumaczeń",
    purpose: "Na końcu odcinamy nadzieję, lęk i wygodne wyjaśnienia. Zostają zachowania, powtarzalność i realny kierunek.",
    writingLabel: "TWOJA UCZCIWA ODPOWIEDŹ",
  },
];

const INTERVIEW_PATH_WRITING_CUES: Record<EntryKey, [string, string, string]> = {
  unease: [
    "Zacznij od: kiedy to było, co dokładnie zrobiła druga osoba i co wydarzyło się chwilę później.",
    "Nazwij swój automatyczny ruch: sprawdzanie, dopytywanie, wycofanie, uspokajanie albo udawanie, że nic się nie stało.",
    "Napisz, jak wyglądałaby ta sama sytuacja, gdybyś nie dopowiadał/dopowiadała niczego na korzyść ani przeciwko tej osobie.",
  ],
  betrayal: [
    "Oddziel wydarzenie od późniejszych wyjaśnień. Wypisz kolejność faktów.",
    "Skup się na tym, kto dziś dźwiga odbudowę zaufania i po czym to realnie widać.",
    "Usuń przeprosiny i deklaracje. Zostaw tylko obecne zachowania oraz ich powtarzalność.",
  ],
  uncertain: [
    "Pokaż jedną sytuację, po której nadal nie było wiadomo, na czym stoisz.",
    "Napisz, kto korzysta na niejasności i co Ty robisz, żeby mimo niej utrzymać relację.",
    "Wyobraź sobie, że przestajesz wypełniać luki interpretacją. Co pozostaje jednoznaczne?",
  ],
  asymmetry: [
    "Rozpisz ostatnią sytuację, w której kontakt albo naprawa zależały głównie od Ciebie.",
    "Nazwij rzecz, którą przejmujesz automatycznie, oraz to, co robi wtedy druga strona.",
    "Usuń swój wysiłek z równania. Opisz, co utrzymałoby się samo, a co natychmiast by zniknęło.",
  ],
  conflict: [
    "Odtwórz ostatni konflikt od pierwszego zdania do momentu, w którym temat uznano za zamknięty.",
    "Pokaż, kto naprawia, kto unika i co dzieje się z właściwym problemem po uspokojeniu emocji.",
    "Sprawdź, czy po kłótni zmienia się zachowanie, czy tylko wraca chwilowy spokój.",
  ],
  stagnation: [
    "Wybierz zwykły dzień, który najlepiej pokazuje, jak dziś naprawdę jesteście ze sobą.",
    "Nazwij pierwszy element bliskości, który zniknął, oraz to, co weszło w jego miejsce.",
    "Oddziel więź od wspólnych obowiązków, historii i przyzwyczajenia. Co nadal jest świadomym wyborem?",
  ],
  returning: [
    "Odtwórz ostatni kontakt po rozstaniu bez dopisywania, co mógł oznaczać.",
    "Zestaw powód poprzedniego rozpadu z tym, co od tamtej pory rzeczywiście się zmieniło.",
    "Zadaj sobie pytanie, czy wybierasz dzisiejszą osobę, czy najlepszą wersję wspomnienia o niej.",
  ],
  triangle: [
    "Opisz sytuację, w której obecność trzeciej osoby najmocniej zmieniła Twoje zachowanie albo ocenę relacji.",
    "Nazwij brak, potrzebę lub konflikt, który ta osoba odsłoniła, ale którego sama nie stworzyła.",
    "Usuń trzecią osobę z historii. Napisz, jaki problem w obecnej relacji nadal zostałby nierozwiązany.",
  ],
  loop: [
    "Odtwórz ostatni pełny cykl: napięcie, zerwanie lub dystans, powrót i pierwsze oznaki starego schematu.",
    "Nazwij korzyść, która pojawia się przy powrocie i sprawia, że cykl znów wydaje się wart kolejnej próby.",
    "Wskaż dokładny moment, w którym zwykle można przerwać pętlę, oraz czego wtedy najbardziej się obawiasz.",
  ],
};

function interviewChapter(depth: number): InterviewChapter {
  return INTERVIEW_CHAPTERS[Math.max(0, Math.min(OPEN_INTERVIEW_LIMIT - 1, depth - 1))];
}

function interviewWritingCue(path: EntryKey, depth: number): string {
  return INTERVIEW_PATH_WRITING_CUES[path]?.[Math.max(0, Math.min(OPEN_INTERVIEW_LIMIT - 1, depth - 1))]
    || "Zapisz konkretny przebieg sytuacji: kto, co zrobił, co wydarzyło się potem i co faktycznie się zmieniło.";
}

function interviewButtonLabel(depth: number): string {
  if (depth <= 1) return "Pokaż, co jest pod spodem →";
  if (depth === 2) return "Sprawdźmy, co się nie zgadza →";
  return "Zamknij ten wątek →";
}

const CLOSED_QUESTION_PHASES = [
  {
    kicker: "PIERWSZY ODCZYT",
    title: "Co wraca samo",
    note: "Nie wybieraj wersji, która brzmi najlepiej. Zaznacz tę, która najczęściej wydarza się bez Twojego tłumaczenia.",
  },
  {
    kicker: "UKŁAD RELACJI",
    title: "Kto niesie ciężar",
    note: "Patrzymy na powtarzalność, inicjatywę i zachowanie po napięciu, nie na pojedyncze dobre momenty.",
  },
  {
    kicker: "KIERUNEK",
    title: "Co mówi codzienność",
    note: "Ta część oddziela intencję od tego, co relacja realnie utrzymuje w zwykłym dniu.",
  },
  {
    kicker: "KOSZT I FAKTY",
    title: "Co zostaje po emocjach",
    note: "Ostatnie odpowiedzi sprawdzają, co relacja robi z Tobą i co zobaczyłaby osoba patrząca z boku.",
  },
] as const;

function closedQuestionPhase(index: number, total: number) {
  const normalized = total > 1 ? index / (total - 1) : 0;
  const phaseIndex = Math.min(CLOSED_QUESTION_PHASES.length - 1, Math.floor(normalized * CLOSED_QUESTION_PHASES.length));
  return CLOSED_QUESTION_PHASES[phaseIndex];
}


function interviewAnswerExcerpt(value?: string, max = 210): string {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
}

type SessionCreateResponse = { ok?: boolean; token?: string; sessionId?: string };
type ReportAccess = { token: string; exp: string; sig: string };

const STORAGE_KEY = "ctms_one_person_deep_premium_v21";
const FOLLOWUP_KEY = "ctms_followup_after_7_days";
const ANON_PROFILE_KEY = "ctms_anonymous_profile_v1";
const FOLLOWUP_RESULT_KEY = "ctms_followup_result_v1";
const REPORT_ACCESS_KEY = "ctms_report_access_v1";
const STORAGE_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const CHECKOUT_CONSENT_VERSION = "2026-07-31";
const ANALYSIS_CONSENT_VERSION = "2026-08-03";
const FOLLOWUP_PLAN_DAYS = [7, 21] as const;

const confidenceLabel = (value?: ReportConfidence) => ({
  low: "niska — materiał wymaga doprecyzowania",
  medium: "średnia — sygnały są spójne, ale pochodzą z jednej perspektywy",
  high: "wysoka — kilka obserwowalnych faktów wskazuje ten sam wzorzec",
}[value || "low"]);

function qualitativePortraitFromReport(report: FullReport): RelationshipPortrait {
  const tension = Number(report.tensionPercent ?? 50);
  const drift = Number(report.driftPercent ?? 50);
  const rebuild = Number(report.rebuildPercent ?? 50);
  const forceState: PortraitState = drift >= 66 ? "user_heavy" : drift <= 34 ? "balanced" : "suspended";
  const relationState: PortraitState = rebuild >= 64 && drift < 56
    ? "reciprocal"
    : tension >= 68 || drift >= 68
      ? "strained"
      : "suspended";
  const declarationsState: PortraitState = drift <= 36 ? "coherent" : drift <= 64 ? "mixed" : "weak";
  const behaviorState: PortraitState = rebuild >= 66 ? "coherent" : rebuild >= 40 ? "mixed" : "weak";
  const directionState: PortraitState = rebuild >= 66 && drift < 58
    ? "forward"
    : rebuild < 36 && (tension >= 66 || drift >= 66)
      ? "backward"
      : "stalled";

  return {
    forceField: {
      headline: relationState === "reciprocal"
        ? "Relacja ma obustronny punkt oparcia"
        : relationState === "strained"
          ? "Ciężar nie rozkłada się neutralnie"
          : "Układ pozostaje nierozstrzygnięty",
      userState: forceState,
      otherState: forceState === "user_heavy" ? "other_heavy" : forceState,
      relationState,
      userLabel: forceState === "user_heavy" ? "częściej uruchamiasz i domykasz" : forceState === "balanced" ? "masz własny udział, ale nie niesiesz wszystkiego" : "część ciężaru nadal zostaje po Twojej stronie",
      otherLabel: forceState === "user_heavy" ? "mniej ruchu bez Twojego impulsu" : forceState === "balanced" ? "widać odpowiedź i udział" : "udział jest zmienny albo trudny do odczytania",
      relationLabel: relationState === "reciprocal" ? "wzajemność widoczna w zachowaniu" : relationState === "strained" ? "utrzymywana nierówno lub w napięciu" : "zawieszona między zasobem a kosztem",
      insight: report.previewLine || "Najwięcej mówi nie intensywność uczuć, tylko rozkład inicjatywy, odpowiedzialności i naprawy po napięciu.",
    },
    truthLine: {
      headline: directionState === "forward"
        ? "Słowa i zachowanie zaczynają iść w jednym kierunku"
        : directionState === "backward"
          ? "Zachowanie osłabia to, co obiecują słowa"
          : "Kierunek nadal nie jest potwierdzony",
      declarationsState,
      behaviorState,
      directionState,
      declarationsLabel: declarationsState === "coherent" ? "spójne i konkretne" : declarationsState === "mixed" ? "częściowo jasne, częściowo otwarte" : "mocniejsze niż ich pokrycie",
      behaviorLabel: behaviorState === "coherent" ? "powtarzalne i potwierdzające" : behaviorState === "mixed" ? "nieregularne lub zależne od napięcia" : "nie potwierdza trwałej zmiany",
      directionLabel: directionState === "forward" ? "ruch do przodu" : directionState === "backward" ? "powrót do starego układu" : "zawieszenie",
      insight: report.closing || "To, co ma znaczenie, powinno być widoczne również wtedy, gdy emocje opadną i nikt nie prowadzi drugiej strony za rękę.",
    },
  };
}

function resolveRelationshipPortrait(report: FullReport): RelationshipPortrait {
  return report.portrait || qualitativePortraitFromReport(report);
}


const FOLLOWUP_QUESTIONS: FollowUpQuestion[] = [
  {
    id: "behavior_change",
    lead: "Najpierw oddzielmy rozmowę od tego, co wydarzyło się później.",
    text: "Czy od pierwszego odczytu pojawiła się konkretna zmiana zachowania, która utrzymała się bez Twojego przypominania?",
    options: [
      { id: "clear", label: "Tak. Zmiana jest konkretna i powtarzalna.", score: 0 },
      { id: "some", label: "Trochę. Widać ruch, ale jeszcze niestabilny.", score: 1 },
      { id: "brief", label: "Była poprawa, ale szybko wrócił dawny układ.", score: 2 },
      { id: "none", label: "Nie. Zmieniły się głównie słowa albo atmosfera.", score: 3 },
    ],
  },
  {
    id: "initiative",
    lead: "Sprawdźmy, kto uruchomił ten ruch.",
    text: "Czy druga strona sama zainicjowała rozmowę, naprawę albo konkretny krok?",
    options: [
      { id: "yes", label: "Tak, bez nacisku i bez prowadzenia jej za rękę.", score: 0 },
      { id: "partial", label: "Częściowo. Potrzebowała sygnału, ale potem działała.", score: 1 },
      { id: "prompted", label: "Dopiero po moim przypomnieniu albo nacisku.", score: 2 },
      { id: "no", label: "Nie. Nadal głównie ja uruchamiam zmianę.", score: 3 },
    ],
  },
  {
    id: "tension_now",
    lead: "Nie oceniaj tylko relacji. Zobacz, co dzieje się z Tobą.",
    text: "Jak zmieniło się Twoje napięcie od poprzedniej analizy?",
    options: [
      { id: "lower", label: "Wyraźnie spadło i mam więcej spokoju.", score: 0 },
      { id: "slightly_lower", label: "Trochę spadło, ale nadal wraca.", score: 1 },
      { id: "same", label: "Jest podobne jak wcześniej.", score: 2 },
      { id: "higher", label: "Wzrosło albo doszły nowe powody do niepokoju.", score: 3 },
    ],
  },
  {
    id: "clarity_now",
    lead: "Jasność poznaje się po tym, że jest mniej zgadywania.",
    text: "Czy dziś lepiej wiesz, na czym stoisz i czego możesz spodziewać się po drugiej stronie?",
    options: [
      { id: "clear", label: "Tak. Jest więcej konkretu i mniej zgadywania.", score: 0 },
      { id: "some", label: "Trochę, ale część spraw nadal jest otwarta.", score: 1 },
      { id: "unclear", label: "Niewiele się zmieniło. Nadal analizuję i czekam.", score: 2 },
      { id: "worse", label: "Jest jeszcze mniej jasno niż wcześniej.", score: 3 },
    ],
  },
  {
    id: "pattern_return",
    lead: "Teraz najważniejsza jest powtarzalność.",
    text: "Czy wrócił ten sam problem, który uruchomił pierwszą analizę?",
    options: [
      { id: "no", label: "Nie wrócił, a sposób reagowania rzeczywiście się zmienił.", score: 0 },
      { id: "smaller", label: "Wrócił słabiej i został lepiej domknięty.", score: 1 },
      { id: "same", label: "Wrócił praktycznie w tej samej formie.", score: 2 },
      { id: "stronger", label: "Wrócił mocniej albo doszły kolejne podobne sytuacje.", score: 3 },
    ],
  },
  {
    id: "safety",
    lead: "Jedno pytanie dotyczy nie jakości relacji, ale bezpieczeństwa.",
    text: "Czy od ostatniej analizy pojawiła się kontrola, groźby, upokarzanie, izolowanie, użycie siły albo realny lęk przed reakcją tej osoby?",
    options: [
      { id: "no", label: "Nie.", score: 0 },
      { id: "uncertain", label: "Nie jestem pewien/pewna, ale coś mnie niepokoi.", score: 1 },
      { id: "psych", label: "Tak — kontrola, presja, groźby albo upokarzanie.", score: 3 },
      { id: "physical", label: "Tak — użycie siły albo obawa o bezpieczeństwo.", score: 3 },
    ],
  },
  {
    id: "event_note",
    lead: "Na końcu potrzebny jest jeden fakt, nie cała historia.",
    text: "Co wydarzyło się od poprzedniej analizy i najmocniej zmieniło Twój odbiór sytuacji?",
    open: true,
  },
];

function followUpScore(answers: FollowUpAnswerMap, questionId: string): number {
  const question = FOLLOWUP_QUESTIONS.find((item) => item.id === questionId);
  const option = question?.options?.find((item) => item.id === answers[questionId]);
  return option?.score ?? 1;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function daysBetween(from?: string, to = new Date()): number {
  if (!from) return 0;
  const date = new Date(from);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((to.getTime() - date.getTime()) / 86400000));
}

function buildFollowUpResult(
  answers: FollowUpAnswerMap,
  baseline: FullReport | null,
  createdAt?: string,
): FollowUpResult {
  const behavior = followUpScore(answers, "behavior_change");
  const initiative = followUpScore(answers, "initiative");
  const tensionNow = followUpScore(answers, "tension_now");
  const clarity = followUpScore(answers, "clarity_now");
  const pattern = followUpScore(answers, "pattern_return");
  const safety = followUpScore(answers, "safety");

  const currentTension = clampPercent(((tensionNow + pattern + safety) / 9) * 100);
  const currentDrift = clampPercent(((behavior + initiative + clarity + pattern) / 12) * 100);
  const currentRebuild = clampPercent(100 - ((behavior + initiative + pattern) / 9) * 100);

  const baselineTension = Number(baseline?.tensionPercent ?? 50);
  const baselineDrift = Number(baseline?.driftPercent ?? 50);
  const baselineRebuild = Number(baseline?.rebuildPercent ?? 50);

  const delta = {
    tension: currentTension - baselineTension,
    drift: currentDrift - baselineDrift,
    rebuild: currentRebuild - baselineRebuild,
  };
  const composite = (-delta.tension - delta.drift + delta.rebuild) / 3;
  const trend: FollowUpResult["trend"] = composite >= 9 ? "improved" : composite <= -9 ? "worse" : "stable";

  const improved: string[] = [];
  const unchanged: string[] = [];
  const warning: string[] = [];

  if (behavior <= 1) improved.push("Po rozmowie pojawił się ruch widoczny w zachowaniu, nie tylko w słowach.");
  else warning.push("Poprawa nie utrzymała się albo nie wyszła poza deklaracje.");

  if (initiative <= 1) improved.push("Druga strona przejęła część inicjatywy i odpowiedzialności.");
  else unchanged.push("Ciężar uruchamiania zmiany nadal w dużej mierze pozostaje po Twojej stronie.");

  if (tensionNow <= 1) improved.push("Masz więcej spokoju i mniej potrzeby ciągłego sprawdzania.");
  else if (tensionNow >= 3) warning.push("Napięcie wzrosło zamiast opaść.");

  if (clarity <= 1) improved.push("Jest więcej jasności co do kierunku i oczekiwań.");
  else unchanged.push("Nadal pozostaje dużo zgadywania i niepewności.");

  if (pattern <= 1) improved.push("Pierwotny problem nie wrócił w tej samej formie albo został lepiej domknięty.");
  else warning.push("Ten sam mechanizm wrócił mimo wcześniejszych rozmów.");

  if (safety >= 3) warning.unshift("Pojawił się sygnał dotyczący bezpieczeństwa. Tego nie należy traktować jak zwykłego kryzysu relacji.");

  const headline =
    trend === "improved"
      ? "Widać ruch, ale sprawdź, czy utrzyma się bez nacisku."
      : trend === "worse"
        ? "Minęło kilka dni, a układ nie odpuścił. To ważniejszy sygnał niż kolejna obietnica."
        : "Zmiana jest jeszcze niejednoznaczna. Część rzeczy drgnęła, część wraca.";

  const summary =
    trend === "improved"
      ? "W porównaniu z pierwszym odczytem jest więcej zachowania, które może dawać realny grunt. Nie trzeba tego umniejszać, ale warto obserwować, czy inicjatywa i odpowiedzialność utrzymają się także wtedy, gdy nie prowadzisz całego procesu."
      : trend === "worse"
        ? "Porównanie nie pokazuje zwykłego gorszego dnia. Najwięcej waży powrót tego samego mechanizmu, brak samodzielnej inicjatywy albo wzrost napięcia. To moment, żeby nie dokładać nadziei tam, gdzie nadal brakuje zachowania."
        : "Dziś nie ma uczciwych podstaw ani do ogłoszenia przełomu, ani do przekreślenia relacji. Rozstrzygnie to, co wydarzy się bez kolejnego nacisku, przypominania i ratowania atmosfery.";

  return {
    trend,
    elapsedDays: daysBetween(createdAt),
    headline,
    summary,
    improved,
    unchanged,
    warning,
    current: { tension: currentTension, drift: currentDrift, rebuild: currentRebuild },
    delta,
    note: answers.event_note || "",
  };
}


const ENTRY_CONFIGS: EntryConfig[] = [
  {
    key: "unease",
    title: "Coś mi w tej relacji nie daje spokoju",
    subtitle: "Nie zawsze od razu wiadomo, o co chodzi. Ale napięcie które wraca, zwykle nie bierze się znikąd.",
    quote: `„Nie umiem tego dobrze wyjaśnić. Po prostu coś mi w tym nie daje spokoju."`,
    intro: "Dowiesz się czy problem leży w braku jasności, asymetrii, lęku przed stratą, wypaleniu czy schemacie, który dopiero zaczyna być widoczny.",
    duration: "ok. 7 minut",
    questions: [
      { id: "e1", lead: "Zacznij od miejsca, którego nie umiesz nazwać.", text: "Kiedy myślisz o tej relacji, co wraca najczęściej – spokój, niepewność, napięcie czy poczucie że coś Ci umyka?", options: [{ id: "a", label: "Napięcie i poczucie że coś jest nie tak.", score: 3 }, { id: "b", label: "Niepewność. Nie wiem na czym stoję.", score: 2 }, { id: "c", label: "Mieszane uczucia, ale nie cały czas.", score: 1 }, { id: "d", label: "Raczej spokój. Mam tylko konkretne pytania.", score: 0 }] },
      { id: "e2", lead: "Niepokój rzadko pojawia się bez powodu.", text: "Czy potrafisz wskazać konkretne zachowania tej osoby, po których zaczynasz się wycofywać, analizować albo tracić spokój?", options: [{ id: "a", label: "Tak. Jest kilka zachowań które regularnie mnie rozbijają.", score: 3 }, { id: "b", label: "Częściowo. Czuję to, ale trudno mi to nazwać.", score: 2 }, { id: "c", label: "Czasem coś mnie porusza, ale nie widzę stałego wzorca.", score: 1 }, { id: "d", label: "Nie. To bardziej moje myśli niż jej/jego zachowanie.", score: 0 }] },
      { id: "e3", lead: "Zobacz, kto w tej relacji niesie ciężar rozumienia.", text: "Kto częściej próbuje zrozumieć, nazwać i naprawić to co dzieje się między Wami?", options: [{ id: "a", label: "Głównie ja. To ja analizuję i próbuję to utrzymać.", score: 3 }, { id: "b", label: "Częściej ja, choć druga strona czasem też próbuje.", score: 2 }, { id: "c", label: "Różnie. Zależy od sytuacji.", score: 1 }, { id: "d", label: "Oboje. Nie czuję że jestem z tym sam/sama.", score: 0 }] },
      { id: "e4", lead: "Relacja może nie być zła, a jednak nie dawać oparcia.", text: "Czy przy tej osobie częściej czujesz się spokojniej, czy bardziej czujnie i ostrożnie niż kiedyś?", options: [{ id: "a", label: "Bardziej czujnie. Jakbym czekał/czekała na kolejny sygnał.", score: 3 }, { id: "b", label: "Różnie. Są dobre momenty, ale czujność wraca.", score: 2 }, { id: "c", label: "Czasem czuję napięcie, ale nie dominuje.", score: 1 }, { id: "d", label: "Raczej spokojniej. Ta osoba mnie stabilizuje.", score: 0 }] },
      { id: "e5", lead: "Przyszłość pokazuje więcej niż deklaracje.", text: "Kiedy wyobrażasz sobie Was za rok, obraz jest konkretny i spokojny, czy mglisty i pełen znaków zapytania?", options: [{ id: "a", label: "Mglisty. Nie umiem tego zobaczyć bez napięcia.", score: 3 }, { id: "b", label: "Widzę jakieś wersje, ale żadna nie daje mi pewności.", score: 2 }, { id: "c", label: "Jest trochę niepewności, ale widzę kierunek.", score: 1 }, { id: "d", label: "Widzę kierunek. Nie wszystko jest idealne, ale jest grunt.", score: 0 }] },
      { id: "e6", lead: "Ciało często wie wcześniej niż głowa.", text: "Jak reagujesz przed spotkaniem, rozmową albo wiadomością od tej osoby?", options: [{ id: "a", label: "Napięciem. Sprawdzam, przewiduję, układam w głowie scenariusze.", score: 3 }, { id: "b", label: "Często mam niepokój, choć próbuję go tłumaczyć.", score: 2 }, { id: "c", label: "Zdarza się napięcie, ale nie zawsze.", score: 1 }, { id: "d", label: "Naturalnie. Nie czuję że muszę się przygotowywać.", score: 0 }] },
      { id: "e7", lead: "Nazwij koszt, nawet jeśli nie znasz jeszcze przyczyny.", text: "Co ta relacja najczęściej robi z Tobą na co dzień?", options: [{ id: "a", label: "Rozregulowuje mnie. Myślę o niej za dużo i tracę spokój.", score: 3 }, { id: "b", label: "Męczy mnie, ale są momenty które wszystko łagodzą.", score: 2 }, { id: "c", label: "Daje i zabiera. Nie umiem tego jednoznacznie ocenić.", score: 1 }, { id: "d", label: "Raczej mnie wzmacnia, mimo trudniejszych momentów.", score: 0 }] },
      { id: "e8", lead: "Ostatnie pytanie w tej ścieżce.", text: "Gdyby ktoś z zewnątrz zobaczył tylko fakty, nie Twoje nadzieje i lęki, co mógłby zauważyć jako pierwszy?", options: [{ id: "a", label: "Że próbuję utrzymać coś, co nie daje mi spokoju.", score: 3 }, { id: "b", label: "Że jest dużo niejasności i trudno to nazwać.", score: 2 }, { id: "c", label: "Że są trudności, ale nie wszystko jest stracone.", score: 1 }, { id: "d", label: "Że to relacja z problemami, ale z realną wzajemnością.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Gdybyś miał/miała dziś nazwać jedną rzecz, która najbardziej zabiera Ci spokój w tej relacji, co byłoby najbliżej prawdy?", options: [{ id: "a", label: "Brak jasności i ciągłe analizowanie.", score: 3 }, { id: "b", label: "Nierówność. Czuję że ja bardziej to niosę.", score: 2 }, { id: "c", label: "Lęk przed stratą albo przed złą decyzją.", score: 1 }, { id: "d", label: "Konkretny problem, który da się nazwać i omówić.", score: 0 }] },
    openPrompt: "Opisz najprościej jak umiesz, co dokładnie nie daje Ci spokoju w tej relacji, nawet jeśli brzmi to chaotycznie.",
  },
  {
    key: "betrayal",
    title: "Po zdradzie albo kłamstwie",
    subtitle: "Zaufanie można odbudować. Ale nie na udawaniu że wszystko jest okej.",
    quote: `„Mówi że to już za nim. Ale ja nadal sprawdzam telefon."`,
    intro: "Dowiesz się czy to co wróciło to realna zmiana, czy tylko cisza po burzy. I czy zaufanie które masz teraz to zaufanie, czy strach przed kolejną prawdą.",
    duration: "ok. 7 minut",
    questions: [
      { id: "b1", lead: "Przeprosiny to słowa. Odpowiedzialność to zachowanie.", text: "Czy ta osoba wzięła realną odpowiedzialność – nie tylko przeprosiła, ale zmieniła coś konkretnego w tym co robi na co dzień?", options: [{ id: "a", label: "Głównie słowa. W zachowaniu nic się nie zmieniło.", score: 3 }, { id: "b", label: "Zmieniła się, ale tylko gdy czuje że patrzę.", score: 2 }, { id: "c", label: "Stara się, widać wysiłek, choć nie zawsze skuteczny.", score: 1 }, { id: "d", label: "Tak. Zmiana jest widoczna i trwała.", score: 0 }] },
      { id: "b2", lead: "Żyć w ciągłym trybie sprawdzania to nie ostrożność. To wyrok.", text: "Czy dziś masz w głowie stały monitoring (telefon, godziny, spójność historii) i to stało się Twoim normalem?", options: [{ id: "a", label: "Tak. Nie umiem już inaczej i to mnie wyczerpuje.", score: 3 }, { id: "b", label: "Wpadam w to regularnie, choć walczę z tym.", score: 2 }, { id: "c", label: "Zdarza się rzadko, przy konkretnych sytuacjach.", score: 1 }, { id: "d", label: "Nie. Nie czuję już tej potrzeby.", score: 0 }] },
      { id: "b3", lead: "To jak ktoś reaguje gdy wracasz do bólu, mówi wszystko o tym czy naprawdę zrozumiał.", text: "Kiedy wracasz do tego co się stało, ta osoba jest cierpliwa i obecna, czy daje Ci do zrozumienia że już za długo to ciągniesz?", options: [{ id: "a", label: "Ucina temat, irytuje się albo mówi żebym przestał.", score: 3 }, { id: "b", label: "Słucha, ale czuję że ma tego dość.", score: 2 }, { id: "c", label: "Słucha, choć widać że to dla niej trudne.", score: 1 }, { id: "d", label: "Jest przy mnie. Cierpliwa. Nie spieszy się.", score: 0 }] },
      { id: "b4", lead: "Jest jedno pytanie którego się boisz zadać wprost.", text: "Gdybyś zapytał dziś tej osoby: „Czy mam się bać że to się powtórzy?”, byłbyś w stanie uwierzyć w odpowiedź?", options: [{ id: "a", label: "Nie. I to mówi mi więcej niż cokolwiek.", score: 3 }, { id: "b", label: "Chciałbym wierzyć, ale coś we mnie blokuje.", score: 2 }, { id: "c", label: "Częściowo. Wierzę, ale z rezerwą.", score: 1 }, { id: "d", label: "Tak. Uwierzyłbym bez wahania.", score: 0 }] },
      { id: "b5", lead: "Intymność po zdradzie to jeden z najtrudniejszych testów.", text: "Jak wygląda między Wami bliskość fizyczna i emocjonalna od kiedy to się stało?", options: [{ id: "a", label: "Jest dystans. Trudno mi być blisko jak wcześniej.", score: 3 }, { id: "b", label: "Bywa różnie, raz lepiej, raz gorzej.", score: 2 }, { id: "c", label: "Powoli wracamy, czuję że próbujemy.", score: 1 }, { id: "d", label: "Jest bliskość. Może nawet głębsza niż przed.", score: 0 }] },
      { id: "b6", lead: "Tajemnice które zostały, mówią tyle samo co ta która wyszła.", text: "Czy masz poczucie że wiesz wszystko co chciałeś wiedzieć, czy są wciąż rzeczy których się boisz zapytać?", options: [{ id: "a", label: "Czuję że czegoś nie wiem i boję się zapytać.", score: 3 }, { id: "b", label: "Pytałem, ale odpowiedzi mnie nie przekonały.", score: 2 }, { id: "c", label: "Dowiedziałem się wystarczająco, choć nie wszystkiego.", score: 1 }, { id: "d", label: "Wiem co chciałem wiedzieć. Nie mam poczucia ukrywania.", score: 0 }] },
      { id: "b7", lead: "Wybaczenie to nie amnezja. Wybaczenie to decyzja co z tym zrobić.", text: "Jak dziś naprawdę czujesz się wobec tego co się stało – wybaczasz, tolerujesz, czy jeszcze nie wiesz?", options: [{ id: "a", label: "Nie wybaczyłem/am. I nie wiem czy potrafię.", score: 3 }, { id: "b", label: "Staram się, ale złość i ból wracają.", score: 2 }, { id: "c", label: "W dużej miary wybaczyłem/am, ale nie zapomniałem/am.", score: 1 }, { id: "d", label: "Wybaczyłem/am. Naprawdę.", score: 0 }] },
      { id: "b8", lead: "Co byś odpowiedział szczerze, nie co powinieneś odpowiedzieć.", text: "Gdybyś miał ocenić szanse tej relacji, co pierwsze przyszłoby Ci do głowy, zanim zaczniesz to racjonalizować?", options: [{ id: "a", label: "Głęboko w sobie nie wierzę że to ma szansę.", score: 3 }, { id: "b", label: "Połowa na połowę. Naprawdę nie wiem.", score: 2 }, { id: "c", label: "Trudne, ale wierzę że możliwe.", score: 1 }, { id: "d", label: "Naprawdę wierzę że damy radę.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Co dziś bardziej trzyma Cię przy tej osobie – poczucie że naprawdę odbudowujecie coś realnego, czy strach że jak odejdziesz, ta historia nie będzie miała sensu?", options: [{ id: "a", label: "Bardziej strach że historia nie miałaby sensu.", score: 3 }, { id: "b", label: "Obie rzeczy, trudno to rozdzielić.", score: 2 }, { id: "c", label: "Uczucie jest realne, choć sytuacja trudna.", score: 1 }, { id: "d", label: "Odbudowujemy coś realnego. To czuję.", score: 0 }] },
    openPrompt: "Co dokładnie pękło i po czym dziś poznajesz, że zaufanie wróciło albo wróciło tylko pozornie?",
  },
  {
    key: "uncertain",
    title: "Nie wiem na czym stoję",
    subtitle: "Niepewność która trwa miesiącami rzadko jest przypadkowa.",
    quote: `„Nie wiem czy jesteśmy razem. Nie wiem czy nie jesteśmy. On też chyba nie wie."`,
    intro: "Dowiesz się czy ta niepewność wynika z sytuacji, czy z tego, że ktoś świadomie nie daje Ci jasności, bo mu to odpowiada.",
    duration: "ok. 7 minut",
    questions: [
      { id: "u1", lead: "Kiedy ktoś chce, mówi wprost. Reszta to wymówki.", text: "Czy ta osoba konkretnie i wprost określiła czym dla niej jesteście, czy raczej temat jakoś zawsze się rozmywa?", options: [{ id: "a", label: "Rozmywa się albo w ogóle nie poruszamy tego tematu.", score: 3 }, { id: "b", label: "Coś mówi, ale nieprecyzyjnie.", score: 2 }, { id: "c", label: "Mówiła, ale słowa nie zgadzają się z zachowaniem.", score: 1 }, { id: "d", label: "Tak, jest jasność co do tego co jest między nami.", score: 0 }] },
      { id: "u2", lead: "Zaangażowanie widać wtedy gdy Ty nic nie robisz.", text: "Jak wygląda kontakt gdy to nie Ty piszesz pierwszy, nie Ty proponujesz, nie Ty inicjujesz?", options: [{ id: "a", label: "Prawie nic się nie dzieje. To ja napędzam wszystko.", score: 3 }, { id: "b", label: "Coś się pojawia, ale rzadziej i jakby z obowiązku.", score: 2 }, { id: "c", label: "Inicjuje, choć nieregularnie.", score: 1 }, { id: "d", label: "Sama inicjuje. Regularnie i naturalnie.", score: 0 }] },
      { id: "u3", lead: "Uwaga która pojawia się gdy zaczynasz się wycofywać, to nie uczucie. To refleks.", text: "Czy ta osoba staje się bardziej obecna i zaangażowana dokładnie wtedy, gdy wyczuje że możesz odejść?", options: [{ id: "a", label: "Tak. Wtedy wszystko wraca, a potem znowu znika.", score: 3 }, { id: "b", label: "Chyba tak, choć nie chcę w to wierzyć.", score: 2 }, { id: "c", label: "Może trochę, ale nie widzę wyraźnego wzorca.", score: 1 }, { id: "d", label: "Nie. Poziom zaangażowania jest mniej więcej stały.", score: 0 }] },
      { id: "u4", lead: "Zrób ten eksperyment w głowie – odpowiedz szybko.", text: "Gdybyś przez dwa tygodnie przestał pisać pierwszy i nie odzywał się wcale, co by się stało z kontaktem?", options: [{ id: "a", label: "Prawdopodobnie zamarłby całkowicie.", score: 3 }, { id: "b", label: "Odezwałaby się, ale nie wiem kiedy ani po co.", score: 2 }, { id: "c", label: "Odezwałaby się, choć pewnie nie od razu.", score: 1 }, { id: "d", label: "Odezwałaby się szybko. Jestem pewien.", score: 0 }] },
      { id: "u5", lead: "Plany to deklaracje intencji. Realizacja to prawda.", text: "Czy ta osoba pojawiła się w Twoich planach i Ty w jej – konkretnych, nie mglistych?", options: [{ id: "a", label: "Nie. Plany to u nas abstrakcja.", score: 3 }, { id: "b", label: "Rzadko. I zwykle to ja proponuję.", score: 2 }, { id: "c", label: "Czasem. Ale nie jest to naturalne.", score: 1 }, { id: "d", label: "Tak. Jesteśmy w swoich planach.", score: 0 }] },
      { id: "u6", lead: "Jak traktujesz siebie w tej relacji, to też jest informacja.", text: "Czy czekanie na jasność z jej strony sprawiło że zacząłeś/aś dostosowywać się, tłumaczyć jej zachowanie albo zaniżać swoje oczekiwania?", options: [{ id: "a", label: "Tak. Schodzę coraz niżej żeby pasować do tej sytuacji.", score: 3 }, { id: "b", label: "Trochę. Racjonalizuję bardziej niż powinienem.", score: 2 }, { id: "c", label: "Staram się nie, ale to trudne.", score: 1 }, { id: "d", label: "Nie. Pozostałem przy swoim.", score: 0 }] },
      { id: "u7", lead: "Jest granica między cierpliwością a czekaniem bez powodu.", text: "Jak długo trwa ta niepewność i czy w tym czasie sytuacja się jakoś zmienia, czy stoi w miejscu?", options: [{ id: "a", label: "Długo. Miesiące. I nic się nie zmienia.", score: 3 }, { id: "b", label: "Trochę trwa, bywa lepiej i gorzej bez kierunku.", score: 2 }, { id: "c", label: "Jakiś czas, ale widzę powolny ruch.", score: 1 }, { id: "d", label: "Stosunkowo krótko. Jesteśmy w procesie.", score: 0 }] },
      { id: "u8", lead: "Jedna uczciwa odpowiedź.", text: "Co naprawdę chcesz usłyszeć i dlaczego jeszcze tego nie zapytałeś/aś wprost?", options: [{ id: "a", label: "Boję się odpowiedzi. Wolę nie wiedzieć.", score: 3 }, { id: "b", label: "Pytałem/am, ale odpowiedź była wymijająca.", score: 2 }, { id: "c", label: "Pytałem/am, ale nie wiem czy usłyszałem/am prawdę.", score: 1 }, { id: "d", label: "Zapytałem/am i dostałem/am jasną odpowiedź.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Gdybyś wyjął z równania tęsknotę, przyzwyczajenie i lęk przed samotnością, czy nadal chciałbyś tej konkretnej osoby?", options: [{ id: "a", label: "Szczerze? Chyba nie. To bardziej uzależnienie niż wybór.", score: 3 }, { id: "b", label: "Myślę że tak, ale nie jestem pewien.", score: 2 }, { id: "c", label: "Tak, choć mam wątpliwości których nie chcę ignorować.", score: 1 }, { id: "d", label: "Tak. Niezależnie od tych wszystkich rzeczy.", score: 0 }] },
    openPrompt: "Co konkretnie od miesięcy nie daje Ci jasności i dlaczego mimo tego wciąż jesteś w tym miejscu?",
  },
  {
    key: "asymmetry",
    title: "Daję więcej niż dostaję",
    subtitle: "Relacja nie musi kończyć się głośno, żeby zaczęła opierać się głównie na Tobie.",
    quote: `„Mam wrażenie, że gdybym przestał/przestała się starać, to wszystko po prostu by zgasło."`,
    intro: "Dowiesz się czy to chwilowa nierówność, czy układ w którym jedna osoba niesie relację za dwoje i coraz bardziej traci w tym siebie.",
    duration: "ok. 7 minut",
    questions: [
      { id: "a1", lead: "Zaangażowanie widać wtedy, kiedy przestajesz ciągnąć.", text: "Co dzieje się z kontaktem, atmosferą i bliskością, gdy to Ty na chwilę przestajesz inicjować?", options: [{ id: "a", label: "Prawie wszystko siada. Jakby relacja nie miała własnego napędu.", score: 3 }, { id: "b", label: "Coś się dzieje, ale wyraźnie mniej i później.", score: 2 }, { id: "c", label: "Druga strona zauważa, choć nie zawsze od razu.", score: 1 }, { id: "d", label: "Relacja dalej działa. Nie opiera się tylko na mnie.", score: 0 }] },
      { id: "a2", lead: "Nie chodzi o liczenie punktów. Chodzi o kierunek.", text: "Kto częściej naprawia atmosferę po napięciu, wraca do rozmowy i próbuje zrozumieć drugą stronę?", options: [{ id: "a", label: "Głównie ja. Bez tego temat zwykle by umarł.", score: 3 }, { id: "b", label: "Częściej ja, choć czasem druga strona też wraca.", score: 2 }, { id: "c", label: "Różnie. Nie ma jednej reguły.", score: 1 }, { id: "d", label: "Oboje. Czuję wzajemność w naprawie.", score: 0 }] },
      { id: "a3", lead: "Czasem człowiek schodzi coraz niżej i nazywa to cierpliwością.", text: "Czy zauważasz, że obniżasz swoje oczekiwania, żeby tylko ta relacja mogła dalej trwać?", options: [{ id: "a", label: "Tak. Proszę już o rzeczy, które powinny być podstawą.", score: 3 }, { id: "b", label: "Trochę tak. Tłumaczę więcej niż powinienem/powinnam.", score: 2 }, { id: "c", label: "Zdarza się, ale próbuję trzymać swoje granice.", score: 1 }, { id: "d", label: "Nie. Moje potrzeby są traktowane poważnie.", score: 0 }] },
      { id: "a4", lead: "Zobacz, kto korzysta z Twojej wyrozumiałości.", text: "Kiedy mówisz, że czegoś potrzebujesz, druga strona realnie to uwzględnia czy tylko uspokaja Cię na chwilę?", options: [{ id: "a", label: "Raczej uspokaja na chwilę. Potem wraca to samo.", score: 3 }, { id: "b", label: "Czasem próbuje, ale bez trwałości.", score: 2 }, { id: "c", label: "Widać próby, choć nie zawsze skuteczne.", score: 1 }, { id: "d", label: "Uwzględnia. Widzę realną zmianę.", score: 0 }] },
      { id: "a5", lead: "Asymetria nie zawsze wygląda jak obojętność.", text: "Czy druga strona daje Ci tyle, żebyś został/została, ale za mało, żebyś poczuł/poczuła spokój?", options: [{ id: "a", label: "Tak. To dokładnie ten układ.", score: 3 }, { id: "b", label: "Często tak to czuję, choć nie chcę tego przyznać.", score: 2 }, { id: "c", label: "Bywa tak, ale nie cały czas.", score: 1 }, { id: "d", label: "Nie. Czuję się wybierany/wybierana, nie tylko zatrzymywany/zatrzymywana.", score: 0 }] },
      { id: "a6", lead: "Sprawdź, jak wygląda odpowiedzialność.", text: "Kiedy pojawia się problem, czy druga strona umie zobaczyć swój udział bez przerzucania wszystkiego na Ciebie?", options: [{ id: "a", label: "Rzadko. Zwykle kończy się na mojej winie albo mojej przesadzie.", score: 3 }, { id: "b", label: "Czasem widzi, ale szybko się broni.", score: 2 }, { id: "c", label: "Bywa trudno, ale potrafi uznać część odpowiedzialności.", score: 1 }, { id: "d", label: "Tak. Umie zobaczyć swój udział i coś z tym zrobić.", score: 0 }] },
      { id: "a7", lead: "Największy koszt nierówności pojawia się po cichu.", text: "Kim się stajesz w tej relacji?", options: [{ id: "a", label: "Kimś bardziej proszącym, czekającym i napiętym niż chcę być.", score: 3 }, { id: "b", label: "Często tracę siebie, ale potem wracam do równowagi.", score: 2 }, { id: "c", label: "Mam trudniejsze momenty, ale nadal czuję siebie.", score: 1 }, { id: "d", label: "Jestem sobą. Ta relacja mnie nie pomniejsza.", score: 0 }] },
      { id: "a8", lead: "Odpowiedz bez usprawiedliwień.", text: "Gdybyś dawał/dawała dokładnie tyle, ile dostajesz, co stałoby się z tą relacją?", options: [{ id: "a", label: "Prawdopodobnie by się rozsypała.", score: 3 }, { id: "b", label: "Mocno by osłabła.", score: 2 }, { id: "c", label: "Byłoby trudniej, ale może coś by się wyrównało.", score: 1 }, { id: "d", label: "Niewiele. Jest w niej wzajemność.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Czy w tej relacji bardziej czujesz się wybrany/wybrana, czy potrzebny/potrzebna do tego, żeby ona w ogóle działała?", options: [{ id: "a", label: "Bardziej potrzebny/potrzebna do utrzymywania tego w całości.", score: 3 }, { id: "b", label: "Trochę wybrany/wybrana, trochę użyteczny/użyteczna.", score: 2 }, { id: "c", label: "Różnie, ale nie chcę ignorować nierówności.", score: 1 }, { id: "d", label: "Wybrany/wybrana. Nie czuję że to ja wszystko dźwigam.", score: 0 }] },
    openPrompt: "Opisz konkretnie, w czym dajesz więcej niż dostajesz i co by się stało, gdybyś przestał/przestała to ciągnąć.",
  },
  {
    key: "conflict",
    title: "Ciągle się kłócimy",
    subtitle: "Nie chodzi już o jedną sprzeczkę. Chodzi o rytm, w którym każda rozmowa może skończyć się napięciem.",
    quote: `„Nie umiemy normalnie rozmawiać. Wszystko zaraz robi się ciężkie."`,
    intro: "Dowiesz się czy to przeciążony okres, różnica stylów komunikacji, czy sposób bycia razem, który coraz bardziej niszczy bliskość.",
    duration: "ok. 7 minut",
    questions: [
      { id: "c1", lead: "Kłótnia sama w sobie nie niszczy relacji. Niszczy to, co dzieje się po niej.", text: "Po konflikcie między Wami częściej pojawia się naprawa i zrozumienie, czy cisza, dystans i kolejny ślad na później?", options: [{ id: "a", label: "Cisza, dystans albo kolejny ślad. Naprawy prawie nie ma.", score: 3 }, { id: "b", label: "Czasem jest naprawa, ale napięcie zostaje.", score: 2 }, { id: "c", label: "Bywa różnie. Nie zawsze umiemy to domknąć.", score: 1 }, { id: "d", label: "Zwykle umiemy wrócić do siebie po konflikcie.", score: 0 }] },
      { id: "c2", lead: "Zobacz, czy kłócicie się o temat, czy o siebie.", text: "Czy Wasze kłótnie dotyczą konkretnych spraw, czy szybko zamieniają się w atak, obronę i wypominanie wszystkiego naraz?", options: [{ id: "a", label: "Szybko idzie w atak, obronę i stare rzeczy.", score: 3 }, { id: "b", label: "Często odpływamy od tematu.", score: 2 }, { id: "c", label: "Zdarza się, ale umiemy czasem wrócić do sedna.", score: 1 }, { id: "d", label: "Zwykle trzymamy się konkretu.", score: 0 }] },
      { id: "c3", lead: "Najważniejsze jest to, czy w konflikcie nadal jesteście po jednej stronie.", text: "Kiedy się kłócicie, czujesz że walczycie z problemem, czy przeciwko sobie?", options: [{ id: "a", label: "Przeciwko sobie. Jakby ktoś musiał wygrać.", score: 3 }, { id: "b", label: "Często tak, choć potem tego żałujemy.", score: 2 }, { id: "c", label: "Bywa ostro, ale czasem wracamy do problemu.", score: 1 }, { id: "d", label: "Raczej z problemem. Nie przeciwko sobie.", score: 0 }] },
      { id: "c4", lead: "Napięcie przed rozmową też jest informacją.", text: "Czy boisz się zaczynać ważne tematy, bo wiesz, że może z tego wyjść kolejna awantura?", options: [{ id: "a", label: "Tak. Często wolę milczeć niż uruchomić konflikt.", score: 3 }, { id: "b", label: "Często się waham, bo wiem jak może się skończyć.", score: 2 }, { id: "c", label: "Czasem, ale nie zawsze.", score: 1 }, { id: "d", label: "Nie. Trudne tematy nie muszą kończyć się awanturą.", score: 0 }] },
      { id: "c5", lead: "Sprawdź, czy konflikt ma granice.", text: "Czy w kłótniach pojawiają się słowa albo zachowania, po których trudno wrócić do normalności?", options: [{ id: "a", label: "Tak. Padają rzeczy, które długo we mnie zostają.", score: 3 }, { id: "b", label: "Zdarza się, choć potem ktoś przeprasza.", score: 2 }, { id: "c", label: "Rzadko, ale granice bywają naruszane.", score: 1 }, { id: "d", label: "Nie. Nawet w konflikcie są granice.", score: 0 }] },
      { id: "c6", lead: "Niektóre pary nie rozwiązują konfliktów. Tylko robią przerwę między nimi.", text: "Czy macie poczucie, że naprawdę rozwiązujecie problemy, czy raczej wracacie do względnego spokoju aż do następnego wybuchu?", options: [{ id: "a", label: "Raczej przerwa między wybuchami. Tematy wracają.", score: 3 }, { id: "b", label: "Część rzeczy wraca, choć próbujemy je zamykać.", score: 2 }, { id: "c", label: "Nie wszystko rozwiązujemy, ale coś się zmienia.", score: 1 }, { id: "d", label: "Rozwiązujemy problemy, nie tylko je przeczekujemy.", score: 0 }] },
      { id: "c7", lead: "Zobacz, jak wygląda Wasz kontakt w spokojniejsze dni.", text: "Kiedy akurat się nie kłócicie, jest między Wami ciepło i normalność, czy raczej napięcie wisi w tle?", options: [{ id: "a", label: "Napięcie wisi w tle prawie cały czas.", score: 3 }, { id: "b", label: "Bywa spokojnie, ale czuję że to kruche.", score: 2 }, { id: "c", label: "Są normalne chwile, choć nie zawsze lekkie.", score: 1 }, { id: "d", label: "Jest ciepło. Konflikty nie zabierają wszystkiego.", score: 0 }] },
      { id: "c8", lead: "Ostatnie pytanie. Bez wybielania.", text: "Gdyby nic się nie zmieniło w sposobie Waszych kłótni, co zrobiłoby to z relacją za rok?", options: [{ id: "a", label: "Mogłoby ją zniszczyć albo już ją niszczy.", score: 3 }, { id: "b", label: "Będzie coraz ciężej i coraz mniej blisko.", score: 2 }, { id: "c", label: "Byłoby trudno, ale może jeszcze do odwrócenia.", score: 1 }, { id: "d", label: "Nie widzę aż takiego ryzyka.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Czy Wasze kłótnie bardziej oczyszczają relację, czy zostawiają w niej coraz więcej rzeczy, których potem nikt nie umie naprawić?", options: [{ id: "a", label: "Zostawiają ślady. Coraz trudniej wrócić do bliskości.", score: 3 }, { id: "b", label: "Czasem oczyszczają, ale coraz częściej ranią.", score: 2 }, { id: "c", label: "Różnie. Widzę i ryzyko, i potencjał.", score: 1 }, { id: "d", label: "Oczyszczają. Po nich zwykle jest więcej jasności.", score: 0 }] },
    openPrompt: "Opisz typową kłótnię między Wami: od czego się zaczyna, gdzie wymyka się spod kontroli i co zostaje po niej później.",
  },
  {
    key: "stagnation",
    title: "To trwa, ale czegoś już w tym nie ma",
    subtitle: "Brak awantur to nie dowód spokoju. Czasem dowód że już o nic nie ma sensu się kłócić.",
    quote: `„Wszystko jest okej. I właśnie to mnie przeraża."`,
    intro: "Dowiesz się czy jesteście w spokojnej fazie po trudnym czasie, czy po prostu oboje przestaliście już czegokolwiek oczekiwać.",
    duration: "ok. 7 minut",
    questions: [
      { id: "s1", lead: "Samotność w związku boli inaczej niż samotność po rozstaniu.", text: "Czy coraz częściej jesteście razem fizycznie, ale czujesz że naprawdę jesteś sam?", options: [{ id: "a", label: "Tak. I to stało się moim normalem.", score: 3 }, { id: "b", label: "Często, szczególnie przy ważnych tematach.", score: 2 }, { id: "c", label: "Czasem. Nie jest to regułą.", score: 1 }, { id: "d", label: "Nie. Czuję jej obecność i kontakt.", score: 0 }] },
      { id: "s2", lead: "Kiedy ostatnio ta osoba zrobiła coś dla Was z własnej inicjatywy, bez podpowiedzi?", text: "Czy masz poczucie że to głównie Ty trzymasz tę relację przy życiu – emocjami, inicjatywą, podtrzymywaniem atmosfery?", options: [{ id: "a", label: "Tak. Bez mojego wysiłku to by już padło.", score: 3 }, { id: "b", label: "Zdecydowanie ja więcej, ona mało.", score: 2 }, { id: "c", label: "Trochę nierówno, ale oboje coś wnosimy.", score: 1 }, { id: "d", label: "Jest obustronne. Oboje się staramy.", score: 0 }] },
      { id: "s3", lead: "Kiedy myśl o odejściu przestaje przerażać, to jest sygnał.", text: "Czy myśl o zakończeniu tej relacji jest coraz mniej przerażająca, a coraz bardziej... ulżyłoby?", options: [{ id: "a", label: "Tak. Coraz częściej myślę o uldze niż o stracie.", score: 3 }, { id: "b", label: "Pojawia się, przeraża i przyciąga naraz.", score: 2 }, { id: "c", label: "Pojawia się rzadko. Nie dominuje.", score: 1 }, { id: "d", label: "Nie. Ta myśl nadal mnie naprawdę przeraża.", score: 0 }] },
      { id: "s4", lead: "Odpowiedz zanim zdążysz to przemyśleć.", text: "Gdybyś jutro dowiedział się że ta osoba odchodzi, pierwsza emocja to byłby ból czy ulga?", options: [{ id: "a", label: "Ulga. Może też ból, ale ulga byłaby pierwsza.", score: 3 }, { id: "b", label: "Nie wiem. Pewnie jedno i drugie naraz.", score: 2 }, { id: "c", label: "Ból, choć może też trochę ulgi.", score: 1 }, { id: "d", label: "Ból. Zdecydowanie i tylko ból.", score: 0 }] },
      { id: "s5", lead: "Kiedy ostatnio rozmawialiście o czymś ważnym, naprawdę.", text: "Czy macie ze sobą rozmowy które coś znaczą – o Was, o przyszłości, o tym co czujecie?", options: [{ id: "a", label: "Głównie logistyka. Rozmów które coś znaczą prawie nie ma.", score: 3 }, { id: "b", label: "Czasem, ale rzadziej niż kiedyś i trudniej.", score: 2 }, { id: "c", label: "Bywa, choć nie tak często jak bym chciał.", score: 1 }, { id: "d", label: "Tak. Rozmawiamy o tym co ważne.", score: 0 }] },
      { id: "s6", lead: "Wspólne chwile mówią więcej niż deklaracje.", text: "Czy jest coś co robicie razem i oboje naprawdę tego chcecie – coś co nie jest obowiązkiem?", options: [{ id: "a", label: "Trudno mi cokolwiek wymienić.", score: 3 }, { id: "b", label: "Było, ale dawno. Teraz głównie rutyna.", score: 2 }, { id: "c", label: "Jedna, dwie rzeczy, ale to za mało.", score: 1 }, { id: "d", label: "Tak. Mamy wspólne rzeczy które lubimy.", score: 0 }] },
      { id: "s7", lead: "To pytanie boli bardziej niż inne.", text: "Czy pamiętasz kiedy ostatnio naprawdę się cieszyłeś na spotkanie z tą osobą?", options: [{ id: "a", label: "Nie pamiętam. Już tego nie czuję.", score: 3 }, { id: "b", label: "Dawno temu. Teraz jest głównie zwyczaj.", score: 2 }, { id: "c", label: "Zdarza się, rzadziej niż kiedyś.", score: 1 }, { id: "d", label: "Tak. Cieszę się na nią.", score: 0 }] },
      { id: "s8", lead: "Rozmawialiście kiedyś o tym co czujecie?", text: "Czy ta osoba wie że coś między Wami zgasło – powiedziałeś jej to, czy niesiesz to sam?", options: [{ id: "a", label: "Nie wie. Noszę to sam i nie wiem jak zacząć.", score: 3 }, { id: "b", label: "Próbowałem powiedzieć, ale nie dotarło.", score: 2 }, { id: "c", label: "Wie, ale jej reakcja mnie nie przekonała.", score: 1 }, { id: "d", label: "Rozmawialiśmy o tym. Oboje to czujemy.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Co konkretnie chciałbyś żeby wróciło między Wami i czy ta osoba w ogóle wie o tym i robi cokolwiek żeby to zmienić?", options: [{ id: "a", label: "Wie albo powinna wiedzieć, i nic nie robi.", score: 3 }, { id: "b", label: "Coś próbuje, ale za mało i za rzadko.", score: 2 }, { id: "c", label: "Stara się, nie wiem czy wystarczająco.", score: 1 }, { id: "d", label: "Tak. Naprawdę razem nad tym pracujemy.", score: 0 }] },
    openPrompt: "Co dokładnie zniknęło między Wami i kiedy przestałeś wierzyć że samo wróci?",
  },
  {
    key: "returning",
    title: "Rozstaliśmy się i nie wiem czy wracać",
    subtitle: "Tęsknota potrafi udawać miłość. Lęk przed samotnością potrafi udawać sens.",
    quote: `„Wiem że nie powinnam. Ale cały czas o nim myślę."`,
    intro: "Dowiesz się czy chcesz tej konkretnej osoby, czy chcesz żeby pewien rozdział w końcu miał dobre zakończenie.",
    duration: "ok. 7 minut",
    questions: [
      { id: "r1", lead: "Tęsknić można za człowiekiem. Tęsknić można za poczuciem że się jest potrzebnym.", text: "Gdy wyobrażasz sobie powrót, co konkretnie widzisz? Tę osobę, czy koniec zawieszenia i samotności?", options: [{ id: "a", label: "Szczerość mówi: bardziej koniec tego stanu niż tę osobę.", score: 3 }, { id: "b", label: "Trudno to rozdzielić. Jedno z drugim.", score: 2 }, { id: "c", label: "Widzę tę osobę, choć tęsknota za normalnością też jest.", score: 1 }, { id: "d", label: "Widzę tę konkretną osobę. Nie ulgę.", score: 0 }] },
      { id: "r2", lead: "Powód rozstania to prawda o relacji. Tęsknota go nie usuwa.", text: "To przez co się rozstaliście – czy to był jednorazowy kryzys, czy wzorzec który wracał od dawna?", options: [{ id: "a", label: "Wzorzec. Wracał wielokrotnie pod różnymi nazwami.", score: 3 }, { id: "b", label: "Trochę jednego i drugiego, nie wiem jak to nazwać.", score: 2 }, { id: "c", label: "Był wzorzec, ale myślę że rozumiemy już dlaczego.", score: 1 }, { id: "d", label: "Jednorazowy kryzys albo okoliczności zewnętrzne.", score: 0 }] },
      { id: "r3", lead: "Odległość filtruje wspomnienia. Przepuszcza to co przyjemne.", text: "Gdy myślisz o tej osobie teraz, widzisz całość jasno, czy złe jest rozmyte a dobre wyostrzone?", options: [{ id: "a", label: "Głównie dobre. Złe jakoś samo się tłumaczy.", score: 3 }, { id: "b", label: "Widzę jedno i drugie, ale nierówno.", score: 2 }, { id: "c", label: "Staram się widzieć całość, choć to trudne.", score: 1 }, { id: "d", label: "Widzę całość. Włącznie z tym co bolało.", score: 0 }] },
      { id: "r4", lead: "Przed powrotem jest jedno kluczowe pytanie.", text: "Czy wiesz co konkretnie musiałoby się zmienić żeby powrót miał sens i czy ta osoba wie to samo i jest gotowa?", options: [{ id: "a", label: "Nie wiem. Albo wiem, ale ta osoba nie.", score: 3 }, { id: "b", label: "Mam jakiś obraz, ale nie rozmawialiśmy o tym wprost.", score: 2 }, { id: "c", label: "Rozmawialiśmy, ale nie wiem czy jesteśmy zgodni.", score: 1 }, { id: "d", label: "Oboje wiemy co i oboje jesteśmy gotowi na zmianę.", score: 0 }] },
      { id: "r5", lead: "Uczucia nie kłamią. Interpretacja, owszem.", text: "Czy tęsknota którą czujesz jest stała i spokojna, czy intensywna szczególnie gdy jesteś sam, w nocy, albo gdy coś boli?", options: [{ id: "a", label: "Intensywna szczególnie gdy jestem sam i jest źle.", score: 3 }, { id: "b", label: "Różna. Bywa spokojna i bywa intensywna.", score: 2 }, { id: "c", label: "Raczej stała, nie tylko w trudnych momentach.", score: 1 }, { id: "d", label: "Spokojna i stała. Nie napędzana bólem.", score: 0 }] },
      { id: "r6", lead: "Co mówisz sobie o tej osobie kiedy nikt nie słyszy.", text: "Gdybyś miał opisać tę osobę komuś bliskiemu, powiedziałbyś o niej dobrze, uczciwie, czy ostrożnie?", options: [{ id: "a", label: "Ostrożnie. Wiem że bliscy mają wątpliwości.", score: 3 }, { id: "b", label: "Mieszanie, bo sam mam mieszane uczucia.", score: 2 }, { id: "c", label: "Uczciwie, z dobrymi i złymi stronami.", score: 1 }, { id: "d", label: "Dobrze i bez zastrzeżeń.", score: 0 }] },
      { id: "r7", lead: "Wyobraź sobie że za rok nic się nie zmieni.", text: "Gdybyś za rok był dokładnie w tym samym miejscu – tęskniący, niepewny, bez odpowiedzi – czy to jest wersja życia którą akceptujesz?", options: [{ id: "a", label: "Nie. Ale nie wiem jak z tego wyjść.", score: 3 }, { id: "b", label: "Nie chcę tego, ale nie jestem gotowy się zatrzymać.", score: 2 }, { id: "c", label: "Nie. Dlatego chcę to rozwiązać – w jedną lub drugą stronę.", score: 1 }, { id: "d", label: "Nie. I dlatego działam.", score: 0 }] },
      { id: "r8", lead: "Ostatnie pytanie tego bloku.", text: "Czy ta osoba wie że o tym myślisz – o powrocie – i jaka jest jej reakcja?", options: [{ id: "a", label: "Nie wie. Albo wie i nie reaguje.", score: 3 }, { id: "b", label: "Wie, ale jej odpowiedź jest nieokreślona.", score: 2 }, { id: "c", label: "Rozmawialiśmy, nie mamy jeszcze jasności.", score: 1 }, { id: "d", label: "Wie i jest otwarta na rozmowę.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Gdybyś wiedział że ta osoba już ułożyła sobie życie z kimś innym i nie wróci, jak długo zajęłoby Ci dojście do siebie?", options: [{ id: "a", label: "Długo. Bardzo długo. To by mnie złamało.", score: 3 }, { id: "b", label: "Byłoby bardzo ciężko. Nie wiem czy dałbym radę.", score: 2 }, { id: "c", label: "Ciężko, ale bym przez to przeszedł w końcu.", score: 1 }, { id: "d", label: "Byłoby smutno. Ale przyjąłbym to i szedł dalej.", score: 0 }] },
    openPrompt: "Co naprawdę trzyma Cię przy myśleniu o powrocie i czego się boisz jeśli nie wrócisz?",
  },
  {
    key: "triangle",
    title: "Jest ktoś trzeci",
    subtitle: "Nowa osoba obnaża to czego nie było, albo daje pretekst do ucieczki. Z zewnątrz wygląda tak samo.",
    quote: `„Nie wiem czy ją kocham czy tylko uciekam. I nie wiem od czego."`,
    intro: "Dowiesz się czy ta trzecia osoba jest odpowiedzią na coś realnego, czy pytaniem które zadajesz sobie od dawna i szukasz dla niego gotowej nazwy.",
    duration: "ok. 7 minut",
    questions: [
      { id: "t1", lead: "Gdyby w obecnej relacji było naprawdę dobrze, ta osoba by się tak nie pojawiła.", text: "Czy pojawienie się kogoś trzeciego odsłoniło coś czego Ci w obecnej relacji brakowało od dawna?", options: [{ id: "a", label: "Tak. I teraz nie mogę tego nie widzieć.", score: 3 }, { id: "b", label: "Chyba tak, ale nie wiem czy bezpośrednio związane.", score: 2 }, { id: "c", label: "Może trochę, ale nie chcę tak tego widzieć.", score: 1 }, { id: "d", label: "Nie. To osobna historia. W relacji jest dobrze.", score: 0 }] },
      { id: "t2", lead: "Nowa osoba to jeszcze nie człowiek. To wyobrażenie.", text: "Czy znasz tę osobę w realu – w konflikcie, zmęczeniu, codzienności – czy tylko w jej najlepszym wydaniu?", options: [{ id: "a", label: "Wyłącznie w najlepszym. Bez żadnej codzienności.", score: 3 }, { id: "b", label: "Głównie od dobrej strony, codzienność jest minimalna.", score: 2 }, { id: "c", label: "Trochę jedno i drugie, poznaję ją powoli.", score: 1 }, { id: "d", label: "Znam ją realnie. Nie tylko od dobrej strony.", score: 0 }] },
      { id: "t3", lead: "Pierwsza myśl. Zanim zdążysz ją poprawić.", text: "Gdyby ta trzecia osoba zniknęła z Twojego życia całkowicie, jak byś się poczuł?", options: [{ id: "a", label: "Bardzo źle. Trudno to sobie wyobrazić.", score: 3 }, { id: "b", label: "Ciężko, ale w końcu bym sobie poradził.", score: 2 }, { id: "c", label: "Smutno, ale wiem że to by minęło.", score: 1 }, { id: "d", label: "Dobrze. Wiem że to bardziej fascynacja.", score: 0 }] },
      { id: "t4", lead: "Zawieszenie jest wygodne – odraczasz decyzję nie podejmując jej.", text: "Czy dziś bardziej działasz – robisz coś z którąś z tych sytuacji – czy trwasz i odkładasz?", options: [{ id: "a", label: "Trwam. Odkładam. Czekam aż coś się samo rozstrzygnie.", score: 3 }, { id: "b", label: "Próbuję coś rozumieć, ale bez realnego działania.", score: 2 }, { id: "c", label: "Staram się działać, choć nie wiem od czego zacząć.", score: 1 }, { id: "d", label: "Działam. Podjąłem lub podejmuję decyzję.", score: 0 }] },
      { id: "t5", lead: "Porównania mówią więcej niż deklaracje.", text: "Czy porównujesz te dwie osoby i co konkretnie wychodzi z tych porównań?", options: [{ id: "a", label: "Porównuję ciągle. Ta trzecia wypada lepiej prawie zawsze.", score: 3 }, { id: "b", label: "Porównuję, ale nie wiem który obraz jest prawdziwy.", score: 2 }, { id: "c", label: "Próbuję nie porównywać, bo to nieuczciwe.", score: 1 }, { id: "d", label: "Nie porównuję. To dla mnie zupełnie różne sprawy.", score: 0 }] },
      { id: "t6", lead: "Co robi ta osoba z Twoją głową na co dzień.", text: "Jak dużo czasu dziennie myślisz o tej trzeciej osobie i czy to Ci przeszkadza?", options: [{ id: "a", label: "Bardzo dużo. Zajmuje mi głowę przez większość dnia.", score: 3 }, { id: "b", label: "Sporo, szczególnie gdy jestem sam.", score: 2 }, { id: "c", label: "Czasem. Nie dominuje ale jest.", score: 1 }, { id: "d", label: "Rzadko. To nie jest obsesja.", score: 0 }] },
      { id: "t7", lead: "Obecna relacja zasługuje na uczciwe pytanie.", text: "Czy rozmawiałeś ze swoją obecną osobą o tym że coś między Wami nie gra – bez wspominania o kimś trzecim?", options: [{ id: "a", label: "Nie. Noszę to sam i nie potrafię zacząć.", score: 3 }, { id: "b", label: "Próbowałem, ale to nie było szczere.", score: 2 }, { id: "c", label: "Tak, ale bez efektu.", score: 1 }, { id: "d", label: "Tak. Rozmawiamy o tym co się dzieje między nami.", score: 0 }] },
      { id: "t8", lead: "Na koniec, uczciwie.", text: "Gdybyś musiał dziś podjąć decyzję – zostać w obecnej relacji albo z niej wyjść – co byś wybrał?", options: [{ id: "a", label: "Chciałbym wyjść. Ale się boję.", score: 3 }, { id: "b", label: "Nie wiem. Naprawdę nie wiem.", score: 2 }, { id: "c", label: "Chciałbym zostać i naprawić to co nie gra.", score: 1 }, { id: "d", label: "Zostać. Ta relacja jest dla mnie ważna.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Gdyby tamta trzecia osoba nigdy nie pojawiła się w Twoim życiu, czy dziś byłbyś zadowolony z obecnej relacji?", options: [{ id: "a", label: "Nie. Problem by i tak istniał.", score: 3 }, { id: "b", label: "Nie wiem. Chyba byłoby ciężko.", score: 2 }, { id: "c", label: "Może, ale to trudne pytanie.", score: 1 }, { id: "d", label: "Tak. Byłoby dobrze.", score: 0 }] },
    openPrompt: "Co ta trzecia osoba daje Ci, albo obiecuje że da, czego nie masz w obecnej relacji?",
  },
  {
    key: "loop",
    title: "Wracamy do siebie w kółko",
    subtitle: "Odchodzicie. Wracacie. I za każdym razem mówisz sobie że tym razem będzie inaczej.",
    quote: `„Rozstajemy się od trzech lat. Nigdy nie wychodzi nam to na stałe."`,
    intro: "Dowiesz się czy to co Was trzyma razem to miłość, czy mechanizm napięcie-ulga, który wygląda jak miłość ale nią nie jest.",
    duration: "ok. 7 minut",
    questions: [
      { id: "l1", lead: "Jest pytanie które warto zadać sobie uczciwie.", text: "Czy najsilniejsze uczucie do tej osoby pojawia się głównie wtedy gdy coś się sypie, ktoś odchodzi albo jest ryzyko utraty?", options: [{ id: "a", label: "Tak. Wtedy jest najmocniej. W spokoju jakoś mdło.", score: 3 }, { id: "b", label: "Częściej tak niż nie, choć nie zawsze.", score: 2 }, { id: "c", label: "Zdarza się, ale intensywność jest też w spokojnych momentach.", score: 1 }, { id: "d", label: "Nie. Bliskość nie zależy u nas od napięcia.", score: 0 }] },
      { id: "l2", lead: "Policz ile razy obiecywałeś sobie że tym razem będzie inaczej.", text: "Po poprzednich powrotach, czy pojawiły się konkretne zmiany w zachowaniu które utrzymały się dłużej niż miesiąc?", options: [{ id: "a", label: "Nie. Za każdym razem wracamy do dokładnie tego samego.", score: 3 }, { id: "b", label: "Coś się zmieniało, ale nie na długo.", score: 2 }, { id: "c", label: "Są zmiany, choć nie wiem czy trwałe.", score: 1 }, { id: "d", label: "Tak. Były realne i trwałe zmiany.", score: 0 }] },
      { id: "l3", lead: "To jest pytanie które boli, bo odpowiedź już znasz.", text: "Gdybyś wyjął z tej relacji napięcie, pojednania i intensywność emocjonalną, co by zostało?", options: [{ id: "a", label: "Niewiele. Albo pustka.", score: 3 }, { id: "b", label: "Coś by zostało, ale nie wiem ile i czy wystarczy.", score: 2 }, { id: "c", label: "Zostałoby sporo, napięcie to nie wszystko.", score: 1 }, { id: "d", label: "Dużo. Naprawdę lubimy ze sobą być.", score: 0 }] },
      { id: "l4", lead: "Nikt tego za Ciebie nie nazwie. Powiedz to wprost.", text: "Czy boisz się odejść nie dlatego że Ci jej brakuje, ale dlatego że nie wiesz kim jesteś bez tego cyklu?", options: [{ id: "a", label: "To uderza za mocno żeby zaprzeczyć.", score: 3 }, { id: "b", label: "Może trochę, ale to nie jedyny powód.", score: 2 }, { id: "c", label: "Trochę, ale głównie mi jej brakuje.", score: 1 }, { id: "d", label: "Nie. Boję się bo mi jej brakuje, nie dlatego.", score: 0 }] },
      { id: "l5", lead: "Schemat ma swój rytm. Opisz go.", text: "Jak wygląda typowy cykl między Wami – od kryzysu do pojednania do kolejnego kryzysu?", options: [{ id: "a", label: "Bardzo regularny. Wiem już kiedy zacznie się kolejny.", score: 3 }, { id: "b", label: "Jest wzorzec, choć nie zawsze taki sam.", score: 2 }, { id: "c", label: "Trudno to opisać. Bywa różnie.", score: 1 }, { id: "d", label: "Nie widzę wyraźnego cyklu. To nie jest schemat.", score: 0 }] },
      { id: "l6", lead: "Co czujesz między cyklami, w tych spokojniejszych momentach.", text: "Gdy wszystko jest między Wami w porządku, czy czujesz spokój i bliskość, czy raczej czekasz na następny problem?", options: [{ id: "a", label: "Czekam. Spokój mnie niepokoi, wiem że nie potrwa.", score: 3 }, { id: "b", label: "Staram się cieszyć, ale czujność gdzieś jest.", score: 2 }, { id: "c", label: "Głównie spokój, choć nie zawsze.", score: 1 }, { id: "d", label: "Spokój i bliskość. Cieszę się tym.", score: 0 }] },
      { id: "l7", lead: "Twoje otoczenie też coś widzi.", text: "Co mówią Ci bliscy o tej relacji i jak na to reagujesz?", options: [{ id: "a", label: "Mówią żebym odszedł/a. Denerwuje mnie to bo wiem że mają rację.", score: 3 }, { id: "b", label: "Mają wątpliwości. Unikam tego tematu.", score: 2 }, { id: "c", label: "Są mieszane opinie. Nie wiem kogo słuchać.", score: 1 }, { id: "d", label: "Są wspierający albo widzą to podobnie do mnie.", score: 0 }] },
      { id: "l8", lead: "Ostatnie pytanie, i najtrudniejsze.", text: "Czy wyobrażasz sobie swoje życie bez tej osoby – nie jako katastrofę, ale jako coś możliwego?", options: [{ id: "a", label: "Nie umiem tego sobie wyobrazić. To mnie przeraża.", score: 3 }, { id: "b", label: "Mogę to sobie wyobrazić, ale chcę żeby było inaczej.", score: 2 }, { id: "c", label: "Tak, choć byłoby bardzo trudno.", score: 1 }, { id: "d", label: "Tak. Wiem że dałbym/dałabym radę.", score: 0 }] },
    ],
    checkpoint: { title: "Jedno pytanie. Bez ucieczki.", text: "Jeśli nic się nie zmieni i za rok będziecie dokładnie w tym samym miejscu co teraz, czy to jest życie które akceptujesz?", options: [{ id: "a", label: "Nie. Ale nie wiem jak z tego wyjść.", score: 3 }, { id: "b", label: "Nie chcę tego, ale nie jestem gotowy na zmianę.", score: 2 }, { id: "c", label: "Nie. I dlatego chcę to zrozumieć i coś z tym zrobić.", score: 1 }, { id: "d", label: "Wierzę że do tego nie dojdzie. Że coś się zmieni.", score: 0 }] },
    openPrompt: "Co konkretnie trzyma Cię w tym cyklu i dlaczego mimo wszystkiego co wiesz, wracasz?",
  },
 ];

const FINAL_CONTEXT_BY_PATH: Record<EntryKey, FinalContextConfig> = {
  unease: {
    eyebrow: "DOPISZ TO, CZEGO NIE DAŁO SIĘ ZAMKNĄĆ W PYTANIACH",
    title: "Opisz relację tak, jak wygląda w zwykłym dniu — nie tylko wtedy, gdy jest źle.",
    lead: "Napisz, co uruchamia niepokój, jak reaguje druga osoba i co dzieje się później. Ten opis może wzmocnić wcześniejszy trop, osłabić go albo całkiem zmienić kierunek odczytu.",
    placeholder: "Np. W większości dni jest spokojnie, ale kiedy pytam o przyszłość, rozmowa się urywa. Potem to ja wracam do tematu i próbuję uspokoić sytuację…",
    prompts: ["co dokładnie wraca", "jak wygląda reakcja drugiej osoby", "co robisz Ty i co zostaje po wszystkim"],
  },
  betrayal: {
    eyebrow: "SZERSZY KONTEKST PO ZDRADZIE LUB KŁAMSTWIE",
    title: "Opisz, co wydarzyło się później — bo odbudowę zaufania widać po zachowaniu, nie po samych przeprosinach.",
    lead: "Oddziel fakty od podejrzeń. Napisz, co zostało wyjaśnione, co zmieniło się w codziennym zachowaniu i co nadal uruchamia brak bezpieczeństwa.",
    placeholder: "Np. Po odkryciu powiedział wszystko i przez pierwszy miesiąc był bardzo otwarty. Teraz znowu unika pytań, a ja wracam do sprawdzania…",
    prompts: ["co było faktem", "co zmieniło się po odkryciu", "co nadal podważa lub odbudowuje zaufanie"],
  },
  uncertain: {
    eyebrow: "DOPISZ, JAK TA RELACJA WYGLĄDA W PRAKTYCE",
    title: "Nie opisuj etykiety. Opisz rytm kontaktu, inicjatywę i to, co dzieje się, gdy prosisz o jasność.",
    lead: "Najwięcej wniesie zwykły obraz ostatnich tygodni: kto szuka kontaktu, co pada w rozmowach i czy po deklaracjach pojawia się czytelny ruch.",
    placeholder: "Np. Widzimy się regularnie i mówi, że mu zależy, ale kiedy pytam, dokąd to zmierza, odpowiada ogólnie i przez kilka dni kontakt słabnie…",
    prompts: ["jak często i z czyjej inicjatywy macie kontakt", "co druga osoba deklaruje", "co dzieje się po prośbie o jasność"],
  },
  asymmetry: {
    eyebrow: "POKAŻ, JAK ROZKŁADA SIĘ CIĘŻAR RELACJI",
    title: "Opisz jedną typową sytuację, w której widać, kto uruchamia kontakt, rozmowę i naprawę.",
    lead: "Nie chodzi o rozliczanie każdej wiadomości. Chodzi o stały układ: co robisz Ty, co dzieje się bez Twojego ruchu i jak druga osoba reaguje, gdy przestajesz prowadzić.",
    placeholder: "Np. Gdy się oddalamy, zawsze piszę pierwszy, proponuję rozmowę i próbuję ustalić rozwiązanie. Jeśli tego nie zrobię, temat po prostu znika…",
    prompts: ["co najczęściej robisz Ty", "co robi druga osoba bez Twojej inicjatywy", "co dzieje się, gdy odpuszczasz"],
  },
  conflict: {
    eyebrow: "DOPISZ PEŁNY PRZEBIEG KONFLIKTU",
    title: "Opisz ostatnią kłótnię od pierwszego napięcia aż do tego, co zostało po rozmowie.",
    lead: "Ważne są trzy momenty: co uruchomiło konflikt, jak zachowała się każda strona i czy później zmieniło się cokolwiek poza atmosferą.",
    placeholder: "Np. Zaczęło się od…, ja odpowiedziałem…, druga osoba zrobiła…, następnego dnia wróciliśmy do rozmowy, ale ustalenie nie zostało dotrzymane…",
    prompts: ["co uruchomiło konflikt", "kto i jak próbował go domknąć", "co realnie zmieniło się później"],
  },
  stagnation: {
    eyebrow: "OPISZ RÓŻNICĘ MIĘDZY KIEDYŚ A TERAZ",
    title: "Pokaż, czy to spokojna stabilność, czy relacja, która działa już głównie z przyzwyczajenia.",
    lead: "Napisz, co kiedyś dawało bliskość, czego dziś brakuje i jakie konkretne próby zmiany podjęła każda ze stron.",
    placeholder: "Np. Kiedyś dużo rozmawialiśmy i planowaliśmy wspólne rzeczy. Teraz funkcjonujemy poprawnie, ale osobno. Ja proponowałem…, druga osoba…",
    prompts: ["co było żywe wcześniej", "co zniknęło lub osłabło", "kto i jak próbował to zmienić"],
  },
  returning: {
    eyebrow: "ZANIM OCENISZ POWRÓT, DOPISZ TŁO",
    title: "Opisz, dlaczego relacja się skończyła i jaki konkretny fakt pokazuje, że kolejna próba miałaby wyglądać inaczej.",
    lead: "Tęsknota jest ważna, ale nie rozstrzyga sensu powrotu. Liczy się przyczyna rozstania, obecne zachowanie i gotowość obu stron do konkretnej zmiany.",
    placeholder: "Np. Rozstaliśmy się przez…, od tamtej pory druga osoba zrobiła…, ja zmieniłem…, ale nadal nie wiem, czy…",
    prompts: ["co naprawdę zakończyło relację", "co zmieniło się od tamtej pory", "jaki dowód przemawia za innym przebiegiem"],
  },
  triangle: {
    eyebrow: "DOPISZ FAKTY, NIE TYLKO PORÓWNANIE",
    title: "Opisz obecną relację i trzecią osobę osobno — co jest realnym zachowaniem, a co obietnicą albo wyobrażeniem.",
    lead: "Ten kontekst ma pomóc oddzielić brak w obecnej relacji od fascynacji nowością. Napisz, jakie zobowiązania istnieją, jak wygląda realny kontakt i czego faktycznie szukasz.",
    placeholder: "Np. W obecnej relacji od dawna brakuje…, z trzecią osobą mam kontakt…, ona realnie zrobiła…, a ja wyobrażam sobie…",
    prompts: ["jak wygląda obecna relacja", "co trzecia osoba robi realnie", "czego szukasz poza fascynacją"],
  },
  loop: {
    eyebrow: "OPISZ JEDEN PEŁNY CYKL",
    title: "Pokaż, jak zaczyna się kryzys, co prowadzi do powrotu i po czym poznajesz, że wszystko znów wraca.",
    lead: "Nie skupiaj się tylko na ostatnim pojednaniu. Najwięcej da pełna sekwencja oraz jeden fakt, który po poprzednim powrocie miał się zmienić, ale się nie utrzymał.",
    placeholder: "Np. Najpierw pojawia się…, potem odchodzimy od siebie, wracamy gdy…, przez kilka tygodni jest…, a później znów…",
    prompts: ["co uruchamia rozstanie lub oddalenie", "co prowadzi do powrotu", "co po poprawie znów się powtarza"],
  },
};

const MIDWAY_PATH_SENTENCE: Record<EntryKey, string> = {
  unease: "Niepokój zaczyna wyglądać mniej jak przypadkowy stan, a bardziej jak reakcja na brak jasności i konieczność ciągłego czytania sygnałów.",
  betrayal: "Najmocniej pracuje już nie samo wydarzenie, lecz pytanie, czy późniejsze zachowanie daje grunt, czy tylko chwilowo uspokaja czujność.",
  uncertain: "Sednem nie jest sama nazwa relacji, lecz to, czy druga osoba daje czytelny kierunek również wtedy, gdy nie prosisz jej o deklarację.",
  asymmetry: "Tu nie rozstrzyga, kto czuje mocniej. Rozstrzyga to, kto regularnie uruchamia kontakt, naprawę i ruch do przodu.",
  conflict: "Nie sam konflikt buduje obraz tej relacji. Znacznie więcej mówi sposób powrotu po nim i to, czy następny spór przebiega inaczej.",
  stagnation: "Coraz ważniejsze staje się odróżnienie spokojnej stabilności od układu, który trwa głównie dlatego, że obie strony nauczyły się w nim funkcjonować.",
  returning: "Tęsknota może przywrócić intensywność, ale sama nie odpowiada na pytanie, czy zniknął powód wcześniejszego końca.",
  triangle: "Porównanie dwóch osób łatwo miesza realne potrzeby z wyobrażeniem. Teraz trzeba oddzielić zachowanie od obietnicy nowego początku.",
  loop: "Najwięcej powie nie kolejny powrót, lecz to, czy po nim zmienia się choć jeden element całego cyklu.",
};

function buildMidwayReflection(path: EntryConfig, forceMap: ForceMap, burdens: BurdenItem[], emotions: EmotionItem[]): MidwayReflection {
  const topBurden = burdens[0]?.label || "to, co najbardziej ciąży";
  const topEmotion = emotions[0]?.label || "stan, który wraca najczęściej";
  const pathItems = forceMapItemsForPath(path.key);
  const userHeavy = pathItems.filter((item) => ["definitely_me", "mostly_me"].includes(String(forceMap[item.key] || "")));
  const balanceLine = userHeavy.length >= 3
    ? "W kilku miejscach to Ty częściej przejmujesz inicjatywę albo odpowiedzialność za domknięcie sytuacji."
    : userHeavy.length === 2
      ? "W części kluczowych momentów ciężar przesuwa się na Twoją stronę, ale obraz nie jest jeszcze jednostronny."
      : "Rozkład wysiłku nie daje jeszcze podstaw do prostego wniosku o jednostronności.";
  return {
    kicker: "ZATRZYMAJMY SIĘ NA CHWILĘ",
    title: "Jedno zdanie zaczyna się już wyłaniać",
    quote: MIDWAY_PATH_SENTENCE[path.key],
    signal: `Najmocniej łączą się teraz dwa sygnały: „${topBurden}” i „${topEmotion}”. ${balanceLine}`,
    next: "To nie jest wynik. Za chwilę sprawdzimy, czy ten trop wytrzymuje zderzenie z konkretnymi sytuacjami z życia.",
  };
}

function finalContextForPath(path: EntryConfig): FinalContextConfig {
  return FINAL_CONTEXT_BY_PATH[path.key];
}

type ForceMapItem = { key: ForceMapKey; title: string; hint: string };

const FORCE_MAP_ITEMS: ForceMapItem[] = [
  { key: "contactInitiative", title: "Kto częściej inicjuje kontakt?", hint: "Nie chodzi o jedną wiadomość, tylko o rytm relacji." },
  { key: "repairAfterConflict", title: "Kto częściej naprawia po konflikcie?", hint: "Kto wraca do rozmowy, łagodzi napięcie albo próbuje domknąć temat." },
  { key: "emotionalLabor", title: "Kto niesie większy ciężar emocjonalny?", hint: "Kto więcej analizuje, tłumaczy, czeka, pilnuje atmosfery." },
  { key: "avoidance", title: "Kto częściej unika trudnych rozmów?", hint: "Wskaż stronę, która częściej odsuwa temat albo znika w ciszę." },
  { key: "fearOfLoss", title: "Kto bardziej boi się utraty tej relacji?", hint: "Nie kto bardziej kocha, tylko kto bardziej boi się konsekwencji końca." },
];

const FORCE_MAP_ITEMS_BY_PATH: Record<EntryKey, ForceMapItem[]> = {
  unease: [
    { key: "contactInitiative", title: "Kto częściej szuka kontaktu, kiedy pojawia się niepokój?", hint: "Kto pierwszy próbuje sprawdzić, co właściwie dzieje się między Wami." },
    { key: "repairAfterConflict", title: "Kto częściej próbuje nazwać i wyjaśnić napięcie?", hint: "Nie chodzi o winę, tylko o to, kto podejmuje próbę zrozumienia sytuacji." },
    { key: "emotionalLabor", title: "Kto więcej analizuje i pilnuje atmosfery?", hint: "Kto częściej czyta sygnały, tłumaczy zachowania i próbuje utrzymać spokój." },
    { key: "avoidance", title: "Kto częściej unika tematów, które mogłyby dać jasność?", hint: "Kto odsuwa rozmowę, zmienia temat albo zostawia rzeczy niedopowiedziane." },
    { key: "fearOfLoss", title: "Kto bardziej boi się, że nazwanie problemu coś popsuje?", hint: "Lęk przed utratą może wpływać na to, ile rzeczy zostaje przemilczanych." },
  ],
  betrayal: [
    { key: "contactInitiative", title: "Kto częściej inicjuje rozmowy, które mają odbudować zaufanie?", hint: "Kto wraca do tematu z własnej inicjatywy, a nie dopiero po nacisku." },
    { key: "repairAfterConflict", title: "Kto częściej próbuje naprawdę domknąć pytania po zdradzie lub kłamstwie?", hint: "Kto bierze odpowiedzialność za wyjaśnienie tego, co nadal wraca." },
    { key: "emotionalLabor", title: "Kto niesie większy ciężar odbudowy poczucia bezpieczeństwa?", hint: "Kto więcej sprawdza, uspokaja, tłumaczy i pilnuje, żeby temat się nie rozpadł." },
    { key: "avoidance", title: "Kto częściej unika szczegółów albo powrotu do tego, co się stało?", hint: "Czy pytania można domknąć, czy temat ma po prostu zniknąć." },
    { key: "fearOfLoss", title: "Kto bardziej boi się, że ten temat może zakończyć relację?", hint: "Nie chodzi o miłość, tylko o wpływ lęku przed końcem na zachowanie." },
  ],
  uncertain: [
    { key: "contactInitiative", title: "Kto częściej inicjuje kontakt, kiedy relacja zaczyna się rozmywać?", hint: "Kto podtrzymuje rytm kontaktu, gdy druga osoba nic nie uruchamia." },
    { key: "repairAfterConflict", title: "Kto częściej próbuje nazwać, czym właściwie jest ta relacja?", hint: "Kto wraca do pytania o status, kierunek i wzajemne oczekiwania." },
    { key: "emotionalLabor", title: "Kto więcej czeka, analizuje i dopasowuje się do niejasności?", hint: "Brak definicji nie jest neutralny — zwykle ktoś ponosi jego większy koszt." },
    { key: "avoidance", title: "Kto częściej unika konkretnej deklaracji albo rozmowy o kierunku?", hint: "Kto zostawia temat otwarty, mimo że dla drugiej strony ma on znaczenie." },
    { key: "fearOfLoss", title: "Kto bardziej boi się, że postawienie sprawy jasno zakończy tę relację?", hint: "Czasem niejasność trwa dlatego, że konkret mógłby wymusić decyzję." },
  ],
  asymmetry: [
    { key: "contactInitiative", title: "Kto częściej uruchamia kontakt, bliskość i wspólne działania?", hint: "Kto nadaje relacji ruch, kiedy nic nie dzieje się samo." },
    { key: "repairAfterConflict", title: "Kto częściej bierze odpowiedzialność za naprawę po napięciu?", hint: "Kto pierwszy wraca, tłumaczy i próbuje odbudować kontakt." },
    { key: "emotionalLabor", title: "Kto więcej pamięta, planuje i dba o więź?", hint: "Chodzi o niewidoczny ciężar utrzymywania relacji przy życiu." },
    { key: "avoidance", title: "Kto częściej odpuszcza odpowiedzialność, gdy druga osoba przejmuje ster?", hint: "Sprawdź, kto może liczyć na to, że relacja i tak zostanie podtrzymana." },
    { key: "fearOfLoss", title: "Kto bardziej boi się, że bez własnego wysiłku relacja się rozpadnie?", hint: "Ten lęk często pokazuje, kto czuje się odpowiedzialny za całość." },
  ],
  conflict: [
    { key: "contactInitiative", title: "Kto częściej rozpoczyna trudne rozmowy, zanim napięcie wybuchnie?", hint: "Kto próbuje zająć się problemem zanim zamieni się w kolejną kłótnię." },
    { key: "repairAfterConflict", title: "Kto częściej wraca po kłótni i próbuje naprawić kontakt?", hint: "Najwięcej mówi to, co dzieje się już po wybuchu." },
    { key: "emotionalLabor", title: "Kto więcej pilnuje, żeby rozmowa nie zamieniła się w walkę?", hint: "Kto łagodzi, tłumaczy, zatrzymuje eskalację albo bierze odpowiedzialność za atmosferę." },
    { key: "avoidance", title: "Kto częściej przerywa rozmowę, wycofuje się albo zamyka w ciszy?", hint: "Wycofanie może chronić przed eskalacją albo blokować naprawę — ważny jest wzorzec." },
    { key: "fearOfLoss", title: "Kto bardziej boi się kolejnego konfliktu albo jego konsekwencji?", hint: "Lęk przed następną kłótnią może ustawiać całą komunikację." },
  ],
  stagnation: [
    { key: "contactInitiative", title: "Kto częściej inicjuje bliskość, rozmowę i wspólny czas?", hint: "Nie logistykę, tylko rzeczy, które naprawdę budują kontakt." },
    { key: "repairAfterConflict", title: "Kto częściej próbuje ożywić coś, co między Wami wygasło?", hint: "Kto proponuje zmianę zamiast tylko utrzymywać codzienność." },
    { key: "emotionalLabor", title: "Kto więcej niesie emocjonalnie, żeby relacja nie stała się tylko rutyną?", hint: "Kto próbuje zachować ciekawość, ciepło i poczucie bycia razem." },
    { key: "avoidance", title: "Kto częściej unika rozmowy o tym, że czegoś już brakuje?", hint: "Brak konfliktu może oznaczać spokój albo rezygnację z rozmowy." },
    { key: "fearOfLoss", title: "Kto bardziej boi się zmiany, nawet jeśli obecny układ nie daje satysfakcji?", hint: "Przyzwyczajenie i lęk przed zmianą mogą podtrzymywać relację inaczej niż bliskość." },
  ],
  returning: [
    { key: "contactInitiative", title: "Kto częściej inicjuje kontakt po rozstaniu albo oddaleniu?", hint: "Kto uruchamia kolejny powrót, gdy emocje znowu rosną." },
    { key: "repairAfterConflict", title: "Kto częściej wraca do prawdziwych przyczyn rozstania?", hint: "Powrót do kontaktu to nie to samo co naprawa tego, co wcześniej nie działało." },
    { key: "emotionalLabor", title: "Kto więcej pracuje, żeby kolejna próba miała być inna?", hint: "Kto niesie plan zmiany, rozmowy i odpowiedzialność za nowy start." },
    { key: "avoidance", title: "Kto częściej unika konkretów o tym, co miałoby się zmienić po powrocie?", hint: "Bez konkretu łatwo wrócić do osoby, ale też do starego układu." },
    { key: "fearOfLoss", title: "Kto bardziej boi się ostatecznego zamknięcia tej historii?", hint: "Czasem wraca się nie tylko do człowieka, ale też do niedomkniętej historii." },
  ],
  triangle: [
    { key: "contactInitiative", title: "Kto częściej inicjuje prawdziwy kontakt w obecnej relacji?", hint: "Nie chodzi o logistykę, tylko o zainteresowanie, obecność i bliskość." },
    { key: "repairAfterConflict", title: "Kto częściej próbuje rozmawiać o tym, czego w obecnej relacji brakuje?", hint: "Trzecia osoba często uwidacznia problem, który istniał już wcześniej." },
    { key: "emotionalLabor", title: "Kto niesie większy ciężar wyboru, ukrywania albo rozdwojenia?", hint: "Sprawdź, gdzie naprawdę kumuluje się napięcie tej sytuacji." },
    { key: "avoidance", title: "Kto częściej unika jasnej decyzji albo rozmowy o konsekwencjach?", hint: "Brak decyzji też tworzy układ i ma swój koszt." },
    { key: "fearOfLoss", title: "Kto bardziej boi się konsekwencji utraty jednej z tych relacji?", hint: "Lęk przed stratą może utrudniać zobaczenie, czego naprawdę brakuje." },
  ],
  loop: [
    { key: "contactInitiative", title: "Kto częściej inicjuje kolejny powrót po kryzysie albo rozstaniu?", hint: "Kto uruchamia fazę pojednania, kiedy napięcie opada." },
    { key: "repairAfterConflict", title: "Kto częściej próbuje naprawić przyczynę, a nie tylko odzyskać kontakt?", hint: "Ulga po powrocie może wyglądać jak zmiana, choć źródło problemu zostaje." },
    { key: "emotionalLabor", title: "Kto niesie większy ciężar całego cyklu?", hint: "Kto więcej analizuje, czeka, wraca i próbuje nadać kolejnemu powrotowi sens." },
    { key: "avoidance", title: "Kto częściej unika realnej zmiany, gdy kryzys już mija?", hint: "Najważniejsze jest to, co dzieje się po odzyskaniu spokoju." },
    { key: "fearOfLoss", title: "Kto bardziej boi się definitywnego końca tego cyklu?", hint: "Lęk przed końcem może być jednym z mechanizmów kolejnych powrotów." },
  ],
};

function forceMapItemsForPath(pathKey?: EntryKey): ForceMapItem[] {
  return pathKey ? FORCE_MAP_ITEMS_BY_PATH[pathKey] : FORCE_MAP_ITEMS;
}

const FORCE_OPTIONS: { value: ForceValue; label: string }[] = [
  { value: "definitely_me", label: "Zdecydowanie ja" },
  { value: "mostly_me", label: "Raczej ja" },
  { value: "balanced", label: "Po równo" },
  { value: "mostly_other", label: "Raczej druga osoba" },
  { value: "definitely_other", label: "Zdecydowanie druga osoba" },
];

const BURDEN_OPTIONS_BY_PATH: Record<EntryKey, string[]> = {
  unease: ["ciągła czujność", "brak jasności", "mieszane sygnały", "nadmierne analizowanie", "cisza po ważnych momentach", "nierówne starania", "brak poczucia bezpieczeństwa", "brak bliskości", "lęk przed nazwaniem problemu", "kontrola / zazdrość", "brak kierunku", "coś się zmieniło, ale nie wiem co"],
  betrayal: ["zdrada / kłamstwo", "niepełna prawda", "brak odpowiedzialności", "ciągła kontrola", "powrót nieufności", "presja żeby już zapomnieć", "lęk że to się powtórzy", "brak przejrzystości", "utrata bliskości", "ktoś trzeci", "wstyd / poczucie winy", "seks / intymność"],
  uncertain: ["brak jasności", "mieszane sygnały", "brak deklaracji", "kontakt tylko gdy się wycofuję", "nierówne starania", "ciągłe czekanie", "brak planów", "brak wyłączności", "ktoś trzeci", "lęk przed samotnością", "kontrola / zazdrość", "ciągłe analizowanie"],
  asymmetry: ["nierówne starania", "ja zawsze inicjuję", "ja naprawiam po konflikcie", "brak wdzięczności", "brak odpowiedzialności drugiej strony", "ciągłe dopasowywanie się", "brak wzajemności", "zmęczenie rolą ratownika", "brak bliskości", "cisza gdy przestaję się starać", "obniżanie własnych potrzeb", "finanse / codzienność"],
  conflict: ["kłótnie", "eskalacja", "cisza po konflikcie", "wypominanie przeszłości", "brak naprawy", "atak / obrona", "chodzenie na palcach", "brak bezpiecznej rozmowy", "obrażanie / przekraczanie granic", "ten sam temat wraca", "kontrola / zazdrość", "dzieci / rodzina wciągane w konflikt"],
  stagnation: ["rutyna / wypalenie", "brak bliskości", "brak ciekawości sobą", "tylko logistyka", "brak wspólnych planów", "seks / intymność", "samotność obok siebie", "brak inicjatywy", "rezygnacja z rozmów", "lęk przed zmianą", "finanse / codzienność", "rodzina / obowiązki"],
  returning: ["powroty i rozstania", "idealizowanie przeszłości", "brak realnej zmiany", "tęsknota silniejsza niż fakty", "niedomknięta historia", "brak zaufania", "samotność po rozstaniu", "stare problemy wracają", "brak konkretnego planu", "nierówne starania", "ktoś trzeci", "lęk przed ostatecznym końcem"],
  triangle: ["ktoś trzeci", "brak bliskości w obecnej relacji", "porównywanie dwóch osób", "ukrywanie / podwójne życie", "brak decyzji", "poczucie winy", "idealizowanie nowej osoby", "lęk przed stratą obu relacji", "seks / intymność", "rutyna / wypalenie", "brak jasności", "presja czasu"],
  loop: ["powroty i rozstania", "po poprawie wraca to samo", "intensywność zamiast stabilności", "brak trwałej zmiany", "lęk przed końcem", "uzależnienie od ulgi po powrocie", "nierówne starania", "cisza", "kłótnie", "idealizowanie dobrych momentów", "brak granicy końcowej", "zmęczenie cyklem"],
};

function burdenOptionsForPath(pathKey?: EntryKey): string[] {
  return pathKey ? BURDEN_OPTIONS_BY_PATH[pathKey] : BURDEN_OPTIONS_BY_PATH.unease;
}

const EMOTION_OPTIONS_BY_PATH: Record<EntryKey, string[]> = {
  unease: ["niepokój", "czujność", "dezorientacja", "napięcie", "nadzieja", "lęk", "zmęczenie", "poczucie winy", "złość", "smutek", "ulga w dobrych chwilach", "brak zaufania do własnej oceny"],
  betrayal: ["nieufność", "złość", "żal", "lęk że to się powtórzy", "wstyd", "poczucie winy", "potrzeba kontroli", "smutek", "tęsknota za tym co było", "nadzieja", "odrętwienie", "ulga gdy wszystko się zgadza"],
  uncertain: ["niepewność", "nadzieja", "lęk przed odrzuceniem", "czekanie", "frustracja", "dezorientacja", "tęsknota", "zazdrość", "napięcie", "ulga po kontakcie", "wstyd że nadal czekam", "potrzeba pewności"],
  asymmetry: ["zmęczenie", "żal", "frustracja", "poczucie niedocenienia", "złość", "lęk przed odpuszczeniem", "poczucie winy gdy przestaję się starać", "samotność", "nadzieja", "bezsilność", "przeciążenie", "tęsknota za wzajemnością"],
  conflict: ["złość", "lęk przed kolejną kłótnią", "bezsilność", "wstyd po tym co padło", "żal", "napięcie", "poczucie winy", "ulga po pogodzeniu", "czujność", "smutek", "frustracja", "zmęczenie konfliktem"],
  stagnation: ["pustka", "samotność", "obojętność", "smutek", "tęsknota za dawną bliskością", "ulga że nie ma konfliktu", "lęk przed zmianą", "poczucie winy", "nuda", "rezygnacja", "nadzieja że coś wróci", "niepewność czy to jeszcze miłość"],
  returning: ["tęsknota", "nadzieja", "lęk przed kolejnym zranieniem", "idealizowanie", "samotność", "ulga po kontakcie", "żal", "poczucie winy", "niepewność", "pragnienie domknięcia", "złość", "lęk przed ostatecznym końcem"],
  triangle: ["fascynacja", "poczucie winy", "lęk", "ekscytacja", "dezorientacja", "zazdrość", "wstyd", "ulga przy drugiej osobie", "smutek", "presja decyzji", "nadzieja", "strach przed stratą"],
  loop: ["tęsknota", "ulga po powrocie", "lęk przed kolejnym kryzysem", "intensywność", "nadzieja", "zmęczenie", "bezsilność", "złość", "poczucie winy", "strach przed końcem", "euforia po pojednaniu", "brak spokoju"],
};

function emotionOptionsForPath(pathKey?: EntryKey): string[] {
  return pathKey ? EMOTION_OPTIONS_BY_PATH[pathKey] : EMOTION_OPTIONS_BY_PATH.unease;
}

const TRUTH_CARD_OPTIONS_BY_PATH: Record<EntryKey, string[]> = {
  unease: [
    "Nie umiem wskazać jednego problemu, ale coraz mniej ufam własnemu spokojowi w tej relacji.",
    "Częściej analizuję sygnały niż po prostu jestem w tej relacji.",
    "Są dobre momenty, ale mój niepokój wraca bez wyraźnego domknięcia.",
    "Boję się, że jeśli nazwę problem wprost, usłyszę coś, czego nie chcę wiedzieć.",
    "Nie wiem jeszcze, czy problem jest między nami, czy w sposobie, w jaki próbuję uzyskać pewność.",
    "Potrzebuję konkretów, bo same uspokajające słowa przestały mi wystarczać.",
    "Mam poczucie, że coś się zmieniło, choć nie potrafię jeszcze uczciwie powiedzieć co.",
    "Chcę sprawdzić, czy moje napięcie ma oparcie w powtarzalnych faktach.",
  ],
  betrayal: [
    "Najtrudniejsze nie jest to, co się stało, tylko że nadal nie wiem, czy znam całą prawdę.",
    "Przeprosiny padły, ale nie jestem pewien/pewna, czy odpowiedzialność naprawdę zmieniła zachowanie.",
    "Kontrola daje mi chwilową ulgę, ale nie odbudowuje zaufania.",
    "Czuję presję, żeby już zamknąć temat szybciej, niż naprawdę potrafię.",
    "Boję się bardziej powtórki niż samego wspomnienia tego, co się stało.",
    "Chcę wierzyć w zmianę, ale nadal szukam dowodów zamiast czuć bezpieczeństwo.",
    "Nie wiem, czy odbudowujemy relację, czy tylko próbujemy wrócić do normalności.",
    "Najważniejsze pytanie brzmi dla mnie: co ta osoba robi dziś inaczej bez mojego pilnowania?",
  ],
  uncertain: [
    "Czekam na jasność od osoby, która może nie mieć interesu, żeby ją dać.",
    "Najwięcej dzieje się wtedy, gdy zaczynam się wycofywać.",
    "Niejasność trwa tak długo, że sama stała się częścią tej relacji.",
    "Boję się zapytać wprost, bo odpowiedź mogłaby zakończyć to, co jeszcze mam.",
    "Częściej analizuję sygnały niż opieram się na jasnych ustaleniach.",
    "Moje oczekiwania stopniowo dopasowały się do tego, jak mało pewności dostaję.",
    "Nie wiem, czy czekam na tę osobę, czy na wersję relacji, która jeszcze się nie wydarzyła.",
    "Potrzebuję zobaczyć, co ta osoba robi bez mojego inicjowania i przypominania.",
  ],
  asymmetry: [
    "Gdybym przestał/przestała się starać, duża część tej relacji prawdopodobnie by zgasła.",
    "Coraz częściej proszę o rzeczy, które kiedyś uważałem/uważałam za podstawę.",
    "Biorę odpowiedzialność za atmosferę, rozmowy i naprawę bardziej, niż chcę przyznać.",
    "Druga osoba może nie być obojętna, ale korzysta z tego, że ja i tak podtrzymuję całość.",
    "Zmęczyło mnie bycie osobą, która zawsze musi uruchomić zmianę.",
    "Nie wiem już, czy jestem wybierany/wybierana, czy po prostu potrzebny/potrzebna do utrzymania układu.",
    "Moje staranie stało się tak normalne, że trudno mi zobaczyć, co dzieje się bez niego.",
    "Najuczciwszy test to sprawdzić, czy druga strona wykona ruch, kiedy ja przestanę prowadzić.",
  ],
  conflict: [
    "Nie boję się już tylko samej kłótni, ale tego, co zostaje po niej na kolejne dni.",
    "Coraz częściej walczymy przeciwko sobie zamiast razem przeciwko problemowi.",
    "Wracamy do spokoju, ale nie zawsze do rozwiązania.",
    "Są tematy, których unikam, bo wiem, jak łatwo rozmowa może się wymknąć.",
    "Po kolejnych konfliktach przybywa śladów, a ubywa poczucia bezpieczeństwa.",
    "Przeprosiny nie wystarczają mi, jeśli ten sam sposób kłócenia się wraca.",
    "Nie wiem, czy problemem jest różnica zdań, czy sposób, w jaki traktujemy się pod presją.",
    "Najważniejsze jest dla mnie zobaczyć, czy umiemy realnie naprawiać, a nie tylko przeczekać napięcie.",
  ],
  stagnation: [
    "Brak kłótni nie daje mi już pewności, że między nami jest bliskość.",
    "Jesteśmy razem, ale coraz mniej rzeczy naprawdę przeżywamy razem.",
    "Nie wiem, czy to spokojna faza, czy moment, w którym oboje przestaliśmy oczekiwać zmiany.",
    "Tęsknię bardziej za dawną wersją naszej relacji niż za tym, jak jest dzisiaj.",
    "Rutyna daje bezpieczeństwo, ale nie wiem, czy nadal daje mi więź.",
    "Boję się zmiany, choć obecny układ też mnie nie zaspokaja.",
    "Najtrudniej mi przyznać, jak dawno nie czułem/czułam prawdziwej ciekawości między nami.",
    "Potrzebuję sprawdzić, czy oboje chcemy coś odbudować, czy tylko nie chcemy burzyć codzienności.",
  ],
  returning: [
    "Tęsknota wygładza mi część powodów, dla których wcześniej się rozstaliśmy.",
    "Chcę wrócić, ale nie mam jeszcze dowodu, że wrócilibyśmy do czegoś innego.",
    "Najbardziej boję się, że kolejny powrót da ulgę, a potem odtworzy ten sam problem.",
    "Nie wiem, czy tęsknię za tą osobą, czy za szansą na inne zakończenie tej historii.",
    "Kontakt po rozstaniu uruchamia we mnie więcej nadziei, niż mam konkretnych ustaleń.",
    "Sama miłość nie odpowiada jeszcze na pytanie, co miałoby się realnie zmienić.",
    "Chcę zobaczyć, kto bierze odpowiedzialność za przyczyny rozstania, a nie tylko za powrót.",
    "Potrzebuję odróżnić realną gotowość do zmiany od lęku przed ostatecznym końcem.",
  ],
  triangle: [
    "Trzecia osoba pokazała mi brak, którego wcześniej nie umiałem/umiałam nazwać.",
    "Nie wiem jeszcze, czy wybieram człowieka, czy uczucie, którego brakowało mi w obecnej relacji.",
    "Nowa relacja jest łatwiejsza do idealizowania, bo nie przeszła jeszcze testu codzienności.",
    "Brak decyzji też jest decyzją i ma koszt dla wszystkich stron.",
    "Część mojego napięcia wynika z wyboru, a część z problemów, które istniały wcześniej.",
    "Boję się stracić obie możliwości i dlatego trudno mi zobaczyć, czego naprawdę chcę.",
    "Potrzebuję oddzielić fascynację od informacji o tym, czego brakuje w obecnej relacji.",
    "Nawet bez trzeciej osoby musiałbym/musiałabym zmierzyć się z tym, co nie działa między nami.",
  ],
  loop: [
    "Po każdej poprawie wracamy do podobnego miejsca.",
    "Ulga po powrocie bywa tak silna, że łatwo pomylić ją z naprawą.",
    "Najmocniej czuję tę relację wtedy, gdy grozi jej utrata.",
    "Dobre momenty zasłaniają mi pytanie, co dzieje się najczęściej.",
    "Nie wiem, czy trzyma mnie ta osoba, czy cały rytm napięcia i pojednania.",
    "Kolejne próby mają sens tylko wtedy, jeśli coś zmienia się również po ustaniu kryzysu.",
    "Bardziej boję się definitywnego końca niż kolejnego powrotu do tego samego.",
    "Potrzebuję zobaczyć, co naprawdę utrzymało się po poprzednich powrotach dłużej niż kilka tygodni.",
  ],
};

function truthCardOptionsForPath(pathKey?: EntryKey): string[] {
  return pathKey ? TRUTH_CARD_OPTIONS_BY_PATH[pathKey] : TRUTH_CARD_OPTIONS_BY_PATH.unease;
}

function forceLabel(value?: ForceValue): string {
  return FORCE_OPTIONS.find((item) => item.value === value)?.label || "Nie zaznaczono";
}

function mapCompletion(forceMap: ForceMap, burdens: BurdenItem[], emotions: EmotionItem[], truthCards: string[]): number {
  const forceDone = FORCE_MAP_ITEMS.filter((item) => Boolean(forceMap[item.key])).length;
  return Math.round(((forceDone / FORCE_MAP_ITEMS.length) * 0.34 + (Math.min(burdens.length, 3) / 3) * 0.24 + (Math.min(emotions.length, 3) / 3) * 0.18 + (Math.min(truthCards.length, 2) / 2) * 0.24) * 100);
}

function isMeHeavy(value?: ForceValue): boolean {
  return value === "definitely_me" || value === "mostly_me";
}

function isOtherHeavy(value?: ForceValue): boolean {
  return value === "definitely_other" || value === "mostly_other";
}

function hasBurden(burdens: BurdenItem[], fragment: string): boolean {
  return burdens.some((item) => item.label.toLowerCase().includes(fragment.toLowerCase()));
}

function buildMapSignals(forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[], emotions: EmotionItem[] = []): MapSignal[] {
  const meLoad = FORCE_MAP_ITEMS.filter((item) => isMeHeavy(forceMap[item.key])).length;
  const otherLoad = FORCE_MAP_ITEMS.filter((item) => isOtherHeavy(forceMap[item.key])).length;
  const topBurden = burdens[0]?.label || "brak jednego dominującego ciężaru";
  const topEmotion = emotions[0]?.label || "brak wskazanej dominującej emocji";
  const asymmetry = meLoad >= 3 ? "ciężar częściej po Twojej stronie" : otherLoad >= 3 ? "ciężar częściej po stronie drugiej osoby" : "układ częściowo zrównoważony";
  const risk = truthCards.some((text) => text.includes("wracamy w to samo")) || hasBurden(burdens, "powroty") ? "powtarzanie tego samego cyklu" :
    truthCards.some((text) => text.includes("boję się końca")) || hasBurden(burdens, "lęk") ? "lęk może mieszać się z decyzją" :
    hasBurden(burdens, "cisza") ? "cisza może zastępować naprawę" :
    hasBurden(burdens, "zdrada") ? "zaufanie wymaga konkretów, nie samych deklaracji" :
    "trzeba odróżnić realną zmianę od chwilowej ulgi";
  const focus = meLoad >= 3 ? "czy relacja działa bez Twojego ciągnięcia" :
    hasBurden(burdens, "brak jasności") ? "czy brak jasności jest przypadkiem, czy wygodnym stanem" :
    hasBurden(burdens, "kłótnie") ? "co zostaje po konflikcie" :
    hasBurden(burdens, "rutyna") ? "czy to spokój, czy rezygnacja" :
    "co naprawdę musi się zmienić w zachowaniu";

  return [
    { label: "Największy ciężar", value: topBurden, tone: burdens.length ? "gold" : "normal" },
    { label: "Dominująca emocja", value: topEmotion, tone: emotions.length ? "gold" : "normal" },
    { label: "Układ sił", value: asymmetry, tone: meLoad >= 3 || otherLoad >= 3 ? "danger" : "normal" },
    { label: "Punkt ryzyka", value: risk, tone: "danger" },
    { label: "Do doprecyzowania", value: focus, tone: "gold" },
  ];
}


type VisualBar = { label: string; value: number; text: string; tone?: "normal" | "gold" | "danger" | "green" };

function clampScore(value: number): number {
  return Math.max(5, Math.min(95, Math.round(value)));
}

function buildMapVisualBars(forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): VisualBar[] {
  const meLoad = FORCE_MAP_ITEMS.filter((item) => isMeHeavy(forceMap[item.key])).length;
  const otherLoad = FORCE_MAP_ITEMS.filter((item) => isOtherHeavy(forceMap[item.key])).length;
  const imbalance = Math.max(meLoad, otherLoad);
  const highRiskBurden = hasBurden(burdens, "cisza") || hasBurden(burdens, "kłótnie") || hasBurden(burdens, "zdrada") || hasBurden(burdens, "powroty") || hasBurden(burdens, "brak jasności");
  const loopSignal = truthCards.some((text) => text.includes("wracamy") || text.includes("nadziei") || text.includes("czekam"));
  const tension = clampScore(34 + burdens.length * 12 + truthCards.length * 9 + (highRiskBurden ? 12 : 0));
  const asymmetry = clampScore(28 + imbalance * 13 + (meLoad >= 3 || otherLoad >= 3 ? 18 : 0));
  const clarityLoss = (hasBurden(burdens, "brak jasności") ? 28 : 0) + (loopSignal ? 16 : 0) + burdens.length * 5;
  const clarity = clampScore(82 - clarityLoss);
  const change = clampScore(72 - tension * 0.28 - asymmetry * 0.22 - (loopSignal ? 18 : 0) + (clarity > 60 ? 10 : 0));

  return [
    { label: "Napięcie", value: tension, tone: tension >= 70 ? "danger" : tension >= 45 ? "gold" : "green", text: tension >= 70 ? "relacja mocno rozregulowuje" : "napięcie jest widoczne, ale wymaga doprecyzowania" },
    { label: "Asymetria", value: asymmetry, tone: asymmetry >= 70 ? "danger" : asymmetry >= 45 ? "gold" : "green", text: asymmetry >= 70 ? "ciężar nie rozkłada się równo" : "układ sił nie jest jeszcze jednoznaczny" },
    { label: "Jasność", value: clarity, tone: clarity <= 35 ? "danger" : clarity <= 60 ? "gold" : "green", text: clarity <= 35 ? "za dużo rzeczy zostaje bez nazwania" : "część obrazu jest już czytelna" },
    { label: "Zmiana", value: change, tone: change <= 35 ? "danger" : change <= 58 ? "gold" : "green", text: change <= 35 ? "widać więcej cyklu niż przełomu" : "potencjał wymaga sprawdzenia w faktach" },
  ];
}

function buildPreviewVisualBars(preview: Preview): VisualBar[] {
  const clarity = clampScore(100 - Math.max(preview.tension * 0.45, preview.asymmetry * 0.55));
  return [
    { label: "Napięcie", value: preview.tension, tone: preview.tension >= 70 ? "danger" : preview.tension >= 45 ? "gold" : "green", text: preview.tension >= 70 ? "relacja częściej uruchamia czujność niż spokój" : "napięcie jest obecne, ale nie musi dominować" },
    { label: "Asymetria", value: preview.asymmetry, tone: preview.asymmetry >= 70 ? "danger" : preview.asymmetry >= 45 ? "gold" : "green", text: preview.asymmetry >= 70 ? "jedna strona prawdopodobnie niesie więcej ciężaru" : "nierównowaga wymaga dalszego odczytu" },
    { label: "Jasność", value: clarity, tone: clarity <= 35 ? "danger" : clarity <= 60 ? "gold" : "green", text: clarity <= 35 ? "za dużo pozostaje w domysłach" : "część sytuacji daje się już nazwać" },
    { label: "Zmiana", value: preview.change, tone: preview.change <= 35 ? "danger" : preview.change <= 58 ? "gold" : "green", text: preview.change <= 35 ? "na razie słabiej widać trwały zwrot" : "jest przestrzeń do sprawdzenia potencjału" },
  ];
}

function buildCycleSteps(pathKey?: EntryKey, burdens: BurdenItem[] = [], truthCards: string[] = []): string[] {
  if (pathKey === "betrayal" || hasBurden(burdens, "zdrada")) return ["pęknięcie", "kontrola", "chwilowa ulga", "powrót nieufności"];
  if (pathKey === "conflict" || hasBurden(burdens, "kłótnie")) return ["napięcie", "konflikt", "cisza", "powrót wzorca"];
  if (pathKey === "uncertain" || hasBurden(burdens, "brak jasności")) return ["kontakt", "nadzieja", "niejasność", "czekanie"];
  if (pathKey === "loop" || hasBurden(burdens, "powroty") || truthCards.some((text) => text.includes("wracamy"))) return ["oddalenie", "tęsknota", "powrót", "ten sam problem"];
  if (pathKey === "asymmetry" || hasBurden(burdens, "nierówne")) return ["staranie", "brak odpowiedzi", "dopasowanie", "zmęczenie"];
  return ["sygnał", "napięcie", "doprecyzowanie", "wniosek"];
}

function sentenceCase(value: string): string {
  const clean = String(value || "").replace(/^\d+\.\s*/, "").trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "";
}

function asSentence(value: string): string {
  const clean = sentenceCase(value);
  if (!clean) return "";
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function signalRole(index: number): string {
  if (index === 0) return "główny trop";
  if (index === 1) return "sygnał wspierający";
  return "do sprawdzenia";
}

function SignalHierarchy({ items }: { items: VisualBar[] }) {
  return (
    <div className="signal-hierarchy">
      {items.slice(0, 3).map((item, index) => (
        <article key={`${item.label}-${index}`} className={`signal-hierarchy-item rank-${index + 1} ${item.tone || "normal"}`}>
          <div className="signal-hierarchy-meta">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <em>{signalRole(index)}</em>
          </div>
          <strong>{sentenceCase(item.label)}</strong>
          <p>{asSentence(item.text)}</p>
        </article>
      ))}
    </div>
  );
}

function cycleStepDescription(step: string): string {
  const normalized = step.toLowerCase();
  const descriptions: Record<string, string> = {
    "kontakt": "jest punkt zaczepienia",
    "napięcie do udźwignięcia": "problem nie musi dominować",
    "rozmowa": "jest przestrzeń na nazwanie sprawy",
    "równowaga": "możliwy powrót do spokoju",
    "różnica": "nie wszystko musi oznaczać kryzys",
    "naprawa": "ważne jest konkretne zachowanie",
    "powrót równowagi": "relacja może się regulować",
    "trudność": "coś wymaga nazwania",
    "nazwanie": "problem robi się czytelniejszy",
    "współpraca": "liczy się udział obu stron",
    "kierunek": "widać następny krok",
    "działa": "są elementy, które trzymają układ",
    "obciąża": "jest koszt, którego nie warto pomijać",
    "wymaga sprawdzenia": "bez doprecyzowania łatwo o zły wniosek",
    "wniosek": "ten punkt wymaga rozstrzygnięcia",
    "bliskość": "jest coś, co nadal przyciąga",
    "ciężar": "jednocześnie pojawia się obciążenie",
    "próba naprawy": "jest ruch w stronę poprawy",
    "niepewność": "nie wszystko daje stabilny grunt",
    "pęknięcie": "coś naruszyło zaufanie",
    "kontrola": "pojawia się potrzeba sprawdzania",
    "chwilowa ulga": "napięcie spada tylko na moment",
    "powrót nieufności": "stary lęk wraca do układu",
    "napięcie": "koszt emocjonalny rośnie",
    "konflikt": "spór zastępuje rozmowę",
    "cisza": "brak naprawy utrwala dystans",
    "powrót wzorca": "problem wraca w podobnej formie",
    "nadzieja": "pojawia się oczekiwanie zmiany",
    "niejasność": "brakuje stabilnej odpowiedzi",
    "czekanie": "decyzja zostaje odłożona",
    "oddalenie": "kontakt słabnie",
    "tęsknota": "brak zaczyna działać jak magnes",
    "powrót": "relacja znów się zbliża",
    "ten sam problem": "wraca coś, co nie zostało domknięte",
    "staranie": "jedna strona mocno inwestuje",
    "brak odpowiedzi": "druga strona nie daje podobnego ruchu",
    "dopasowanie": "pojawia się schodzenie z własnych potrzeb",
    "zmęczenie": "koszt zaczyna być widoczny",
    "sygnał": "coś zaczyna się powtarzać",
    "doprecyzowanie": "jedna rzecz może zmienić odczyt",
  };
  return descriptions[normalized] || "ten element dopowie dalsza część analizy";
}

function MechanismNarrative({ steps }: { steps: string[] }) {
  const parts = steps.slice(0, 4);
  if (!parts.length) return null;
  const labels = ["Zaczyna się od", "Potem pojawia się", "W odpowiedzi wchodzi", "Jeśli rytm się nie zmienia, zostaje"];
  return (
    <div className="mechanism-narrative" aria-label="Mechanizm relacji opisany jednym ciągiem">
      <div className="mechanism-narrative-copy">
        {parts.map((step, index) => (
          <span key={`${step}-${index}`} className={`mechanism-phrase phrase-${index + 1}`}>
            <small>{labels[index] || "Następnie"}</small>
            <strong>{sentenceCase(step)}</strong>
          </span>
        ))}
      </div>
      <p>{parts.map((step) => sentenceCase(cycleStepDescription(step))).join(" · ")}</p>
    </div>
  );
}


type InsightMode = "supportive" | "mixed" | "difficult";
type PauseVariant = "questions" | "force" | "burdens" | "truth";

type PauseInsight = {
  mode: InsightMode;
  eyebrow: string;
  title: string;
  text: string;
  takeaway?: string;
  notProof?: string;
  bars: VisualBar[];
  chips?: string[];
  cycle?: string[];
  quote?: string;
};

function averageQuestionScore(path: EntryConfig | null, answers: AnswerMap): number {
  if (!path) return 1.5;
  const scores = path.questions
    .map((q) => q.options.find((opt) => opt.id === answers[q.id])?.score)
    .filter((v): v is number => typeof v === "number");
  const checkpointScore = path.checkpoint.options.find((opt) => opt.id === answers[`${path.key}_checkpoint`])?.score;
  if (typeof checkpointScore === "number") scores.push(checkpointScore);
  if (!scores.length) return 1.5;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function relationshipMode(path: EntryConfig | null, answers: AnswerMap, forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): InsightMode {
  const avg = averageQuestionScore(path, answers);
  const meLoad = FORCE_MAP_ITEMS.filter((item) => isMeHeavy(forceMap[item.key])).length;
  const otherLoad = FORCE_MAP_ITEMS.filter((item) => isOtherHeavy(forceMap[item.key])).length;
  const imbalance = Math.max(meLoad, otherLoad);
  const hardBurdenCount = burdens.filter((b) => /zdrada|kłamstwo|cisza|kłótnie|powroty|rozstania|ktoś trzeci|brak jasności|nierówne/i.test(b.label)).length;
  const hardTruth = truthCards.some((t) => /wracamy|boję się końca|czekam|zgasła|nie daje mi oparcia/i.test(t));
  if (avg <= 0.95 && imbalance <= 1 && hardBurdenCount <= 1 && !hardTruth) return "supportive";
  if (avg >= 2.05 || imbalance >= 3 || hardBurdenCount >= 2 || hardTruth) return "difficult";
  return "mixed";
}

function modeLabel(mode: InsightMode): string {
  if (mode === "supportive") return "sporo gruntu";
  if (mode === "difficult") return "wymaga uwagi";
  return "mieszany sygnał";
}

function buildAdaptiveBars(mode: InsightMode, variant: PauseVariant, path: EntryConfig | null, answers: AnswerMap, forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): VisualBar[] {
  const avg = averageQuestionScore(path, answers);
  const questionRisk = clampScore(18 + avg * 25);
  const questionStrength = clampScore(88 - avg * 21);
  const forceBars = buildMapVisualBars(forceMap, burdens, truthCards);

  if (variant === "questions") {
    if (mode === "supportive") return [
      { label: "Spokój", value: questionStrength, tone: "green", text: "odpowiedzi częściej pokazują możliwość rozmowy niż chaos" },
      { label: "Trudność", value: questionRisk, tone: questionRisk > 55 ? "gold" : "green", text: "jest temat do sprawdzenia, ale nie wygląda na cały obraz" },
      { label: "Grunt", value: clampScore(questionStrength - 6), tone: "green", text: "widać coś, na czym można oprzeć dalszy odczyt" },
    ];
    if (mode === "difficult") return [
      { label: "Koszt", value: questionRisk, tone: "danger", text: "odpowiedzi pokazują, że sytuacja zabiera sporo spokoju" },
      { label: "Jasność", value: clampScore(100 - questionRisk), tone: "danger", text: "część spraw zostaje domyślana zamiast nazwana" },
      { label: "Ruch", value: clampScore(82 - questionRisk), tone: "gold", text: "trzeba sprawdzić, czy zmieniają się zachowania, nie tylko nastrój" },
    ];
    return [
      { label: "Działa", value: clampScore(questionStrength), tone: "green", text: "są elementy, które mogą dawać tej relacji oparcie" },
      { label: "Męczy", value: clampScore(questionRisk), tone: "gold", text: "jest też koszt, którego nie da się pominąć" },
      { label: "Niejasne", value: clampScore(60 - avg * 8), tone: "gold", text: "trzeba oddzielić fakty od nadziei i domysłów" },
    ];
  }

  if (variant === "force") return forceBars.slice(0, 3).map((bar) => ({
    ...bar,
    text: bar.label.toLowerCase().includes("napraw")
      ? "chodzi o to, kto wraca do rozmowy i bierze sprawę na siebie"
      : bar.label.toLowerCase().includes("inicj")
        ? "chodzi o to, kto częściej robi pierwszy ruch"
        : bar.text
  }));

  if (variant === "burdens") {
    const base = burdens.slice(0, 3);
    if (!base.length) return [{ label: "Brak jednego ciężaru", value: 35, tone: "green", text: "problem może być sytuacyjny albo jeszcze za słabo nazwany" }];
    return base.map((b, i) => ({
      label: `${b.rank}. ${b.label}`,
      value: clampScore(92 - i * 18),
      tone: mode === "supportive" ? "green" : mode === "difficult" ? "danger" : "gold",
      text: i === 0 ? "to nie jest wniosek, tylko miejsce które najmocniej wpływa na dalsze pytania" : "to dopowiada, gdzie relacja traci lekkość albo jasność"
    }));
  }

  return buildPreviewVisualBars({ chance: 50, tension: forceBars[0]?.value || questionRisk, asymmetry: forceBars[1]?.value || 50, change: forceBars[3]?.value || questionStrength, badge: "", headline: "", truth: "", mirror: "", summary: "", paidTease: "", tone: "yellow" }).slice(0, 3);
}

function buildAdaptiveCycle(mode: InsightMode, variant: PauseVariant, pathKey?: EntryKey, burdens: BurdenItem[] = [], truthCards: string[] = []): string[] {
  if (mode === "supportive") {
    if (variant === "force") return ["różnica", "rozmowa", "naprawa", "powrót równowagi"];
    if (variant === "burdens") return ["trudność", "nazwanie", "współpraca", "kierunek"];
    return ["kontakt", "napięcie do udźwignięcia", "rozmowa", "równowaga"];
  }
  if (mode === "mixed") {
    if (variant === "burdens") return ["bliskość", "ciężar", "próba naprawy", "niepewność"];
    return ["działa", "obciąża", "wymaga sprawdzenia", "wniosek"];
  }
  return buildCycleSteps(pathKey, burdens, truthCards);
}

function buildPauseInsight(variant: PauseVariant, path: EntryConfig | null, answers: AnswerMap, forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[]): PauseInsight {
  const mode = relationshipMode(path, answers, forceMap, burdens, truthCards);
  const bars = buildAdaptiveBars(mode, variant, path, answers, forceMap, burdens, truthCards);
  const cycle = buildAdaptiveCycle(mode, variant, path?.key, burdens, truthCards);
  const topBurden = burdens[0]?.label;
  const truth = truthCards[0];

  if (variant === "questions") {
    if (mode === "supportive") return {
      mode, eyebrow: "PO PIERWSZYCH ODPOWIEDZIACH",
      title: "Na razie nie widać, żeby problem przykrywał całą relację",
      text: "To nie jest pochwała ani werdykt. Pierwsze odpowiedzi pokazują, że obok trudności może być też kontakt, rozmowa albo coś, co nadal daje oparcie.",
      takeaway: "Dalsze kroki sprawdzą, czy ten grunt jest realny w zachowaniu, nie tylko w deklaracjach.",
      notProof: "To jeszcze nie znaczy, że wszystko jest dobrze.",
      bars, cycle
    };
    if (mode === "difficult") return {
      mode, eyebrow: "PO PIERWSZYCH ODPOWIEDZIACH",
      title: "Pierwszy sygnał jest taki: ta sytuacja kosztuje sporo spokoju",
      text: "Nie chodzi o to, że jedna odpowiedź przesądza wynik. Chodzi o to, że kilka odpowiedzi idzie w podobną stronę: więcej napięcia, domysłów albo czekania niż stabilności.",
      takeaway: "Teraz trzeba sprawdzić, czy ten koszt wynika z chwilowego kryzysu, czy z czegoś, co wraca regularnie.",
      notProof: "To nie jest jeszcze decyzja, że relacja nie ma sensu.",
      bars, cycle
    };
    return {
      mode, eyebrow: "PO PIERWSZYCH ODPOWIEDZIACH",
      title: "Tu nie wychodzi proste „dobrze” albo „źle”",
      text: "W odpowiedziach są jednocześnie rzeczy, które mogą trzymać relację, i takie, które ją obciążają. Dlatego wynik nie powinien iść na skróty.",
      takeaway: "Dalej sprawdzimy, kto co niesie i co powtarza się najczęściej.",
      notProof: "To nie jest jeszcze gotowy wniosek, tylko kierunek dalszego sprawdzania.",
      bars, cycle
    };
  }

  if (variant === "force") {
    if (mode === "supportive") return {
      mode, eyebrow: "PO UKŁADZIE SIŁ",
      title: "Ciężar nie wygląda na oczywiście jednostronny",
      text: "To ważne, bo relacja może mieć trudne miejsca, a mimo to nie opierać się wyłącznie na wysiłku jednej osoby.",
      takeaway: "Wynik będzie dalej sprawdzał, czy ta względna równowaga utrzymuje się też przy konfliktach i decyzjach.",
      notProof: "To nie unieważnia problemów, tylko pokazuje, że nie wszystko trzeba czytać jako brak wzajemności.",
      bars, cycle
    };
    if (mode === "difficult") return {
      mode, eyebrow: "PO UKŁADZIE SIŁ",
      title: "Najmocniej widać pytanie: kto naprawdę dźwiga tę relację",
      text: "Jeśli jedna osoba częściej zaczyna rozmowę, naprawia po konflikcie albo pilnuje kontaktu, problem nie leży tylko w uczuciach. Leży też w podziale ciężaru.",
      takeaway: "Dalszy wynik powinien sprawdzić, czy druga strona odpowiada działaniem, czy tylko chwilową obecnością.",
      notProof: "To nie jest ocena partnera. To sprawdzenie, jak rozkłada się odpowiedzialność.",
      bars, cycle
    };
    return {
      mode, eyebrow: "PO UKŁADZIE SIŁ",
      title: "Równowaga nie jest pełna, ale nie wszystko jest po jednej stronie",
      text: "To sygnał mieszany. Część ciężaru może być po Twojej stronie, ale nie widać jeszcze, czy to stały układ, czy reakcja na konkretny etap.",
      takeaway: "Następny krok pokaże, co najbardziej obciąża tę relację w praktyce.",
      notProof: "To nie jest jeszcze dowód na jednostronność.",
      bars, cycle
    };
  }

  if (variant === "burdens") {
    if (mode === "supportive") return {
      mode, eyebrow: "PO WYBORZE CIĘŻARÓW",
      title: topBurden ? `Najbardziej trzeba nazwać: ${sentenceCase(topBurden)}` : "Nie ma jednego ciężaru, który przykrywa wszystko",
      text: topBurden ? "To wygląda bardziej jak temat do uporządkowania niż automatyczny dowód, że relacja jest zła." : "Czasem problem nie jest jednym wielkim ciężarem, tylko kilkoma drobnymi napięciami, które zbierają się po czasie.",
      takeaway: "Wynik nie powinien robić z tego dramatu, jeśli odpowiedzi pokazują też współpracę i kontakt.",
      notProof: "Samo wskazanie ciężaru nie mówi jeszcze, czy druga strona chce i potrafi coś zmienić.",
      bars, cycle, chips: burdens.map((b) => b.label)
    };
    if (mode === "difficult") return {
      mode, eyebrow: "PO WYBORZE CIĘŻARÓW",
      title: topBurden ? `${sentenceCase(topBurden)} nie jest tylko etykietą problemu` : "Ciężar zaczyna ustawiać dalszy odczyt",
      text: "Najważniejsze nie jest samo słowo, które zaznaczyłeś. Ważniejsze jest to, czy ten temat wraca, zmienia Twoje zachowanie i zostawia Cię z większym kosztem niż drugą stronę.",
      takeaway: "Dalsze pytanie ma sprawdzić konkretną sytuację z życia, żeby raport nie powtórzył tylko zaznaczenia.",
      notProof: "To jeszcze nie mówi, kto jest winny. Mówi, gdzie trzeba szukać faktów.",
      bars, cycle, chips: burdens.map((b) => b.label)
    };
    return {
      mode, eyebrow: "PO WYBORZE CIĘŻARÓW",
      title: topBurden ? `Najmocniej wraca temat: ${sentenceCase(topBurden)}` : "Ciężar nie jest jeszcze jednoznaczny",
      text: "Ten wybór jest punktem zaczepienia, nie gotowym raportem. Trzeba jeszcze sprawdzić, czy to chwilowe napięcie, czy coś, co powtarza się w podobny sposób.",
      takeaway: "Raport powinien z tego wyciągnąć wniosek, a nie przepisać nazwę zaznaczonego kafelka.",
      notProof: "Sama nazwa problemu nie wystarczy do uczciwej oceny.",
      bars, cycle, chips: burdens.map((b) => b.label)
    };
  }

  if (mode === "supportive") return {
    mode, eyebrow: "PO MOMENCIE PRAWDY",
    title: "To zdanie nie musi oznaczać końca",
    text: "Może pokazywać miejsce, które domaga się rozmowy, a nie dowód, że wszystko się rozsypuje.",
    takeaway: "Jeśli w odpowiedziach jest wzajemność, wynik ma ją pokazać uczciwie.",
    notProof: "Jedno mocne zdanie nie powinno przykrywać całego obrazu.",
    bars, cycle, quote: truth
  };
  if (mode === "difficult") return {
    mode, eyebrow: "PO MOMENCIE PRAWDY",
    title: "To zdanie może pokazywać coś, czego nie chcesz już omijać",
    text: "Nie dlatego, że samo zdanie przesądza o relacji. Dlatego, że często trafia dokładnie tam, gdzie człowiek przestał już wierzyć własnym tłumaczeniom.",
    takeaway: "Ostatnie pytania mają sprawdzić fakt z życia, a nie tylko Twoje odczucie.",
    notProof: "To nadal nie jest wyrok. To wskazanie miejsca do sprawdzenia.",
    bars, cycle, quote: truth
  };
  return {
    mode, eyebrow: "PO MOMENCIE PRAWDY",
    title: "To jest punkt do rozróżnienia, nie gotowa odpowiedź",
    text: "Wybrane zdanie pomaga zobaczyć, gdzie miesza się realny problem, lęk, przywiązanie albo zmęczenie.",
    takeaway: "Dlatego na końcu dopytamy o konkret, który może zmienić odczyt.",
    notProof: "Nie będziemy udawać pewności tam, gdzie jej jeszcze nie ma.",
    bars, cycle, quote: truth
  };
}

function PauseInsightPanel({ insight, onBack, onNext, nextLabel = "Dalej →" }: { insight: PauseInsight; onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <motion.div key={`${insight.eyebrow}-${insight.title}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="section-head compact">
        <div>
          <div className="eyebrow">{insight.eyebrow}</div>
          <h2>{insight.title}</h2>
          <p>{insight.text}</p>
        </div>
        <div className={`mode-pill ${insight.mode}`}>{modeLabel(insight.mode)}</div>
      </div>
      <Glass className={`question-panel relationship-map-panel pause-panel ${insight.mode}`}>
        {insight.quote && <div className="pause-quote">„{insight.quote}”</div>}
        <div className="pause-grid">
          <div className="pause-visual-card">
            <div className="eyebrow">NAJWAŻNIEJSZE TROPY</div>
            <SignalHierarchy items={insight.bars} />
          </div>
          <div className="pause-visual-card">
            <div className="eyebrow">{insight.mode === "supportive" ? "JAK TEN UKŁAD MOŻE SIĘ REGULOWAĆ" : "JAK TEN UKŁAD SIĘ NAKRĘCA"}</div>
            <MechanismNarrative steps={insight.cycle || []} />
            {insight.chips && insight.chips.length > 0 && (
              <div className="pause-chip-row">
                {insight.chips.map((chip) => <span key={chip}>{chip}</span>)}
              </div>
            )}
          </div>
        </div>
        <div className="pause-explain-grid">
          {insight.takeaway && <div><span>Wniosek na teraz</span><strong>{insight.takeaway}</strong></div>}
          {insight.notProof && <div><span>To jeszcze nie znaczy</span><strong>{insight.notProof}</strong></div>}
        </div>
        <div className="section-actions">
          <GhostButton onClick={onBack}>Wróć</GhostButton>
          <PrimaryButton onClick={onNext}>{nextLabel}</PrimaryButton>
        </div>
      </Glass>
    </motion.div>
  );
}

function uniqueClarifications(items: ClarificationQuestion[]): ClarificationQuestion[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function buildClarificationQuestions(path: EntryConfig, forceMap: ForceMap, burdens: BurdenItem[], truthCards: string[], note: string): ClarificationQuestion[] {
  const candidates: ClarificationQuestion[] = [];
  const meLoad = FORCE_MAP_ITEMS.filter((item) => isMeHeavy(forceMap[item.key])).length;

  if (meLoad >= 3 || isMeHeavy(forceMap.repairAfterConflict) || isMeHeavy(forceMap.emotionalLabor)) {
    candidates.push({ id: "asymmetry-reality", signal: "Kto ciągnie kontakt", lead: "Nie pytamy, kto bardziej kocha. Pytamy, co dzieje się, gdy Ty na chwilę przestajesz ciągnąć temat.", text: "Gdybyś przez kilka dni nie zaczynał/zaczynała rozmowy, nie wracał/wracała do problemu i nie próbował/próbowała naprawiać, co najpewniej by się wydarzyło?" });
  }
  if (hasBurden(burdens, "cisza") || isOtherHeavy(forceMap.avoidance)) {
    candidates.push({ id: "silence-pattern", signal: "Cisza po trudnym momencie", lead: "Tu liczy się zwykły przebieg sytuacji, nie interpretacja.", text: "Kiedy robi się cicho po kłótni albo napięciu: ile to zwykle trwa, kto pierwszy wraca do kontaktu i czy po tym coś się realnie zmienia?" });
  }
  if (hasBurden(burdens, "kłótnie")) {
    candidates.push({ id: "conflict-after", signal: "Co zostaje po kłótni", lead: "Nie chodzi o to, jak mocna była kłótnia. Chodzi o to, co zostało po niej.", text: "Przypomnij sobie ostatnie 2–3 kłótnie. Co po nich naprawdę zmieniło się w zachowaniu którejkolwiek ze stron?" });
  }
  if (hasBurden(burdens, "zdrada") || path.key === "betrayal") {
    candidates.push({ id: "trust-proof", signal: "Co dzieje się po kłamstwie", lead: "Tu nie wystarczy, że ktoś przeprosił. Liczy się to, co robi później.", text: "Co dziś bardziej utrudnia Ci zaufanie: samo wydarzenie, czy to, jak druga strona zachowuje się po nim? Podaj jeden konkretny przykład." });
  }
  if (hasBurden(burdens, "brak jasności") || path.key === "uncertain") {
    candidates.push({ id: "clarity-cost", signal: "Co nadal nie jest nazwane", lead: "Nie chodzi o wielkie deklaracje. Chodzi o jedną rzecz, której brak najbardziej męczy.", text: "Co dokładnie nadal jest między Wami niejasne i co Ty przez to robisz więcej: czekasz, piszesz pierwszy/pierwsza, tłumaczysz, odpuszczasz swoje potrzeby?" });
  }
  if (hasBurden(burdens, "powroty") || truthCards.some((text) => text.includes("wracamy w to samo")) || path.key === "loop") {
    candidates.push({ id: "cycle-proof", signal: "Czy poprawa zostaje", lead: "Najłatwiej pomylić ulgę po napięciu z prawdziwą zmianą.", text: "Kiedy robi się lepiej, co później zostaje na dłużej: konkretne zachowanie, inny sposób rozmowy, większa odpowiedzialność — czy głównie chwilowy spokój?" });
  }
  if (truthCards.some((text) => text.includes("boję się końca")) || hasBurden(burdens, "lęk")) {
    candidates.push({ id: "fear-vs-choice", signal: "Czego boisz się naprawdę", lead: "Czasem trudno odróżnić miłość od strachu przed pustką po tej historii.", text: "Co byłoby dla Ciebie trudniejsze: stracić tę osobę, czy uznać, że ta historia nie poszła tam, gdzie miała pójść?" });
  }
  if (hasBurden(burdens, "rutyna") || path.key === "stagnation") {
    candidates.push({ id: "stagnation-proof", signal: "Czy jest jeszcze kontakt", lead: "Brak kłótni nie zawsze oznacza bliskość.", text: "Po czym poznajesz, że między Wami jest jeszcze ciekawość, bliskość albo chęć bycia razem, a nie tylko przyzwyczajenie?" });
  }
  if (path.key === "triangle" || hasBurden(burdens, "ktoś trzeci")) {
    candidates.push({ id: "third-person-meaning", signal: "Co ta osoba pokazała", lead: "Trzecia osoba nie zawsze jest przyczyną. Czasem tylko odsłania brak, który był wcześniej.", text: "Gdyby tej trzeciej osoby w ogóle nie było, jaki problem w obecnej relacji i tak zostałby na stole?" });
  }

  candidates.push({ id: "one-change", signal: "Jeden konkret", lead: "Na końcu liczy się to, co ktoś robi, nie to, co obiecuje.", text: "Co musiałoby się zmienić w zachowaniu tej osoby, żebyś poczuł/poczuła: „to nie jest tylko chwilowa poprawa”?" });
  candidates.push({ id: "missing-context", signal: "Jedna rzecz z życia", lead: "Żeby wynik nie brzmiał jak przepisanie odpowiedzi, potrzebny jest jeden fakt, nie ogólny opis.", text: `Jaki jeden konkretny fakt z tej relacji najbardziej zmieniłby ocenę sytuacji, gdyby ktoś z boku go poznał?` });

  const unique = uniqueClarifications(candidates);
  const strongSignals = burdens.length + truthCards.length + (meLoad >= 3 ? 1 : 0) + (note.trim().length < 40 ? 1 : 0);
  return unique.slice(0, 3);
}

const LOCAL_INTERVIEW_QUESTIONS: Record<EntryKey, LocalInterviewQuestion[]> = {
  unease: [
    { lead: "Najpierw trzeba nazwać, gdzie zaczyna się napięcie.", question: "Kiedy najczęściej czujesz, że coś jest nie tak: po rozmowach, przy ciszy, przy planach, przy braku kontaktu czy przy myśli o przyszłości?", observation: "Nie szukamy jeszcze decyzji. Szukamy punktu, w którym relacja traci spokój." },
    { lead: "Niepokój zwykle ma swój powtarzalny moment.", question: "Jaka sytuacja wraca najczęściej i za każdym razem zostawia Cię z podobnym uczuciem?", observation: "Interesuje nas to, co wraca, nie jednorazowa sytuacja." },
    { lead: "Teraz oddziel fakty od tłumaczeń.", question: "Co konkretnie widzisz w zachowaniu tej osoby, a co dopowiadasz sobie, żeby to jakoś utrzymać w całości?", observation: "To pomaga oddzielić fakt od tłumaczenia." },
  ],
  betrayal: [
    { lead: "Po zdradzie najważniejsze są nie słowa, tylko ciężar odpowiedzialności.", question: "Co ta osoba realnie zmieniła od tamtej sytuacji, a co zostało tylko na poziomie przeprosin albo obietnic?", observation: "Odbudowa zaufania zaczyna się tam, gdzie druga strona przestaje oczekiwać, że ból po prostu minie." },
    { lead: "Sprawdź, czy żyjesz już normalnie, czy nadal w trybie kontroli.", question: "W jakich momentach najczęściej wraca potrzeba sprawdzania, pytania albo analizowania szczegółów?", observation: "Stała czujność nie jest spokojem. Jest kosztem, który relacja zaczęła pobierać." },
    { lead: "Zaufanie wraca przez zachowanie, nie przez zmęczenie tematem.", question: "Co musiałoby się wydarzyć, żebyś naprawdę poczuł/poczuła, że nie musisz już pilnować tej historii?", observation: "To pytanie pokazuje, czy oczekujesz realnej zmiany, czy tylko ulgi od napięcia." },
  ],
  uncertain: [
    { lead: "Niejasność rzadko trwa przypadkiem.", question: "Co dokładnie jest między Wami niedopowiedziane: status, zaangażowanie, przyszłość, wyłączność czy odpowiedzialność za relację?", observation: "Im dłużej coś pozostaje niejasne, tym bardziej zaczyna ustawiać całą relację." },
    { lead: "Zobacz, kto płaci za brak definicji.", question: "Co Ty robisz więcej właśnie dlatego, że nie masz jasności: czekasz, dopasowujesz się, tłumaczysz, inicjujesz, kontrolujesz emocje?", observation: "Brak jasności nie jest neutralny. Ktoś zwykle ponosi jego koszt." },
    { lead: "Teraz najprostszy test.", question: "Gdyby ta osoba naprawdę chciała dać Ci spokój i pewność, co mogłaby zrobić już teraz, bez wielkich deklaracji?", observation: "Ta odpowiedź odróżnia realną trudność od wygodnej nieokreśloności." },
  ],
  asymmetry: [
    { lead: "Asymetrię widać najlepiej wtedy, gdy przestajesz ciągnąć.", question: "Co realnie stałoby się z kontaktem, bliskością i rozmowami, gdybyś przez chwilę przestał/przestała inicjować i naprawiać?", observation: "To pytanie pokazuje, czy relacja stoi na dwóch osobach, czy głównie na Twoim wysiłku." },
    { lead: "Nie chodzi tylko o ilość starań, ale o ich ciężar.", question: "Które rzeczy w tej relacji bierzesz na siebie prawie automatycznie, choć coraz bardziej Cię to męczy?", observation: "Czasem dopiero po takim pytaniu widać, ile rzeczy robisz automatycznie." },
    { lead: "Teraz nazwij koszt.", question: "Kim stajesz się przy tej osobie, kiedy znowu próbujesz utrzymać coś, czego druga strona nie niesie tak samo?", observation: "Najważniejszy nie jest sam wysiłek, tylko to, co ten wysiłek robi z Tobą." },
  ],
  conflict: [
    { lead: "Kłótnia nie jest problemem sama w sobie. Problemem jest to, co zostaje po niej.", question: "Co najczęściej dzieje się po konflikcie: naprawa, cisza, dystans, kolejne wypominanie czy udawanie, że nic się nie stało?", observation: "Relację bardziej definiuje sposób naprawy niż sam fakt sporu." },
    { lead: "Sprawdź, o co naprawdę walczycie.", question: "Czy Wasze kłótnie dotyczą konkretnych spraw, czy po chwili zamieniają się w walkę o rację, uwagę, szacunek albo kontrolę?", observation: "Jeśli temat znika, a zostaje walka, kłótnia przestaje cokolwiek naprawiać." },
    { lead: "Teraz najważniejsze: czy konflikt coś zmienia.", question: "Po ostatnich trzech kłótniach co realnie zmieniło się w zachowaniu którejkolwiek ze stron?", observation: "Jeśli po konflikcie nie ma zmiany, konflikt staje się tylko cyklem napięcia." },
  ],
  stagnation: [
    { lead: "Cisza w relacji może być spokojem albo rezygnacją.", question: "Po czym poznajesz, że między Wami jest jeszcze żywy kontakt, a nie tylko przyzwyczajenie i poprawne funkcjonowanie obok siebie?", observation: "Brak awantur nie zawsze oznacza bliskość." },
    { lead: "Zobacz, co zniknęło jako pierwsze.", question: "Czego najbardziej brakuje Ci z wcześniejszej wersji tej relacji: rozmów, ciekawości, dotyku, planów, lekkości czy poczucia bycia wybranym/wybraną?", observation: "To, co zniknęło pierwsze, często pokazuje prawdziwe miejsce pęknięcia." },
    { lead: "Teraz bez sentymentu.", question: "Co dzisiaj realnie trzyma Was razem, jeśli odłożysz wspomnienia, obowiązki i lęk przed zmianą?", observation: "Ta odpowiedź odróżnia relację żywą od relacji podtrzymywanej rozpędem." },
  ],
  returning: [
    { lead: "Tęsknota potrafi wygładzać powód rozstania.", question: "Który element tej relacji najłatwiej dziś idealizujesz, mimo że wcześniej właśnie on bolał albo wracał jako problem?", observation: "Po rozstaniu pamięć często przepuszcza ulgę, a zatrzymuje najlepsze kadry." },
    { lead: "Powrót ma sens tylko wtedy, gdy wracacie do czegoś innego.", question: "Co konkretnie musiałoby być inne po powrocie i skąd miałoby wynikać, że to nie będzie kolejna ta sama próba?", observation: "Bez konkretu powrót bywa tylko powrotem do znanego bólu." },
    { lead: "Oddziel osobę od niedomkniętej historii.", question: "Czego bardziej nie umiesz puścić: tej konkretnej osoby czy wersji zakończenia, której nadal dla siebie chcesz?", observation: "Czasem nie trzyma człowiek, tylko potrzeba, żeby historia wreszcie miała sens." },
  ],
  triangle: [
    { lead: "Trzecia osoba rzadko jest tylko trzecią osobą.", question: "Co ta osoba uruchomiła w Tobie, czego od dawna nie czułeś/czułaś w obecnej relacji?", observation: "Nowa fascynacja często pokazuje brak, który istniał wcześniej." },
    { lead: "Sprawdź, czy patrzysz na człowieka, czy na obietnicę wyjścia.", question: "Co w tej trzeciej osobie jest realnie poznane, a co jest jeszcze wyobrażeniem, kontrastem albo ucieczką od napięcia?", observation: "To ważne, bo wyobrażenie prawie zawsze jest lżejsze niż codzienność." },
    { lead: "Teraz wróć do obecnej relacji.", question: "Gdyby nie było tej trzeciej osoby, jaki problem w obecnej relacji nadal musiałby zostać nazwany?", observation: "To pytanie oddziela nową historię od starego pęknięcia." },
  ],
  loop: [
    { lead: "Pętla ma swój rytm.", question: "Jak wygląda ostatni pełny cykl między Wami: co uruchomiło napięcie, co doprowadziło do powrotu i co potem znowu zaczęło znikać?", observation: "Dopóki nie nazwiesz tego rytmu, każdy powrót może wyglądać jak nowy start." },
    { lead: "Sprawdź, czy po powrotach zostaje zmiana, czy tylko ulga.", question: "Co po ostatnim powrocie naprawdę utrzymało się dłużej niż kilka tygodni?", observation: "Ulga po odzyskaniu kontaktu może bardzo łatwo udawać naprawę." },
    { lead: "Teraz najtrudniejsze.", question: "Co daje Ci ten cykl, mimo że jednocześnie Cię męczy: intensywność, poczucie bycia potrzebnym/potrzebną, nadzieję, adrenalinę czy uniknięcie pustki?", observation: "Czasem człowieka trzyma nie tylko osoba, ale cały rytm napięcia i ulgi." },
  ],
};

function universalDeepeningQuestions(path: EntryConfig): LocalInterviewQuestion[] {
  const pathName = path.title.toLowerCase();
  return [
    {
      lead: "Teraz potrzebny jest fakt, który zmienia odczyt.",
      question: `Jaki jeden konkretny fakt z tej historii najbardziej zmieniłby ocenę osoby z zewnątrz, gdyby znała tylko Twoją perspektywę?`,
      observation: "Ten punkt chroni wynik przed prostym potwierdzeniem nastroju z danego dnia."
    },
    {
      lead: "Sprawdźmy, czy jest tu zasób, którego nie wolno zgubić.",
      question: `Co w tej relacji nadal działa albo kiedy ostatnio poczułeś/poczułaś: „tu jest coś prawdziwego”?`,
      observation: "Dobry odczyt nie szuka problemu na siłę. Jeśli są zasoby, trzeba je nazwać równie uczciwie jak ryzyka."
    },
    {
      lead: "Na koniec nie decyzja, tylko najbliższy ruch.",
      question: `Gdybyś przez najbliższe 7 dni miał/miała sprawdzić tylko jedną rzecz w zachowaniu tej osoby, co dokładnie powinno się wydarzyć?`,
      observation: "To zmienia analizę w konkretną obserwację, a nie kolejne kręcenie się w głowie."
    }
  ];
}


function normalizeAnswerText(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[„”"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shortAnswerAnchor(value: string): string {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "tym, co właśnie opisałeś/opisałaś";
  const words = cleaned.split(" ").slice(0, 12).join(" ");
  return words.length > 90 ? `${words.slice(0, 87)}…` : words;
}

function questionWasUsed(history: InterviewExchange[], fragment: string): boolean {
  const normalized = normalizeAnswerText(fragment);
  return history.some((item) => normalizeAnswerText(item.ai).includes(normalized));
}

function buildAdaptiveLocalQuestion(
  path: EntryConfig,
  answer: string,
  history: InterviewExchange[],
  depth: number
): LocalInterviewQuestion {
  const anchor = shortAnswerAnchor(answer);
  const firstAnchor = shortAnswerAnchor(history[0]?.user || answer);
  const latestObservation = history[history.length - 1]?.observation || "";
  const pathQuestions: Record<EntryKey, { second: LocalInterviewQuestion; third: LocalInterviewQuestion }> = {
    unease: {
      second: {
        lead: `Zatrzymuje się jeden fragment: „${anchor}”. Teraz sprawdzamy nie samo uczucie, lecz sekwencję, która je uruchamia.`,
        question: "Co wydarzyło się bezpośrednio przed tym momentem, jaki ruch wykonała druga osoba i co zrobiłeś/zrobiłaś Ty, żeby odzyskać spokój albo kontrolę nad sytuacją?",
        observation: latestObservation || "Niepokój zwykle ma konkretny zapalnik i automatyczną odpowiedź po Twojej stronie.",
      },
      third: {
        lead: `Pierwszy kadr brzmiał: „${firstAnchor}”. Ostatnia odpowiedź pokazuje już nie tylko zdarzenie, ale sposób, w jaki próbujesz je unieść.`,
        question: "Załóż na chwilę, że nie tłumaczysz zachowania tej osoby ani na jej korzyść, ani przeciwko niej. Jak wygląda ten układ wyłącznie z perspektywy działań z ostatnich tygodni i co z tego wynika?",
        observation: "Ostatnie pytanie oddziela realny sygnał od lęku oraz od nadziei, która może wypełniać brakujące fakty.",
      },
    },
    betrayal: {
      second: {
        lead: `W Twoim opisie najwięcej waży fragment „${anchor}”. Po naruszeniu zaufania kluczowe jest to, kto dziś wykonuje pracę naprawczą.`,
        question: "Jakie dwa konkretne zachowania tej osoby pokazują, że bierze odpowiedzialność za odbudowę zaufania — i jakie zachowanie nadal przerzuca ten ciężar na Ciebie?",
        observation: latestObservation || "Przeprosiny opisują intencję. Odpowiedzialność widać dopiero w powtarzalnych działaniach.",
      },
      third: {
        lead: `Punkt wyjścia to „${firstAnchor}”. Teraz usuwamy z obrazu słowa, przeprosiny i obietnice.`,
        question: "Gdybyś oceniał/oceniała sytuację wyłącznie po obecnych zachowaniach, co byłoby dowodem realnej odbudowy, a co pokazuje jedynie chęć zamknięcia tematu?",
        observation: "To pytanie sprawdza, czy zaufanie odbudowuje wspólna praca, czy tylko Twoje zmęczenie ciągłym wracaniem do sprawy.",
      },
    },
    uncertain: {
      second: {
        lead: `Niejasność skupia się wokół „${anchor}”. Teraz trzeba zobaczyć, kto płaci za brak jednoznaczności i kto z niego korzysta.`,
        question: "Co Ty robisz więcej dlatego, że sytuacja pozostaje niejasna, a czego druga osoba dzięki tej niejasności nie musi dziś powiedzieć, ustalić albo wziąć na siebie?",
        observation: latestObservation || "Brak decyzji też ustawia relację — zwykle nierówno rozkładając koszt czekania.",
      },
      third: {
        lead: `Pierwszy konkret to „${firstAnchor}”. Na końcu wyłączamy interpretacje i zostawiamy tylko czytelne ruchy.`,
        question: "Gdybyś przestał/przestała wypełniać luki nadzieją albo obawą, jakie działania tej osoby byłyby jednoznaczną odpowiedzią — i które z nich faktycznie już się wydarzyły?",
        observation: "To odróżnia trudną, ale realną drogę do jasności od układu, który trwa właśnie dlatego, że niczego nie trzeba rozstrzygać.",
      },
    },
    asymmetry: {
      second: {
        lead: `Fragment „${anchor}” pokazuje nie tylko nierówność, ale prawdopodobnie Twój automatyczny sposób jej wyrównywania.`,
        question: "Którą część relacji przejmujesz bez zastanowienia — kontakt, rozmowę, naprawę, planowanie czy uspokajanie — i co robi wtedy druga osoba, kiedy Ty tego nie zrobisz od razu?",
        observation: latestObservation || "Asymetria bywa niewidoczna tak długo, jak jedna strona sprawnie zasypuje każdą lukę.",
      },
      third: {
        lead: `Pierwszy ślad brzmiał „${firstAnchor}”. Teraz na chwilę usuwamy z układu Twój dodatkowy wysiłek.`,
        question: "Co w tej relacji utrzymałoby się samo przez najbliższy tydzień, a co prawdopodobnie zniknęłoby natychmiast bez Twojej inicjatywy? Oprzyj odpowiedź na wcześniejszych sytuacjach, nie na nadziei.",
        observation: "To jest próba wzajemności: nie pyta o uczucia, tylko o to, co relacja potrafi utrzymać bez jednostronnego podtrzymywania.",
      },
    },
    conflict: {
      second: {
        lead: `Najważniejszy fragment to „${anchor}”. Teraz patrzymy, co dzieje się z właściwym problemem po opadnięciu emocji.`,
        question: "Kto zwykle wykonuje pierwszy ruch naprawczy, jak druga strona na niego odpowiada i czy temat zostaje naprawdę domknięty, czy tylko znika do następnego konfliktu?",
        observation: latestObservation || "O jakości relacji mówi nie temperatura kłótni, lecz to, czy po niej powstaje nowy sposób działania.",
      },
      third: {
        lead: `Punktem wyjścia było „${firstAnchor}”. Ostatnia próba ma rozdzielić naprawę od chwilowego uspokojenia.`,
        question: "Po trzech ostatnich konfliktach wskaż jedną trwałą zmianę w zachowaniu którejkolwiek ze stron. Jeżeli jej nie ma, co faktycznie podtrzymuje przekonanie, że kolejna rozmowa będzie inna?",
        observation: "To pytanie sprawdza, czy konflikt prowadzi do korekty układu, czy jest tylko kolejną rundą tego samego mechanizmu.",
      },
    },
    stagnation: {
      second: {
        lead: `W opisie zatrzymuje się „${anchor}”. Teraz szukamy momentu, w którym bliskość zaczęła być zastępowana funkcjonowaniem obok siebie.`,
        question: "Co zniknęło jako pierwsze — ciekawość, rozmowa, dotyk, wspólne plany, lekkość — i co każde z Was zrobiło, kiedy to zauważyło?",
        observation: latestObservation || "Stagnacja nie zaczyna się od nudy, tylko od rzeczy, które przestają być wybierane i przestają być naprawiane.",
      },
      third: {
        lead: `Pierwszy obraz to „${firstAnchor}”. Teraz odkładamy historię, wspólne obowiązki i lęk przed zmianą.`,
        question: "Co między Wami nadal jest świadomym wyborem obu stron, a co trwa głównie siłą przyzwyczajenia, wygody albo odpowiedzialności za wspólne życie?",
        observation: "Ostatnie pytanie nie szuka spektakularnych uczuć. Sprawdza, czy w codzienności nadal istnieje wzajemny wybór.",
      },
    },
    returning: {
      second: {
        lead: `W ostatnim kontakcie najmocniej brzmi „${anchor}”. Teraz zestawiamy tę chwilę z powodem, dla którego relacja wcześniej się rozpadła.`,
        question: "Który dawny problem pojawił się także w tym kontakcie, a jaki konkretny fakt pokazuje, że choć jedna ze stron reaguje dziś inaczej niż wcześniej?",
        observation: latestObservation || "Tęsknota pokazuje znaczenie relacji. Nie pokazuje jeszcze, czy zmienił się mechanizm, który ją zakończył.",
      },
      third: {
        lead: `Pierwszy kadr to „${firstAnchor}”. Na końcu oddzielamy dzisiejszą osobę od najlepszej wersji wspomnienia.`,
        question: "Gdybyś poznał/poznała tę osobę dzisiaj, z jej obecnym zachowaniem i bez wspólnej historii, czy wybrałbyś/wybrałabyś tę relację? Jakie fakty przesądzają odpowiedź?",
        observation: "To pytanie sprawdza, czy powrót opiera się na nowej jakości, czy na sile więzi z dawną wersją tej historii.",
      },
    },
    triangle: {
      second: {
        lead: `Fragment „${anchor}” pokazuje, że trzecia osoba mogła coś odsłonić, ale niekoniecznie to stworzyć.`,
        question: "Jaką potrzebę, brak albo część siebie uruchamia przy Tobie ta osoba — i od kiedy tego samego nie znajdujesz albo nie próbujesz budować w obecnej relacji?",
        observation: latestObservation || "Trzecia osoba często staje się lustrem istniejącego braku, zanim staje się samodzielnym problemem.",
      },
      third: {
        lead: `Początek historii to „${firstAnchor}”. Teraz całkowicie usuwamy trzecią osobę z równania.`,
        question: "Jaki problem w obecnej relacji pozostałby dokładnie taki sam, gdyby tej osoby nigdy nie było — i co ten fakt mówi o prawdziwym źródle Twojego dylematu?",
        observation: "Ostatnia odpowiedź powinna pokazać, czy wybór dotyczy dwóch osób, czy przede wszystkim jednej relacji, której nie da się już omijać.",
      },
    },
    loop: {
      second: {
        lead: `W cyklu zatrzymuje się fragment „${anchor}”. Teraz szukamy nagrody, która sprawia, że powrót znów wygląda jak rozwiązanie.`,
        question: "Co dostajesz w pierwszych dniach po powrocie — ulgę, intensywność, uwagę, obietnicę zmiany, poczucie bycia potrzebnym — i kiedy dokładnie zaczyna to znowu znikać?",
        observation: latestObservation || "Pętla utrzymuje się nie tylko przez ból, ale również przez krótką nagrodę, która pojawia się po kryzysie.",
      },
      third: {
        lead: `Pierwszy pełny cykl zaczął się od „${firstAnchor}”. Na końcu szukamy miejsca, w którym schemat można rozpoznać przed kolejnym powrotem.`,
        question: "Jaki dokładny moment zawsze poprzedza decyzję, że spróbujecie jeszcze raz — i co musiałoby wydarzyć się inaczej właśnie wtedy, żeby nie był to kolejny obrót tej samej pętli?",
        observation: "To pytanie nie sprawdza siły uczuć. Sprawdza, czy istnieje realny punkt przerwania mechanizmu.",
      },
    },
  };

  const selected = pathQuestions[path.key] || pathQuestions.unease;
  return depth >= 3 ? selected.third : selected.second;
}

function buildLocalPersonalizedOpening(path: EntryConfig, seed?: any): LocalInterviewQuestion {
  const map = seed?.relationshipMap || {};
  const topBurden = map?.burdens?.[0]?.label || "";
  const topEmotion = map?.emotions?.[0]?.label || "";
  const truth = map?.truthCards?.[0] || "";
  const signal = topBurden || topEmotion || path.title.toLowerCase();
  const lead = topBurden && topEmotion
    ? `W Twojej mapie spotykają się „${topBurden}” i „${topEmotion}”. Pierwszy krok to sprawdzić je na jednej prawdziwej scenie.`
    : `Nie zaczynamy od ogólnej oceny. Zatrzymujemy jeden moment związany z „${signal}”.`;

  const openingByPath: Record<EntryKey, string> = {
    unease: `Zatrzymaj ostatni moment, po którym pomyślałeś/pomyślałaś: „coś tu nie gra”. Odtwórz go bez interpretacji: gdzie byliście, co dokładnie zrobiła lub powiedziała druga osoba i co wydarzyło się w kolejnych minutach albo godzinach?`,
    betrayal: `Wróć do ostatniej sytuacji, w której temat zaufania znów stał się obecny — niekoniecznie do samego odkrycia. Co było bodźcem, jak zachowała się druga osoba i co zrobiła później bez Twojego nacisku?`,
    uncertain: `Wybierz jeden moment, po którym nadal nie wiedziałeś/nie wiedziałaś, na czym stoisz. Co dokładnie się wydarzyło, jaka odpowiedź padła i czego ta odpowiedź nadal nie rozstrzygnęła?`,
    asymmetry: `Odtwórz ostatnią sytuację, w której relacja ruszyła do przodu głównie dlatego, że Ty coś zainicjowałeś/zainicjowałaś, naprawiłeś/naprawiłaś albo przypomniałeś/przypomniałaś. Co zrobiła każda ze stron — krok po kroku?`,
    conflict: `Weź ostatni konflikt i odtwórz go jak krótką scenę: pierwsze zdanie, moment eskalacji, zachowanie każdej ze stron i to, co wydarzyło się po uspokojeniu emocji.`,
    stagnation: `Wybierz jeden zwykły dzień, który najlepiej pokazuje dzisiejszą wersję tej relacji. Jak wyglądał Wasz kontakt od rana do wieczora i w którym momencie najbardziej poczułeś/poczułaś brak żywej bliskości?`,
    returning: `Odtwórz ostatni kontakt po rozstaniu albo oddaleniu od pierwszej wiadomości do zakończenia spotkania lub rozmowy. Co było faktem, a co dopiero zaczęło budzić nadzieję na powrót?`,
    triangle: `Zatrzymaj sytuację, w której obecność trzeciej osoby najmocniej wpłynęła na Twoje myślenie o obecnej relacji. Co wydarzyło się realnie, czego zapragnąłeś/zapragnęłaś i co zrobiłeś/zrobiłaś później?`,
    loop: `Odtwórz ostatni pełny obrót Waszego schematu: co uruchomiło napięcie, kiedy pojawił się dystans, co sprowadziło Was z powrotem i jaki był pierwszy znak, że stary rytm wraca.`,
  };

  return {
    lead,
    question: openingByPath[path.key],
    observation: truth
      ? `Zdanie „${truth}” zostaje na razie hipotezą. Pierwszy kadr pokaże, jaki fakt rzeczywiście je wspiera albo osłabia.`
      : `Pierwsze pytanie korzysta z wybranej ścieżki i mapy odpowiedzi, ale nie przesądza jeszcze wyniku.`,
  };
}

function createLocalInterviewState(path: EntryConfig, seed?: any): InterviewState {
  const first = buildLocalPersonalizedOpening(path, seed);
  return {
    path: path.key,
    currentQuestion: first.question,
    currentLead: first.lead,
    currentObservation: first.observation || "",
    history: [],
    depth: 1,
    finished: false,
    exchangeIndex: 0,
    source: "local",
    localQuestions: [first],
    localIndex: 0,
  };
}

const LEGAL_CONTENT: Record<Exclude<LegalKey, null>, { title: string; body: string }> = {
  regulamin: {
    title: "Regulamin",
    body: "Data obowiązywania: 31.07.2026 r.\n\n1. Informacje ogólne\n\nSerwis CzyToMaSens jest dostępny pod adresem czytomasens.pl i umożliwia wykonanie prywatnej analizy relacji na podstawie odpowiedzi użytkownika.\n\nUsługodawcą jest osoba fizyczna prowadząca serwis CzyToMaSens. Kontakt z usługodawcą: kontakt.czytomasens@gmail.com.\n\n2. Charakter usługi\n\nCzyToMaSens jest narzędziem analitycznym i refleksyjnym. Serwis nie świadczy usług psychologicznych, terapeutycznych, medycznych, prawnych ani diagnostycznych.\n\nWynik oraz raport powstają automatycznie na podstawie odpowiedzi użytkownika i mają charakter informacyjny. Nie są diagnozą, opinią specjalisty ani oceną drugiej osoby.\n\n3. Korzystanie z serwisu\n\nUżytkownik wybiera ścieżkę analizy, odpowiada na pytania i może otrzymać pierwszy obraz sytuacji. Pełny raport jest dostępny po dokonaniu płatności.\n\nUżytkownik powinien udzielać odpowiedzi zgodnych z rzeczywistą sytuacją i nie podawać danych pozwalających bez potrzeby zidentyfikować osoby trzecie.\n\n4. Płatność i raport\n\nPełny raport jest odpłatną treścią cyfrową przygotowywaną indywidualnie na podstawie odpowiedzi użytkownika. Płatność obsługiwana jest przez Stripe.\n\n5. Prawo odstąpienia\n\nBezpośrednio przed zakupem użytkownik może wyrazić wyraźną zgodę na rozpoczęcie realizacji usługi przed upływem 14 dni i potwierdzić, że po rozpoczęciu generowania raportu traci prawo odstąpienia od umowy w zakresie tej treści cyfrowej.\n\n6. Reklamacje\n\nReklamacje można składać na adres: kontakt.czytomasens@gmail.com.\n\n7. Odpowiedzialność\n\nUżytkownik samodzielnie podejmuje decyzje dotyczące swojej relacji. Serwis nie ponosi odpowiedzialności za decyzje podjęte wyłącznie na podstawie wyniku lub raportu.\n\nW sytuacji zagrożenia życia, zdrowia, przemocy lub silnego kryzysu psychicznego użytkownik powinien przerwać analizę i skorzystać z odpowiedniej, bezpośredniej pomocy."
  },
  prywatnosc: {
    title: "Polityka prywatności i RODO",
    body: "Data obowiązywania: 31.07.2026 r.\n\n1. Administrator danych\n\nAdministratorem danych osobowych jest osoba fizyczna prowadząca serwis CzyToMaSens. Kontakt w sprawach danych osobowych: kontakt.czytomasens@gmail.com.\n\n2. Jakie dane przetwarzamy\n\nSerwis może przetwarzać: adres e-mail, odpowiedzi udzielone w analizie, treść wpisaną w polach otwartych, identyfikator sesji, informacje o płatności przekazane przez operatora płatności, adres IP, rodzaj przeglądarki oraz dane zapisane lokalnie na urządzeniu. Odpowiedzi mogą zawierać informacje dotyczące zdrowia, życia seksualnego lub innych szczególnie prywatnych okoliczności. Użytkownik powinien ograniczyć dane osób trzecich do minimum.\n\n3. Cele i podstawy przetwarzania\n\nDane są przetwarzane w celu wykonania usługi i przygotowania raportu, obsługi płatności, udostępnienia raportu, obsługi reklamacji oraz zabezpieczenia serwisu. Podstawą jest wykonanie umowy, obowiązek prawny, uzasadniony interes administratora, a w zakresie wymaganym dla danych szczególnych kategorii — wyraźna zgoda użytkownika.\n\n4. Odbiorcy i dostawcy\n\nW realizacji usługi uczestniczą: OpenAI jako dostawca technologii generowania analizy, Railway jako dostawca infrastruktury i bazy danych, Stripe jako operator płatności oraz Resend jako dostawca wiadomości e-mail. Dane nie są sprzedawane ani wykorzystywane przez serwis do reklamy. Korzystanie z dostawców spoza Europejskiego Obszaru Gospodarczego może wiązać się z transferem danych na podstawie mechanizmów wymaganych przez RODO.\n\n5. Okres przechowywania\n\nDane związane z analizą, raportem i anonimowym profilem powrotu są automatycznie usuwane po maksymalnie 90 dniach od ostatniej aktywności, chyba że obowiązek prawny wymaga dłuższego przechowania wybranych danych transakcyjnych. Dane zapisane lokalnie użytkownik może usunąć przyciskiem „Od początku” lub przez wyczyszczenie danych strony w przeglądarce.\n\n6. Prawa użytkownika\n\nUżytkownik ma prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia, sprzeciwu oraz złożenia skargi do Prezesa UODO. Żądania można kierować na adres kontakt.czytomasens@gmail.com."
  },
  rodo: {
    title: "Informacja RODO i cookies",
    body: "Data obowiązywania: 31.07.2026 r.\n\nAdministratorem danych jest osoba fizyczna prowadząca serwis CzyToMaSens. Kontakt w sprawach danych osobowych: kontakt.czytomasens@gmail.com.\n\nSerwis korzysta z technicznej pamięci przeglądarki, w szczególności localStorage i sessionStorage, aby zapamiętać postęp analizy, umożliwić bezpieczny powrót do raportu i ograniczyć utratę odpowiedzi po odświeżeniu strony. Serwis nie używa tych danych do reklamy ani śledzenia użytkownika pomiędzy innymi stronami.\n\nPostęp analizy zapisany na urządzeniu wygasa po 90 dniach. Użytkownik może usunąć go wcześniej przyciskiem „Od początku” albo przez wyczyszczenie danych strony w ustawieniach przeglądarki. Usunięcie danych lokalnych może uniemożliwić powrót do niedokończonej analizy z tego urządzenia."
  },
  kontakt: {
    title: "Kontakt",
    body: "W sprawach technicznych, płatności, raportu, reklamacji oraz danych osobowych napisz na: kontakt.czytomasens@gmail.com.\n\nCzas odpowiedzi: do 14 dni."
  }
};

function safeNumber(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function friendlyError(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : String(error || "");
  if (/failed to fetch|networkerror|load failed|fetch/i.test(raw)) {
    return "Nie udało się połączyć z analizą. Spróbuj ponownie za chwilę.";
  }
  return fallback;
}

function normalizeSafetyText(text: string): string {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[łŁ]/g, "l")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function hasCrisisContent(text: string): boolean {
  // Frontend zatrzymuje tylko poziom 2-3. Sygnały niejednoznaczne doprecyzowuje backend.
  const value = normalizeSafetyText(text);
  const patterns = [
    /\b(chce|zamierzam|zaraz|dzisiaj|teraz)\s+(sie\s+)?(zabic|zabije|skrzywdzic)\b/i,
    /\b(zabije|powiesze|otruje)\s+sie\b/i,
    /\b(odbiore|chce\s+odebrac|zamierzam\s+odebrac)\s+sobie\s+zycie\b/i,
    /\bnie\s+chce\s+(juz\s+|dalej\s+)?zyc\b/i,
    /\bchce\s+skonczyc\s+ze\s+soba\b/i,
    /\bmam\s+(konkretny\s+)?plan(\s+samobojczy|.{0,80}(zabic\s+sie|odebrac\s+sobie\s+zycie|skonczyc\s+ze\s+soba))\b/i,
    /\b(grozi|powiedzial|mowi).{0,60}(zabije\s+mnie|ze\s+mnie\s+zabije)\b/i,
    /\bboje\s+sie.{0,80}(ze\s+mnie\s+zabije|o\s+swoje\s+zycie)\b/i,
    /\b(uderzyl|pobil|dusil|szarpal|kopnal|zgwalcil|bil)\s+(mnie|ja|go)\b/i,
    /\b(zmusil|zmusila)\s+mnie\s+do\s+(seksu|stosunku)\b/i,
    /\bboje\s+sie\s+wrocic\s+do\s+domu\b/i,
    /\b(mam|miewam)\s+mysli\s+samobojcze\b/i,
    /\bmysle\s+o\s+samobojstwie\b/i,
  ];
  return patterns.some((re) => re.test(value));
}

function buildPreview(path: EntryConfig, answers: AnswerMap, openText: string): Preview {
  const scoreMap = new Map<string, number>();
  for (const q of path.questions) for (const opt of q.options) scoreMap.set(`${q.id}:${opt.id}`, opt.score);
  for (const opt of path.checkpoint.options) scoreMap.set(`${path.key}_checkpoint:${opt.id}`, opt.score);
  let total = 0;
  for (const [qid, oid] of Object.entries(answers)) total += scoreMap.get(`${qid}:${oid}`) ?? 0;
  const max = path.questions.length * 3 + 3;
  const intensity = max > 0 ? total / max : 0;
  const textPenalty = openText.trim().length > 180 ? 4 : openText.trim().length > 80 ? 2 : 0;
  const chance = safeNumber(100 - Math.round(intensity * 76) - textPenalty, 8, 88);
  const tension = safeNumber(Math.round(28 + intensity * 59), 14, 96);
  const asymmetry = safeNumber(Math.round(24 + intensity * 62), 12, 97);
  const change = safeNumber(Math.round(74 - intensity * 48), 8, 84);
  
  if (chance <= 24) return { chance, tension, asymmetry, change, tone: "red", badge: "Dużo napięcia i mało stabilnego gruntu", headline: "To nie wygląda jak coś, co samo się uspokoi.", truth: "Najmocniej widać, że trudne momenty nie kończą się realną naprawą. One raczej zostają w tle i wracają przy kolejnej sytuacji.", mirror: "Uczucie może tu nadal być, ale coraz częściej miesza się z czujnością, czekaniem albo próbą utrzymania czegoś, co nie daje spokoju.", summary: "Ten wynik pojawia się, gdy relacja zaczyna kosztować więcej energii, niż daje oparcia: przez chaos, nierówne starania, brak jasności albo powroty do tego samego problemu.", paidTease: "Pełny raport pokaże, co konkretnie trzyma Cię przy tej relacji, co jest nadzieją, a co realną zmianą po drugiej stronie." };
  if (chance <= 49) return { chance, tension, asymmetry, change, tone: "yellow", badge: "Są dobre momenty, ale nie ma pełnego spokoju", headline: "Coś tu jeszcze trzyma. Ale coś innego wyraźnie męczy.", truth: "Nie chodzi tylko o to, że jest trudno. Chodzi o to, że trudność wraca i zaczyna ustawiać całą relację.", mirror: "Widać przywiązanie, ale obok niego widać też zmęczenie, nierówne starania albo niepewność, która trwa zbyt długo, żeby ją zbyć przypadkiem.", summary: "Ten wynik pojawia się, gdy uczucie nadal ma znaczenie, ale nie wystarcza do tego, żeby dać stabilność, jasność i poczucie wzajemności.", paidTease: "Pełny raport pokaże, co jeszcze działa, co już Cię kosztuje i po czym odróżnić prawdziwą zmianę od chwilowego uspokojenia." };
  if (chance <= 69) return { chance, tension, asymmetry, change, tone: "yellow", badge: "Jest potencjał, ale wymaga konkretów", headline: "Tu coś jeszcze ma sens. Ale nie na autopilocie.", truth: "Nie wygląda to jak relacja skazana na powtarzanie tego samego. Ale sama dobra wola nie wystarczy, jeśli po trudnych momentach nie pojawia się inny sposób działania.", mirror: "Są miejsca, na których można budować. Są też takie, których nie warto zostawiać bez nazwania, bo z czasem zwykle robią się większe.", summary: "Ten wynik pojawia się, gdy relacja ma jeszcze realny materiał, ale nie obroni się samym sentymentem, przyzwyczajeniem albo obietnicami.", paidTease: "Pełny raport pokaże, co daje podstawy do nadziei, co ją osłabia i jaki konkretny sygnał warto teraz sprawdzić." };
  return { chance, tension, asymmetry, change, tone: "green", badge: "Widać stabilniejszy grunt", headline: "Tu jest coś, na czym można budować.", truth: "W odpowiedziach jest więcej spójności niż chaosu. To nie wygląda jak relacja trzymana wyłącznie lękiem albo przyzwyczajeniem.", mirror: "To nie znaczy, że wszystko jest idealne. Znaczy tyle, że obok trudności widać kontakt, wzajemność i zdolność wracania do rozmowy.", summary: "Ten wynik pojawia się, gdy relacja ma nie tylko emocje, ale też pewien grunt: odpowiedzialność, rozmowę, konsekwencję albo wspólny kierunek.", paidTease: "Pełny raport pokaże, skąd bierze się ten potencjał i które słabsze miejsca warto sprawdzić, zanim urosną." };
}


function localTone(chance: number): "red" | "yellow" | "green" {
  return chance <= 34 ? "red" : chance <= 64 ? "yellow" : "green";
}

function buildMapBasedPreview(path: EntryConfig, map: RelationshipMapPayload, finalOpenText: string): Preview {
  const fm = map.forceMap || {};
  const burdensList = map.burdens || [];
  const emotionList = map.emotions || [];
  const truths = map.truthCards || [];
  const meLoad = FORCE_MAP_ITEMS.filter((item) => isMeHeavy(fm[item.key])).length;
  const otherLoad = FORCE_MAP_ITEMS.filter((item) => isOtherHeavy(fm[item.key])).length;
  const topBurden = burdensList[0]?.label || "brak jednego dominującego ciężaru";
  const topEmotion = emotionList[0]?.label || "";
  const hasLoop = truths.some((t) => /wracamy|nadziei|czekam|starać|zgasła/i.test(t));
  const hasClarity = hasBurden(burdensList, "brak jasności") || path.key === "uncertain";
  const hasThird = hasBurden(burdensList, "ktoś trzeci") || path.key === "triangle";
  const hasBetrayal = hasBurden(burdensList, "zdrada") || path.key === "betrayal";
  const hasConflict = hasBurden(burdensList, "kłótnie") || path.key === "conflict";
  const hasResource = fm.contactInitiative === "balanced" || fm.repairAfterConflict === "balanced" || otherLoad >= 2;
  const tension = clampScore(30 + burdensList.length * 10 + truths.length * 9 + (hasConflict ? 10 : 0) + (hasBetrayal ? 10 : 0));
  const asymmetry = clampScore(28 + Math.max(meLoad, otherLoad) * 12 + (meLoad >= 3 || otherLoad >= 3 ? 18 : 0));
  const change = clampScore(76 - tension * 0.24 - asymmetry * 0.18 - (hasLoop ? 14 : 0) + (hasResource ? 14 : 0));
  const chance = clampScore(38 + change * 0.46 - tension * 0.24 - asymmetry * 0.16 + (hasResource ? 12 : 0));
  const meText = meLoad >= 3
    ? "Większość odpowiedzialności zbiera się po Twojej stronie: inicjujesz, wracasz do tematu, pilnujesz atmosfery albo czekasz na jasność."
    : otherLoad >= 3
      ? "Druga strona wykonuje ruch, ale trzeba sprawdzić jego trwałość: czy pojawia się regularnie, czy głównie wtedy, gdy sytuacja robi się niewygodna."
      : "Ciężar nie układa się jednoznacznie po jednej stronie. Rozstrzygnie to dopiero powtarzalność zachowań po napięciu.";
  const resourceText = hasResource
    ? "Są też konkretne zasoby: kontakt, próba naprawy albo udział drugiej strony. Mają znaczenie tylko wtedy, gdy utrzymują się poza jedną dobrą rozmową."
    : "Zasoby są na razie zbyt słabo potwierdzone, żeby oprzeć na nich decyzję. Potrzebne jest zachowanie, które pojawi się ponownie bez przypominania.";
  const specificRisk = hasThird
    ? "Obecność osoby trzeciej może wyostrzać braki, które istniały wcześniej. Nie chodzi tylko o tę osobę, ale o to, co przy niej zaczęło być bardziej widoczne."
    : hasClarity
      ? "Najbardziej ryzykowny jest brak jasności. Człowiek zaczyna wtedy dopowiadać sens, łagodzić fakty i czekać na odpowiedź, która powinna pojawić się w zachowaniu."
      : hasLoop
        ? "Najbardziej ryzykowne jest mylenie ulgi po poprawie z realną zmianą. Jeśli po kilku dniach wraca ten sam układ, sama intensywność nie jest dowodem naprawy."
        : "Najważniejsze jest teraz nie szukać winnego, tylko sprawdzić, czy po rozmowie zmienia się zachowanie po obu stronach.";
  const headline = chance >= 70
    ? "Widać tu coś, na czym można budować — ale nie warto pomijać słabszych miejsc."
    : chance >= 45
      ? "Ta relacja nie jest jednoznaczna. Widać i przywiązanie, i koszt."
      : "Tu nie chodzi już tylko o emocje. Widać układ, który zaczyna kosztować.";
  const badge = chance >= 70 ? "są zasoby i punkt do rozmowy" : chance >= 45 ? "potencjał wymaga sprawdzenia w zachowaniu" : "najpierw trzeba odzyskać jasność i bezpieczeństwo decyzji";
  return {
    chance,
    tension,
    asymmetry,
    change,
    tone: localTone(chance),
    badge,
    headline,
    truth: topBurden !== "brak jednego dominującego ciężaru"
      ? `Najmocniej wraca temat: ${topBurden}. To kierunek do sprawdzenia, nie gotowy wyrok.`
      : "Nie ma jednego sygnału, który uczciwie tłumaczyłby całą relację.",
    mirror: specificRisk,
    summary: `${meText} ${topEmotion ? `Najczęściej uruchamia się przy tym ${topEmotion}. ` : ""}${resourceText}`,
    paidTease: "Pełna analiza rozdziela zachowania, interpretacje, kontrsygnały i jeden konkretny ruch dla tej historii.",
    whatUserKnows: meText,
    hiddenInsight: hasResource
      ? "Obraz zmieni powtarzalna inicjatywa i odpowiedzialność po obu stronach, widoczna bez dodatkowego nacisku."
      : "Obraz zmieni dopiero konkretne zachowanie drugiej strony, które powtórzy się bez przypominania i prowadzenia jej za rękę.",
    contradiction: resourceText,
    concreteConclusion: chance >= 70 ? "Nie podejmuj decyzji z lęku. Sprawdź spokojnie, czy dobre elementy są powtarzalne i obustronne." : chance >= 45 ? "Przez najbliższe dni patrz na zachowanie po rozmowie, nie na siłę samej rozmowy." : "Na chwilę przestań ratować sytuację za dwie osoby. Zobaczysz wtedy, czy druga strona wykonuje własny ruch.",
    tensionMeaning: "To nie ocena miłości. To koszt psychiczny: ile czujności, czekania i analizowania uruchamia ta relacja.",
    asymmetryMeaning: "To rozkład ciężaru: kto częściej inicjuje, wraca, naprawia i pilnuje, żeby sprawa się nie rozsypała.",
    changeMeaning: "To pytanie, czy zmiana jest widoczna w zachowaniu bez nacisku, czy tylko pojawia się po rozmowie i presji.",
    premiumSpecific: "Pełny raport pokazuje osobno: co jest zasobem, co Cię wkręca, gdzie można próbować naprawy, a gdzie potrzebne jest zatrzymanie i ochrona siebie.",
  };
}

async function createSession(entryKey: EntryKey): Promise<SessionCreateResponse> {
  const res = await fetch(`${API_BASE}/api/session/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryKey }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się utworzyć sesji.");
  return data;
}

async function updateSession(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/session/update`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się zapisać sesji.");
  return data;
}


async function createAnonymousProfile(payload: any): Promise<AnonymousProfile> {
  const res = await fetch(`${API_BASE}/api/followup/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się zapisać anonimowego profilu.");
  return data;
}

async function recoverAnonymousProfile(token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/followup/recover/${encodeURIComponent(token)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Link powrotu jest nieprawidłowy albo wygasł.");
  return data;
}

async function scheduleAnonymousReminder(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/followup/reminder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się ustawić przypomnienia.");
  return data;
}

async function submitReportFeedback(payload: { sessionToken: string; rating: 1 | 3 | 5; comment?: string }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, reportKind: "full_report_v2" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się zapisać oceny.");
}

async function saveFollowUpCheckin(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/followup/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się zapisać ponownego odczytu.");
  return data;
}


async function startDynamicFollowUp(recoveryToken: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/followup/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recoveryToken }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się rozpocząć ponownego odczytu.");
  return data;
}

async function nextDynamicFollowUp(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/followup/next`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Nie udało się wygenerować kolejnego pytania.");
  return data;
}

async function createCheckout(
  token: string,
  email: string,
  consent: { accepted: boolean; acceptedAt: string }
): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/api/create-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      email,
      consentAccepted: consent.accepted,
      consentAcceptedAt: consent.acceptedAt,
      consentVersion: CHECKOUT_CONSENT_VERSION,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) throw new Error(data?.error || "Błąd inicjalizacji płatności.");
  return { url: data.url };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTemporaryReportStatus(status: number): boolean {
  // 202 = raport w kolejce / processing
  // 402 = webhook Stripe jeszcze nie oznaczył sesji jako PAID
  // 404 = sesja/raport może jeszcze nie być widoczny po powrocie ze Stripe
  // 409/425 = techniczne stany "jeszcze nie teraz", jeśli backend kiedyś je zwróci
  return status === 202 || status === 402 || status === 404 || status === 409 || status === 425;
}

async function fetchSignedReport(accessToken: string, accessExp: string, accessSig: string): Promise<FullReport> {
  const MAX_ATTEMPTS = 60; // do 3 minut dla linku z maila
  const INTERVAL_MS = 3000;

  let lastMessage = "Raport nie jest jeszcze dostępny.";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const res = await fetch(
      `${API_BASE}/api/report/signed?token=${encodeURIComponent(accessToken)}&exp=${encodeURIComponent(accessExp)}&sig=${encodeURIComponent(accessSig)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.report) {
      return data.report as FullReport;
    }

    lastMessage = data?.message || data?.error || lastMessage;

    if (isTemporaryReportStatus(res.status)) {
      await wait(INTERVAL_MS);
      continue;
    }

    throw new Error(lastMessage || "Link wygasł albo raport nie jest dostępny.");
  }

  throw new Error(`${lastMessage} Spróbuj odświeżyć link za chwilę.`);
}


function normalizeSectionKey(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findSectionText(sections: FullReportSection[], key: string, fallback = ""): string {
  const normalizedKey = normalizeSectionKey(key);
  const aliases: Record<string, string[]> = {
    "co uzytkownik sam juz wie": ["co juz wiesz", "to juz wiesz", "co jest jasne"],
    "co wynika ale nie zostalo powiedziane wprost": ["co z tego wynika", "czego mogles nie nazwac", "co jest pod spodem"],
    "najwieksza sprzecznosc": ["gdzie jest rozjazd", "co sie nie sklada", "najwiekszy rozjazd"],
    "jeden konkretny wniosek": ["jeden wniosek", "najwazniejszy wniosek", "co warto zabrac"],
    "co dokladnie daje premium": ["co daje pelny raport", "co dostaniesz w pelnym raporcie", "co bedzie dalej"],
    "metryka napiecie": ["napiecie", "koszt emocjonalny"],
    "metryka asymetria": ["ciezar po stronach", "nierowny ciezar", "kto niesie wiecej"],
    "metryka zmiana": ["szansa na zmiane", "realnosc zmiany", "czy widac zmiane"],
  };
  const keys = [normalizedKey, ...(aliases[normalizedKey] || []).map(normalizeSectionKey)];
  const found = sections.find((section) => {
    const title = normalizeSectionKey(section.title || "");
    return keys.some((candidate) => title.includes(candidate) || candidate.includes(title));
  });
  return (found?.text || fallback || "").trim();
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 25000): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function fetchPreviewFromAPI(token: string, path: EntryConfig, answers: AnswerMap, openText: string, relationshipMap?: RelationshipMapPayload): Promise<Preview> {
  const answersArr = Object.entries(answers).map(([qid, oid]) => { const q = path.questions.find((x) => x.id === qid); const opt = q?.options.find((o) => o.id === oid); return { q: q?.text || qid, a: opt?.label || oid }; });
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, path: path.key, mode: "soft", answers: answersArr, openText, customDescription: openText, relationshipMap }) }, 25000);
    const data = await res.json().catch(() => ({}));
    if (data?.crisis) throw new Error("__CRISIS__");
    if (data?.ok && data?.preview) {
      const p = data.preview;
      const tension = typeof p.tensionPercent === "number" ? p.tensionPercent : 50;
      const asymmetry = typeof p.driftPercent === "number" ? p.driftPercent : 50;
      const change = typeof p.rebuildPercent === "number" ? p.rebuildPercent : 50;
      const chance = Math.round(100 - tension * 0.5 - asymmetry * 0.3 + change * 0.2);
      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
      const sections: FullReportSection[] = Array.isArray(p.sections) ? p.sections : [];
      const firstSection = sections[0];
      const evidence = Array.isArray(firstSection?.evidence) && firstSection.evidence.length
        ? firstSection.evidence
        : Array.isArray(p.evidenceSummary) ? p.evidenceSummary : [];
      const whatUserKnows = evidence.slice(0, 3).map((item: string) => asSentence(item)).join(" ") || firstSection?.text || "W odpowiedziach nie ma jeszcze dość konkretów, żeby postawić mocny wniosek.";
      const hiddenInsight = firstSection?.whatCouldChange || "Powtarzalne zachowanie po rozmowie, widoczne bez przypominania i nacisku.";
      const contradiction = firstSection?.counterSignal || "Jedna perspektywa nie pozwala rozstrzygnąć intencji drugiej osoby.";
      const concreteConclusion = p.closing || firstSection?.whatCouldChange || "Sprawdź jeden konkretny fakt w zachowaniu, nie kolejną deklarację.";
      const premiumSpecific = findSectionText(sections, "co dokladnie daje premium", "Pełny raport rozdziela fakty, hipotezy, kontrsygnały i konkretny ruch dla tej historii.");
      return {
        chance: clamp(chance, 5, 95),
        tension: clamp(tension, 5, 97),
        asymmetry: clamp(asymmetry, 5, 97),
        change: clamp(change, 5, 90),
        tone: chance <= 30 ? "red" : chance <= 60 ? "yellow" : "green",
        badge: p.subheadline || "Analiza relacji",
        headline: p.headline || "Wynik gotowy.",
        truth: p.previewLine || "Najważniejszy mechanizm da się nazwać, ale nie należy go mylić z wyrokiem.",
        mirror: p.subheadline || firstSection?.text || "Ten odczyt opiera się na zachowaniach, nie na próbie zgadywania intencji.",
        summary: firstSection?.text || whatUserKnows,
        paidTease: premiumSpecific,
        whatUserKnows,
        hiddenInsight,
        contradiction,
        concreteConclusion,
        tensionMeaning: findSectionText(sections, "metryka napiecie"),
        asymmetryMeaning: findSectionText(sections, "metryka asymetria"),
        changeMeaning: findSectionText(sections, "metryka zmiana"),
        premiumSpecific,
      } as Preview;
    }
  } catch (e: any) {
    if (e?.message === "__CRISIS__") throw e;
  }

  const answerPreview = buildPreview(path, answers, openText);
  if (!relationshipMap) return answerPreview;

  const mapPreview = buildMapBasedPreview(path, relationshipMap, openText);
  const blendedChance = Math.round((answerPreview.chance + mapPreview.chance * 2) / 3);
  return {
    ...mapPreview,
    chance: blendedChance,
    tension: Math.round((answerPreview.tension + mapPreview.tension * 2) / 3),
    asymmetry: Math.round((answerPreview.asymmetry + mapPreview.asymmetry * 2) / 3),
    change: Math.round((answerPreview.change + mapPreview.change * 2) / 3),
    tone: localTone(blendedChance),
  };
}


function dominantPreviewAxis(preview: Preview): string {
  const unresolved = 100 - preview.change;
  if (preview.tension >= preview.asymmetry && preview.tension >= unresolved) return "napięcie";
  if (preview.asymmetry >= preview.tension && preview.asymmetry >= unresolved) return "asymetria";
  return "realność zmiany";
}

function buildPreviewMap(path: EntryConfig, preview: Preview) {
  const axis = dominantPreviewAxis(preview);
  const riskText = preview.change <= 30
    ? "Największe ryzyko jest takie, że chwilowe uspokojenie po rozmowie może wyglądać jak zmiana, choć nie musi niczego przesuwać w zachowaniu."
    : preview.change <= 55
      ? "Największe ryzyko leży w tym, że część rzeczy jeszcze działa, ale nie wiadomo, czy wystarczy to do trwałej zmiany."
      : "Największe ryzyko nie polega na braku potencjału, tylko na tym, że słabsze miejsca zostaną zlekceważone, bo wynik wygląda względnie dobrze.";
  const axisText = axis === "napięcie"
    ? "Najmocniej wybija się napięcie: relacja nie daje prostego spokoju, tylko wymusza czujność, reakcję albo obronę."
    : axis === "asymetria"
      ? "Najmocniej wybija się asymetria: widać różnicę między tym, kto niesie ciężar relacji, a kto częściej zostawia rzeczy bez domknięcia."
      : "Najmocniej wybija się pytanie o realność zmiany: nie chodzi o deklaracje, tylko o to, czy zachowanie rzeczywiście przesuwa relację w lepsze miejsce.";
  const pathQuestion: Record<EntryKey, string> = {
    unease: "Czy ten niepokój jest sygnałem konkretnego pęknięcia, czy sumą wielu drobnych rzeczy, których nie da się już ignorować?",
    betrayal: "Czy odbudowa zaufania dzieje się realnie, czy tylko temat zdrady został zmęczony i wypchnięty z rozmów?",
    uncertain: "Czy brak jasności jest przejściowy, czy stał się wygodnym układem, w którym jedna osoba czeka, a druga nie musi decydować?",
    asymmetry: "Czy to jeszcze chwilowa nierówność, czy relacja zaczęła działać głównie dzięki Twojemu wysiłkowi?",
    conflict: "Czy kłótnie rozwiązują problem, czy tylko zostawiają ciszę, dystans i kolejny powód do następnej walki?",
    stagnation: "Czy to spokojniejszy etap relacji, czy moment, w którym obie strony przestały już naprawdę po siebie sięgać?",
    returning: "Czy chcesz wrócić do tej osoby, czy do wersji historii, która wreszcie miałaby dobre zakończenie?",
    triangle: "Czy trzecia osoba jest realną odpowiedzią, czy tylko pokazuje brak, który istniał wcześniej?",
    loop: "Czy wracacie do miłości, czy do znajomego cyklu napięcia, ulgi i kolejnego rozczarowania?",
  };
  return [
    { label: "Najmocniejszy sygnał", text: axisText },
    { label: "Największe ryzyko", text: riskText },
    { label: "Pytanie, którego jeszcze nie widać w wyniku", text: pathQuestion[path.key] },
    { label: "Co wymaga pogłębienia", text: "Pełny raport rozdziela fakty, nadzieję, koszt emocjonalny i realną zmianę, zamiast sprowadzać historię do jednego wskaźnika." },
  ];
}

function buildPremiumSamples(path: EntryConfig, preview: Preview) {
  const mechanism = dominantPreviewAxis(preview);
  const conflictSample = path.key === "conflict" ? "czy kłótnia jest próbą rozwiązania problemu, czy sposobem walki o wpływ, uwagę albo kontrolę" : "jaki wzorzec naprawdę organizuje tę relację i dlaczego wraca mimo rozmów";
  return [
    { title: "Co tu naprawdę działa", text: mechanism === "napięcie" ? conflictSample : "czy główny ciężar leży w napięciu, braku jasności, nierównych staraniach, chwilowych poprawach czy braku konkretnej zmiany" },
    { title: "Kto niesie więcej", text: "kto częściej inicjuje, naprawia, czeka, wraca do rozmowy i zostaje z napięciem po trudnych momentach" },
    { title: "Co wygląda jak poprawa", text: "czy po trudnych momentach naprawdę zmienia się zachowanie, czy tylko na chwilę robi się spokojniej" },
  ];
}

function LogoBlock() {
  return (
    <div className="ctms-logo-wrap">
      <div className="ctms-logo-mark" />
      <div>
        <div className="ctms-logo">CzyToMaSens<span>.</span></div>
        <div className="ctms-logo-sub">PRYWATNA ANALIZA RELACJI</div>
      </div>
    </div>
  );
}

function Glass({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`ctms-glass ${className}`.trim()} style={style}>{children}</div>;
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button className="ctms-btn ctms-btn-primary" onClick={onClick} disabled={disabled}>{children}</button>;
}

function GhostButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button className="ctms-btn ctms-btn-ghost" onClick={onClick} disabled={disabled}>{children}</button>;
}

function PremiumBadge({ preview }: { preview: Preview }) {
  const color = preview.tone === "red" ? BRAND.danger : preview.tone === "green" ? BRAND.success : BRAND.goldSoft;
  const scoreExplanation = "To syntetyczny pierwszy odczyt całego układu. Nie jest prognozą ani matematyczną oceną przyszłości relacji.";
  return (
    <Glass className="ctms-preview-badge">
      <div className="ctms-kicker">NA ILE TO MA SENS</div>
      <div className="ctms-preview-score" style={{ color }}>{preview.chance}%</div>
      <div className="ctms-preview-label">{preview.badge}</div>
      <div className="ctms-preview-truth">{preview.truth}</div>
      <div className="ctms-preview-mirror">{preview.mirror}</div>
      <div className="ctms-score-explanation">{scoreExplanation}</div>
    </Glass>
  );
}

function RelationshipForcePortraitCard({ portrait }: { portrait: RelationshipPortrait["forceField"] }) {
  return (
    <Glass className="relationship-portrait relationship-force-portrait">
      <div className="portrait-header">
        <div>
          <div className="eyebrow">PORTRET RELACJI · UKŁAD SIŁ</div>
          <h3>{portrait.headline}</h3>
        </div>
        <span className="portrait-signature">CTMS / 01</span>
      </div>
      <div className={`force-field force-field--${portrait.relationState}`}>
        <div className={`portrait-node portrait-node--user state-${portrait.userState}`}>
          <span>TY</span>
          <strong>{portrait.userLabel}</strong>
        </div>
        <div className={`force-connection force-connection--left state-${portrait.relationState}`} aria-hidden="true"><i /></div>
        <div className={`portrait-node portrait-node--relation state-${portrait.relationState}`}>
          <span>RELACJA</span>
          <strong>{portrait.relationLabel}</strong>
          <b aria-hidden="true" />
        </div>
        <div className={`force-connection force-connection--right state-${portrait.relationState}`} aria-hidden="true"><i /></div>
        <div className={`portrait-node portrait-node--other state-${portrait.otherState}`}>
          <span>DRUGA OSOBA</span>
          <strong>{portrait.otherLabel}</strong>
        </div>
      </div>
      <p className="portrait-insight">{portrait.insight}</p>
    </Glass>
  );
}

function TruthLinePortraitCard({ portrait }: { portrait: RelationshipPortrait["truthLine"] }) {
  const items = [
    { label: "Deklaracje", value: portrait.declarationsLabel, state: portrait.declarationsState },
    { label: "Zachowanie", value: portrait.behaviorLabel, state: portrait.behaviorState },
    { label: "Realny kierunek", value: portrait.directionLabel, state: portrait.directionState },
  ];
  return (
    <Glass className="relationship-portrait truth-line-portrait">
      <div className="portrait-header">
        <div>
          <div className="eyebrow">PORTRET RELACJI · LINIA PRAWDY</div>
          <h3>{portrait.headline}</h3>
        </div>
        <span className="portrait-signature">CTMS / 02</span>
      </div>
      <div className={`truth-line truth-line--${portrait.directionState}`}>
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            <div className={`truth-stop state-${item.state}`}>
              <span className="truth-stop-index">0{index + 1}</span>
              <i aria-hidden="true" />
              <div><span>{item.label}</span><strong>{item.value}</strong></div>
            </div>
            {index < items.length - 1 && <div className="truth-connector" aria-hidden="true"><b /></div>}
          </React.Fragment>
        ))}
      </div>
      <p className="portrait-insight">{portrait.insight}</p>
    </Glass>
  );
}

function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem("ctms_cookies_accepted")) setVisible(true); } catch {}
  }, []);
  const accept = () => {
    try { localStorage.setItem("ctms_cookies_accepted", "1"); } catch {}
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, background: "rgba(10,10,10,0.97)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px clamp(18px,3vw,36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
      <p style={{ margin: 0, fontSize: "13px", color: "#A8A099", maxWidth: "700px", lineHeight: 1.6 }}>
        Ta strona używa plików cookies wyłącznie do utrzymania sesji i poprawnego działania. Nie stosujemy cookies reklamowych ani śledzących.
      </p>
      <button onClick={accept} style={{ background: "#C5A059", color: "#050505", border: "none", borderRadius: "6px", padding: "10px 20px", fontWeight: 600, fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}>
        Rozumiem
      </button>
    </div>
  );
}

const PROCESSING_MESSAGES = [
  "Porządkuję mapę relacji",
  "Sprawdzam, co wraca po napięciu",
  "Oddzielam deklaracje od zachowania",
  "Szukam zasobów i miejsc ryzyka",
  "Przygotowuję pierwszy odczyt",
];

function ProcessingScreen() {
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [dots, setDots] = React.useState(0);
  React.useEffect(() => {
    const msgTimer = setInterval(() => { setMsgIndex((v) => (v + 1) % PROCESSING_MESSAGES.length); }, 3500);
    const dotTimer = setInterval(() => { setDots((v) => (v + 1) % 4); }, 500);
    return () => { clearInterval(msgTimer); clearInterval(dotTimer); };
  }, []);
  return (
    <div className="loading-wrap">
      <Glass className="loading-panel">
        <div className="processing-orb">
          <div className="processing-ring" />
          <div className="processing-ring processing-ring--2" />
          <div className="processing-dot" />
        </div>
        <h2 style={{ marginBottom: "12px", fontSize: "clamp(20px,4vw,26px)" }}>Przygotowuję wynik</h2>
        <div className="processing-message">{PROCESSING_MESSAGES[msgIndex]}{".".repeat(dots)}</div>
        <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--muted)", lineHeight: 1.6 }}>To zajmuje chwilę. Nie zamykaj karty.</p>
        <div className="processing-bar"><div className="processing-bar-fill" /></div>
      </Glass>
    </div>
  );
}

const SITE_URL = "https://czytomasens.pl";

const LEGAL_ROUTES: Record<string, LegalKey> = {
  "/regulamin": "regulamin",
  "/polityka-prywatnosci": "prywatnosc",
  "/rodo": "rodo",
  "/kontakt": "kontakt",
};

function normalizePath(value: string): string {
  const path = value.split("?")[0].split("#")[0];
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

function ensureMeta(selector: string, create: () => HTMLMetaElement): HTMLMetaElement {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = create();
    document.head.appendChild(tag);
  }
  return tag;
}

function setMetaName(name: string, content: string) {
  const tag = ensureMeta(`meta[name="${name}"]`, () => {
    const element = document.createElement("meta");
    element.setAttribute("name", name);
    return element;
  });
  tag.setAttribute("content", content);
}

function setMetaProperty(property: string, content: string) {
  const tag = ensureMeta(`meta[property="${property}"]`, () => {
    const element = document.createElement("meta");
    element.setAttribute("property", property);
    return element;
  });
  tag.setAttribute("content", content);
}

function setCanonical(path: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", `${SITE_URL}${path === "/" ? "" : path}`);
}

function setStructuredData(id: string, data: Record<string, unknown>) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export default function App() {
  const [stage, setStage] = useState<Stage>("landing");
  const [followUpDueAt, setFollowUpDueAt] = useState<string>(() => { try { return JSON.parse(localStorage.getItem(FOLLOWUP_KEY) || "{}")?.dueAt || ""; } catch { return ""; } });

  const [anonymousProfile, setAnonymousProfile] = useState<AnonymousProfile | null>(() => {
    try { return JSON.parse(localStorage.getItem(ANON_PROFILE_KEY) || "null"); } catch { return null; }
  });
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState<FollowUpAnswerMap>({});
  const [followUpDraft, setFollowUpDraft] = useState("");
  const [followUpResult, setFollowUpResult] = useState<FollowUpResult | null>(() => {
    try { return JSON.parse(localStorage.getItem(FOLLOWUP_RESULT_KEY) || "null"); } catch { return null; }
  });
  const [followUpEmail, setFollowUpEmail] = useState("");
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [followUpSaving, setFollowUpSaving] = useState(false);
  const [dynamicFollowUpQuestion, setDynamicFollowUpQuestion] = useState<DynamicFollowUpQuestion | null>(null);
  const [dynamicFollowUpHistory, setDynamicFollowUpHistory] = useState<DynamicFollowUpExchange[]>([]);
  const [dynamicFollowUpTeaser, setDynamicFollowUpTeaser] = useState("");
  const [dynamicFollowUpElapsedDays, setDynamicFollowUpElapsedDays] = useState(0);
  const [followUpCheckoutBusy, setFollowUpCheckoutBusy] = useState(false);
  const [followUpPurchaseConsent, setFollowUpPurchaseConsent] = useState(false);
  const [reportFeedback, setReportFeedback] = useState<1 | 3 | 5 | null>(null);
  const [reportFeedbackMessage, setReportFeedbackMessage] = useState("");

  const [selectedPath, setSelectedPath] = useState<EntryKey | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [openText, setOpenText] = useState("");
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisConsent, setAnalysisConsent] = useState(false);
  const [analysisConsentAcceptedAt, setAnalysisConsentAcceptedAt] = useState("");
  const [purchaseConsent, setPurchaseConsent] = useState(false);
  const [reportAccess, setReportAccess] = useState<ReportAccess | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(REPORT_ACCESS_KEY) || "null"); } catch { return null; }
  });
  const [legalOpen, setLegalOpen] = useState<LegalKey>(null);
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewBusy, setInterviewBusy] = useState(false);
  const [forceMap, setForceMap] = useState<ForceMap>({});
  const [burdens, setBurdens] = useState<BurdenItem[]>([]);
  const [emotions, setEmotions] = useState<EmotionItem[]>([]);
  const [truthCards, setTruthCards] = useState<string[]>([]);
  const [relationshipNote, setRelationshipNote] = useState("");
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<ClarificationAnswerMap>({});
  const [clarificationIndex, setClarificationIndex] = useState(0);
  const [clarificationDraft, setClarificationDraft] = useState("");
  const [routePath, setRoutePath] = useState(() => normalizePath(typeof window !== "undefined" ? window.location.pathname : "/"));

  const articleSlugFromRoute = routePath.startsWith("/artykuly/") ? decodeURIComponent(routePath.replace("/artykuly/", "")) : null;
  const routeArticle = articleSlugFromRoute ? ARTICLES.find((article) => article.slug === articleSlugFromRoute) : null;
  const routeLegalKey = LEGAL_ROUTES[routePath] || null;
  const isPublicContentRoute = routePath === "/artykuly" || Boolean(routeArticle) || Boolean(routeLegalKey);

  const navigateTo = (nextPath: string) => {
    const cleanPath = normalizePath(nextPath);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", cleanPath);
      setRoutePath(cleanPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const path = useMemo(() => ENTRY_CONFIGS.find((x) => x.key === selectedPath) || null, [selectedPath]);
  const currentQuestion = path?.questions[questionIndex] || null;

  useEffect(() => {
    const handlePopState = () => setRoutePath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPublicContentRoute) return;

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const raf = window.requestAnimationFrame(scrollToTop);
    return () => window.cancelAnimationFrame(raf);
  }, [stage, questionIndex, clarificationIndex, isPublicContentRoute]);

  useEffect(() => {
    const articleTitle = routeArticle?.seoTitle || (routeArticle ? `${routeArticle.title} | CzyToMaSens` : "");
    const articleDescription = routeArticle?.seoDescription || routeArticle?.lead || "";
    const legalTitle = routeLegalKey ? `${LEGAL_CONTENT[routeLegalKey].title} | CzyToMaSens` : "";
    const legalDescription = routeLegalKey ? `Dokument: ${LEGAL_CONTENT[routeLegalKey].title} serwisu CzyToMaSens.` : "";

    const title = routeArticle
      ? articleTitle
      : routePath === "/artykuly"
        ? "Artykuły o relacjach, związkach i schematach | CzyToMaSens"
        : routeLegalKey
          ? legalTitle
          : "CzyToMaSens | Prywatna analiza relacji";

    const description = routeArticle
      ? articleDescription
      : routePath === "/artykuly"
        ? "Artykuły o relacjach, powrotach, niepewności, bliskości i sytuacjach, które od środka trudno nazwać."
        : routeLegalKey
          ? legalDescription
          : "Prywatna analiza relacji. Zobacz, co naprawdę wraca między Wami, kto niesie większy ciężar i czy ta relacja ma jeszcze sens.";

    document.title = title;
    setMetaName("description", description);
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:type", routeArticle ? "article" : "website");
    setMetaProperty("og:url", `${SITE_URL}${routePath === "/" ? "" : routePath}`);
    setMetaName("robots", "index,follow");
    setCanonical(routePath);

    if (routeArticle) {
      setStructuredData("ctms-jsonld", {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: routeArticle.title,
        description,
        url: `${SITE_URL}/artykuly/${routeArticle.slug}`,
        mainEntityOfPage: `${SITE_URL}/artykuly/${routeArticle.slug}`,
        publisher: { "@type": "Organization", name: "CzyToMaSens" },
      });
    } else {
      setStructuredData("ctms-jsonld", {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "CzyToMaSens",
        url: SITE_URL,
      });
    }
  }, [routePath, routeArticle, routeLegalKey]);

  useEffect(() => {
    if (!isPublicContentRoute) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!parsed.savedAt || Date.now() - Number(parsed.savedAt) > STORAGE_TTL_MS) {
            localStorage.removeItem(STORAGE_KEY);
            throw new Error("LOCAL_STATE_EXPIRED");
          }
          const restoredStage: Stage = parsed.stage === "processing" ? (parsed.preview ? "preview" : "landing") : (parsed.stage === "consent" ? "entry" : (parsed.stage === "short_note" ? "truth_cards" : (parsed.stage || "landing")));
          setStage(restoredStage);
          setSelectedPath(parsed.selectedPath || null);
          setQuestionIndex(parsed.questionIndex || 0);
          setAnswers(parsed.answers || {});
          setOpenText(parsed.openText || "");
          setEmail(parsed.email || "");
          setPreview(parsed.preview || null);
          setFullReport(parsed.fullReport || null);
          setSessionToken(parsed.sessionToken || null);
          setAnalysisConsent(Boolean(parsed.analysisConsent));
          setAnalysisConsentAcceptedAt(parsed.analysisConsentAcceptedAt || "");
          setInterviewState(parsed.interviewState || null);
          setForceMap(parsed.forceMap || {});
          setBurdens(parsed.burdens || []);
          setEmotions(parsed.emotions || []);
          setTruthCards(parsed.truthCards || []);
          setRelationshipNote(parsed.relationshipNote || "");
          setClarificationQuestions(parsed.clarificationQuestions || []);
          setClarificationAnswers(parsed.clarificationAnswers || {});
          setClarificationIndex(parsed.clarificationIndex || 0);
          setClarificationDraft(parsed.clarificationDraft || "");
          if (parsed.followUpResult) setFollowUpResult(parsed.followUpResult);
        }
      } catch {}
    }

    const params = new URLSearchParams(window.location.search);
    const recovery = params.get("recovery");
    if (recovery) {
      setBusy(true);
      setError(null);
      recoverAnonymousProfile(recovery)
        .then((data) => {
          if (data?.profile?.fullReport) setFullReport(data.profile.fullReport);
          if (data?.profile?.sessionToken) setSessionToken(data.profile.sessionToken);
          if (data?.profile?.selectedPath) setSelectedPath(data.profile.selectedPath);
          if (data?.profile?.email) {
            setEmail(data.profile.email);
            setFollowUpEmail(data.profile.email);
          }
          const profile = {
            recoveryToken: recovery,
            recoveryUrl: `${window.location.origin}/?recovery=${encodeURIComponent(recovery)}`,
            createdAt: data?.profile?.createdAt,
            dueAt: data?.profile?.reminderDueAt,
            email: data?.profile?.email,
          };
          setAnonymousProfile(profile);
          try { localStorage.setItem(ANON_PROFILE_KEY, JSON.stringify(profile)); } catch {}
          setStage("paid");
          setFollowUpOpen(true);
        })
        .catch((e: any) => {
          setStage("error");
          setError(friendlyError(e, "Nie udało się przywrócić analizy z linku."));
        })
        .finally(() => {
          setBusy(false);
          window.history.replaceState({}, "", window.location.pathname);
        });
      return;
    }

    const success = params.get("success");
    const token = params.get("token");
    const cancel = params.get("cancel") || params.get("cancelled") || params.get("canceled");
    const accessToken = params.get("access_token");
    const accessExp = params.get("exp");
    const accessSig = params.get("sig");

    if (accessToken && accessExp && accessSig) {
      const nextAccess = { token: accessToken, exp: accessExp, sig: accessSig };
      setReportAccess(nextAccess);
      try { sessionStorage.setItem(REPORT_ACCESS_KEY, JSON.stringify(nextAccess)); } catch {}
      setBusy(true);
      setError(null);
      setStage("processing");
      setSessionToken(accessToken);

      fetchSignedReport(accessToken, accessExp, accessSig)
        .then((report) => {
          setFullReport(report);
          setSessionToken(accessToken);
          setStage("paid");
          setBusy(false);
        })
        .catch((e: any) => {
          setBusy(false);
          setStage("error");
          setError(friendlyError(e, "Link do raportu nie jest jeszcze dostępny albo wygasł. Spróbuj ponownie za chwilę."));
        })
        .finally(() => {
          window.history.replaceState({}, "", window.location.pathname);
        });

      return;
    }

    if (cancel === "1" || cancel === "true") {
      setBusy(false);
      setStage("preview");
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (success === "1" && token) {
      setSessionToken(token);
      setBusy(false);
      setStage("error");
      setError("Płatność została przyjęta. Ze względów bezpieczeństwa pełny raport otworzysz z czasowego linku wysłanego na podany adres e-mail.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), stage, selectedPath, questionIndex, answers, openText, email, preview, fullReport, sessionToken, analysisConsent, analysisConsentAcceptedAt, interviewState, forceMap, burdens, emotions, truthCards, relationshipNote, clarificationQuestions, clarificationAnswers, clarificationIndex, clarificationDraft, followUpResult }));
  }, [stage, selectedPath, questionIndex, answers, openText, email, preview, fullReport, sessionToken, analysisConsent, analysisConsentAcceptedAt, interviewState, forceMap, burdens, emotions, truthCards, relationshipNote, clarificationQuestions, clarificationAnswers, clarificationIndex, clarificationDraft]);

  const ensureSession = async (entryKey: EntryKey): Promise<string> => {
    if (sessionToken) return sessionToken;
    const data = await createSession(entryKey);
    const nextToken = data?.token || data?.sessionId || null;
    if (!nextToken) throw new Error("Nie udało się uzyskać tokenu sesji.");
    setSessionToken(nextToken); return nextToken;
  };



  useEffect(() => {
    if (stage !== "paid" || !fullReport || !sessionToken) return;
    if (anonymousProfile?.recoveryToken) return;

    const localId = (() => {
      try {
        const existing = localStorage.getItem("ctms_local_anonymous_id");
        if (existing) return existing;
        const next = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `ctms_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem("ctms_local_anonymous_id", next);
        return next;
      } catch {
        return `ctms_${Date.now()}`;
      }
    })();

    createAnonymousProfile({
      sessionToken,
      localId,
      email: email || null,
      selectedPath,
      createdAt: new Date().toISOString(),
      baseline: {
        tensionPercent: fullReport.tensionPercent,
        driftPercent: fullReport.driftPercent,
        rebuildPercent: fullReport.rebuildPercent,
      },
      fullReport,
    })
      .then((profile) => {
        setAnonymousProfile(profile);
        if (profile.email) setFollowUpEmail(profile.email);
        try { localStorage.setItem(ANON_PROFILE_KEY, JSON.stringify(profile)); } catch {}
      })
      .catch(() => {
        // Zapis lokalny nadal działa. Backend może być chwilowo niedostępny.
      });
  }, [stage, fullReport, sessionToken, anonymousProfile?.recoveryToken, email, selectedPath]);

  const scheduleFollowUp = async () => {
    const due = new Date();
    due.setDate(due.getDate() + FOLLOWUP_PLAN_DAYS[0]);
    const dueAt = due.toISOString();
    setFollowUpSaving(true);
    setFollowUpMessage("");

    try {
      let profile = anonymousProfile;
      if (!profile?.recoveryToken && sessionToken && fullReport) {
        profile = await createAnonymousProfile({
          sessionToken,
          email: followUpEmail || email || null,
          selectedPath,
          createdAt: new Date().toISOString(),
          baseline: {
            tensionPercent: fullReport.tensionPercent,
            driftPercent: fullReport.driftPercent,
            rebuildPercent: fullReport.rebuildPercent,
          },
          fullReport,
        });
        setAnonymousProfile(profile);
        try { localStorage.setItem(ANON_PROFILE_KEY, JSON.stringify(profile)); } catch {}
      }

      if (profile?.recoveryToken && (followUpEmail || email)) {
        await scheduleAnonymousReminder({
          recoveryToken: profile.recoveryToken,
          email: followUpEmail || email,
          days: [...FOLLOWUP_PLAN_DAYS],
        });
      }

      const payload = {
        dueAt,
        createdAt: anonymousProfile?.createdAt || new Date().toISOString(),
        sessionToken,
        selectedPath,
        headline: fullReport?.headline || preview?.headline || "",
        recoveryToken: profile?.recoveryToken || null,
      };
      try { localStorage.setItem(FOLLOWUP_KEY, JSON.stringify(payload)); } catch {}
      setFollowUpDueAt(dueAt);

      const recoveryUrl = profile?.recoveryUrl || (profile?.recoveryToken ? `${window.location.origin}/?recovery=${encodeURIComponent(profile.recoveryToken)}` : window.location.origin);
      const calendarEvents = FOLLOWUP_PLAN_DAYS.map((days) => {
        const eventStart = new Date();
        eventStart.setDate(eventStart.getDate() + days);
        const eventEnd = new Date(eventStart.getTime() + 30 * 60 * 1000);
        const start = eventStart.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
        const end = eventEnd.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
        return [
          "BEGIN:VEVENT",
          `UID:ctms-${sessionToken || "private"}-${days}@czytomasens.pl`,
          `DTSTART:${start}`,
          `DTEND:${end}`,
          `SUMMARY:Ponowny odczyt relacji po ${days} dniach — CzyToMaSens`,
          `DESCRIPTION:Sprawdź po ${days} dniach, co realnie zmieniło się w zachowaniu i czy zmiana się utrzymuje.`,
          `URL:${recoveryUrl}`,
          "END:VEVENT",
        ].join("\r\n");
      });
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//CzyToMaSens//Ponowny odczyt//PL",
        ...calendarEvents,
        "END:VCALENDAR",
      ].join("\r\n");
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "czytomasens-powrot-7-i-21-dni.ics";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setFollowUpMessage(
        followUpEmail || email
          ? "Gotowe. Przypomnienia wyślemy po 7 i 21 dniach, a link pozwoli otworzyć analizę także na innym urządzeniu."
          : `Termin zapisany. Dodaj e-mail, aby dostać link działający także na innym urządzeniu.`
      );
    } catch (e: any) {
      setFollowUpMessage(friendlyError(e, "Nie udało się ustawić przypomnienia. Zapis na tym urządzeniu nadal pozostaje aktywny."));
    } finally {
      setFollowUpSaving(false);
    }
  };

  const ensureAnonymousProfileForFollowUp = async () => {
    if (anonymousProfile?.recoveryToken) return anonymousProfile;
    if (!sessionToken || !fullReport) throw new Error("Brak zapisanej analizy do porównania.");
    const profile = await createAnonymousProfile({
      sessionToken,
      email: followUpEmail || email || null,
      selectedPath,
      createdAt: new Date().toISOString(),
      baseline: {
        tensionPercent: fullReport.tensionPercent,
        driftPercent: fullReport.driftPercent,
        rebuildPercent: fullReport.rebuildPercent,
      },
      fullReport,
    });
    setAnonymousProfile(profile);
    try { localStorage.setItem(ANON_PROFILE_KEY, JSON.stringify(profile)); } catch {}
    return profile;
  };

  const startFollowUpNow = async () => {
    setFollowUpSaving(true);
    setFollowUpMessage("");
    setDynamicFollowUpTeaser("");
    setDynamicFollowUpHistory([]);
    try {
      const profile = await ensureAnonymousProfileForFollowUp();
      const data = await startDynamicFollowUp(profile.recoveryToken);
      if (data?.crisis) {
        setFollowUpOpen(false);
        setStage("crisis");
        return;
      }
      setDynamicFollowUpElapsedDays(Number(data.elapsedDays || 0));
      setDynamicFollowUpQuestion({ lead: data.lead, question: data.question, open: Boolean(data.open), options: data.options || [], finished: false });
      setFollowUpDraft("");
      setFollowUpOpen(true);
      window.setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 50);
    } catch (e: any) {
      setFollowUpMessage(friendlyError(e, "Nie udało się rozpocząć ponownego odczytu."));
    } finally {
      setFollowUpSaving(false);
    }
  };

  const answerFollowUp = async (value?: string) => {
    const question = dynamicFollowUpQuestion;
    if (!question) return;
    const answerValue = question.open ? followUpDraft.trim() : String(value || "");
    if (!answerValue) return;
    const answerLabel = question.open
      ? answerValue
      : question.options.find((option) => option.id === answerValue)?.label || answerValue;
    const nextHistory = [...dynamicFollowUpHistory, { question: question.question, answer: answerLabel }];
    setDynamicFollowUpHistory(nextHistory);
    setFollowUpDraft("");
    setFollowUpSaving(true);
    try {
      const profile = await ensureAnonymousProfileForFollowUp();
      const data = await nextDynamicFollowUp({ recoveryToken: profile.recoveryToken, conversation: nextHistory, latestAnswer: answerLabel });
      if (data?.crisis) {
        setFollowUpOpen(false);
        setDynamicFollowUpQuestion(null);
        setStage("crisis");
        return;
      }
      if (data.finished) {
        setDynamicFollowUpTeaser(data.teaser || "Od poprzedniego odczytu pojawiły się sygnały, które wymagają ponownego porównania całej historii.");
        setDynamicFollowUpQuestion(null);
        setFollowUpOpen(false);
      } else {
        setDynamicFollowUpQuestion({ lead: data.lead, question: data.question, open: Boolean(data.open), options: data.options || [], finished: false });
      }
    } catch (e: any) {
      setFollowUpMessage(friendlyError(e, "Nie udało się przejść do kolejnego pytania."));
    } finally {
      setFollowUpSaving(false);
    }
  };

  const buyFollowUpReport = async () => {
    const checkoutEmail = (followUpEmail || email || anonymousProfile?.email || "").trim();
    if (!checkoutEmail || !checkoutEmail.includes("@")) {
      setFollowUpMessage("Podaj poprawny adres e-mail, aby otrzymać dostęp do raportu porównawczego.");
      return;
    }
    if (!followUpPurchaseConsent) {
      setFollowUpMessage("Zaznacz zgodę na rozpoczęcie generowania raportu porównawczego bezpośrednio po płatności.");
      return;
    }
    setFollowUpCheckoutBusy(true);
    setFollowUpMessage("");
    try {
      const profile = await ensureAnonymousProfileForFollowUp();
      const session = await createSession((selectedPath || "uncertain") as EntryKey);
      const token = session.token || session.sessionId;
      if (!token) throw new Error("Nie udało się utworzyć sesji płatności.");
      const payload = {
        reportKind: "followup",
        recoveryToken: profile.recoveryToken,
        followUpHistory: dynamicFollowUpHistory,
        elapsedDays: dynamicFollowUpElapsedDays,
        entryKey: selectedPath,
      };
      await updateSession({ token, payload, email: checkoutEmail });
      const acceptedAt = new Date().toISOString();
      const checkout = await createCheckout(token, checkoutEmail, { accepted: true, acceptedAt });
      window.location.href = checkout.url;
    } catch (e: any) {
      setFollowUpMessage(friendlyError(e, "Nie udało się rozpocząć płatności za raport porównawczy."));
      setFollowUpCheckoutBusy(false);
    }
  };


  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FOLLOWUP_KEY);
    localStorage.removeItem(FOLLOWUP_RESULT_KEY);
    localStorage.removeItem(ANON_PROFILE_KEY);
    localStorage.removeItem("ctms_local_anonymous_id");
    sessionStorage.removeItem(REPORT_ACCESS_KEY);
    setStage("landing"); setSelectedPath(null); setQuestionIndex(0); setAnswers({}); setOpenText(""); setEmail(""); setPreview(null); setFullReport(null); setSessionToken(null); setBusy(false); setError(null); setAnalysisConsent(false); setAnalysisConsentAcceptedAt(""); setPurchaseConsent(false); setReportAccess(null); setLegalOpen(null); setInterviewState(null); setInterviewAnswer(""); setForceMap({}); setBurdens([]); setEmotions([]); setTruthCards([]); setRelationshipNote(""); setClarificationQuestions([]); setClarificationAnswers({}); setClarificationIndex(0); setClarificationDraft(""); setFollowUpOpen(false); setFollowUpIndex(0); setFollowUpAnswers({}); setFollowUpDraft(""); setFollowUpResult(null); setFollowUpDueAt(""); setFollowUpMessage(""); setDynamicFollowUpQuestion(null); setDynamicFollowUpHistory([]); setDynamicFollowUpTeaser(""); setDynamicFollowUpElapsedDays(0); setFollowUpCheckoutBusy(false); setFollowUpPurchaseConsent(false); setAnonymousProfile(null);
    window.history.replaceState({}, "", "/");
    setRoutePath("/");
  };

  const startPath = async (key: EntryKey) => {
    setBusy(false);
    setError(null);
    setSelectedPath(key);
    setQuestionIndex(0);
    setAnswers({});
    setOpenText("");
    setAnalysisConsent(false);
    setAnalysisConsentAcceptedAt("");
    setPreview(null);
    setFullReport(null);
    setInterviewState(null);
    setForceMap({});
    setBurdens([]);
    setEmotions([]);
    setTruthCards([]);
    setRelationshipNote("");
    setClarificationQuestions([]);
    setClarificationAnswers({});
    setClarificationIndex(0);
    setClarificationDraft("");
    setStage("questions");

    createSession(key)
      .then((data) => {
        const token = data?.token || data?.sessionId || null;
        if (token) {
          setSessionToken(token);
        }
      })
      .catch(() => {});
  };

  const answerQuestion = (qid: string, optionId: string) => {
    const next = { ...answers, [qid]: optionId };
    setAnswers(next);
    if (!path) return;
    if (questionIndex >= path.questions.length - 1) { setStage("checkpoint"); return; }
    setQuestionIndex((v) => v + 1);
  };

  const answerCheckpoint = async (optionId: string) => {
    if (!path) return;
    const newAnswers = { ...answers, [`${path.key}_checkpoint`]: optionId };
    setAnswers(newAnswers);
    setStage("force_map");
  };

  const setForceValue = (key: ForceMapKey, value: ForceValue) => {
    setForceMap((current) => ({ ...current, [key]: value }));
  };

  const toggleBurden = (label: string) => {
    setBurdens((current) => {
      const exists = current.find((item) => item.label === label);
      if (exists) {
        return current.filter((item) => item.label !== label).map((item, index) => ({ ...item, rank: index + 1 }));
      }
      if (current.length >= 3) return current;
      return [...current, { label, rank: current.length + 1 }];
    });
  };

  const toggleEmotion = (label: string) => {
    setEmotions((current) => {
      const exists = current.find((item) => item.label === label);
      if (exists) {
        return current.filter((item) => item.label !== label).map((item, index) => ({ ...item, rank: index + 1 }));
      }
      if (current.length >= 3) return current;
      return [...current, { label, rank: current.length + 1 }];
    });
  };

  const toggleTruthCard = (text: string) => {
    setTruthCards((current) => {
      if (current.includes(text)) return current.filter((item) => item !== text);
      if (current.length >= 2) return current;
      return [...current, text];
    });
  };

  const relationshipMapPayload = (clarificationsOverride?: ClarificationAnswerMap): RelationshipMapPayload => {
    const answersSource = clarificationsOverride || clarificationAnswers;
    return {
      forceMap,
      burdens,
      emotions,
      truthCards,
      userNote: relationshipNote.trim(),
      clarificationAnswers: clarificationQuestions.map((q) => ({
        question: q.text,
        signal: q.signal,
        answer: (answersSource[q.id] || "").trim(),
      })).filter((item) => item.answer),
    };
  };

  const buildClosedAnswerSnapshot = () => {
    if (!path) return [];
    return path.questions.map((question) => {
      const selectedId = answers[question.id];
      const option = question.options.find((item) => item.id === selectedId);
      return {
        id: question.id,
        question: question.text,
        answer: option?.label || "Brak odpowiedzi",
        score: typeof option?.score === "number" ? option.score : null,
      };
    });
  };

  const buildInterviewSeed = () => {
    if (!path) return null;
    const checkpointId = answers[`${path.key}_checkpoint`];
    const checkpointOption = path.checkpoint.options.find((item) => item.id === checkpointId);
    return {
      path: { key: path.key, title: path.title },
      closedAnswers: buildClosedAnswerSnapshot(),
      checkpoint: {
        question: path.checkpoint.text,
        answer: checkpointOption?.label || "Brak odpowiedzi",
        score: typeof checkpointOption?.score === "number" ? checkpointOption.score : null,
      },
      relationshipMap: {
        axes: forceMapItemsForPath(path.key).map((item) => ({
          key: item.key,
          question: item.title,
          answer: forceLabel(forceMap[item.key]),
        })),
        burdens: burdens.map((item) => ({ rank: item.rank, label: item.label })),
        emotions: emotions.map((item) => ({ rank: item.rank, label: item.label })),
        truthCards: [...truthCards],
        userNote: relationshipNote.trim(),
      },
    };
  };

  const buildCompositeOpenText = (_clarificationsOverride?: ClarificationAnswerMap, finalContextOverride?: string): string => {
    const forceLines = forceMapItemsForPath(path?.key)
      .map((item) => `- ${item.title}: ${forceLabel(forceMap[item.key])}`)
      .join("\n");
    const closedLines = path
      ? buildClosedAnswerSnapshot().map((item, index) => `${index + 1}. ${item.question}\nOdpowiedź: ${item.answer}`).join("\n\n")
      : "Brak danych z pytań zamkniętych.";
    const checkpointId = path ? answers[`${path.key}_checkpoint`] : "";
    const checkpointOption = path?.checkpoint.options.find((item) => item.id === checkpointId);
    const checkpointLines = path
      ? `${path.checkpoint.text}\nOdpowiedź: ${checkpointOption?.label || "Brak odpowiedzi"}`
      : "Brak checkpointu.";
    const burdenLines = burdens.length
      ? burdens.map((item) => `${item.rank}. ${item.label}`).join("\n")
      : "Brak wskazanych ciężarów.";
    const emotionLines = emotions.length
      ? emotions.map((item) => `${item.rank}. ${item.label}`).join("\n")
      : "Brak wskazanych emocji.";
    const truthLines = truthCards.length
      ? truthCards.map((item) => `- ${item}`).join("\n")
      : "Brak wybranych zdań prawdy.";
    const note = relationshipNote.trim() || "Brak dodatkowej notatki.";
    const interviewLines = interviewState?.history?.length
      ? interviewState.history.map((e, index) => [
          `Pytanie otwarte ${index + 1}: ${e.ai}`,
          e.lead ? `Kontekst pytania: ${e.lead}` : "",
          `Odpowiedź: ${e.user}`,
          e.observation ? `Ślad po odpowiedzi: ${e.observation}` : "",
        ].filter(Boolean).join("\n")).join("\n\n")
      : "Brak dodatkowego wywiadu otwartego.";
    const finalContext = typeof finalContextOverride === "string" ? finalContextOverride.trim() : openText.trim();
    const finalOwnText = finalContext || "Użytkownik nie dopisał szerszego kontekstu końcowego.";
    return `ŚCIEŻKA ANALIZY
${path?.title || selectedPath || "nieznana"}

PYTANIA ZAMKNIĘTE — konkretne odpowiedzi użytkownika
${closedLines}

PYTANIE ROZSTRZYGAJĄCE
${checkpointLines}

MAPA RELACJI — dane kliknięte przez użytkownika

UKŁAD SIŁ
${forceLines}

NAJWIĘKSZE CIĘŻARY
${burdenLines}

MAPA EMOCJI
${emotionLines}

MOMENT PRAWDY
${truthLines}

DODATKOWA MYŚL UŻYTKOWNIKA
${note}

WYWIAD OTWARTY
${interviewLines}

SZERSZY KONTEKST UŻYTKOWNIKA — OSTATNIE OKNO
${finalOwnText}`;
  };

  const prepareMapSummary = () => {
    if (!path) return;
    // Analiza 2.4: trzy pytania otwarte tworzą jeden pogłębiający wywiad.
    // Osobna seria doprecyzowań została wyłączona, aby nie powtarzać tych samych wątków.
    setClarificationQuestions([]);
    setClarificationAnswers({});
    setClarificationIndex(0);
    setClarificationDraft("");
    setInterviewState(createLocalInterviewState(path, buildInterviewSeed()));
    setInterviewAnswer("");
    setStage("map_summary");
  };

  const startOpenInterview = () => {
    if (!path) return;
    setInterviewAnswer("");
    setError(null);
    setInterviewBusy(false);
    // Pytania są prowadzone przez kontrolowany, trzyetapowy scenariusz zależny od ścieżki.
    // Dzięki temu pierwszy kadr nie brzmi tak samo w każdej analizie, a kolejne pytania
    // korzystają z rzeczywistej odpowiedzi użytkownika zamiast wracać do ogólników.
    setInterviewState(createLocalInterviewState(path, buildInterviewSeed()));
    setStage("interview");
  };

  const goToClarification = () => {
    if (!clarificationQuestions.length) {
      buildPreviewAndGo({});
      return;
    }
    setClarificationIndex(0);
    setClarificationDraft(clarificationAnswers[clarificationQuestions[0].id] || "");
    setStage("clarification");
  };

  const saveClarificationAndNext = (skip = false) => {
    const question = clarificationQuestions[clarificationIndex];
    if (!question) { setStage("open_text"); return; }
    const nextAnswers = { ...clarificationAnswers, [question.id]: skip ? "" : clarificationDraft.trim() };
    setClarificationAnswers(nextAnswers);
    if (clarificationIndex >= clarificationQuestions.length - 1) {
      setStage("open_text");
      return;
    }
    const nextIndex = clarificationIndex + 1;
    setClarificationIndex(nextIndex);
    setClarificationDraft(nextAnswers[clarificationQuestions[nextIndex].id] || "");
  };

  const advanceAfterOpenInterview = () => {
    setStage("open_text");
  };

  const sendInterviewAnswer = async () => {
    if (!interviewState || !interviewAnswer.trim()) return;
    if (hasCrisisContent(interviewAnswer)) { setStage("crisis"); return; }
    const currentExchangeCount = interviewState.history.length + 1;
    const updatedHistory: InterviewExchange[] = [...interviewState.history, { ai: interviewState.currentQuestion, user: interviewAnswer.trim(), lead: interviewState.currentLead, observation: interviewState.currentObservation }];

    if (interviewState.source === "local") {
      const maxDepth = OPEN_INTERVIEW_LIMIT;
      if (currentExchangeCount < maxDepth) {
        const pathConfig = ENTRY_CONFIGS.find((item) => item.key === interviewState.path) || ENTRY_CONFIGS[0];
        const nextQuestion = buildAdaptiveLocalQuestion(pathConfig, interviewAnswer.trim(), updatedHistory, currentExchangeCount + 1);
        setInterviewState({
          ...interviewState,
          history: updatedHistory,
          currentQuestion: nextQuestion.question,
          currentLead: nextQuestion.lead,
          currentObservation: nextQuestion.observation || "",
          depth: currentExchangeCount + 1,
          exchangeIndex: currentExchangeCount,
          localIndex: currentExchangeCount,
        });
        setInterviewAnswer("");
        return;
      }
      setInterviewState({ ...interviewState, history: updatedHistory, finished: true });
      setInterviewAnswer("");
      advanceAfterOpenInterview();
      return;
    }
    
    if (currentExchangeCount >= OPEN_INTERVIEW_LIMIT) {
      setInterviewBusy(true);
      try {
        await fetch(`${API_BASE}/api/interview/finish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken }) }).catch(() => {});
      } catch {}
      finally { setInterviewBusy(false); }
      setInterviewState({ ...interviewState, history: updatedHistory, finished: true });
      setInterviewAnswer("");
      advanceAfterOpenInterview();
      return;
    }
    
    setInterviewBusy(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/interview/next`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken, userAnswer: interviewAnswer.trim() }) });
      const d = await res.json().catch(() => ({}));
      if (d.crisis) { setStage("crisis"); return; }
      if (!d.ok) throw new Error(d.message || "Błąd wywiadu.");
      
      if (d.finished || updatedHistory.length >= OPEN_INTERVIEW_LIMIT) {
        try { await fetch(`${API_BASE}/api/interview/finish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken }) }); } catch {}
        setInterviewState({ ...interviewState, history: updatedHistory, finished: true }); advanceAfterOpenInterview();
      } else {
        setInterviewState({ ...interviewState, history: updatedHistory, currentQuestion: d.question, currentLead: d.lead || "", currentObservation: d.observation || "", depth: Math.min(d.depth, OPEN_INTERVIEW_LIMIT), exchangeIndex: d.exchangeIndex });
        setInterviewAnswer("");
      }
    } catch (e: any) { setError(friendlyError(e, "Nie udało się przejść dalej.")); }
    finally { setInterviewBusy(false); }
  };

  const continueAfterFinalContext = (skip = false) => {
    const nextContext = skip ? "" : openText.trim();
    if (skip) setOpenText("");
    buildPreviewAndGo(clarificationAnswers, nextContext);
  };

  const goBack = () => {
    setError(null);
    if (stage === "questions") { if (questionIndex === 0) { setStage("entry"); return; } setQuestionIndex((v) => Math.max(0, v - 1)); return; }
    if (stage === "question_signal") { setStage("questions"); return; }
    if (stage === "checkpoint") { setStage("questions"); return; }
    if (stage === "force_map") { setStage("checkpoint"); return; }
    if (stage === "force_signal") { setStage("force_map"); return; }
    if (stage === "burdens") { setStage("force_map"); return; }
    if (stage === "burden_signal") { setStage("burdens"); return; }
    if (stage === "emotions") { setStage("burdens"); return; }
    if (stage === "mid_reflection") { setStage("emotions"); return; }
    if (stage === "truth_cards") { setStage("mid_reflection"); return; }
    if (stage === "truth_signal") { setStage("truth_cards"); return; }
    if (stage === "short_note") { setStage("truth_cards"); return; }
    if (stage === "map_summary") { setStage("truth_cards"); return; }
    if (stage === "clarification") {
      if (clarificationIndex > 0) {
        const prevIndex = clarificationIndex - 1;
        setClarificationIndex(prevIndex);
        setClarificationDraft(clarificationAnswers[clarificationQuestions[prevIndex]?.id] || "");
        return;
      }
      setStage("interview"); return;
    }
    if (stage === "interview") { setStage("map_summary"); return; }
    if (stage === "open_text") {
      if (interviewState && interviewState.history.length > 0) { setStage("interview"); return; }
      setStage("truth_cards"); return;
    }
    if (stage === "preview") { setStage("open_text"); return; }
    if (stage === "entry") setStage("landing");
  };

  const buildPreviewAndGo = async (clarificationsOverride?: ClarificationAnswerMap, finalContextOverride?: string) => {
    if (!path) return;
    if (!analysisConsent) {
      setError("Zaznacz zgodę na przetworzenie treści potrzebnych do przygotowania analizy.");
      return;
    }
    const consentAcceptedAt = analysisConsentAcceptedAt || new Date().toISOString();
    if (!analysisConsentAcceptedAt) setAnalysisConsentAcceptedAt(consentAcceptedAt);
    const relationshipMap = relationshipMapPayload(clarificationsOverride);
    const finalOpenText = buildCompositeOpenText(clarificationsOverride, finalContextOverride);
    if (hasCrisisContent(finalOpenText)) { setStage("crisis"); return; }

    setBusy(true);
    setError(null);
    setStage("processing");

    try {
      let token = sessionToken || "";
      if (!token) {
        const data = await createSession(path.key);
        token = data?.token || data?.sessionId || "";
        if (token) setSessionToken(token);
      }
      if (!token) throw new Error("Nie udało się utworzyć sesji analizy.");

      const previewData = await fetchPreviewFromAPI(token, path, answers, finalOpenText, relationshipMap);
      setPreview(previewData);
      await updateSession({
        token,
        path: path.key,
        answers,
        openText: finalOpenText,
        relationshipMap,
        preview: previewData,
        analysisConsent: { accepted: true, acceptedAt: consentAcceptedAt, version: ANALYSIS_CONSENT_VERSION },
        stage: "preview",
      });
      setStage("preview");
      setBusy(false);
    } catch (e: any) {
      if (e?.message === "__CRISIS__") {
        setStage("crisis");
      } else {
        setError(friendlyError(e, "Nie udało się przygotować odczytu. Spróbuj ponownie."));
        setStage("open_text");
      }
      setBusy(false);
    }
  };

  const saveReportFeedback = async (rating: 1 | 3 | 5) => {
    if (!sessionToken || reportFeedback) return;
    setReportFeedbackMessage("");
    try {
      await submitReportFeedback({ sessionToken, rating });
      setReportFeedback(rating);
      setReportFeedbackMessage("Dziękujemy. Ta ocena posłuży do mierzenia trafności kolejnych wersji analizy.");
    } catch (e: any) {
      setReportFeedbackMessage(friendlyError(e, "Nie udało się zapisać oceny. Raport pozostaje bez zmian."));
    }
  };

  const pay = async () => {
    if (!selectedPath || !preview) { setError("Brak gotowego podglądu."); return; }
    if (!email.includes("@")) { setError("Podaj prawidłowy adres e-mail."); return; }
    if (!purchaseConsent) { setError("Zaznacz zgodę na rozpoczęcie generowania raportu bezpośrednio po płatności."); return; }
    setBusy(true); setError(null);
    try {
      const token = await ensureSession(selectedPath);
      const acceptedAt = new Date().toISOString();
      await updateSession({ token, path: selectedPath, answers, openText: buildCompositeOpenText(), relationshipMap: relationshipMapPayload(), preview, email, purchaseConsent: { accepted: true, acceptedAt, version: CHECKOUT_CONSENT_VERSION }, stage: "checkout_started" });
      const checkout = await createCheckout(token, email, { accepted: true, acceptedAt });
      window.location.href = checkout.url;
    } catch (e: any) { setError(friendlyError(e, "Nie udało się rozpocząć płatności.")); setBusy(false); }
  };

  const retryPaidReport = async () => {
    const access = reportAccess;
    if (!access) {
      setError("Bezpieczny link wygasł albo nie jest dostępny w tej karcie. Otwórz link do raportu z wiadomości e-mail.");
      return;
    }

    setBusy(true);
    setError(null);
    setStage("processing");

    try {
      const report = await fetchSignedReport(access.token, access.exp, access.sig);
      setFullReport(report);
      setStage("paid");
    } catch (e: any) {
      setStage("error");
      setError(
        friendlyError(
          e,
          "Raport nadal się przygotowuje. Nie płać drugi raz. Kliknij „Sprawdź raport ponownie” za chwilę albo sprawdź e-mail."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  const buildPrintableReportHtml = () => {
    if (!fullReport) return "";
    const safe = (value?: string) => String(value || "").replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch] || ch));
    const paragraphs = (value?: string) => safe(value).split(/\n+/).filter(Boolean).map((p) => `<p>${p}</p>`).join("");
    const generatedAt = new Date().toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" });
    const reportId = String(sessionToken || anonymousProfile?.recoveryToken || "prywatny").slice(0, 10).toUpperCase();

    const portrait = resolveRelationshipPortrait(fullReport);
    const stateClass = (value?: PortraitState) => `state-${safe(value || "suspended")}`;
    const forcePortraitPrint = `
      <section class="portrait-card portrait-card-force">
        <div class="portrait-card-head"><div><span>PORTRET RELACJI · UKŁAD SIŁ</span><h2>${safe(portrait.forceField.headline)}</h2></div><b>CTMS / 01</b></div>
        <div class="print-force-field ${stateClass(portrait.forceField.relationState)}">
          <div class="print-force-node ${stateClass(portrait.forceField.userState)}"><small>TY</small><strong>${safe(portrait.forceField.userLabel)}</strong></div>
          <div class="print-force-link"><i></i></div>
          <div class="print-force-node print-force-node-relation ${stateClass(portrait.forceField.relationState)}"><small>RELACJA</small><strong>${safe(portrait.forceField.relationLabel)}</strong></div>
          <div class="print-force-link"><i></i></div>
          <div class="print-force-node ${stateClass(portrait.forceField.otherState)}"><small>DRUGA OSOBA</small><strong>${safe(portrait.forceField.otherLabel)}</strong></div>
        </div>
        <p class="portrait-card-insight">${safe(portrait.forceField.insight)}</p>
      </section>`;
    const truthLinePrint = `
      <section class="portrait-card portrait-card-truth">
        <div class="portrait-card-head"><div><span>PORTRET RELACJI · LINIA PRAWDY</span><h2>${safe(portrait.truthLine.headline)}</h2></div><b>CTMS / 02</b></div>
        <div class="print-truth-line ${stateClass(portrait.truthLine.directionState)}">
          <div class="print-truth-stop ${stateClass(portrait.truthLine.declarationsState)}"><em>01</em><i></i><small>Deklaracje</small><strong>${safe(portrait.truthLine.declarationsLabel)}</strong></div>
          <div class="print-truth-connector"></div>
          <div class="print-truth-stop ${stateClass(portrait.truthLine.behaviorState)}"><em>02</em><i></i><small>Zachowanie</small><strong>${safe(portrait.truthLine.behaviorLabel)}</strong></div>
          <div class="print-truth-connector"></div>
          <div class="print-truth-stop ${stateClass(portrait.truthLine.directionState)}"><em>03</em><i></i><small>Realny kierunek</small><strong>${safe(portrait.truthLine.directionLabel)}</strong></div>
        </div>
        <p class="portrait-card-insight">${safe(portrait.truthLine.insight)}</p>
      </section>`;

    const sections = (fullReport.sections || []).map((section, index) => {
      const sectionHtml = `
      <section class="report-section tone-${safe(section.tone || "normal")}">
        <div class="section-heading">
          <div class="section-no">${String(index + 1).padStart(2, "0")}</div>
          <h2>${safe(section.title)}</h2>
        </div>
        <div class="section-body">${paragraphs(section.text)}</div>
        <div class="section-confidence">Pewność: ${safe(confidenceLabel(section.confidence))}</div>
        <div class="evidence-box">
          ${section.evidence?.length ? `<div><strong>Podstawa wniosku</strong><ul>${section.evidence.map((item) => `<li>${safe(item)}</li>`).join("")}</ul></div>` : ""}
          ${section.counterSignal ? `<div><strong>Kontrsygnał</strong><p>${safe(section.counterSignal)}</p></div>` : ""}
          ${section.whatCouldChange ? `<div><strong>Co zmieni ocenę</strong><p>${safe(section.whatCouldChange)}</p></div>` : ""}
        </div>
      </section>`;
      if (index === 1) return `${sectionHtml}${forcePortraitPrint}`;
      if (index === 5) return `${sectionHtml}${truthLinePrint}`;
      return sectionHtml;
    }).join("\n");

    const followup = followUpResult ? `
      <section class="followup-summary">
        <div class="section-no">POWRÓT</div>
        <h2>${safe(followUpResult.headline)}</h2>
        <p>${safe(followUpResult.summary)}</p>
        ${followUpResult.note ? `<div class="followup-note"><strong>Najważniejszy fakt od pierwszego odczytu:</strong> ${safe(followUpResult.note)}</div>` : ""}
      </section>` : "";

    return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pełny odczyt relacji — CzyToMaSens</title>
<style>
@page{size:A4;margin:11mm 12mm 13mm}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#ece9e2;color:#171513;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-size:11.2pt;line-height:1.56}
.page{width:100%;max-width:186mm;margin:0 auto;background:#fff}
.cover{min-height:273mm;padding:17mm 15mm 14mm;background:
radial-gradient(circle at 12% 8%,rgba(197,160,89,.22),transparent 28%),
linear-gradient(145deg,#0a0908,#16130f 66%,#0a0908);color:#f7f1e7;display:flex;flex-direction:column;page-break-after:always}
.brand{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(215,185,120,.32);padding-bottom:8mm}
.logo{font-family:Georgia,'Times New Roman',serif;font-size:29pt;font-weight:900;letter-spacing:-.045em}.logo span{color:#d4ad5b}
.meta{text-align:right;font-size:7.5pt;line-height:1.7;letter-spacing:.16em;text-transform:uppercase;color:#c8b994}
.kicker{margin-top:22mm;font-size:8pt;letter-spacing:.36em;color:#d4ad5b;text-transform:uppercase}
.cover h1{font-family:Georgia,'Times New Roman',serif;font-size:35pt;line-height:1.02;letter-spacing:-.035em;margin:5mm 0 5mm;max-width:150mm}
.cover-lead{font-size:13pt;line-height:1.55;color:#ddd5c9;max-width:145mm;margin:0}
.cover-bottom{margin-top:auto;display:grid;grid-template-columns:1.2fr .8fr;gap:8mm;border-top:1px solid rgba(215,185,120,.25);padding-top:7mm}
.cover-bottom h3{font-family:Georgia,'Times New Roman',serif;font-size:15pt;margin:0 0 2mm}.cover-bottom p{font-size:9pt;line-height:1.6;color:#c9c0b4;margin:0}
.confidential{border-left:2px solid #d4ad5b;padding-left:5mm}
.content{padding:0}
.content-header{display:flex;justify-content:space-between;align-items:end;padding:0 0 5mm;border-bottom:1px solid #cdbd9b;margin:0 0 7mm}
.content-header .logo{font-size:18pt;color:#171513}.content-header small{font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:#8a7853}
.report-section{position:relative;margin:0 0 7mm;padding:0 0 6mm 7mm;border-bottom:1px solid #e4ded2;break-inside:auto;page-break-inside:auto}
.report-section:before{content:"";position:absolute;left:0;top:0;bottom:6mm;width:1.2mm;border-radius:99px;background:#c5a059}
.report-section.tone-danger:before{background:#b66f6f}.report-section.tone-gold:before{background:#c5a059}
.section-heading{display:grid;grid-template-columns:12mm 1fr;gap:2mm;align-items:start;margin-bottom:3mm;break-after:avoid;page-break-after:avoid}
.section-no{font-size:7.5pt;letter-spacing:.24em;color:#9b7b3e;font-weight:800;padding-top:1.2mm}
h2{font-family:Georgia,'Times New Roman',serif;font-size:18pt;line-height:1.14;letter-spacing:-.02em;margin:0;color:#1c1813}
.section-body p{font-size:10.7pt;line-height:1.62;margin:0 0 3mm;color:#332e28;orphans:3;widows:3}
.section-confidence{display:inline-block;margin:1mm 0 3mm;padding:1.4mm 2.5mm;border-radius:99px;background:#f4eee2;color:#715b34;font-size:7.5pt;font-weight:700}
.evidence-box{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-top:3mm;padding:4mm;background:#f8f6f1;border:1px solid #e5ded1;border-radius:3mm}
.evidence-box strong{display:block;font-size:7.5pt;letter-spacing:.06em;text-transform:uppercase;color:#80683b;margin-bottom:1.5mm}.evidence-box p,.evidence-box li{font-size:8.3pt;line-height:1.45;color:#4b443c;margin:0}.evidence-box ul{margin:0;padding-left:4mm}
.portrait-card{margin:3mm 0 8mm;padding:7mm;border:1px solid #cdbd9b;border-radius:4mm;background:linear-gradient(145deg,#16130f,#0b0a08);color:#f6efe5;break-inside:avoid;page-break-inside:avoid}
.portrait-card-head{display:flex;justify-content:space-between;gap:7mm;align-items:flex-start;padding-bottom:5mm;border-bottom:1px solid rgba(215,185,120,.27)}
.portrait-card-head span{display:block;font-size:6.8pt;letter-spacing:.22em;color:#d4ad5b;font-weight:800}.portrait-card-head h2{margin:2mm 0 0;color:#f7f1e8;font-size:18pt}.portrait-card-head>b{font-size:6.8pt;letter-spacing:.16em;color:#a99979;white-space:nowrap}
.print-force-field{display:grid;grid-template-columns:1fr 13mm 1.1fr 13mm 1fr;align-items:center;gap:2mm;margin:8mm 0 6mm}
.print-force-node{min-height:32mm;padding:5mm 4mm;border:1px solid rgba(215,185,120,.28);border-radius:50%;background:radial-gradient(circle at 35% 25%,rgba(215,185,120,.13),rgba(255,255,255,.025) 55%,transparent);display:flex;flex-direction:column;justify-content:center;text-align:center}
.print-force-node-relation{min-height:39mm;border-color:rgba(215,185,120,.58);box-shadow:inset 0 0 0 1.8mm rgba(215,185,120,.05)}
.print-force-node small,.print-truth-stop small{font-size:6.6pt;letter-spacing:.16em;color:#b9aa8e}.print-force-node strong{font-family:Georgia,'Times New Roman',serif;font-size:9.2pt;line-height:1.3;margin-top:1.5mm;color:#f2e8d8}
.print-force-link{height:1px;background:rgba(215,185,120,.38);position:relative}.print-force-link i{position:absolute;width:3mm;height:3mm;border:1px solid #d4ad5b;border-radius:50%;background:#16130f;top:50%;left:50%;transform:translate(-50%,-50%)}
.print-truth-line{display:grid;grid-template-columns:1fr 13mm 1fr 13mm 1fr;align-items:center;margin:8mm 0 6mm}.print-truth-stop{text-align:center;position:relative;padding:0 1mm}.print-truth-stop em{display:block;font-size:6.5pt;letter-spacing:.14em;color:#8f826d;font-style:normal}.print-truth-stop i{display:block;width:6mm;height:6mm;margin:2mm auto;border:1px solid #d4ad5b;transform:rotate(45deg);background:#16130f}.print-truth-stop small{display:block}.print-truth-stop strong{display:block;font-family:Georgia,'Times New Roman',serif;font-size:9.3pt;line-height:1.32;color:#f2e8d8;margin-top:1mm}.print-truth-connector{height:1px;background:linear-gradient(90deg,rgba(215,185,120,.18),rgba(215,185,120,.72),rgba(215,185,120,.18))}
.portrait-card-insight{margin:0;padding-top:5mm;border-top:1px solid rgba(215,185,120,.22);font-family:Georgia,'Times New Roman',serif;font-size:10.4pt;line-height:1.55;color:#ded3c3}
.portrait-card .state-strained,.portrait-card .state-weak,.portrait-card .state-backward{border-color:rgba(182,111,111,.62)}.portrait-card .state-reciprocal,.portrait-card .state-coherent,.portrait-card .state-forward{border-color:rgba(153,184,145,.62)}
.closing,.followup-summary{margin:9mm 0 0;border:1px solid #cdbd9b;background:#f8f4eb;padding:7mm;border-radius:4mm;break-inside:avoid;page-break-inside:avoid}
.closing{font-family:Georgia,'Times New Roman',serif;font-size:15pt;line-height:1.45;color:#2b2115}
.followup-summary h2{margin:1mm 0 3mm}.followup-summary p{margin:0;color:#3d362e}
.followup-note{margin-top:4mm;padding-top:4mm;border-top:1px solid #dfd3bc}
.footer{margin-top:9mm;padding-top:4mm;border-top:1px solid #e6e0d6;display:flex;justify-content:space-between;font-size:7pt;color:#81796f}
@media screen{body{padding:20px}.page{box-shadow:0 25px 80px rgba(0,0,0,.18)}.content{padding:12mm}}
@media print{
  html,body{background:#fff}
  .page{max-width:none}
  .content{padding:0}
  .cover{margin:-11mm -12mm -13mm;min-height:297mm;padding:18mm 16mm 15mm}
  .report-section{box-shadow:none}
}
</style>
</head>
<body>
<main class="page">
<section class="cover">
  <header class="brand">
    <div><div class="logo">CzyToMaSens<span>.</span></div><div class="kicker" style="margin-top:2mm">prywatny odczyt jednej relacji</div></div>
    <div class="meta">Raport ${safe(reportId)}<br>${safe(generatedAt)}</div>
  </header>
  <div class="kicker">Najważniejsze na początku</div>
  <h1>${safe(fullReport.headline || "Pełny odczyt relacji")}</h1>
  <p class="cover-lead">${safe(fullReport.subheadline || fullReport.previewLine || "Prywatny odczyt sytuacji oparty na odpowiedziach, zachowaniach i powtarzających się sygnałach.")}</p>
  <p class="cover-lead" style="font-size:10pt;margin-top:4mm;color:#c8b994"><strong>Pewność odczytu:</strong> ${safe(confidenceLabel(fullReport.overallConfidence))}</p>
  <div class="cover-bottom">
    <div><h3>Jak czytać ten dokument</h3><p>Nie szukaj jednego procentu ani jednego zdania, które podejmie decyzję za Ciebie. Najwięcej mówi układ: co wraca, kto bierze odpowiedzialność i czy po rozmowie zmienia się zachowanie.</p></div>
    <div class="confidential"><h3>Tylko dla Ciebie</h3><p>To prywatny odczyt jednej perspektywy. Nie jest diagnozą ani oceną drugiej osoby.</p></div>
  </div>
</section>
<section class="content">
  <header class="content-header"><div class="logo">CzyToMaSens<span>.</span></div><small>pełny odczyt relacji</small></header>
  ${sections}
  ${followup}
  ${fullReport.closing ? `<div class="closing">${safe(fullReport.closing)}</div>` : ""}
  <footer class="footer"><span>kontakt.czytomasens@gmail.com</span><span>Dokument prywatny — nie jest diagnozą ani terapią</span></footer>
</section>
</main>
</body>
</html>`;
  };

  const openPremiumPdf = () => {
    const html = buildPrintableReportHtml();
    if (!html) return;
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1080,height=920");
    if (!printWindow) { window.print(); return; }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 650);
  };

  const downloadPremiumReport = openPremiumPdf;
  const printPremiumReport = openPremiumPdf;


  const renderPublicContentRoute = () => {
    if (routeLegalKey) {
      const legal = LEGAL_CONTENT[routeLegalKey];
      return (
        <motion.div key={`legal-${routeLegalKey}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <Glass className="question-panel legal-page">
            <div className="eyebrow">DOKUMENTY</div>
            <h1 style={{ marginTop: 0 }}>{legal.title}</h1>
            <div style={{ whiteSpace: "pre-line", color: BRAND.muted, lineHeight: 1.75, fontSize: "15px" }}>{legal.body}</div>
            <div className="section-actions">
              <GhostButton onClick={() => navigateTo("/")}>Wróć na stronę główną</GhostButton>
            </div>
          </Glass>
        </motion.div>
      );
    }

    return (
      <motion.div key={`articles-${routeArticle?.slug || "index"}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <ArticlesSection
          initialSlug={routeArticle?.slug || null}
          onNavigateHome={() => navigateTo("/artykuly")}
          onNavigateArticle={(slug) => navigateTo(`/artykuly/${slug}`)}
          onStartAnalysis={() => {
            navigateTo("/");
            setStage("entry");
          }}
        />
      </motion.div>
    );
  };


  return (
    <div className="ctms-shell">
      <div className="ctms-noise" />
      <div className={`ctms-topbar ${stage === "landing" ? "ctms-topbar--landing" : ""}`}>
        <LogoBlock />
        {stage !== "landing" && !isPublicContentRoute && <GhostButton onClick={resetAll}>Od początku</GhostButton>}
      </div>

      <main className={`ctms-main ${stage === "landing" ? "ctms-main--landing" : ""} ${(["questions","checkpoint","mid_reflection","interview","open_text","preview","paid","error","crisis"].includes(stage) || Boolean(routeLegalKey)) ? "narrow" : ""}`}>
        <AnimatePresence mode="wait">

          {stage === "landing" && isPublicContentRoute && renderPublicContentRoute()}

          {stage === "landing" && !isPublicContentRoute && (
            <motion.div key="landing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <section className="ctms-home-stage" data-ui-version="2.5.2">
                <div className="ctms-home-glow" aria-hidden="true" />
                <Glass className="ctms-home-canvas">
                  <section className="ctms-home-copy">
                    <div className="ctms-home-eyebrow">
                      <span>PRYWATNA ANALIZA JEDNEJ RELACJI</span>
                      <i aria-hidden="true" />
                    </div>

                    <div className="ctms-home-hook">KIEDY SŁOWA JUŻ NIE WYSTARCZAJĄ</div>

                    <h1>
                      Nie pytaj dłużej, czy przesadzasz.
                      <em>Sprawdź, co naprawdę robi ta relacja.</em>
                    </h1>

                    <p className="ctms-home-lead">
                      Zaczynamy od konkretnych zdarzeń. Potem sprawdzamy, kto niesie ciężar, co wraca mimo rozmów i czy zachowanie potwierdza słowa. Dzięki temu nie zostajesz z kolejną opinią, tylko z uporządkowanym obrazem sytuacji.
                    </p>

                    <div className="ctms-home-actions">
                      <PrimaryButton onClick={() => setStage("entry")}>Rozpocznij prywatną analizę</PrimaryButton>
                      <div className="ctms-home-privacy">
                        <span aria-hidden="true">●</span>
                        <div>
                          <strong>Bez profilu, bez publicznych odpowiedzi.</strong>
                          <small>Analiza porządkuje Twoją perspektywę i nie udaje diagnozy drugiej osoby.</small>
                        </div>
                      </div>
                    </div>

                    <div className="ctms-home-value-grid" aria-label="Co porządkuje analiza">
                      <article className="ctms-home-value-card">
                        <span>01</span>
                        <div>
                          <strong>Fakty przed interpretacją</strong>
                          <p>Oddzielasz to, co rzeczywiście się wydarzyło, od lęku, nadziei i późniejszych tłumaczeń.</p>
                        </div>
                      </article>
                      <article className="ctms-home-value-card">
                        <span>02</span>
                        <div>
                          <strong>Wzajemność przed deklaracją</strong>
                          <p>Widzisz, kto inicjuje, naprawia, domyka rozmowy i utrzymuje relację, gdy robi się trudno.</p>
                        </div>
                      </article>
                      <article className="ctms-home-value-card">
                        <span>03</span>
                        <div>
                          <strong>Kierunek zamiast kolejnej obietnicy</strong>
                          <p>Sprawdzasz, czy relacja naprawdę się zmienia, czy tylko na chwilę ucisza napięcie.</p>
                        </div>
                      </article>
                    </div>
                  </section>

                  <aside className="ctms-home-reading ctms-home-reading--mirror">
                    <div className="ctms-home-reading-top">
                      <span>PRZYKŁADOWE LUSTRO ANALIZY</span>
                      <small>FRAGMENT ODCZYTU</small>
                    </div>

                    <div className="ctms-home-reading-word" aria-hidden="true">LUSTRO</div>

                    <div className="ctms-mirror-source">
                      <small>FRAGMENT SYTUACJI</small>
                      <p>„Kiedy odpuszczam i przestaję pytać, robi się spokojnie. Gdy próbuję ustalić, dokąd to zmierza, druga osoba znowu się wycofuje, a ja zaczynam zastanawiać się, czy przesadzam.”</p>
                    </div>

                    <div className="ctms-mirror-main">
                      <div className="ctms-mirror-main-label">
                        <span aria-hidden="true">✦</span>
                        <small>LUSTRO</small>
                      </div>
                      <blockquote>
                        Nie tracisz spokoju dlatego, że pytasz za dużo. Tracisz go, bo ta relacja jest spokojna głównie wtedy, gdy rezygnujesz z własnej potrzeby jasności.
                      </blockquote>
                      <p>
                        To nie jest wyrok o uczuciach drugiej osoby. To sygnał, że obecny układ nagradza Twoje milczenie, a koszt niejasności zostawia po Twojej stronie.
                      </p>
                    </div>

                    <div className="ctms-mirror-evidence" aria-label="Jak analiza schodzi głębiej">
                      <article>
                        <span>01</span>
                        <div>
                          <small>CO WIDAĆ W FAKTACH</small>
                          <strong>Spokój wraca po Twoim wycofaniu, nie po wspólnym rozwiązaniu problemu.</strong>
                          <p>To odróżnia prawdziwe domknięcie od chwilowej ciszy, która pojawia się tylko dlatego, że przestajesz naciskać.</p>
                        </div>
                      </article>
                      <article>
                        <span>02</span>
                        <div>
                          <small>MECHANIZM POD SPODEM</small>
                          <strong>Im bardziej potrzebujesz jasności, tym więcej odpowiedzialności przejmujesz za atmosferę.</strong>
                          <p>Zamiast otrzymać odpowiedź, zaczynasz pilnować tonu, czasu rozmowy i reakcji drugiej osoby.</p>
                        </div>
                      </article>
                      <article>
                        <span>03</span>
                        <div>
                          <small>CO TO KOSZTUJE</small>
                          <strong>Zaczynasz oceniać własne potrzeby przez pryzmat tego, czy druga osoba je dobrze zniesie.</strong>
                          <p>Wtedy coraz trudniej odróżnić cierpliwość od rezygnowania z siebie, żeby utrzymać pozorny spokój.</p>
                        </div>
                      </article>
                      <article>
                        <span>04</span>
                        <div>
                          <small>KONTRSYGNAŁ</small>
                          <strong>Dobre chwile są prawdziwe. Nie unieważniają jednak tego, co powtarza się po trudnym pytaniu.</strong>
                          <p>Analiza nie kasuje bliskości. Sprawdza, czy bliskość potrafi przetrwać także wtedy, gdy pojawia się potrzeba, granica albo konflikt.</p>
                        </div>
                      </article>
                      <article>
                        <span>05</span>
                        <div>
                          <small>PRÓBA PRAWDY</small>
                          <strong>Najwięcej pokaże to, co wydarzy się, gdy nazwiesz potrzebę raz i przestaniesz prowadzić drugą osobę do odpowiedzi.</strong>
                          <p>Nie kolejna rozmowa pełna obietnic, lecz samodzielny ruch drugiej strony rozstrzygnie, czy układ rzeczywiście może się zmienić.</p>
                        </div>
                      </article>
                    </div>

                    <div className="ctms-mirror-summary">
                      <small>PRZYKŁADOWE PODSUMOWANIE</small>
                      <blockquote>
                        Ta relacja może mieć uczucie, ale dziś nie daje Ci jeszcze oparcia tam, gdzie najbardziej go potrzebujesz: w jasności, wzajemności i odpowiedzialności po trudnej rozmowie.
                      </blockquote>
                    </div>

                    <div className="ctms-mirror-conclusion-grid">
                      <article>
                        <small>CO MOGŁOBY ZMIENIĆ OCENĘ</small>
                        <strong>Samodzielna, konkretna i powtarzalna inicjatywa drugiej strony — bez Twojego przypominania, nacisku i ratowania atmosfery.</strong>
                      </article>
                      <article>
                        <small>NAJBLIŻSZY ROZSĄDNY RUCH</small>
                        <strong>Nazwij jedno oczekiwanie. Nie tłumacz go pięć razy. Potem obserwuj zachowanie, a nie ulgę po kolejnej rozmowie.</strong>
                      </article>
                    </div>

                    <div className="ctms-mirror-promise">
                      <span>To tylko przykład formy. Twój odczyt powstaje od zera.</span>
                      <p>Język, tropy, kontrsygnały i wniosek wynikają z wybranej ścieżki, odpowiedzi zamkniętych, trzech pytań pogłębiających oraz opisu konkretnego zdarzenia.</p>
                    </div>
                  </aside>
                </Glass>
              </section>

              <div className="ctms-home-articles">
                <ArticlesSection onNavigateHome={() => navigateTo("/artykuly")} onNavigateArticle={(slug) => navigateTo(`/artykuly/${slug}`)} onStartAnalysis={() => setStage("entry")} />
              </div>
            </motion.div>
          )}

          {stage === "entry" && (
            <motion.div key="entry" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <section className="ctms-route-stage" data-ui-version="2.4.8">
                <div className="ctms-route-head">
                  <div>
                    <div className="eyebrow">WYBIERZ PUNKT WEJŚCIA</div>
                    <h2>Co dziś jest najbliżej prawdy?</h2>
                    <p>Zacznij od problemu, który najlepiej opisuje obecną sytuację. Pozostałe sygnały i tak sprawdzimy po drodze.</p>
                  </div>
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                </div>

                <Glass className="ctms-route-canvas ctms-route-canvas--direct">
                  <div className="ctms-route-grid-direct" aria-label="Ścieżki analizy">
                    {ENTRY_CONFIGS.map((entry, index) => (
                      <button
                        type="button"
                        key={entry.key}
                        className="ctms-route-card-direct"
                        onClick={() => startPath(entry.key)}
                        disabled={busy}
                        aria-label={`Rozpocznij ścieżkę: ${entry.title}`}
                      >
                        <span className="ctms-route-card-no">{String(index + 1).padStart(2, "0")}</span>
                        <div className="ctms-route-card-copy">
                          <small>PUNKT WEJŚCIA</small>
                          <strong>{entry.title}</strong>
                          <p>{entry.subtitle}</p>
                        </div>
                        <i aria-hidden="true">→</i>
                      </button>
                    ))}
                  </div>
                </Glass>
              </section>
            </motion.div>
          )}

          {stage === "questions" && path && currentQuestion && (() => {
            const phase = closedQuestionPhase(questionIndex, path.questions.length);
            return (
              <motion.div
                key={currentQuestion.id}
                className="closed-question-experience"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: .32, ease: "easeOut" }}
              >
                <div className="section-head compact closed-question-head">
                  <div className="eyebrow">{path.title.toUpperCase()}</div>
                  <div className="progress-wrap">
                    <span>Pytanie {questionIndex + 1} z {path.questions.length}</span>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${((questionIndex + 1) / path.questions.length) * 100}%` }} /></div>
                  </div>
                </div>

                <Glass className="question-panel closed-question-panel">
                  <aside className="closed-question-rail">
                    <div className="closed-question-rail-top">
                      <span>PYTANIE</span>
                      <strong>{String(questionIndex + 1).padStart(2, "0")}</strong>
                    </div>
                    <div className="closed-question-phase">
                      <span>{phase.kicker}</span>
                      <h2>{phase.title}</h2>
                      <p>{phase.note}</p>
                    </div>
                    <div className="closed-question-path">
                      <span>ŚCIEŻKA</span>
                      <strong>{path.title}</strong>
                    </div>
                  </aside>

                  <section className="closed-question-content">
                    <div className="closed-question-rule">
                      <span>WYBIERZ ODPOWIEDŹ NAJBLIŻSZĄ FAKTOM</span>
                      <i aria-hidden="true" />
                    </div>
                    <div className={`question-copy closed-question-copy ${currentQuestion.text.length > 118 ? "is-long" : currentQuestion.text.length > 88 ? "is-medium" : ""}`}>
                      <div className="question-lead">{currentQuestion.lead}</div>
                      <h3>{currentQuestion.text}</h3>
                    </div>

                    <div className="answer-grid answer-grid--editorial answer-ledger">
                      {currentQuestion.options.map((opt, optionIndex) => (
                        <button
                          key={opt.id}
                          className="answer-card answer-card--editorial answer-ledger-row"
                          onClick={() => answerQuestion(currentQuestion.id, opt.id)}
                        >
                          <span className="answer-card-no">{String(optionIndex + 1).padStart(2, "0")}</span>
                          <span className={`answer-card-label ${opt.label.length > 82 ? "is-long" : opt.label.length > 56 ? "is-medium" : ""}`}>{opt.label}</span>
                          <span className="answer-card-action">
                            <small>TO NAJBLIŻSZE</small>
                            <b aria-hidden="true">↗</b>
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="section-actions closed-question-actions">
                      <GhostButton onClick={goBack}>Wróć</GhostButton>
                      <GhostButton onClick={resetAll}>Od początku</GhostButton>
                    </div>
                  </section>
                </Glass>
              </motion.div>
            );
          })()}

          {stage === "question_signal" && path && (
            <PauseInsightPanel
              insight={buildPauseInsight("questions", path, answers, forceMap, burdens, truthCards)}
              onBack={goBack}
              onNext={() => setStage("checkpoint")}
              nextLabel="Dalej →"
            />
          )}

          {stage === "checkpoint" && path && (
            <motion.div
              key={`${path.key}-checkpoint`}
              className="closed-question-experience checkpoint-experience"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: .32, ease: "easeOut" }}
            >
              <Glass className="question-panel closed-question-panel checkpoint-question-panel">
                <aside className="closed-question-rail">
                  <div className="closed-question-rail-top checkpoint-mark">
                    <span>PUNKT</span>
                    <strong>◆</strong>
                  </div>
                  <div className="closed-question-phase">
                    <span>PUNKT KONTROLNY</span>
                    <h2>Zatrzymaj pierwszy odruch</h2>
                    <p>Ta odpowiedź ustawia dalszą część analizy. Wybierz to, co dzieje się najczęściej, nie to, co wydarzyło się raz.</p>
                  </div>
                  <div className="closed-question-path">
                    <span>ŚCIEŻKA</span>
                    <strong>{path.title}</strong>
                  </div>
                </aside>

                <section className="closed-question-content">
                  <div className="closed-question-rule">
                    <span>{path.checkpoint.title.toUpperCase()}</span>
                    <i aria-hidden="true" />
                  </div>
                  <div className={`question-copy closed-question-copy checkpoint-question-copy ${path.checkpoint.text.length > 118 ? "is-long" : path.checkpoint.text.length > 88 ? "is-medium" : ""}`}>
                    <h3>{path.checkpoint.text}</h3>
                  </div>
                  <div className="answer-grid answer-grid--editorial answer-ledger">
                    {path.checkpoint.options.map((opt, optionIndex) => (
                      <button
                        key={opt.id}
                        className="answer-card answer-card--editorial answer-ledger-row"
                        onClick={() => answerCheckpoint(opt.id)}
                      >
                        <span className="answer-card-no">{String(optionIndex + 1).padStart(2, "0")}</span>
                        <span className={`answer-card-label ${opt.label.length > 82 ? "is-long" : opt.label.length > 56 ? "is-medium" : ""}`}>{busy ? "Ładuję..." : opt.label}</span>
                        <span className="answer-card-action">
                          <small>TO NAJBLIŻSZE</small>
                          <b aria-hidden="true">↗</b>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="section-actions closed-question-actions"><GhostButton onClick={goBack}>Wróć</GhostButton></div>
                </section>
              </Glass>
            </motion.div>
          )}


          {stage === "force_map" && path && (
            <motion.div key={`${path.key}-force-map`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">MAPA RELACJI · KROK 1 Z 4</div>
                  <h2>Układ sił</h2>
                  <p>Nie przesuwasz suwaków. Po prostu zaznaczasz, po której stronie częściej leży ciężar danego elementu.</p>
                </div>
                <div className="progress-wrap">
                  <span>Mapa relacji</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${mapCompletion(forceMap, burdens, emotions, truthCards)}%` }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel">
                <div className="map-step-note">
                  To jest część, która pozwala zobaczyć asymetrię bez pisania długiej historii. Wybierz najbliższą odpowiedź, nie idealną.
                </div>
                <div className="force-map-list">
                  {forceMapItemsForPath(path.key).map((item, itemIndex) => (
                    <div
                      key={item.key}
                      className="force-map-item force-map-item--editorial"
                      data-selected={forceMap[item.key] || "none"}
                    >
                      <div className="force-map-topline">
                        <span className="force-map-index">{String(itemIndex + 1).padStart(2, "0")}</span>
                        <div className="force-map-copy">
                          <strong>{item.title}</strong>
                          <span>{item.hint}</span>
                        </div>
                      </div>
                      <div className="force-choice-field">
                        <div className="force-choice-anchors" aria-hidden="true">
                          <span>BARDZIEJ PO TWOJEJ STRONIE</span>
                          <span>RÓWNOWAGA</span>
                          <span>BARDZIEJ PO DRUGIEJ STRONIE</span>
                        </div>
                        <div className="force-options" role="group" aria-label={item.title}>
                          {FORCE_OPTIONS.map((opt, optionIndex) => (
                            <button
                              key={opt.value}
                              type="button"
                              aria-pressed={forceMap[item.key] === opt.value}
                              className={`force-option ${forceMap[item.key] === opt.value ? "selected" : ""}`}
                              onClick={() => setForceValue(item.key, opt.value)}
                            >
                              <span className="force-option-code">{["I", "II", "III", "IV", "V"][optionIndex]}</span>
                              <span className="force-option-label">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                        {forceMap[item.key] && (
                          <div className="force-map-selection">
                            <span>TWÓJ ODCZYT</span>
                            <strong>{forceLabel(forceMap[item.key])}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={() => setStage("burdens")} disabled={forceMapItemsForPath(path.key).some((item) => !forceMap[item.key])}>Dalej →</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}


          {stage === "force_signal" && path && (
            <PauseInsightPanel
              insight={buildPauseInsight("force", path, answers, forceMap, burdens, truthCards)}
              onBack={goBack}
              onNext={() => setStage("burdens")}
              nextLabel="Dalej →"
            />
          )}

          {stage === "burdens" && path && (
            <motion.div
              key={`${path.key}-burdens`}
              className="ctms-map-stage ctms-map-stage--burdens"
              data-ui-version="2.4.4"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Glass className="ctms-map-canvas">
                <aside className="ctms-map-rail">
                  <div className="ctms-map-sequence">
                    <strong>02</strong>
                    <span>Z 04</span>
                  </div>
                  <div className="ctms-map-rail-copy">
                    <span>WARSTWA CIĘŻARU</span>
                    <h2>Co naprawdę niesiesz</h2>
                    <p>Nie zaznaczasz wszystkiego, co jest trudne. Wybierasz trzy elementy, które najmocniej ustawiają całą relację.</p>
                  </div>
                  <div className="ctms-map-rail-foot">
                    <span>WYBRANA ŚCIEŻKA</span>
                    <strong>{path.title}</strong>
                  </div>
                </aside>

                <section className="ctms-map-body">
                  <header className="ctms-map-body-head">
                    <div>
                      <span>PRIORYTETY RELACJI</span>
                      <h3>Wskaż ciężar główny i dwa, które go wzmacniają.</h3>
                    </div>
                    <div className="ctms-map-counter" aria-label={`${burdens.length} z 3 wybrane`}>
                      <strong>{burdens.length}</strong>
                      <span>/ 3</span>
                    </div>
                  </header>

                  <div className="ctms-burden-ledger">
                    {burdenOptionsForPath(path.key).map((label, optionIndex) => {
                      const selected = burdens.find((item) => item.label === label);
                      return (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={Boolean(selected)}
                          className={`ctms-ledger-row ${selected ? `selected rank-${selected.rank}` : ""}`}
                          onClick={() => toggleBurden(label)}
                        >
                          <span className="ctms-ledger-index">{String(optionIndex + 1).padStart(2, "0")}</span>
                          <span className="ctms-ledger-copy">
                            <small>{selected ? `PRIORYTET ${selected.rank}` : "MOŻLIWY CIĘŻAR"}</small>
                            <strong>{label}</strong>
                          </span>
                          <span className="ctms-ledger-action" aria-hidden="true">
                            {selected ? selected.rank : "+"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="ctms-map-reading-note">
                    <span>JAK TO CZYTAĆ</span>
                    <p>Pierwszy wybór jest osią problemu. Drugi i trzeci pokażą, co go podtrzymuje albo zwiększa jego koszt.</p>
                  </div>

                  <div className="section-actions ctms-map-actions">
                    <GhostButton onClick={goBack}>Wróć</GhostButton>
                    <PrimaryButton onClick={() => setStage("emotions")} disabled={burdens.length < 1}>Dalej →</PrimaryButton>
                  </div>
                </section>
              </Glass>
            </motion.div>
          )}


          {stage === "burden_signal" && path && (
            <PauseInsightPanel
              insight={buildPauseInsight("burdens", path, answers, forceMap, burdens, truthCards)}
              onBack={goBack}
              onNext={() => setStage("emotions")}
              nextLabel="Dalej →"
            />
          )}

          {stage === "emotions" && path && (
            <motion.div
              key={`${path.key}-emotions`}
              className="ctms-map-stage ctms-map-stage--emotions"
              data-ui-version="2.4.4"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Glass className="ctms-map-canvas">
                <aside className="ctms-map-rail">
                  <div className="ctms-map-sequence">
                    <strong>03</strong>
                    <span>Z 04</span>
                  </div>
                  <div className="ctms-map-rail-copy">
                    <span>WARSTWA REAKCJI</span>
                    <h2>Co uruchamia ta relacja</h2>
                    <p>Emocja nie rozstrzyga, kto ma rację. Pokazuje za to, w jakim stanie najczęściej zostajesz po kontakcie z tą sytuacją.</p>
                  </div>
                  <div className="ctms-map-rail-foot">
                    <span>WYBRANA ŚCIEŻKA</span>
                    <strong>{path.title}</strong>
                  </div>
                </aside>

                <section className="ctms-map-body">
                  <header className="ctms-map-body-head">
                    <div>
                      <span>POLE EMOCJI</span>
                      <h3>Wybierz trzy stany. Pierwszy jest tym, który wraca najmocniej.</h3>
                    </div>
                    <div className="ctms-map-counter" aria-label={`${emotions.length} z 3 wybrane`}>
                      <strong>{emotions.length}</strong>
                      <span>/ 3</span>
                    </div>
                  </header>

                  <div className="ctms-emotion-field">
                    {emotionOptionsForPath(path.key).map((label, optionIndex) => {
                      const selected = emotions.find((item) => item.label === label);
                      return (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={Boolean(selected)}
                          className={`ctms-emotion-signal ${selected ? `selected rank-${selected.rank}` : ""}`}
                          onClick={() => toggleEmotion(label)}
                        >
                          <span className="ctms-emotion-code">{String(optionIndex + 1).padStart(2, "0")}</span>
                          <span className="ctms-emotion-pulse" aria-hidden="true" />
                          <span className="ctms-emotion-copy">
                            <small>{selected ? `DOMINUJE JAKO ${selected.rank}` : "STAN DO ROZPOZNANIA"}</small>
                            <strong>{label}</strong>
                          </span>
                          <span className="ctms-emotion-mark" aria-hidden="true">{selected ? selected.rank : "↗"}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="ctms-map-reading-note">
                    <span>WAŻNE ROZRÓŻNIENIE</span>
                    <p>Te stany nie są dowodem na intencję drugiej osoby. Są informacją o koszcie, który relacja regularnie uruchamia w Tobie.</p>
                  </div>

                  <div className="section-actions ctms-map-actions">
                    <GhostButton onClick={goBack}>Wróć</GhostButton>
                    <PrimaryButton onClick={() => setStage("mid_reflection")} disabled={emotions.length < 1}>Dalej →</PrimaryButton>
                  </div>
                </section>
              </Glass>
            </motion.div>
          )}


          {stage === "mid_reflection" && path && (() => {
            const reflection = buildMidwayReflection(path, forceMap, burdens, emotions);
            return (
              <motion.div key={`${path.key}-mid-reflection`} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Glass className="midway-reflection">
                  <div className="midway-reflection-kicker">{reflection.kicker}</div>
                  <div className="midway-reflection-title">{reflection.title}</div>
                  <blockquote>{reflection.quote}</blockquote>
                  <div className="midway-reflection-signal">{reflection.signal}</div>
                  <p>{reflection.next}</p>
                  <div className="section-actions">
                    <GhostButton onClick={goBack}>Wróć</GhostButton>
                    <PrimaryButton onClick={() => setStage("truth_cards")}>Sprawdźmy to dalej →</PrimaryButton>
                  </div>
                </Glass>
              </motion.div>
            );
          })()}

          {stage === "truth_cards" && path && (
            <motion.div
              key={`${path.key}-truth-cards`}
              className="ctms-map-stage ctms-map-stage--truth"
              data-ui-version="2.4.4"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Glass className="ctms-map-canvas">
                <aside className="ctms-map-rail">
                  <div className="ctms-map-sequence">
                    <strong>04</strong>
                    <span>Z 04</span>
                  </div>
                  <div className="ctms-map-rail-copy">
                    <span>WARSTWA PRAWDY</span>
                    <h2>Zdanie, którego nie chcesz już omijać</h2>
                    <p>Nie szukasz odpowiedzi idealnej. Zaznaczasz jedno albo dwa zdania, które najtrafniej nazywają miejsce, w którym dziś jesteś.</p>
                  </div>
                  <div className="ctms-map-rail-foot">
                    <span>WYBRANA ŚCIEŻKA</span>
                    <strong>{path.title}</strong>
                  </div>
                </aside>

                <section className="ctms-map-body">
                  <header className="ctms-map-body-head">
                    <div>
                      <span>PRÓBA PRAWDY</span>
                      <h3>Przeczytaj powoli. Wybierz to, przy czym najtrudniej przejść obojętnie.</h3>
                    </div>
                    <div className="ctms-map-counter" aria-label={`${truthCards.length} z 2 wybrane`}>
                      <strong>{truthCards.length}</strong>
                      <span>/ 2</span>
                    </div>
                  </header>

                  <div className="ctms-truth-manifesto">
                    {truthCardOptionsForPath(path.key).map((text, optionIndex) => {
                      const selected = truthCards.includes(text);
                      const selectedIndex = truthCards.indexOf(text) + 1;
                      return (
                        <button
                          key={text}
                          type="button"
                          aria-pressed={selected}
                          className={`ctms-truth-statement ${selected ? "selected" : ""}`}
                          onClick={() => toggleTruthCard(text)}
                        >
                          <span className="ctms-truth-order">{String(optionIndex + 1).padStart(2, "0")}</span>
                          <span className="ctms-truth-quote" aria-hidden="true">„</span>
                          <span className="ctms-truth-text">{text}</span>
                          <span className="ctms-truth-choice">
                            <small>{selected ? `WYBRANE ${selectedIndex}` : "SPRAWDŹ TO ZDANIE"}</small>
                            <b aria-hidden="true">{selected ? "✓" : "↗"}</b>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="ctms-map-reading-note">
                    <span>TO NIE JEST WERDYKT</span>
                    <p>To punkt, który dalsza analiza zestawi z faktami, zachowaniem drugiej strony i Twoim własnym opisem sytuacji.</p>
                  </div>

                  <div className="section-actions ctms-map-actions">
                    <GhostButton onClick={goBack}>Wróć</GhostButton>
                    <PrimaryButton onClick={prepareMapSummary} disabled={truthCards.length < 1 || busy}>Dalej →</PrimaryButton>
                  </div>
                </section>
              </Glass>
            </motion.div>
          )}


          {stage === "truth_signal" && path && (
            <PauseInsightPanel
              insight={buildPauseInsight("truth", path, answers, forceMap, burdens, truthCards)}
              onBack={goBack}
              onNext={() => setStage("short_note")}
              nextLabel="Dalej →"
            />
          )}

          {stage === "short_note" && path && (
            <motion.div key={`${path.key}-short-note`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">MAPA RELACJI · KROK 5 Z 5</div>
                  <h2>Jedno zdanie od Ciebie</h2>
                  <p>Dopisz jedną rzecz, której nie było w odpowiedziach. Może być jednym zdaniem.</p>
                </div>
                <div className="progress-wrap">
                  <span>Ostatni krok</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: "100%" }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel">
                <div className="map-summary-box">
                  <div>
                    <span>Układ sił</span>
                    <strong>{FORCE_MAP_ITEMS.filter((item) => forceMap[item.key]).length}/{FORCE_MAP_ITEMS.length}</strong>
                  </div>
                  <div>
                    <span>Ciężary</span>
                    <strong>{burdens.map((item) => `${item.rank}. ${item.label}`).join(" · ") || "brak"}</strong>
                  </div>
                  <div>
                    <span>Emocje</span>
                    <strong>{emotions.map((item) => `${item.rank}. ${item.label}`).join(" · ") || "brak"}</strong>
                  </div>
                  <div>
                    <span>Moment prawdy</span>
                    <strong>{truthCards.length ? `${truthCards.length} zaznaczone` : "brak"}</strong>
                  </div>
                </div>
                <textarea
                  className="ctms-textarea ctms-textarea--short"
                  value={relationshipNote}
                  onChange={(e) => setRelationshipNote(e.target.value)}
                  placeholder="Np. Po kłótni ja próbuję wrócić do rozmowy, a druga strona milczy przez kilka dni."
                  maxLength={500}
                />
                <div className="text-meta"><div>Opcjonalnie, ale bardzo pomaga analizie.</div><div>{relationshipNote.length}/500</div></div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={prepareMapSummary} disabled={busy}>Dalej →</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}


          {stage === "map_summary" && path && (
            <motion.div key={`${path.key}-map-summary`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">PRZED WYNIKIEM</div>
                  <h2>Teraz potrzebny jest konkret z życia</h2>
                  <p>Mapa pokazuje układ. Następne pytania otwarte mają sprawdzić, jak ten układ wygląda w realnych sytuacjach, nie tylko w kliknięciach.</p>
                </div>
                <div className="progress-wrap">
                  <span>Mapa gotowa</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: "100%" }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel map-summary-clean">
                <div className="map-summary-clean-copy">
                  <div className="eyebrow">MAPA ZAMKNIĘTA</div>
                  <h3>Teraz sprawdzimy trzy konkretne sytuacje i ewentualnie doprecyzujemy jeden niejasny punkt.</h3>
                  <p>Na samym końcu dostaniesz szerokie pole na własny opis, żeby żaden ważny kontekst nie został poza analizą.</p>
                </div>
                <div className="map-step-note strong-note">
                  Przed Tobą dokładnie 3 pytania otwarte. Jeśli jeden punkt nadal będzie niejasny, pojawi się krótkie doprecyzowanie. Na końcu dopiszesz własny, szerszy kontekst.
                </div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <PrimaryButton onClick={startOpenInterview}>Dalej do pytań otwartych →</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "clarification" && path && clarificationQuestions[clarificationIndex] && (
            <motion.div key={`${path.key}-clarification-${clarificationIndex}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="section-head compact">
                <div>
                  <div className="eyebrow">JEDEN KONKRET {clarificationIndex + 1} Z {clarificationQuestions.length}</div>
                  <h2>{clarificationQuestions[clarificationIndex].signal}</h2>
                  <p>{clarificationQuestions[clarificationIndex].lead} Odpowiedz zwyczajnie, na przykładzie jednej sytuacji.</p>
                </div>
                <div className="progress-wrap">
                  <span>{clarificationIndex + 1}/{clarificationQuestions.length}</span>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${((clarificationIndex + 1) / clarificationQuestions.length) * 100}%` }} /></div>
                </div>
              </div>
              <Glass className="question-panel relationship-map-panel clarification-panel">
                <div className="clarification-question">
                  {clarificationQuestions[clarificationIndex].text}
                </div>
                <textarea
                  className="ctms-textarea clarification-textarea"
                  value={clarificationDraft}
                  onChange={(e) => setClarificationDraft(e.target.value)}
                  placeholder="Np. Po ostatniej kłótni ja napisałem pierwszy, ona odpisała po dwóch dniach i temat już nie wrócił."
                  maxLength={700}
                />
                <div className="text-meta"><div>Wystarczą konkrety. Nie pisz wypracowania.</div><div>{clarificationDraft.length}/700</div></div>
                <div className="section-actions">
                  <GhostButton onClick={goBack}>Wróć</GhostButton>
                  <GhostButton onClick={() => saveClarificationAndNext(true)}>Pomiń</GhostButton>
                  <PrimaryButton onClick={() => saveClarificationAndNext(false)} disabled={busy || clarificationDraft.trim().length < 12}>{clarificationIndex >= clarificationQuestions.length - 1 ? "Dalej do własnego opisu →" : "Dalej →"}</PrimaryButton>
                </div>
              </Glass>
            </motion.div>
          )}

          {stage === "interview" && interviewState && (() => {
            const depth = Math.max(1, Math.min(OPEN_INTERVIEW_LIMIT, interviewState.depth));
            const chapter = interviewChapter(depth);
            const previousExchange = interviewState.history[interviewState.history.length - 1];
            const firstExchange = interviewState.history[0];
            const previousExcerpt = interviewAnswerExcerpt(previousExchange?.user);
            const firstExcerpt = interviewAnswerExcerpt(firstExchange?.user, 150);
            const writingCue = interviewWritingCue(interviewState.path, depth);
            return (
              <motion.div
                key={`interview-${interviewState.exchangeIndex}`}
                className={`interview-experience interview-depth-${depth}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: .36, ease: "easeOut" }}
              >
                <div className="interview-chapter-nav" aria-label={`Pytanie ${depth} z ${OPEN_INTERVIEW_LIMIT}`}>
                  {INTERVIEW_CHAPTERS.map((item, index) => {
                    const itemDepth = index + 1;
                    const state = itemDepth < depth ? "done" : itemDepth === depth ? "active" : "waiting";
                    return (
                      <div className={`interview-chapter-tab ${state}`} key={item.number}>
                        <span>{item.number}</span>
                        <strong>{item.eyebrow}</strong>
                      </div>
                    );
                  })}
                </div>

                <Glass className={`interview-editorial-panel interview-editorial-panel--${depth}`}>
                  <aside className="interview-chapter-rail">
                    <div className="interview-rail-number">{chapter.number}</div>
                    <div className="interview-rail-copy">
                      <span>{chapter.eyebrow}</span>
                      <h2>{chapter.title}</h2>
                      <p>{chapter.purpose}</p>
                    </div>
                    <div className="interview-path-mark">
                      {(ENTRY_CONFIGS.find((x) => x.key === selectedPath)?.title || "Twoja ścieżka")}
                    </div>
                  </aside>

                  <section className="interview-editorial-content">
                    {depth > 1 && (
                      <div className="interview-trace-block">
                        <div className="interview-trace-label">ŚLAD Z POPRZEDNIEJ ODPOWIEDZI</div>
                        {interviewState.currentObservation && (
                          <blockquote>{interviewState.currentObservation}</blockquote>
                        )}
                        {previousExcerpt && <p>„{previousExcerpt}”</p>}
                      </div>
                    )}

                    {depth === 3 && firstExcerpt && previousExcerpt && firstExcerpt !== previousExcerpt && (
                      <div className="interview-frame-pair" aria-label="Dwa fragmenty, które łączy ostatnie pytanie">
                        <div>
                          <span>PIERWSZY KADR</span>
                          <p>„{firstExcerpt}”</p>
                        </div>
                        <div>
                          <span>OSTATNI ŚLAD</span>
                          <p>„{previousExcerpt}”</p>
                        </div>
                      </div>
                    )}

                    <div className={`question-copy interview-question-copy ${interviewState.currentQuestion.length > 160 ? "is-long" : interviewState.currentQuestion.length > 112 ? "is-medium" : ""}`}>
                      {interviewState.currentLead && <div className="question-lead">{interviewState.currentLead}</div>}
                      <h3>{interviewState.currentQuestion}</h3>
                    </div>

                    <div className="interview-writing-desk">
                      <div className="interview-writing-head">
                        <span>{chapter.writingLabel}</span>
                        <em>{writingCue}</em>
                      </div>
                      <textarea
                        className="ctms-textarea interview-textarea"
                        value={interviewAnswer}
                        onChange={(e) => setInterviewAnswer(e.target.value)}
                        placeholder={writingCue}
                        maxLength={2000}
                        autoFocus
                      />
                      <div className="interview-writing-footer">
                        <span>Nie pisz ładnie. Pisz tak, żeby dało się zobaczyć, co naprawdę się wydarzyło.</span>
                        <b>{interviewAnswer.length}/2000</b>
                      </div>
                    </div>

                    {error && <div className="error-line interview-error">{error}</div>}
                    <div className="section-actions interview-actions">
                      <GhostButton onClick={goBack}>Wróć</GhostButton>
                      <PrimaryButton onClick={sendInterviewAnswer} disabled={interviewBusy || interviewAnswer.trim().length < 18}>
                        {interviewBusy ? "Układam kolejne pytanie…" : interviewButtonLabel(depth)}
                      </PrimaryButton>
                    </div>
                  </section>
                </Glass>
              </motion.div>
            );
          })()}


          {stage === "open_text" && path && (() => {
            const context = finalContextForPath(path);
            return (
              <motion.div key={`${path.key}-open`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Glass className="question-panel final-context-panel">
                  <div className="final-context-head">
                    <div className="eyebrow">{context.eyebrow}</div>
                    <h2>{context.title}</h2>
                    <p>{context.lead}</p>
                  </div>
                  <div className="final-context-prompts" aria-label="Co możesz dopisać">
                    {context.prompts.map((prompt, index) => (
                      <span key={prompt}><b>0{index + 1}</b>{prompt}</span>
                    ))}
                  </div>
                  <textarea
                    className="ctms-textarea final-context-textarea"
                    value={openText}
                    onChange={(e) => setOpenText(e.target.value)}
                    placeholder={context.placeholder}
                    maxLength={5000}
                  />
                  <div className="text-meta">
                    <div>Nie musisz odpowiadać punkt po punkcie. Opisz to własnymi słowami.</div>
                    <div>{openText.length}/5000</div>
                  </div>
                  <div className="final-context-weight-note">
                    Ten opis nie jest dodatkiem kosmetycznym. Może potwierdzić wcześniejszy kierunek, osłabić go albo ujawnić fakt, którego pytania nie wychwyciły.
                  </div>
                  <label className="analysis-consent-inline">
                    <input
                      type="checkbox"
                      checked={analysisConsent}
                      onChange={(event) => {
                        const accepted = event.target.checked;
                        setAnalysisConsent(accepted);
                        setAnalysisConsentAcceptedAt(accepted ? new Date().toISOString() : "");
                        if (accepted) setError(null);
                      }}
                    />
                    <span>
                      Wyrażam zgodę na przetworzenie treści podanych w analizie, w tym informacji mogących dotyczyć zdrowia, życia intymnego lub przemocy, wyłącznie w celu przygotowania mojego odczytu z użyciem technologii OpenAI.
                      <small> Kontynuując, akceptujesz <a href="/regulamin" target="_blank" rel="noreferrer">Regulamin</a>, <a href="/polityka-prywatnosci" target="_blank" rel="noreferrer">Politykę prywatności</a> i informację <a href="/rodo" target="_blank" rel="noreferrer">RODO</a>.</small>
                    </span>
                  </label>
                  {error && <div className="error-line" style={{ marginTop: "12px" }}>{error}</div>}
                  <div className="section-actions">
                    <GhostButton onClick={goBack}>Wróć</GhostButton>
                    <GhostButton onClick={() => continueAfterFinalContext(true)} disabled={busy || !analysisConsent}>Nie mam nic do dodania</GhostButton>
                    <PrimaryButton onClick={() => continueAfterFinalContext(false)} disabled={busy || openText.trim().length < 20 || !analysisConsent}>{busy ? "Analizuję..." : "Uwzględnij mój kontekst →"}</PrimaryButton>
                  </div>
                </Glass>
              </motion.div>
            );
          })()}

          {stage === "crisis" && (
            <motion.div key="crisis" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel crisis-panel">
                <div className="eyebrow danger">ZATRZYMAJ SIĘ</div>
                <h2>To nie jest właściwe narzędzie dla sytuacji zagrożenia.</h2>
                <p className="consent-copy">Jeśli jest ryzyko przemocy, zagrożenia życia albo skrzywdzenia siebie, przerwij analizę i skorzystaj z natychmiastowej pomocy. Nie analizuj relacji, kiedy jesteś w bezpośrednim zagrożeniu. Najpierw bezpieczeństwo, potem interpretacja.</p>
                <div className="crisis-grid">
                  <Glass className="crisis-box"><strong>112</strong>. Numer alarmowy</Glass>
                  <Glass className="crisis-box"><strong>116 123</strong>. Telefon zaufania dla dorosłych</Glass>
                  <Glass className="crisis-box"><strong>116 111</strong>. Telefon zaufania dla dzieci i młodzieży</Glass>
                </div>
                <div className="section-actions"><GhostButton onClick={resetAll}>Zamknij</GhostButton></div>
              </Glass>
            </motion.div>
          )}

          {stage === "preview" && preview && (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="preview-card preview-card--editorial">
                <div className="preview-hero preview-hero--no-score">
                  <div>
                    <div className="eyebrow">PIERWSZY ODCZYT SYTUACJI</div>
                    <h2>{preview.headline}</h2>
                    <p className="preview-lead">{preview.truth}</p>
                    <p className="preview-muted">{preview.mirror}</p>
                  </div>
                </div>

                <Glass className="preview-analysis-panel preview-analysis-panel--strong preview-evidence-panel">
                  <div className="eyebrow">NA CZYM OPIERA SIĘ TEN ODCZYT</div>
                  <div className="preview-evidence-layout">
                    <div className="preview-evidence-main">
                      <span>Fakty i zachowania</span>
                      <p>{preview.whatUserKnows || preview.summary}</p>
                    </div>
                    <div className="preview-evidence-side">
                      <div className="preview-editorial-note">
                        <span>Czego nie przesądzamy</span>
                        <p>{preview.contradiction || "Jedna perspektywa nie pozwala rozstrzygnąć intencji drugiej osoby ani uznać pojedynczego zdarzenia za stały wzorzec."}</p>
                      </div>
                      <div className="preview-editorial-note">
                        <span>Co może zmienić obraz</span>
                        <p>{preview.hiddenInsight || "Powtarzalne zachowanie po rozmowie, widoczne bez przypominania i nacisku."}</p>
                      </div>
                    </div>
                  </div>
                  <div className="preview-next-move">
                    <span>Najbliższy rozsądny ruch</span>
                    <strong>{preview.concreteConclusion || "Przez kilka dni patrz nie na deklaracje, tylko na to, co zmienia się bez Twojego ciągnięcia tematu."}</strong>
                  </div>
                </Glass>

                {path && (
                  <Glass className="unlock-panel unlock-panel--strong">
                    <div className="eyebrow">PEŁNA ANALIZA</div>
                    <p className="unlock-copy">Pełny raport rozwija ten odczyt w 7 kluczowych obszarach i modułach dobranych do Twojej historii. Pokazuje podstawy wniosków, kontrsygnały, poziom pewności oraz konkretny ruch — bez sprowadzania relacji do jednego wyniku.</p>
                    <div className="premium-sample-grid">
                      {buildPremiumSamples(path, preview).map((item, index) => (
                        <div key={item.title} className="premium-sample-card">
                          <div className="premium-sample-no">0{index + 1}</div>
                          <strong>{item.title}</strong>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="unlock-form">
                      <input className="ctms-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Twój adres e-mail." />
                      <label className="purchase-consent">
                        <input
                          type="checkbox"
                          checked={purchaseConsent}
                          onChange={(event) => setPurchaseConsent(event.target.checked)}
                        />
                        <span>
                          Wyrażam zgodę na rozpoczęcie generowania indywidualnego raportu bezpośrednio po płatności i przyjmuję do wiadomości, że po rozpoczęciu realizacji tracę prawo odstąpienia od umowy w zakresie tej treści cyfrowej.
                        </span>
                      </label>
                      <PrimaryButton onClick={pay} disabled={busy}>{busy ? "Przetwarzanie..." : "Pokaż pełną analizę — 19,99 zł"}</PrimaryButton>
                    </div>
                    <div className="unlock-fineprint">To nie jest diagnoza, terapia ani decyzja za Ciebie. To prywatny odczyt jednej perspektywy.</div>
                  </Glass>
                )}
                {error && <div className="error-line">{error}</div>}
                <div className="section-actions"><GhostButton onClick={goBack}>Wróć</GhostButton><GhostButton onClick={resetAll}>Od początku</GhostButton></div>
              </Glass>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProcessingScreen />
            </motion.div>
          )}

          {stage === "paid" && fullReport && (
            <motion.div key="paid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="preview-card premium-report-card">
                <div className="premium-report-toolbar">
                  <div className="eyebrow">PEŁNY ODCZYT RELACJI</div>
                  <div className="premium-report-actions">
                    <GhostButton onClick={printPremiumReport}>Drukuj / zapisz PDF</GhostButton>
                    <PrimaryButton onClick={downloadPremiumReport}>Pobierz PDF</PrimaryButton>
                  </div>
                </div>
                <div className="premium-report-head">
                  <h2>{fullReport.headline || "Pełny raport relacji"}</h2>
                  <p>{fullReport.subheadline || fullReport.previewLine || "Poniżej znajdziesz odczyt Twojej sytuacji podzielony na konkretne obszary."}</p>
                  <div className={`report-confidence report-confidence--${fullReport.overallConfidence || "low"}`}>
                    <strong>Pewność odczytu:</strong> {confidenceLabel(fullReport.overallConfidence)}
                  </div>
                  {!!fullReport.evidenceSummary?.length && (
                    <div className="report-evidence-summary">
                      <span>Najmocniejsze podstawy odczytu</span>
                      <ul>{fullReport.evidenceSummary.map((item, index) => <li key={index}>{item}</li>)}</ul>
                    </div>
                  )}
                </div>
                <div className="report-sections premium-report-sections">
                  {(fullReport.sections || []).map((section, i) => (
                    <React.Fragment key={section.key || i}>
                      <Glass className={`report-section premium-report-section report-section--${section.tone || "normal"}`}>
                        <div className="premium-section-no">{String(i + 1).padStart(2, "0")}</div>
                        <div className={`report-section-title ${section.tone || "normal"}`}>{section.title}</div>
                        <div className={`section-confidence section-confidence--${section.confidence || "low"}`}>
                          Pewność: {confidenceLabel(section.confidence)}
                        </div>
                        <div className="report-section-text">
                          {String(section.text || "").split("\n").filter(Boolean).map((para, pi) => (
                            <p key={pi}>{para}</p>
                          ))}
                        </div>
                        <div className="section-evidence-grid">
                          {!!section.evidence?.length && (
                            <div><strong>Na czym opiera się ten wniosek</strong><ul>{section.evidence.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
                          )}
                          {section.counterSignal && <div><strong>Co nie pasuje do tej tezy</strong><p>{section.counterSignal}</p></div>}
                          {section.whatCouldChange && <div><strong>Co mogłoby zmienić ocenę</strong><p>{section.whatCouldChange}</p></div>}
                        </div>
                      </Glass>
                      {i === 1 && <RelationshipForcePortraitCard portrait={resolveRelationshipPortrait(fullReport).forceField} />}
                      {i === 5 && <TruthLinePortraitCard portrait={resolveRelationshipPortrait(fullReport).truthLine} />}
                    </React.Fragment>
                  ))}
                </div>
                {fullReport.closing && <div className="report-closing premium-closing">{fullReport.closing}</div>}

                <Glass className="report-feedback-panel">
                  <div>
                    <div className="eyebrow">KONTROLA JAKOŚCI</div>
                    <h3>Czy ten raport był trafny i użyteczny?</h3>
                    <p>Ocena nie zmienia raportu. Pomaga odróżnić faktycznie trafne analizy od tych, które brzmią dobrze, ale są zbyt ogólne.</p>
                  </div>
                  <div className="report-feedback-actions">
                    {([[5, "Trafny"], [3, "Częściowo"], [1, "Nietrafny"]] as [1 | 3 | 5, string][]).map(([rating, label]) => (
                      <button key={rating} type="button" className={reportFeedback === rating ? "is-selected" : ""} onClick={() => saveReportFeedback(rating)} disabled={reportFeedback !== null}>{label}</button>
                    ))}
                  </div>
                  {reportFeedbackMessage && <span className="followup-message">{reportFeedbackMessage}</span>}
                </Glass>

                <Glass className="pulse-upsell-panel followup-panel">
                  <div>
                    <div className="eyebrow">SPRAWDŹ, CO ZMIENIŁO SIĘ NAPRAWDĘ</div>
                    <h3>Ponowny odczyt relacji</h3>
                    <p>Wróć po 7 dniach, żeby sprawdzić pierwszy ruch, i po 21 dniach, żeby zobaczyć, czy zmiana się utrzymała. System porówna nowe zachowania z pierwszym odczytem, zamiast kazać Ci robić całą analizę od początku.</p>
                    <div className="pulse-upsell-grid">
                      <span>dynamiczne pytania zależne od Twojej historii</span>
                      <span>porównanie z pierwszym raportem</span>
                      <span>powrót bez konta i hasła</span>
                    </div>
                    <div className="followup-actions-row">
                      <button type="button" className="pulse-cta" onClick={startFollowUpNow}>Sprawdź zmianę teraz</button>
                      {anonymousProfile?.recoveryUrl && (
                        <button type="button" className="ctms-btn ctms-btn-ghost followup-copy-link" onClick={() => {
                          navigator.clipboard?.writeText(anonymousProfile.recoveryUrl || "");
                          setFollowUpMessage("Link do prywatnego powrotu został skopiowany.");
                        }}>Kopiuj link powrotu</button>
                      )}
                    </div>
                  </div>
                  <div className="pulse-price-card followup-reminder-card">
                    <strong>{followUpDueAt ? `Ustawiono: ${new Date(followUpDueAt).toLocaleDateString("pl-PL")}` : "Przypomnienie bez konta"}</strong>
                    <label className="followup-label">Plan sprawdzenia zmiany</label>
                    <div className="followup-plan"><strong>7 dni</strong><span>pierwszy obserwowalny ruch</span><strong>21 dni</strong><span>trwałość bez nacisku</span></div>
                    <label className="followup-label">E-mail do prywatnego linku</label>
                    <input type="email" value={followUpEmail || email} onChange={(event) => setFollowUpEmail(event.target.value)} placeholder="Twój adres e-mail" className="followup-email" />
                    <button type="button" className="pulse-cta" onClick={scheduleFollowUp} disabled={followUpSaving}>
                      {followUpSaving ? "Zapisuję…" : "Ustaw przypomnienie"}
                    </button>
                    {followUpMessage && <span className="followup-message">{followUpMessage}</span>}
                  </div>
                </Glass>

                {followUpOpen && dynamicFollowUpQuestion && (
                  <Glass className="followup-checkin-panel">
                    <div className="section-head">
                      <div>
                        <div className="eyebrow">PONOWNY ODCZYT — HISTORIA JEST PAMIĘTANA</div>
                        <h2>{dynamicFollowUpQuestion.lead}</h2>
                        <p>{dynamicFollowUpQuestion.question}</p>
                      </div>
                      <div className="progress-wrap"><span>{Math.min(dynamicFollowUpHistory.length + 1, 6)} / max 6</span></div>
                    </div>
                    {dynamicFollowUpQuestion.open ? (
                      <>
                        <textarea className="open-textarea" value={followUpDraft} onChange={(event) => setFollowUpDraft(event.target.value)} placeholder="Opisz jeden konkretny fakt albo sytuację…" rows={6} />
                        <div className="section-actions">
                          <GhostButton onClick={() => setFollowUpOpen(false)}>Wróć do raportu</GhostButton>
                          <PrimaryButton onClick={() => answerFollowUp()} disabled={!followUpDraft.trim() || followUpSaving}>{followUpSaving ? "Analizuję…" : "Dalej"}</PrimaryButton>
                        </div>
                      </>
                    ) : (
                      <div className="answers-grid">
                        {(dynamicFollowUpQuestion.options || []).map((option) => (
                          <button key={option.id} type="button" className="answer-card" onClick={() => answerFollowUp(option.id)} disabled={followUpSaving}>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </Glass>
                )}

                {dynamicFollowUpTeaser && (
                  <Glass className="followup-result followup-result--stable">
                    <div className="eyebrow">WSTĘPNY SYGNAŁ ZMIANY</div>
                    <h3>To nie jest już ten sam punkt, co przy pierwszym odczycie.</h3>
                    <p className="followup-result-summary">{dynamicFollowUpTeaser}</p>
                    <p>Pełny raport porówna wszystkie wcześniejsze wnioski z nowymi faktami i pokaże, co jest trwałą zmianą, co tylko chwilową ulgą oraz co sprawdzić dalej.</p>
                    <div className="followup-reminder-card" style={{ marginTop: 18 }}>
                      <label className="followup-label">E-mail do odbioru raportu</label>
                      <input type="email" value={followUpEmail || email} onChange={(event) => setFollowUpEmail(event.target.value)} placeholder="Twój adres e-mail" className="followup-email" />
                      <label className="purchase-consent">
                        <input
                          type="checkbox"
                          checked={followUpPurchaseConsent}
                          onChange={(event) => setFollowUpPurchaseConsent(event.target.checked)}
                        />
                        <span>
                          Wyrażam zgodę na rozpoczęcie generowania raportu porównawczego bezpośrednio po płatności i przyjmuję do wiadomości utratę prawa odstąpienia po rozpoczęciu realizacji.
                        </span>
                      </label>
                    </div>
                    <div className="section-actions">
                      <PrimaryButton onClick={buyFollowUpReport} disabled={followUpCheckoutBusy}>{followUpCheckoutBusy ? "Przekierowuję…" : "Odbierz pełne porównanie — 9,99 zł"}</PrimaryButton>
                      <GhostButton onClick={startFollowUpNow}>Zacznij od nowa ten powrót</GhostButton>
                    </div>
                  </Glass>
                )}
                <div className="section-actions"><GhostButton onClick={resetAll}>Nowa analiza</GhostButton></div>
              </Glass>
            </motion.div>
          )}


          {stage === "error" && (
            <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Glass className="question-panel error-panel">
                <div className="eyebrow danger">STATUS RAPORTU</div>
                <h2>Raport nie jest jeszcze gotowy.</h2>
                <p className="consent-copy">
                  {error || "Nie udało się jeszcze pobrać raportu. Jeżeli płatność została pobrana, nie płać drugi raz."}
                </p>
                <p className="consent-copy" style={{ color: BRAND.muted, fontSize: "14px" }}>
                  Jeżeli płatność została pobrana, system powinien dokończyć generowanie raportu w tle i wysłać link na podany adres e-mail.
                </p>
                <div className="section-actions">
                  {reportAccess && <PrimaryButton onClick={retryPaidReport} disabled={busy}>{busy ? "Sprawdzam..." : "Sprawdź raport ponownie"}</PrimaryButton>}
                  <GhostButton onClick={resetAll}>Nowa analiza</GhostButton>
                </div>
              </Glass>
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      <footer className="ctms-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap", padding: "28px 0", color: BRAND.muted, fontSize: "13px" }}>
        <div style={{ color: BRAND.gold, fontWeight: 700 }}>CzyToMaSens.</div>
        <nav style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
          {([
            ["/regulamin", "Regulamin"],
            ["/polityka-prywatnosci", "Polityka prywatności"],
            ["/rodo", "RODO"],
            ["/kontakt", "Kontakt"],
          ] as [string, string][]).map(([href, label]) => (
            <a
              key={href}
              href={href}
              style={{ color: BRAND.muted, textDecoration: "none" }}
              onClick={(event) => {
                event.preventDefault();
                setStage("landing");
                navigateTo(href);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </footer>

      {legalOpen && (
        <div className="ctms-modal-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.76)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Glass className="ctms-modal" style={{ width: "min(900px, 100%)", maxHeight: "82vh", overflow: "auto", padding: "30px" }}>
            <div className="section-head compact">
              <div>
                <div className="eyebrow">DOKUMENTY</div>
                <h2>{LEGAL_CONTENT[legalOpen].title}</h2>
              </div>
              <GhostButton onClick={() => setLegalOpen(null)}>Zamknij</GhostButton>
            </div>
            <div style={{ whiteSpace: "pre-line", color: BRAND.muted, lineHeight: 1.75, fontSize: "14px" }}>{LEGAL_CONTENT[legalOpen].body}</div>
          </Glass>
        </div>
      )}

      <CookieBanner />
    </div>
  );
}
