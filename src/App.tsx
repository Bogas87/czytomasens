import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./index.css";
import { TERMS, PRIVACY, CONSENTS } from "./legalContent";
import {
  getAppState,
  saveAppState,
  clearAppState,
  getSessionId,
  getConsentState,
  saveConsentState,
} from "./memory";

type Screen =
  | "landing"
  | "consents"
  | "entry"
  | "chat"
  | "checkpoint"
  | "processing"
  | "preview"
  | "paid_report";

type LegalKey = "terms" | "privacy" | null;

type EntryPoint = {
  id: string;
  label: string;
  note: string;
};

type Option = {
  label: string;
  tags: string[];
};

type Question = {
  id: number;
  lead: string;
  text: string;
  options: Option[];
};

type Answer = {
  questionId: number;
  text: string;
  tags: string[];
};

type InterviewNode = {
  aiPrompt: string;
  userText: string;
};

type PreviewSection = {
  title: string;
  text: string;
  tone?: "normal" | "gold" | "danger";
};

type PreviewReport = {
  headline: string;
  subheadline: string;
  previewLine: string;
  tensionPercent: number;
  driftPercent: number;
  rebuildPercent: number;
  sections: PreviewSection[];
  closing?: string;
};

type FullReport = {
  headline: string;
  subheadline?: string;
  previewLine?: string;
  rebuildPercent?: number;
  tensionPercent?: number;
  driftPercent?: number;
  sections?: PreviewSection[];
  closing?: string;
};

type PersistedDraft = {
  screen?: Screen;
  selectedPath?: string;
  step?: number;
  answers?: Answer[];
  interviews?: InterviewNode[];
  sessionToken?: string;
  preview?: PreviewReport | null;
  email?: string;
  currentAiObservation?: string;
  currentUserText?: string;
  patterns?: string[];
};

const API_BASE = import.meta.env.VITE_API_BASE || "";

const LEGAL_CONTENT = {
  terms: TERMS,
  privacy: PRIVACY,
};

const ENTRY_POINTS: EntryPoint[] = [
  {
    id: "betrayal",
    label: "Zdrada, kłamstwo albo utrata zaufania",
    note: "Tu nie chodzi tylko o sam fakt. Chodzi o to, co ta historia zrobiła z Twoim poczuciem bezpieczeństwa.",
  },
  {
    id: "uncertainty",
    label: "Nie wiem, na czym stoję",
    note: "Dla układów pełnych chaosu, niedopowiedzeń, emocjonalnych okruszków i sygnałów, które bardziej mieszają niż wyjaśniają.",
  },
  {
    id: "stagnation",
    label: "To trwa, ale coś ewidentnie gaśnie",
    note: "Nie wszystko kończy się wybuchem. Czasem relacja po prostu cicho traci sens, a ludzie długo tego nie nazywają.",
  },
  {
    id: "toxic_loops",
    label: "Kręcimy się w kółko i wracamy do tego samego",
    note: "Dla cyklu napięcie, ulga, powrót i kolejny rozjazd. Bez realnej zmiany, za to z coraz większym kosztem.",
  },
];

const QUESTIONS_BY_PATH: Record<string, Question[]> = {
  betrayal: [
    {
      id: 1,
      lead: "Po zdradzie liczą się nie deklaracje, tylko to, czy wróciło poczucie bezpieczeństwa.",
      text: "Czy po tej historii czujesz dziś więcej bezpieczeństwa, czy nadal głównie napięcie i czujność?",
      options: [
        { label: "Głównie napięcie i czujność", tags: ["betrayal", "stress", "hypervigilance"] },
        { label: "To się waha, nie jest stabilne", tags: ["betrayal", "instability"] },
        { label: "Powoli wraca bezpieczeństwo", tags: ["repair_attempt"] },
      ],
    },
    {
      id: 2,
      lead: "Naprawa po zdradzie nie działa, jeśli jedna strona rozmywa odpowiedzialność.",
      text: "Czy druga strona wzięła pełną odpowiedzialność, czy próbowała mieszać winę i przesuwać ciężar na Ciebie?",
      options: [
        { label: "Rozmywała odpowiedzialność", tags: ["gaslighting", "avoidance"] },
        { label: "Trochę brała, trochę uciekała", tags: ["instability"] },
        { label: "Wzięła ją jasno", tags: ["repair_attempt", "clarity"] },
      ],
    },
    {
      id: 3,
      lead: "Tu trzeba oddzielić miłość od lęku przed rozpadem.",
      text: "Gdybyś miał być brutalnie szczery, to bardziej zostajesz z wiary w zmianę czy z lęku przed stratą?",
      options: [
        { label: "Bardziej z lęku przed stratą", tags: ["fear_of_loss", "attachment"] },
        { label: "Po części z jednego i drugiego", tags: ["ambivalence"] },
        { label: "Bardziej z realnej wiary w zmianę", tags: ["hope", "repair_attempt"] },
      ],
    },
  ],
  uncertainty: [
    {
      id: 1,
      lead: "Niejasność bywa przypadkiem. Ale bywa też wygodnym narzędziem.",
      text: "Czy druga strona daje Ci uwagę głównie wtedy, gdy zaczynasz się wycofywać?",
      options: [
        { label: "Tak, dokładnie tak to działa", tags: ["breadcrumbing", "instability"] },
        { label: "Czasem tak, ale nie zawsze", tags: ["uncertainty"] },
        { label: "Nie, tego akurat nie widzę", tags: ["neutral"] },
      ],
    },
    {
      id: 2,
      lead: "Słowa bez zgodności z czynami są tylko mgłą.",
      text: "Czy deklaracje tej osoby rozjeżdżają się z jej realnym zachowaniem?",
      options: [
        { label: "Tak, bardzo często", tags: ["inconsistency", "confusion"] },
        { label: "Czasem, ale nie stale", tags: ["instability"] },
        { label: "Nie, raczej jest spójność", tags: ["consistency"] },
      ],
    },
    {
      id: 3,
      lead: "Tu zwykle kończy się romantyczna narracja, a zaczyna logika.",
      text: "Gdyby nic się nie zmieniło przez kolejne 6 miesięcy, to bardziej byś w tym trwał czy się dusił?",
      options: [
        { label: "Dusiłbym się coraz bardziej", tags: ["suffocation", "cost"] },
        { label: "Trwałbym, ale z coraz większym kosztem", tags: ["stagnation", "cost"] },
        { label: "To zależy, bo nie umiem tego ocenić", tags: ["unclear"] },
      ],
    },
  ],
  stagnation: [
    {
      id: 1,
      lead: "Brak dramatu nie zawsze oznacza spokój. Czasem oznacza wygaszenie.",
      text: "Czy coraz częściej tłumaczysz brak zaangażowania drugiej strony zmęczeniem, stresem albo trudnym okresem?",
      options: [
        { label: "Tak, często to sobie tłumaczę", tags: ["rationalization", "stagnation"] },
        { label: "Czasem tak robię", tags: ["ambivalence"] },
        { label: "Nie, widzę to już dość jasno", tags: ["clarity"] },
      ],
    },
    {
      id: 2,
      lead: "Najprostszy test relacji to test inicjatywy.",
      text: "Gdybyś przestał inicjować kontakt i naprawiać napięcie, czy to dalej by się toczyło?",
      options: [
        { label: "Nie, praktycznie by zgasło", tags: ["asymmetry", "one_sided"] },
        { label: "Mocno by osłabło", tags: ["asymmetry"] },
        { label: "Tak, druga strona też by to niosła", tags: ["mutuality"] },
      ],
    },
    {
      id: 3,
      lead: "Ludzie często zostają z potencjałem, a nie z rzeczywistością.",
      text: "Czy bardziej trzymasz się tego, kim ta osoba mogłaby być, niż tego, kim realnie jest dzisiaj?",
      options: [
        { label: "Tak, i zaczynam to widzieć", tags: ["idealization", "projection"] },
        { label: "Po części tak", tags: ["ambivalence"] },
        { label: "Nie, raczej patrzę na fakty", tags: ["clarity"] },
      ],
    },
  ],
  toxic_loops: [
    {
      id: 1,
      lead: "Powtarzalny chaos bywa mylony z intensywnością i więzią.",
      text: "Czy po każdej ostrej fazie napięcia pojawia się krótka ulga i bliskość, a potem wszystko wraca do starego schematu?",
      options: [
        { label: "Tak, dokładnie tak to wygląda", tags: ["cycle", "trauma_bond"] },
        { label: "W dużej mierze tak", tags: ["cycle", "instability"] },
        { label: "Nie, nie jest aż tak cykliczne", tags: ["neutral"] },
      ],
    },
    {
      id: 2,
      lead: "Granice zwykle nie pękają od razu. Najpierw się przesuwają.",
      text: "Czy dziś zgadzasz się na rzeczy, które jeszcze rok temu byłyby dla Ciebie nie do przyjęcia?",
      options: [
        { label: "Tak, i to mnie niepokoi", tags: ["boundary_erosion", "adaptation"] },
        { label: "Trochę tak", tags: ["boundary_shift"] },
        { label: "Nie, granice nadal mam jasne", tags: ["boundaries"] },
      ],
    },
    {
      id: 3,
      lead: "Tu zwykle kończy się ładna narracja, a zaczynają fakty.",
      text: "Gdyby nic się nie zmieniło przez kolejne 6 miesięcy, to bardziej byś w tym trwał czy się dusił?",
      options: [
        { label: "Dusiłbym się coraz bardziej", tags: ["suffocation", "cost"] },
        { label: "Trwałbym, ale z coraz większym kosztem", tags: ["stagnation", "cost"] },
        { label: "To zależy, bo nie umiem tego ocenić", tags: ["unclear"] },
      ],
    },
  ],
};

const CHECKPOINTS = [1];

function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = window.setInterval(() => {
      setDisplayed(text.slice(0, i));
      i += 1;
      if (i > text.length) window.clearInterval(timer);
    }, 14);

    return () => window.clearInterval(timer);
  }, [text]);

  return <p className="ctms-report-preview">{displayed}</p>;
}

function PremiumSenseBadge({ score }: { score: number }) {
  const meta =
    score >= 70
      ? {
          tone: "good",
          title: "Wysoki potencjał sensu",
          desc: "Dane nie wyglądają na układ destrukcyjny z automatu. Jest przestrzeń na realną pracę, ale nie na dalsze zgadywanie.",
        }
      : score >= 40
      ? {
          tone: "mid",
          title: "Układ chwiejny",
          desc: "To nie wygląda ani na spokojny fundament, ani na prosty wyrok. Ryzyko jest realne, a margines błędu jeszcze istnieje.",
        }
      : {
          tone: "bad",
          title: "Wzorzec wysokiego ryzyka",
          desc: "Na tym etapie więcej wskazuje na układ kosztowny emocjonalnie niż na relację, która sama się wyprostuje.",
        };

  return (
    <div className={`ctms-premium-badge ctms-premium-badge--${meta.tone}`}>
      <div className="ctms-premium-badge__eyebrow">Szansa, że to ma sens</div>
      <div className="ctms-premium-badge__score">{score}%</div>
      <div className="ctms-premium-badge__title">{meta.title}</div>
      <p className="ctms-premium-badge__desc">{meta.desc}</p>
    </div>
  );
}

function normalizePreview(raw: any): PreviewReport {
  const tension = Number(raw?.tensionPercent ?? raw?.tension ?? 46);
  const drift = Number(raw?.driftPercent ?? raw?.drift ?? 52);
  const rebuild = Number(raw?.rebuildPercent ?? raw?.score ?? 41);

  return {
    headline: raw?.headline || "Tu bardziej widać chwiejność niż spójność.",
    subheadline:
      raw?.subheadline ||
      "To nie wygląda jak układ, który sam się naprawi tylko dlatego, że jeszcze trwa.",
    previewLine:
      raw?.previewLine ||
      raw?.mirror ||
      "Największy problem nie wygląda tu na brak uczuć, tylko na brak stabilności, jasności i równego zaangażowania.",
    tensionPercent: Math.max(0, Math.min(100, tension)),
    driftPercent: Math.max(0, Math.min(100, drift)),
    rebuildPercent: Math.max(0, Math.min(100, rebuild)),
    sections:
      Array.isArray(raw?.sections) && raw.sections.length
        ? raw.sections
        : [
            {
              title: "Dominujący mechanizm",
              text: "Pełny raport rozpisuje, czy ten układ napędza chaos sygnałów, asymetria zaangażowania, lęk przed stratą czy przesuwanie granic.",
              tone: "gold",
            },
            {
              title: "Najbardziej prawdopodobny kierunek",
              text: "Tu system pokaże, czy relacja bardziej idzie w stronę stabilizacji, dalszego rozjazdu czy powolnego wypalenia pod przykrywką 'jakoś to trwa'.",
              tone: "normal",
            },
          ],
    closing:
      raw?.closing ||
      "Pełna analiza pokazuje nie tylko stan relacji, ale też koszt dalszego tkwienia w tej samej dynamice.",
  };
}

function normalizeFullReport(raw: any): FullReport {
  if (!raw) {
    return {
      headline: "Raport premium",
      subheadline: "Raport nie został jeszcze poprawnie znormalizowany.",
      rebuildPercent: 41,
      sections: [],
      closing: "Spróbuj ponownie za chwilę.",
    };
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return normalizeFullReport(parsed);
    } catch {
      return {
        headline: "Raport premium",
        subheadline: "Wersja tekstowa",
        rebuildPercent: 41,
        sections: [{ title: "Treść raportu", text: raw, tone: "normal" }],
        closing: "To jest wersja tekstowa zwrócona przez backend.",
      };
    }
  }

  return {
    headline: raw.headline || "Raport premium",
    subheadline: raw.subheadline || raw.previewLine || "Pełna analiza relacji.",
    previewLine: raw.previewLine || "",
    rebuildPercent: Number(raw.rebuildPercent ?? raw.score ?? 41),
    tensionPercent: Number(raw.tensionPercent ?? raw.tension ?? 46),
    driftPercent: Number(raw.driftPercent ?? raw.drift ?? 52),
    sections: Array.isArray(raw.sections)
      ? raw.sections
      : [{ title: "Treść raportu", text: JSON.stringify(raw, null, 2), tone: "normal" }],
    closing: raw.closing || "Raport został przygotowany.",
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [mode, setMode] = useState<"soft" | "hard">("soft");
  const [legalModal, setLegalModal] = useState<LegalKey>(null);
  const [consents, setConsents] = useState<boolean[]>(new Array(CONSENTS.length).fill(false));

  const [selectedPath, setSelectedPath] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [interviews, setInterviews] = useState<InterviewNode[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);

  const [sessionToken, setSessionToken] = useState("");
  const [currentAiObservation, setCurrentAiObservation] = useState("");
  const [currentUserText, setCurrentUserText] = useState("");
  const [preview, setPreview] = useState<PreviewReport | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [email, setEmail] = useState("");
  const [loadingLabel, setLoadingLabel] = useState("Przetwarzanie...");
  const [loadingHint, setLoadingHint] = useState("");
  const [canRetryReport, setCanRetryReport] = useState(false);
  const [processingToken, setProcessingToken] = useState("");
  const [draftFound, setDraftFound] = useState(false);

  const reportRef = useRef<HTMLDivElement | null>(null);
  const sessionFingerprint = useMemo(() => getSessionId(), []);

  const allConsentsChecked = consents.every(Boolean);
  const pathQuestions = selectedPath ? QUESTIONS_BY_PATH[selectedPath] || QUESTIONS_BY_PATH.uncertainty : [];
  const currentQuestion = pathQuestions[step];
  const progress = currentQuestion ? Math.round(((step + 1) / pathQuestions.length) * 100) : 0;

  const startLoader = (label: string, hint = "") => {
    setLoadingLabel(label);
    setLoadingHint(hint);
    setCanRetryReport(false);
    setScreen("processing");
  };

  const stopLoader = () => {
    setLoadingLabel("Przetwarzanie...");
    setLoadingHint("");
    setCanRetryReport(false);
  };

  const resetFlow = () => {
    clearAppState();
    stopLoader();
    setSelectedPath("");
    setStep(0);
    setAnswers([]);
    setInterviews([]);
    setPatterns([]);
    setSessionToken("");
    setCurrentAiObservation("");
    setCurrentUserText("");
    setPreview(null);
    setFullReport(null);
    setEmail("");
    setProcessingToken("");
    setDraftFound(false);
    setScreen("landing");
  };

  const restoreFromDraft = (draft: PersistedDraft) => {
    setSelectedPath(draft.selectedPath ?? "");
    setStep(draft.step ?? 0);
    setAnswers(Array.isArray(draft.answers) ? draft.answers : []);
    setInterviews(Array.isArray(draft.interviews) ? draft.interviews : []);
    setSessionToken(draft.sessionToken ?? "");
    setCurrentAiObservation(draft.currentAiObservation ?? "");
    setCurrentUserText(draft.currentUserText ?? "");
    setPreview(draft.preview ?? null);
    setEmail(draft.email ?? "");
    setPatterns(Array.isArray(draft.patterns) ? draft.patterns : []);
    setScreen((draft.screen as Screen) ?? "landing");
    setDraftFound(false);
  };

  const handleSuccessReturn = async (token: string) => {
    startLoader("Płatność przyjęta. Pobieram raport premium...", "Jeśli system nie zdążył go jeszcze domknąć, pokażemy Ci bezpieczny komunikat zamiast zapętlonego loadera.");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 8000);

    try {
      const res = await fetch(`${API_BASE}/api/report/${token}`, {
        signal: controller.signal,
      });

      const text = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Backend nie zwrócił poprawnego JSON.");
      }

      if (!data.ok || !data.report) {
        throw new Error("Raport nie jest dostępny.");
      }

      setFullReport(normalizeFullReport(data.report));
      setSessionToken(token);
      setScreen("paid_report");
      clearAppState();
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("handleSuccessReturn error:", error);
      window.history.replaceState({}, document.title, window.location.pathname);
      alert("Płatność wróciła, ale raport nie został poprawnie załadowany. Wrócisz teraz na stronę główną.");
      resetFlow();
      return;
    } finally {
      window.clearTimeout(timeout);
      stopLoader();
    }
  };

  useEffect(() => {
    if (screen === "landing" || screen === "consents" || screen === "paid_report" || screen === "processing") return;

    const state: PersistedDraft = {
      screen,
      selectedPath,
      step,
      answers,
      interviews,
      sessionToken,
      preview,
      email,
      currentAiObservation,
      currentUserText,
      patterns,
    };

    saveAppState(state as any);
  }, [screen, selectedPath, step, answers, interviews, sessionToken, preview, email, currentAiObservation, currentUserText, patterns]);

  useEffect(() => {
    const saved = getAppState() as PersistedDraft | null;

    if (getConsentState()) {
      setConsents(new Array(CONSENTS.length).fill(true));
    }

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const token = params.get("token");
    const cancelled = params.get("cancelled");

    if (cancelled === "1" || cancelled === "true") {
      stopLoader();
      window.history.replaceState({}, document.title, window.location.pathname);

      if (saved?.preview) {
        restoreFromDraft(saved);
        setScreen("preview");
      } else {
        resetFlow();
      }
      return;
    }

    if (success === "1" && token) {
      console.log("SUCCESS RETURN TOKEN:", token);
      void handleSuccessReturn(token);
      return;
    }

    if (saved && saved.screen && saved.screen !== "landing") {
      restoreFromDraft(saved);
      setDraftFound(true);
    }
  }, []);

  async function fetchPaidReportUntilReady(token: string) {
    setCanRetryReport(false);
    setProcessingToken(token);

    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`${API_BASE}/api/report/${token}`);
        const data = await res.json();

        if (data.ok && data.report) {
          setFullReport(normalizeFullReport(data.report));
          setScreen("paid_report");
          clearAppState();
          window.history.replaceState({}, "", window.location.pathname);
          return;
        }

        if (attempts < 24) {
          setTimeout(poll, 2500);
          return;
        }

        setLoadingLabel("Raport dopina się dłużej niż zwykle.");
        setLoadingHint("To nie wygląda jak błąd płatności. System jeszcze składa całość. Możesz sprawdzić status ponownie za chwilę.");
        setCanRetryReport(true);
        setScreen("processing");
      } catch (error) {
        console.error("Fetch report error:", error);

        if (attempts < 24) {
          setTimeout(poll, 2500);
          return;
        }

        setLoadingLabel("Raport jeszcze się przygotowuje.");
        setLoadingHint("Płatność wróciła, ale system nie zdążył jeszcze domknąć raportu. Kliknij poniżej i sprawdź status ponownie.");
        setCanRetryReport(true);
        setScreen("processing");
      }
    };

    void poll();
  }

  async function createSessionIfNeeded() {
    if (sessionToken) return sessionToken;

    const res = await fetch(`${API_BASE}/api/session/create`, { method: "POST" });
    const data = await res.json();

    if (!data.ok || !data.token) {
      throw new Error("Nie udało się utworzyć sesji.");
    }

    setSessionToken(data.token);
    return data.token;
  }

  async function handleStart(selectedMode: "soft" | "hard") {
    setMode(selectedMode);
    setScreen("consents");
  }

  async function handleConsentsContinue() {
    if (!allConsentsChecked) return;

    saveConsentState(true);

    try {
      await createSessionIfNeeded();
      setScreen("entry");
    } catch (error) {
      console.error(error);
      alert("Nie udało się rozpocząć sesji.");
    }
  }

  async function handlePathSelect(pathId: string) {
    setSelectedPath(pathId);
    setStep(0);
    setAnswers([]);
    setInterviews([]);
    setPreview(null);
    setFullReport(null);
    setCurrentAiObservation("");
    setCurrentUserText("");
    setPatterns([]);
    setScreen("chat");
  }

  async function handleAnswer(option: Option) {
    if (!currentQuestion) return;

    const nextAnswer: Answer = {
      questionId: currentQuestion.id,
      text: option.label,
      tags: option.tags,
    };

    const nextAnswers = [...answers.filter((a) => a.questionId !== currentQuestion.id), nextAnswer];
    const nextPatterns = [...new Set([...patterns, ...option.tags])];

    setAnswers(nextAnswers);
    setPatterns(nextPatterns);

    const isCheckpoint = CHECKPOINTS.includes(step);
    const isLast = step >= pathQuestions.length - 1;

    if (isCheckpoint && interviews.length === 0) {
      startLoader("Analizuję niespójność...", "System zatrzyma Cię teraz tam, gdzie zaczyna się rozjazd między faktami a narracją.");

      try {
        const token = await createSessionIfNeeded();
        await fetch(`${API_BASE}/api/session/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            payload: {
              path: selectedPath,
              answers: nextAnswers,
              patterns: nextPatterns,
              fingerprint: sessionFingerprint,
            },
          }),
        });

        const res = await fetch(`${API_BASE}/api/checkpoint`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            path: selectedPath,
            answers: nextAnswers,
            patterns: nextPatterns,
          }),
        });

        const data = await res.json();
        if (!data.ok || !data.checkpoint) throw new Error("Brak checkpointu");

        setCurrentAiObservation(data.checkpoint.insight || data.checkpoint.question || "W Twoich odpowiedziach pojawił się rozjazd, którego nie warto już pudrować.");
        setCurrentUserText("");
        setScreen("checkpoint");
      } catch (error) {
        console.error(error);
        setCurrentAiObservation("W Twoich odpowiedziach pojawił się rozjazd między tym, co chcesz utrzymać, a tym, co naprawdę opisujesz.");
        setCurrentUserText("");
        setScreen("checkpoint");
      } finally {
        stopLoader();
      }
      return;
    }

    if (isLast) {
      await finalizePreview(nextAnswers, nextPatterns);
      return;
    }

    setStep((prev) => prev + 1);
  }

  async function handleCheckpointContinue() {
    if (currentUserText.trim().length < 8) {
      alert("Napisz to konkretnie. Tu nie chodzi o pół zdania.");
      return;
    }

    const newInterview: InterviewNode = {
      aiPrompt: currentAiObservation,
      userText: currentUserText.trim(),
    };

    setInterviews((prev) => [...prev, newInterview]);

    if (step >= pathQuestions.length - 1) {
      await finalizePreview(answers, patterns, [...interviews, newInterview]);
      return;
    }

    setCurrentUserText("");
    setStep((prev) => prev + 1);
    setScreen("chat");
  }

  async function finalizePreview(nextAnswers: Answer[], nextPatterns: string[], forcedInterviews?: InterviewNode[]) {
    startLoader("Buduję wstępny raport...", "Najpierw zobaczysz chłodne lustro relacji. Dopiero potem zdecydujesz, czy chcesz wejść głębiej.");

    try {
      const token = await createSessionIfNeeded();
      const finalInterviews = forcedInterviews ?? interviews;

      await fetch(`${API_BASE}/api/session/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          payload: {
            mode,
            path: selectedPath,
            answers: nextAnswers,
            interviews: finalInterviews,
            patterns: nextPatterns,
            fingerprint: sessionFingerprint,
          },
        }),
      });

      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          path: selectedPath,
          answers: nextAnswers,
          patterns: nextPatterns,
          customDescription: finalInterviews.map((item) => item.userText).join("\n\n"),
        }),
      });

      const data = await res.json();
      if (!data.ok || !data.preview) throw new Error("Brak preview");

      setPreview(normalizePreview(data.preview));
      setScreen("preview");
    } catch (error) {
      console.error(error);
      alert("Wystąpił błąd końcowej analizy.");
      setScreen("chat");
    } finally {
      stopLoader();
    }
  }

  async function handlePayment() {
    if (!email || !email.includes("@")) {
      alert("Podaj prawidłowy e-mail.");
      return;
    }

    if (!preview) {
      alert("Brak preview raportu.");
      return;
    }

    startLoader("Przekierowanie do płatności...", "Po opłaceniu system wygeneruje pełny raport i zacznie go składać w tle.");

    try {
      const token = await createSessionIfNeeded();
      const customText = interviews.map((i) => i.userText).join("\n\n").trim();

      const res = await fetch(`${API_BASE}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          consentAcceptedAt: new Date().toISOString(),
          payload: {
            mode,
            path: selectedPath,
            answers,
            interviews,
            patterns,
            customDescription: customText || answers.map((a) => a.text).join("\n"),
            preview,
            sessionId: sessionFingerprint,
          },
        }),
      });

      const data = await res.json();
      const checkoutLink = data.checkoutUrl || data.url;
      if (!data.ok || !checkoutLink) throw new Error("Brak linku do checkoutu");
      window.location.href = checkoutLink;
    } catch (error) {
      console.error(error);
      alert("Błąd inicjalizacji płatności.");
      setScreen("preview");
      stopLoader();
    }
  }

  async function retryReportStatus() {
    if (!processingToken) return;
    setLoadingLabel("Sprawdzam status raportu ponownie...");
    setLoadingHint("Jeśli system już skończył, raport za chwilę się pojawi.");
    await fetchPaidReportUntilReady(processingToken);
  }

  async function downloadPDF() {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      backgroundColor: "#050505",
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pageHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("czytomasens-raport-premium.pdf");
  }

  function handleBack() {
    if (screen === "entry") {
      setScreen("consents");
      return;
    }
    if (screen === "chat") {
      if (step > 0) {
        const previousQuestion = pathQuestions[step];
        setAnswers((prev) => prev.filter((a) => a.questionId !== previousQuestion?.id));
        setStep((prev) => prev - 1);
      } else {
        setScreen("entry");
      }
      return;
    }
    if (screen === "checkpoint") {
      setScreen("chat");
      return;
    }
    if (screen === "preview") {
      setScreen("chat");
      setStep(Math.max(pathQuestions.length - 1, 0));
    }
  }

  async function saveEmailSoft() {
    if (!email || !email.includes("@")) return;
    try {
      const token = await createSessionIfNeeded();
      await fetch(`${API_BASE}/api/session/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          payload: {
            mode,
            path: selectedPath,
            answers,
            interviews,
            patterns,
            email,
            fingerprint: sessionFingerprint,
          },
        }),
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="ctms-app">
      {legalModal && (
        <div className="ctms-legal-overlay" onClick={() => setLegalModal(null)}>
          <div className="ctms-legal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ctms-legal-header">
              <h3>{LEGAL_CONTENT[legalModal].title}</h3>
              <button onClick={() => setLegalModal(null)}>✕</button>
            </div>
            <div className="ctms-legal-body">{LEGAL_CONTENT[legalModal].body}</div>
          </div>
        </div>
      )}

      <div className="ctms-shell">
        <AnimatePresence mode="wait">
          {screen === "landing" && (
            <motion.section key="landing" className="ctms-landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-landing-glow ctms-landing-glow-left" />
              <div className="ctms-landing-glow ctms-landing-glow-right" />

              <div className="ctms-center ctms-narrow">
                <p className="ctms-eyebrow">CzyToMaSens</p>
                <h1 className="ctms-brand">
                  Przestań zgadywać.
                  <br />
                  Zobacz, co ta relacja
                  <br />
                  naprawdę z Tobą robi.
                </h1>
                <p className="ctms-hero-main">
                  To nie jest zwykły quiz ani plastikowy chatbot. To chłodna analiza wzorców relacyjnych,
                  która ma oddzielić fakty od emocjonalnej mgły, napięcie od bliskości i realny sens od samej nadziei.
                </p>
                <p className="ctms-hero-sub">
                  Najpierw przechodzisz przez rozmowę. Potem dostajesz wstępny raport. A jeśli chcesz wejść głębiej, odblokowujesz pełną analizę premium za 15 zł.
                </p>

                <div className="ctms-impact-grid">
                  <div className="ctms-impact-card">
                    <div className="ctms-impact-value">Rozmowa zamiast formularza</div>
                    <p>System prowadzi użytkownika jak analiza, nie jak nudna ankieta z internetu.</p>
                  </div>
                  <div className="ctms-impact-card">
                    <div className="ctms-impact-value">Checkpoint w środku flow</div>
                    <p>AI zatrzymuje Cię tam, gdzie wykryje niespójność i wymusza dopowiedzenie prawdy.</p>
                  </div>
                  <div className="ctms-impact-card">
                    <div className="ctms-impact-value">Raport, który coś znaczy</div>
                    <p>Preview buduje napięcie, a pełna wersja dowozi kierunek, ryzyko i twarde wnioski.</p>
                  </div>
                </div>

                <div className="ctms-actions">
                  <button className="ctms-primary" style={{ minHeight: "56px", width: "100%" }} onClick={() => handleStart("soft")}>
                    Zacznij analizę
                  </button>
                </div>

                <div className="ctms-footer-links">
                  <button onClick={() => setLegalModal("terms")}>Regulamin</button>
                  <button onClick={() => setLegalModal("privacy")}>Polityka prywatności</button>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "consents" && (
            <motion.section key="consents" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <h1 className="ctms-title">Zanim wejdziesz głębiej</h1>
                  <p className="ctms-copy">To narzędzie ma być ostre, ale uczciwe. Zanim ruszysz dalej, musisz świadomie zaakceptować zasady gry.</p>

                  <div className="ctms-list">
                    {CONSENTS.map((txt, i) => (
                      <label key={i} className="ctms-checkbox-row">
                        <input
                          type="checkbox"
                          checked={consents[i]}
                          onChange={(e) => {
                            const next = [...consents];
                            next[i] = e.target.checked;
                            setConsents(next);
                          }}
                        />
                        <span>{txt}</span>
                      </label>
                    ))}
                  </div>

                  <div className="ctms-actions" style={{ justifyContent: "space-between", marginTop: 28 }}>
                    <button className="ctms-text-btn" onClick={() => setScreen("landing")}>Wróć</button>
                    <button className={allConsentsChecked ? "ctms-primary" : "ctms-primary ctms-primary-disabled"} disabled={!allConsentsChecked} onClick={handleConsentsContinue}>
                      Akceptuję i wchodzę dalej
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "entry" && (
            <motion.section key="entry" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <p className="ctms-eyebrow">Punkt wejścia</p>
                  <h1 className="ctms-title">Co Cię tu naprawdę przyprowadza?</h1>
                  <p className="ctms-copy">Nie wybierasz kategorii na pokaz. Wybierasz problem, od którego ma zacząć się analiza.</p>

                  <div className="ctms-list">
                    {ENTRY_POINTS.map((item) => (
                      <button key={item.id} className="ctms-card-btn" onClick={() => handlePathSelect(item.id)}>
                        <span className="ctms-card-main">{item.label}</span>
                        <span className="ctms-card-note">{item.note}</span>
                      </button>
                    ))}
                  </div>

                  {draftFound && (
                    <div className="ctms-draft-banner">
                      <p>Znaleziono zapisaną sesję. Możesz wrócić do przerwanej analizy albo zacząć od zera.</p>
                      <div className="ctms-actions">
                        <button className="ctms-primary" onClick={() => {
                          const draft = getAppState() as PersistedDraft | null;
                          if (draft) restoreFromDraft(draft);
                        }}>
                          Wróć do sesji
                        </button>
                        <button className="ctms-text-btn" onClick={resetFlow}>Zacznij od nowa</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {screen === "chat" && currentQuestion && (
            <motion.section key={`chat-${selectedPath}-${step}`} className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-topbar">
                  <div className="ctms-topbar-left">
                    <button className="ctms-text-btn" onClick={handleBack}>Cofnij</button>
                    <button className="ctms-text-btn" onClick={resetFlow}>Od początku</button>
                  </div>
                  <div className="ctms-progress-wrap">
                    <span>{progress}%</span>
                    <div className="ctms-progress-track">
                      <div className="ctms-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="ctms-question-card">
                  <p className="ctms-eyebrow">{ENTRY_POINTS.find((p) => p.id === selectedPath)?.label || "Analiza"} • Prawda</p>
                  <p className="ctms-copy">{currentQuestion.lead}</p>
                  <h1 className="ctms-title">{currentQuestion.text}</h1>

                  <div className="ctms-list">
                    {currentQuestion.options.map((option, index) => (
                      <button key={`${currentQuestion.id}-${index}`} className="ctms-card-btn" onClick={() => handleAnswer(option)}>
                        <span className="ctms-card-main">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "checkpoint" && (
            <motion.section key="checkpoint" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-question-card ctms-question-card--checkpoint">
                  <p className="ctms-eyebrow">Checkpoint AI</p>
                  <Typewriter text={currentAiObservation} />

                  <textarea
                    className="ctms-textarea"
                    value={currentUserText}
                    onChange={(e) => setCurrentUserText(e.target.value)}
                    placeholder="Napisz wprost to, co próbujesz jeszcze wygładzić albo ominąć."
                  />

                  <div className="ctms-actions" style={{ justifyContent: "space-between", marginTop: 20 }}>
                    <button className="ctms-text-btn" onClick={handleBack}>Wróć</button>
                    <button className="ctms-primary" onClick={handleCheckpointContinue}>Idź dalej</button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "preview" && preview && (
            <motion.section key="preview" className="ctms-report-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-report-shell">
                <div className="ctms-report-card">
                  <div className="ctms-report-topline">
                    <div>
                      <div className="ctms-eyebrow">Wstępny raport</div>
                      <h2 className="ctms-report-title">{preview.headline}</h2>
                    </div>
                    <div className="ctms-score-box">
                      <div className="ctms-score">15 zł</div>
                      <div className="ctms-score-label">Pełna analiza premium</div>
                    </div>
                  </div>

                  <div className="ctms-report-quote">“{preview.previewLine}”</div>

                  <PremiumSenseBadge score={preview.rebuildPercent} />

                  <div className="ctms-report-metrics">
                    <div className="ctms-report-metric">
                      <span>{preview.tensionPercent}%</span>
                      <small>Poziom napięcia</small>
                    </div>
                    <div className="ctms-report-metric">
                      <span>{preview.driftPercent}%</span>
                      <small>Rozjazd</small>
                    </div>
                    <div className="ctms-report-metric">
                      <span>{preview.rebuildPercent}%</span>
                      <small>Szansa zmiany</small>
                    </div>
                  </div>

                  <div className="ctms-preview-summary">
                    <p>{preview.subheadline}</p>
                  </div>

                  <div className="ctms-preview-blur">
                    {preview.sections.map((section, idx) => (
                      <div key={idx} className="ctms-preview-section">
                        <h3>{section.title}</h3>
                        <p>{section.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="ctms-payment-card">
                    <h3>Odblokuj pełny raport</h3>
                    <p>
                      Dostaniesz pełny dokument premium: rozwinięte metryki, scenariusze,
                      analizę mechanizmów i końcowy werdykt systemu.
                    </p>

                    <input
                      className="ctms-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => {
                        void saveEmailSoft();
                      }}
                      placeholder="Twój e-mail"
                    />

                    <div className="ctms-actions" style={{ marginTop: 16 }}>
                      <button className="ctms-primary ctms-full" onClick={handlePayment}>
                        Pobierz pełną analizę — 15 PLN
                      </button>
                      <button className="ctms-text-btn ctms-full" onClick={handleBack}>
                        Wróć do pytań
                      </button>
                      <button className="ctms-text-btn ctms-full" onClick={resetFlow}>
                        Zacznij od początku
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "processing" && (
            <motion.section key="processing" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-processing-card ctms-center">
                <div className="ctms-spinner ctms-spinner-big" />
                <p>{loadingLabel}</p>
                {loadingHint ? <small className="ctms-loading-hint">{loadingHint}</small> : null}

                <div className="ctms-actions" style={{ marginTop: 18, width: "100%" }}>
                  {canRetryReport ? (
                    <button className="ctms-primary ctms-full" onClick={() => void retryReportStatus()}>
                      Sprawdź status raportu ponownie
                    </button>
                  ) : null}
                  <button
                    className="ctms-text-btn ctms-full"
                    onClick={() => {
                      resetFlow();
                    }}
                  >
                    Przerwij i wróć na stronę główną
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "paid_report" && fullReport && (
            <motion.section key="paid_report" className="ctms-report-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-report-shell">
                <div className="ctms-report-card" ref={reportRef}>
                  <div className="ctms-eyebrow">Raport premium</div>
                  <h2 className="ctms-report-title">{fullReport.headline}</h2>
                  {fullReport.subheadline ? <p className="ctms-report-sub">{fullReport.subheadline}</p> : null}

                  {typeof fullReport.rebuildPercent === "number" ? <PremiumSenseBadge score={fullReport.rebuildPercent} /> : null}

                  {Array.isArray(fullReport.sections)
                    ? fullReport.sections.map((section, idx) => (
                        <div key={idx} className="ctms-preview-section ctms-preview-section--full">
                          <h3>{section.title}</h3>
                          <p>{section.text}</p>
                        </div>
                      ))
                    : null}

                  {fullReport.closing ? <div className="ctms-report-closing">{fullReport.closing}</div> : null}
                </div>

                <div className="ctms-report-actions">
                  <button className="ctms-primary ctms-full" onClick={() => void downloadPDF()}>
                    Pobierz raport jako PDF
                  </button>
                  <button className="ctms-text-btn ctms-full" onClick={resetFlow}>
                    Zakończ i wróć na stronę główną
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
