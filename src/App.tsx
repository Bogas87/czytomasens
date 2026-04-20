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
  | "preview"
  | "processing"
  | "paid_report";

type LegalKey = "terms" | "privacy" | null;
type Mode = "soft" | "hard";

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

type Checkpoint = {
  title: string;
  insight: string;
  question: string;
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
  closing: string;
};

type FullReport = PreviewReport;

const API_BASE = import.meta.env.VITE_API_BASE || "";
const PRICE_LABEL = "15 zł";

const ENTRY_POINTS: EntryPoint[] = [
  {
    id: "betrayal",
    label: "Zdrada, kłamstwo albo utrata zaufania",
    note:
      "Tu nie chodzi tylko o sam fakt. Chodzi o to, co ta sytuacja zrobiła z Twoim poczuciem bezpieczeństwa i godności.",
  },
  {
    id: "uncertainty",
    label: "Nie wiem, na czym stoję",
    note:
      "Dla układów pełnych chaosu, niedopowiedzeń, okruszków uwagi i sygnałów, które bardziej mieszają niż wyjaśniają.",
  },
  {
    id: "stagnation",
    label: "To trwa, ale coś ewidentnie gaśnie",
    note:
      "Nie wszystko kończy się wybuchem. Czasem relacja po prostu cicho przestaje dawać sens, energię i spokój.",
  },
  {
    id: "toxic_loops",
    label: "Kręcimy się w kółko i wracamy do tego samego",
    note:
      "Dla cyklu napięcie – ulga – powrót – kolejny zjazd. Bez realnej zmiany, za to z coraz większym kosztem.",
  },
];

const QUESTIONS_BY_PATH: Record<string, Question[]> = {
  betrayal: [
    {
      id: 1,
      lead: "Po zdradzie liczy się nie tylko zdarzenie. Liczy się też to, co druga strona robi z Twoim bólem później.",
      text: "Czy po utracie zaufania druga strona wzięła pełną odpowiedzialność, czy raczej próbowała rozmyć winę?",
      options: [
        { label: "Rozmywała winę i mieszała odpowiedzialność", tags: ["zdrada", "gaslighting", "ucieczka_od_odpowiedzialnosci"] },
        { label: "Brała odpowiedzialność, ale niespójnie", tags: ["zdrada", "niestabilna_naprawa"] },
        { label: "Naprawdę wzięła odpowiedzialność", tags: ["naprawa", "odpowiedzialnosc"] },
      ],
    },
    {
      id: 2,
      lead: "Po pęknięciu zaufania czyny znaczą więcej niż wszystkie deklaracje.",
      text: "Czy dzisiaj czujesz bardziej bezpieczeństwo czy napięcie i czujność?",
      options: [
        { label: "Głównie napięcie i czujność", tags: ["hiperczujnosc", "stres", "lęk"] },
        { label: "To się waha, nie wróciła stabilność", tags: ["niestabilnosc", "rozchwianie"] },
        { label: "Powoli wraca bezpieczeństwo", tags: ["odbudowa", "naprawa"] },
      ],
    },
    {
      id: 3,
      lead: "Tu trzeba oddzielić miłość od lęku przed rozpadem i samotnością.",
      text: "Gdybyś miał być brutalnie szczery, to bardziej zostajesz z wiary w zmianę czy z lęku przed stratą?",
      options: [
        { label: "Bardziej z lęku przed stratą", tags: ["lęk_przed_strata", "przywiazanie"] },
        { label: "Po części z jednego i drugiego", tags: ["ambiwalencja"] },
        { label: "Bardziej z realnej wiary w zmianę", tags: ["realna_nadzieja", "naprawa"] },
      ],
    },
  ],
  uncertainty: [
    {
      id: 1,
      lead: "Niejasność bywa przypadkiem. Ale bywa też wygodnym narzędziem.",
      text: "Czy druga strona daje Ci uwagę głównie wtedy, gdy zaczynasz się wycofywać?",
      options: [
        { label: "Tak, dokładnie tak to działa", tags: ["breadcrumbing", "wzmocnienie_przerywane"] },
        { label: "Czasem tak, ale nie zawsze", tags: ["niestabilnosc", "chaos"] },
        { label: "Nie, tego akurat nie widzę", tags: ["neutralne"] },
      ],
    },
    {
      id: 2,
      lead: "Słowa bez zgodności z czynami są tylko mgłą.",
      text: "Czy deklaracje tej osoby regularnie rozjeżdżają się z jej realnym zachowaniem?",
      options: [
        { label: "Tak, bardzo często", tags: ["niespojnosc", "dezorientacja"] },
        { label: "Czasem, ale nie stale", tags: ["chwiejność"] },
        { label: "Nie, raczej jest spójność", tags: ["spójnosc"] },
      ],
    },
    {
      id: 3,
      lead: "Tu zwykle kończy się romantyczna narracja, a zaczyna logika.",
      text: "Gdyby nic się nie zmieniło przez kolejne 6 miesięcy, to bardziej byś w tym trwał czy się dusił?",
      options: [
        { label: "Dusiłbym się coraz bardziej", tags: ["duszność", "koszt_emocjonalny"] },
        { label: "Trwałbym, ale z coraz większym kosztem", tags: ["stagnacja", "koszt"] },
        { label: "Nie umiem tego jeszcze uczciwie ocenić", tags: ["zawieszenie"] },
      ],
    },
  ],
  stagnation: [
    {
      id: 1,
      lead: "Brak dramatu nie zawsze oznacza spokój. Czasem oznacza wygaszenie.",
      text: "Czy coraz częściej tłumaczysz brak zaangażowania drugiej strony stresem, zmęczeniem albo trudnym okresem?",
      options: [
        { label: "Tak, często to sobie tłumaczę", tags: ["racjonalizacja", "stagnacja"] },
        { label: "Czasem tak robię", tags: ["ambiwalencja"] },
        { label: "Nie, widzę to już dość jasno", tags: ["świadomość"] },
      ],
    },
    {
      id: 2,
      lead: "Najprostszy test relacji to test inicjatywy.",
      text: "Gdybyś przestał inicjować kontakt, rozmowy i naprawę napięcia, czy to dalej by się toczyło?",
      options: [
        { label: "Nie, to by praktycznie zgasło", tags: ["asymetria", "jednostronnosc"] },
        { label: "Pewnie osłabłoby bardzo mocno", tags: ["asymetria"] },
        { label: "Tak, druga strona też by to niosła", tags: ["wzajemnosc"] },
      ],
    },
    {
      id: 3,
      lead: "Ludzie często zostają z potencjałem, a nie z rzeczywistością.",
      text: "Czy bardziej trzymasz się tego, kim ta osoba mogłaby być, niż tego, kim realnie jest dzisiaj?",
      options: [
        { label: "Tak, i zaczynam to widzieć", tags: ["idealizacja", "projekcja"] },
        { label: "Po części tak", tags: ["ambiwalencja"] },
        { label: "Nie, raczej patrzę na fakty", tags: ["realizm"] },
      ],
    },
  ],
  toxic_loops: [
    {
      id: 1,
      lead: "Powtarzalny chaos bywa mylony z intensywnością i więzią.",
      text: "Czy po każdej ostrej fazie napięcia pojawia się krótka ulga i bliskość, a potem wszystko wraca do starego schematu?",
      options: [
        { label: "Tak, dokładnie tak to wygląda", tags: ["cykl", "uzaleznienie_od_ulgi", "niestabilnosc"] },
        { label: "W dużej mierze tak", tags: ["cykl", "chwiejność"] },
        { label: "Nie, to nie jest aż tak cykliczne", tags: ["neutralne"] },
      ],
    },
    {
      id: 2,
      lead: "Granice zwykle nie pękają od razu. Najpierw się przesuwają.",
      text: "Czy dziś zgadzasz się na rzeczy, które jeszcze rok temu byłyby dla Ciebie nie do przyjęcia?",
      options: [
        { label: "Tak, i to mnie niepokoi", tags: ["erozja_granic", "adaptacja_do_zlego"] },
        { label: "Trochę tak", tags: ["przesuniecie_granic"] },
        { label: "Nie, granice nadal mam dość jasne", tags: ["granice"] },
      ],
    },
    {
      id: 3,
      lead: "Tu zwykle kończy się ładna narracja, a zaczynają fakty.",
      text: "Gdyby nic się nie zmieniło przez kolejne 6 miesięcy, to bardziej byś w tym trwał czy się dusił?",
      options: [
        { label: "Dusiłbym się coraz bardziej", tags: ["duszność", "koszt_emocjonalny"] },
        { label: "Trwałbym, ale z coraz większym kosztem", tags: ["stagnacja", "koszt"] },
        { label: "Nie umiem tego jeszcze uczciwie ocenić", tags: ["zawieszenie"] },
      ],
    },
  ],
};

function legalBody(kind: LegalKey) {
  if (kind === "terms") return TERMS.body;
  if (kind === "privacy") return PRIVACY.body;
  return "";
}

function legalTitle(kind: LegalKey) {
  if (kind === "terms") return TERMS.title;
  if (kind === "privacy") return PRIVACY.title;
  return "";
}

function buildNarrative(path: string, answers: Answer[], note: string) {
  const pathLabel = ENTRY_POINTS.find((x) => x.id === path)?.label || path || "nieokreślone";
  const qa = answers
    .map((a, idx) => `${idx + 1}. ${a.text} [${a.tags.join(", ")}]`)
    .join("\n");
  const cleanNote = String(note || "").trim();
  return [
    `Punkt wejścia: ${pathLabel}`,
    qa ? `Odpowiedzi:\n${qa}` : "",
    cleanNote ? `Dopowiedzenie użytkownika:\n${cleanNote}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function normalizePreview(raw: any): PreviewReport {
  const safeHeadline = raw?.headline || "Tu bardziej widać chwiejność niż spójność.";
  const safeSubheadline =
    raw?.subheadline || "W tym układzie jest więcej napięcia i niejasności niż stabilnego bezpieczeństwa.";
  const safePreviewLine =
    raw?.previewLine ||
    raw?.mirror ||
    "Największy problem nie wygląda tu na pojedynczy incydent. Bardziej na wzorzec, który wraca pod różnymi nazwami.";
  const tension = Number(raw?.tensionPercent ?? 52);
  const drift = Number(raw?.driftPercent ?? 49);
  const rebuild = Number(raw?.rebuildPercent ?? raw?.score ?? 44);
  const sections = Array.isArray(raw?.sections) && raw.sections.length
    ? raw.sections
    : [
        {
          title: "Pierwszy ogląd",
          text: "W tej historii bardziej widać koszt emocjonalny i niestabilność niż spokój wynikający z realnej wzajemności.",
          tone: "normal",
        },
        {
          title: "Największe ryzyko",
          text: "To, co Cię tu trzyma, może być bardziej mieszanką nadziei i przyzwyczajenia niż realną zmianą po drugiej stronie.",
          tone: "danger",
        },
      ];
  return {
    headline: safeHeadline,
    subheadline: safeSubheadline,
    previewLine: safePreviewLine,
    tensionPercent: tension,
    driftPercent: drift,
    rebuildPercent: rebuild,
    sections,
    closing:
      raw?.closing ||
      "Pełny raport pokazuje dominujące mechanizmy, główne ryzyka i najbardziej prawdopodobny kierunek tego układu.",
  };
}

function normalizeFullReport(raw: any): FullReport {
  return {
    headline: raw?.headline || "Dokument analityczny",
    subheadline: raw?.subheadline || "Pełna wersja raportu premium.",
    previewLine:
      raw?.previewLine ||
      "Tu nie chodzi o jedną rozmowę czy jeden zgrzyt. Chodzi o to, co ten układ robi z Tobą w dłuższym czasie.",
    tensionPercent: Number(raw?.tensionPercent ?? 0),
    driftPercent: Number(raw?.driftPercent ?? 0),
    rebuildPercent: Number(raw?.rebuildPercent ?? 0),
    sections: Array.isArray(raw?.sections) ? raw.sections : [],
    closing: raw?.closing || "To nie jest wyrok. To jest chłodny ogląd mechanizmu.",
  };
}

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
          title: "Rokujące / względnie stabilne",
          desc: "Tu nadal trzeba patrzeć na fakty, ale nie wszystko idzie automatycznie w stronę rozpadu.",
        }
      : score >= 40
      ? {
          tone: "mid",
          title: "Układ chwiejny",
          desc: "Nie ma tu jeszcze prostego wyroku. Jest za to realne ryzyko dalszego rozjazdu, jeśli zostawisz to bez twardej oceny.",
        }
      : {
          tone: "bad",
          title: "Wzorzec wysokiego ryzyka",
          desc: "Na tym etapie więcej wskazuje na relację kosztowną emocjonalnie niż na układ, który sam się wyprostuje.",
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

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [mode] = useState<Mode>("hard");
  const [legalModal, setLegalModal] = useState<LegalKey>(null);
  const [consents, setConsents] = useState<boolean[]>(new Array(CONSENTS.length).fill(false));
  const [selectedPath, setSelectedPath] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [interviews, setInterviews] = useState<InterviewNode[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [sessionToken, setSessionToken] = useState("");
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);
  const [currentUserText, setCurrentUserText] = useState("");
  const [preview, setPreview] = useState<PreviewReport | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Przetwarzanie...");
  const [loadingHint, setLoadingHint] = useState("");
  const [draftFound, setDraftFound] = useState(false);
  const [processingToken, setProcessingToken] = useState("");

  const reportRef = useRef<HTMLDivElement | null>(null);
  const localSessionFingerprint = useMemo(() => getSessionId(), []);
  const selectedEntry = ENTRY_POINTS.find((item) => item.id === selectedPath);
  const questions = selectedPath ? QUESTIONS_BY_PATH[selectedPath] || [] : [];
  const currentQuestion = questions[step] || null;
  const progress = questions.length ? Math.round(((step + 1) / questions.length) * 100) : 0;

  const persistState = () => {
    saveAppState({
      screen,
      mode,
      path: selectedPath || null,
      step,
      answers: answers.map((a) => ({ q: String(a.questionId), a: a.text })),
      aiInterview: interviews.map((x) => ({ ai: x.aiPrompt, user: x.userText })),
      currentUserText,
      email,
      sessionToken,
      preview,
    } as any);
  };

  const stopLoader = () => {
    setLoading(false);
    setLoadingLabel("");
    setLoadingHint("");
    setProcessingToken("");
  };

  const startLoader = (label: string, hint = "") => {
    setLoading(true);
    setLoadingLabel(label);
    setLoadingHint(hint);
  };

  const resetFlow = () => {
    clearAppState();
    stopLoader();
    setScreen("landing");
    setSelectedPath("");
    setStep(0);
    setAnswers([]);
    setInterviews([]);
    setPatterns([]);
    setSessionToken("");
    setCurrentCheckpoint(null);
    setCurrentUserText("");
    setPreview(null);
    setFullReport(null);
    setEmail("");
    setDraftFound(false);
  };

  const restoreFromSavedState = (saved: any) => {
    if (saved?.screen) setScreen(saved.screen as Screen);
    if (saved?.path) setSelectedPath(saved.path);
    if (typeof saved?.step === "number") setStep(saved.step);
    if (Array.isArray(saved?.answers)) {
      // answers can't be fully reconstructed from persisted abbreviated shape; keep only text shells
      setAnswers(saved.answers.map((a: any, idx: number) => ({ questionId: idx + 1, text: a.a, tags: [] })));
    }
    if (Array.isArray(saved?.aiInterview)) {
      setInterviews(saved.aiInterview.map((x: any) => ({ aiPrompt: x.ai, userText: x.user })));
    }
    if (typeof saved?.currentUserText === "string") setCurrentUserText(saved.currentUserText);
    if (typeof saved?.email === "string") setEmail(saved.email);
    if (typeof saved?.sessionToken === "string") setSessionToken(saved.sessionToken);
    if (saved?.preview) setPreview(normalizePreview(saved.preview));
    setDraftFound(true);
  };

  useEffect(() => {
    const saved = getAppState() as any;
    if (getConsentState()) {
      setConsents(new Array(CONSENTS.length).fill(true));
    }

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const token = params.get("token");
    const cancelled = params.get("cancel") || params.get("cancelled");

    if (cancelled === "1" || cancelled === "true") {
      window.history.replaceState({}, document.title, window.location.pathname);
      if (saved?.preview) {
        restoreFromSavedState(saved);
        setScreen("preview");
      } else {
        resetFlow();
      }
      return;
    }

    if (success === "1" && token) {
      window.history.replaceState({}, document.title, window.location.pathname);
      void handleSuccessReturn(token);
      return;
    }

    if (saved?.screen && saved.screen !== "landing") {
      restoreFromSavedState(saved);
    }
  }, []);

  useEffect(() => {
    if (!loading && screen !== "landing" && screen !== "paid_report") {
      persistState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, selectedPath, step, answers, interviews, currentUserText, email, sessionToken, preview, loading]);

  const handleStart = () => setScreen("consents");

  const handleConsentContinue = async () => {
    if (!consents.every(Boolean)) return;
    saveConsentState(true);
    startLoader("Przygotowuję sesję...", "Buduję bezpieczny punkt startowy dla analizy.");

    try {
      const res = await fetch(`${API_BASE}/api/session/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: { acceptedAt: new Date().toISOString(), fingerprint: localSessionFingerprint } }),
      });
      const data = await res.json();
      if (!data.ok || !data.token) throw new Error("Nie udało się rozpocząć sesji.");
      setSessionToken(data.token);
      setScreen("entry");
    } catch (error) {
      console.error(error);
      alert("Nie udało się rozpocząć sesji.");
    } finally {
      stopLoader();
    }
  };

  const handleEntrySelect = (pathId: string) => {
    setSelectedPath(pathId);
    setStep(0);
    setAnswers([]);
    setInterviews([]);
    setPatterns([]);
    setCurrentCheckpoint(null);
    setCurrentUserText("");
    setPreview(null);
    setScreen("chat");
  };

  const updateSessionOnServer = async (nextAnswers: Answer[], nextInterviews: InterviewNode[] = interviews) => {
    if (!sessionToken) return;
    const payload = {
      selectedPath,
      answers: nextAnswers,
      interviews: nextInterviews,
      patterns,
      email,
      note: currentUserText,
    };
    try {
      await fetch(`${API_BASE}/api/session/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, payload }),
      });
    } catch (error) {
      console.error("session update error", error);
    }
  };

  const fetchCheckpoint = async (nextAnswers: Answer[]) => {
    startLoader("Zatrzymuję narrację i sprawdzam wzorzec...", "Tu system patrzy, czy Twoje odpowiedzi są spójne z faktami.");
    try {
      const res = await fetch(`${API_BASE}/api/checkpoint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedPath,
          mode,
          answers: nextAnswers,
          patterns,
        }),
      });
      const data = await res.json();
      if (!data.ok || !data.checkpoint) throw new Error("Brak checkpointu");
      setCurrentCheckpoint({
        title: data.checkpoint.title,
        insight: data.checkpoint.insight,
        question: data.checkpoint.question,
      });
      setScreen("checkpoint");
    } catch (error) {
      console.error(error);
      setCurrentCheckpoint({
        title: "Wykryto niespójność",
        insight: "W odpowiedziach widać rozjazd między tym, co próbujesz utrzymać, a tym, co realnie opisujesz.",
        question: "Napisz bez wygładzania, co najbardziej nie daje Ci tu spokoju.",
      });
      setScreen("checkpoint");
    } finally {
      stopLoader();
    }
  };

  const fetchPreview = async (nextAnswers: Answer[], nextInterviews: InterviewNode[]) => {
    startLoader("Buduję wstępny raport...", "Oddzielam fakty od tego, co jeszcze próbujesz uratować samą narracją.");
    try {
      const input = buildNarrative(selectedPath, nextAnswers, nextInterviews.at(-1)?.userText || currentUserText);
      const nextPatterns = [...new Set(nextAnswers.flatMap((a) => a.tags))];
      setPatterns(nextPatterns);

      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          path: selectedPath,
          mode,
          input,
          customDescription: input,
          answers: nextAnswers,
          patterns: nextPatterns,
        }),
      });
      const data = await res.json();
      if (data?.crisis) {
        throw new Error(data.analysis || "Wykryto tryb kryzysowy.");
      }
      if (!data.ok || !data.preview) throw new Error(data.message || "Brak preview");
      const normalized = normalizePreview(data.preview);
      setPreview(normalized);
      setScreen("preview");
      await updateSessionOnServer(nextAnswers, nextInterviews);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Nie udało się wygenerować wstępnego raportu.");
      setScreen("chat");
    } finally {
      stopLoader();
    }
  };

  const handleAnswerSelect = async (option: Option) => {
    if (!currentQuestion) return;
    const nextAnswers = [
      ...answers,
      { questionId: currentQuestion.id, text: option.label, tags: option.tags },
    ];
    setAnswers(nextAnswers);

    const shouldCheckpoint = CHECKPOINTS.includes(step) && step < questions.length - 1;
    const isLast = step >= questions.length - 1;

    if (shouldCheckpoint) {
      await fetchCheckpoint(nextAnswers);
      return;
    }

    if (isLast) {
      await fetchPreview(nextAnswers, interviews);
      return;
    }

    setStep((prev) => prev + 1);
    void updateSessionOnServer(nextAnswers);
  };

  const handleCheckpointSubmit = async () => {
    if (currentUserText.trim().length < 8) {
      alert("Napisz to pełnym zdaniem.");
      return;
    }
    const nextInterviews = [
      ...interviews,
      {
        aiPrompt: currentCheckpoint?.question || "",
        userText: currentUserText.trim(),
      },
    ];
    setInterviews(nextInterviews);
    setCurrentUserText("");

    const isLast = step >= questions.length - 1;
    if (isLast) {
      await fetchPreview(answers, nextInterviews);
      return;
    }

    setStep((prev) => prev + 1);
    setScreen("chat");
    await updateSessionOnServer(answers, nextInterviews);
  };

  const handleBack = () => {
    if (screen === "checkpoint") {
      setScreen("chat");
      return;
    }
    if (screen === "preview") {
      setScreen("chat");
      setStep(Math.max(questions.length - 1, 0));
      return;
    }
    if (screen === "chat") {
      if (step > 0) {
        const nextAnswers = answers.slice(0, -1);
        setAnswers(nextAnswers);
        setStep((prev) => prev - 1);
      } else {
        setScreen("entry");
      }
    }
  };

  const handlePayment = async () => {
    if (!email.includes("@")) {
      alert("Podaj prawidłowy e-mail.");
      return;
    }

    startLoader("Przekierowuję do bezpiecznej płatności...", "Za chwilę przejdziesz do Stripe.");

    try {
      const narrative = buildNarrative(selectedPath, answers, interviews.at(-1)?.userText || "");
      const res = await fetch(`${API_BASE}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          email,
          consentAcceptedAt: new Date().toISOString(),
          payload: {
            path: selectedPath,
            mode,
            answers,
            customDescription: narrative,
            input: narrative,
            patterns,
            interviews,
          },
        }),
      });
      const data = await res.json();
      const checkoutUrl = data.checkoutUrl || data.url;
      if (!data.ok || !checkoutUrl) throw new Error(data.message || "Brak linku do checkoutu");
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);
      alert("Błąd inicjalizacji płatności.");
      stopLoader();
    }
  };

  const handleSuccessReturn = async (token: string) => {
    setProcessingToken(token);
    startLoader("Płatność przyjęta. Pobieram raport premium...", "Jeśli raport jeszcze się generuje, system spróbuje go pobrać ponownie.");

    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`${API_BASE}/api/report/${token}`);
        const data = await res.json();

        if (res.status === 202 || data?.pending) {
          attempts += 1;
          await new Promise((resolve) => setTimeout(resolve, 2500));
          continue;
        }

        if (!data.ok || !data.report) {
          throw new Error(data.message || "Raport nie jest dostępny.");
        }

        const normalized = normalizeFullReport(data.report);
        setFullReport(normalized);
        setScreen("paid_report");
        clearAppState();
        stopLoader();
        return;
      } catch (error) {
        console.error("handleSuccessReturn error:", error);
        break;
      }
    }

    stopLoader();
    alert("Płatność wróciła, ale raport nie jest jeszcze gotowy. Sprawdź za chwilę ponownie albo zajrzyj do maila.");
    setScreen("landing");
  };

  const retryFetchReport = async () => {
    if (!processingToken) return;
    await handleSuccessReturn(processingToken);
  };

  const downloadPDF = async () => {
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
  };

  return (
    <div className="ctms-app" style={{ minHeight: "100dvh" }}>
      <style>{`
        .ctms-premium-badge{margin-top:24px;padding:24px 18px;border-radius:26px;border:1px solid rgba(255,255,255,0.08);background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));text-align:center;box-shadow:inset 0 0 32px rgba(0,0,0,0.22)}
        .ctms-premium-badge__eyebrow{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:12px}
        .ctms-premium-badge__score{font-size:clamp(54px,14vw,84px);font-weight:900;line-height:1;margin-bottom:8px}
        .ctms-premium-badge__title{font-size:clamp(22px,5.5vw,34px);font-weight:800;line-height:1.15}
        .ctms-premium-badge__desc{margin:14px auto 0;max-width:700px;font-size:16px;line-height:1.65;color:#e5e7eb}
        .ctms-premium-badge--good .ctms-premium-badge__score,.ctms-premium-badge--good .ctms-premium-badge__title{color:var(--gold)}
        .ctms-premium-badge--mid .ctms-premium-badge__score,.ctms-premium-badge--mid .ctms-premium-badge__title{color:#facc15}
        .ctms-premium-badge--bad .ctms-premium-badge__score,.ctms-premium-badge--bad .ctms-premium-badge__title{color:#f5a3a3}
        .ctms-hero-grid{display:grid;gap:14px;margin-top:28px;width:100%}
        .ctms-card-note{display:block;margin-top:8px;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.62)}
        .ctms-kicker{font-size:12px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:14px}
        .ctms-price-chip{display:inline-flex;align-items:center;justify-content:center;min-width:110px;padding:10px 14px;border-radius:999px;background:rgba(197,160,89,.14);border:1px solid rgba(197,160,89,.35);color:#f6deb0;font-weight:700}
        .ctms-inline-actions{display:flex;flex-wrap:wrap;gap:10px}
        .ctms-processing-card .ctms-text-btn{opacity:.9}
      `}</style>

      {legalModal && (
        <div className="ctms-legal-overlay" onClick={() => setLegalModal(null)}>
          <div className="ctms-legal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ctms-legal-header">
              <h3>{legalTitle(legalModal)}</h3>
              <button onClick={() => setLegalModal(null)}>✕</button>
            </div>
            <div className="ctms-legal-body" style={{ whiteSpace: "pre-wrap" }}>
              {legalBody(legalModal)}
            </div>
          </div>
        </div>
      )}

      <div className="ctms-shell">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.section key="processing" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-processing-card ctms-center">
                <div className="ctms-spinner ctms-spinner-big" />
                <p>{loadingLabel}</p>
                {loadingHint ? <p className="ctms-copy" style={{ textAlign: "center", marginTop: 10 }}>{loadingHint}</p> : null}
                <div className="ctms-actions" style={{ marginTop: 18, width: "100%" }}>
                  <button className="ctms-text-btn" onClick={resetFlow} style={{ width: "100%", minHeight: 48 }}>
                    Przerwij i wróć na stronę główną
                  </button>
                  {processingToken ? (
                    <button className="ctms-text-btn" onClick={retryFetchReport} style={{ width: "100%", minHeight: 48 }}>
                      Spróbuj pobrać raport ponownie
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "landing" && (
            <motion.section key="landing" className="ctms-landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-landing-glow ctms-landing-glow-left" />
              <div className="ctms-landing-glow ctms-landing-glow-right" />

              <div className="ctms-center ctms-narrow">
                <p className="ctms-kicker">CzyToMaSens</p>
                <h1 className="ctms-brand">
                  Przestań zgadywać.<br />
                  Zobacz, co ta relacja<br />
                  naprawdę z Tobą robi.
                </h1>
                <p className="ctms-hero-main">
                  To nie jest test z internetu ani plastikowy chatbot. To chłodne, premium lustro relacji — zbudowane po to,
                  żeby oddzielić fakty od nadziei, napięcie od bliskości i realny sens od emocjonalnej mgły.
                </p>

                <div className="ctms-hero-grid">
                  <div className="ctms-card-btn" style={{ cursor: "default" }}>
                    <span className="ctms-card-main">Rozmowa zamiast suchego quizu</span>
                    <span className="ctms-card-note">System prowadzi Cię warstwowo, nie traktuje jak kolejną ankietę z internetu.</span>
                  </div>
                  <div className="ctms-card-btn" style={{ cursor: "default" }}>
                    <span className="ctms-card-main">Checkpoint w środku analizy</span>
                    <span className="ctms-card-note">AI zatrzymuje Cię tam, gdzie wykrywa niespójność i wymusza dopowiedzenie prawdy.</span>
                  </div>
                  <div className="ctms-card-btn" style={{ cursor: "default" }}>
                    <span className="ctms-card-main">Wstępne lustro i raport premium</span>
                    <span className="ctms-card-note">Najpierw widzisz kierunek. Potem decydujesz, czy chcesz wejść głębiej.</span>
                  </div>
                </div>

                <div className="ctms-actions" style={{ marginTop: 26 }}>
                  <button className="ctms-primary" onClick={handleStart} style={{ width: "100%", minHeight: 56 }}>
                    Rozpocznij analizę
                  </button>
                </div>

                <div className="ctms-footer-links">
                  <button onClick={() => setLegalModal("terms")}>Regulamin</button>
                  <button onClick={() => setLegalModal("privacy")}>Polityka prywatności</button>
                </div>

                {draftFound ? (
                  <div className="ctms-actions" style={{ marginTop: 18 }}>
                    <button className="ctms-text-btn" onClick={() => setScreen("preview")} style={{ width: "100%", minHeight: 48 }}>
                      Wykryto niedokończoną sesję — wróć do poprzedniego etapu
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.section>
          )}

          {!loading && screen === "consents" && (
            <motion.section key="consents" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <h1 className="ctms-title">Zanim wejdziesz głębiej</h1>
                  <p className="ctms-copy">
                    To narzędzie ma być ostre, ale uczciwe. Zanim ruszysz dalej, musisz świadomie zaakceptować zasady gry.
                  </p>

                  <div className="ctms-list">
                    {CONSENTS.map((txt, i) => (
                      <label key={i} className="ctms-checkbox-row" style={{ padding: "12px 0" }}>
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

                  <div className="ctms-actions" style={{ marginTop: 24 }}>
                    <button
                      className={consents.every(Boolean) ? "ctms-primary" : "ctms-primary ctms-primary-disabled"}
                      disabled={!consents.every(Boolean)}
                      onClick={handleConsentContinue}
                      style={{ width: "100%", minHeight: 54 }}
                    >
                      Akceptuję i wchodzę dalej
                    </button>
                    <button className="ctms-text-btn" onClick={() => setScreen("landing")} style={{ width: "100%", minHeight: 48 }}>
                      Wróć
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "entry" && (
            <motion.section key="entry" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <div className="ctms-copy">
                    Tu nie wybierasz kategorii. Wybierasz problem, od którego system ma zacząć analizę.
                  </div>
                  <h2 className="ctms-question">Co Cię tu naprawdę przyprowadza?</h2>
                  <div className="ctms-list">
                    {ENTRY_POINTS.map((opt) => (
                      <button key={opt.id} className="ctms-card-btn" onClick={() => handleEntrySelect(opt.id)} style={{ minHeight: 64, padding: "18px 20px" }}>
                        <span className="ctms-card-main">{opt.label}</span>
                        <span className="ctms-card-note">{opt.note}</span>
                      </button>
                    ))}
                  </div>
                  <div className="ctms-actions" style={{ marginTop: 18 }}>
                    <button className="ctms-text-btn" onClick={() => setScreen("landing")} style={{ width: "100%", minHeight: 48 }}>
                      Wróć na stronę główną
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "chat" && currentQuestion && (
            <motion.section key={`chat-${selectedPath}-${step}`} className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                  <div className="ctms-inline-actions">
                    <button className="ctms-text-btn" onClick={handleBack}>Cofnij</button>
                    <button className="ctms-text-btn" onClick={resetFlow}>Od początku</button>
                    <button className="ctms-text-btn" onClick={() => setScreen("entry")}>Zmień punkt wejścia</button>
                  </div>
                  <div className="ctms-progress-wrap">
                    <span>{progress}%</span>
                    <div className="ctms-progress-track">
                      <div className="ctms-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="ctms-question-card">
                  <div className="ctms-copy">{selectedEntry?.label} • {currentQuestion.lead}</div>
                  <h2 className="ctms-question">{currentQuestion.text}</h2>
                  <div className="ctms-list">
                    {currentQuestion.options.map((opt, i) => (
                      <button key={i} className="ctms-card-btn" onClick={() => void handleAnswerSelect(opt)} style={{ minHeight: 56, padding: "18px 20px", marginBottom: 12 }}>
                        <span className="ctms-card-main">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "checkpoint" && currentCheckpoint && (
            <motion.section key="checkpoint" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <div className="ctms-copy" style={{ color: "var(--danger)" }}>{currentCheckpoint.title}</div>
                  <Typewriter text={currentCheckpoint.insight} />
                  <h2 className="ctms-question" style={{ marginTop: 16 }}>{currentCheckpoint.question}</h2>
                  <textarea
                    className="ctms-textarea"
                    value={currentUserText}
                    onChange={(e) => setCurrentUserText(e.target.value)}
                    placeholder="Napisz konkretnie. Tu nie chodzi o ładną wersję."
                    style={{ fontSize: 16, minHeight: 130 }}
                  />
                  <div className="ctms-actions" style={{ marginTop: 18 }}>
                    <button className="ctms-primary ctms-full" onClick={() => void handleCheckpointSubmit()} style={{ minHeight: 54 }}>
                      Zatwierdź i idź dalej
                    </button>
                    <button className="ctms-text-btn" onClick={handleBack} style={{ width: "100%", minHeight: 48 }}>
                      Wróć
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "preview" && preview && (
            <motion.section key="preview" className="ctms-report-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-report-shell">
                <div className="ctms-report-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <div className="ctms-kicker">Wstępny raport</div>
                      <h2 className="ctms-report-title" style={{ fontSize: "clamp(32px, 8vw, 56px)" }}>{preview.headline}</h2>
                    </div>
                    <div className="ctms-price-chip">{PRICE_LABEL}</div>
                  </div>

                  <div className="ctms-report-preview" style={{ marginTop: 16 }}>{preview.previewLine}</div>

                  <PremiumSenseBadge score={preview.rebuildPercent} />

                  <div className="ctms-report-metrics" style={{ marginTop: 20 }}>
                    <div className="ctms-report-metric"><span>{preview.tensionPercent}%</span><small>Poziom napięcia</small></div>
                    <div className="ctms-report-metric"><span>{preview.driftPercent}%</span><small>Rozjazd</small></div>
                    <div className="ctms-report-metric"><span>{preview.rebuildPercent}%</span><small>Szansa zmiany</small></div>
                  </div>

                  <div className="ctms-preview-section" style={{ marginTop: 22 }}>
                    <h3>Co system widzi już teraz</h3>
                    <p>{preview.subheadline}</p>
                  </div>

                  {preview.sections?.map((section, idx) => (
                    <div key={idx} className="ctms-preview-section" style={{ marginTop: 18 }}>
                      <h3 className={section.tone === "danger" ? "ctms-tone-danger" : section.tone === "gold" ? "ctms-tone-gold" : ""}>
                        {section.title}
                      </h3>
                      <p>{section.text}</p>
                    </div>
                  ))}

                  <div className="ctms-preview-section" style={{ marginTop: 18 }}>
                    <h3>Lustro systemu</h3>
                    <p>{preview.closing}</p>
                  </div>

                  <div className="ctms-payment-card" style={{ marginTop: 24 }}>
                    <h3 className="ctms-title" style={{ fontSize: 28, marginBottom: 8 }}>Odblokuj pełny raport premium</h3>
                    <p className="ctms-copy" style={{ fontSize: 15 }}>
                      Dostaniesz pełny dokument premium: rozwinięte mechanizmy, scenariusze, analizę ryzyk i końcowy werdykt systemu.
                    </p>

                    <input
                      type="email"
                      className="ctms-input ctms-mb"
                      placeholder="Adres e-mail do raportu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ fontSize: 16, minHeight: 52 }}
                    />

                    <div className="ctms-actions" style={{ marginTop: 12 }}>
                      <button className="ctms-primary ctms-full" onClick={() => void handlePayment()} style={{ minHeight: 56 }}>
                        Pobierz pełną analizę — {PRICE_LABEL}
                      </button>
                      <button className="ctms-text-btn" onClick={handleBack} style={{ width: "100%", minHeight: 48 }}>
                        Wróć do pytań
                      </button>
                      <button className="ctms-text-btn" onClick={resetFlow} style={{ width: "100%", minHeight: 48 }}>
                        Zacznij od początku
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "paid_report" && fullReport && (
            <motion.section key="paid_report" className="ctms-report-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-report-shell">
                <div className="ctms-report-card" ref={reportRef}>
                  <div className="ctms-kicker">Raport premium</div>
                  <h2 className="ctms-report-title">{fullReport.headline}</h2>
                  <p className="ctms-report-sub">{fullReport.subheadline}</p>
                  <div className="ctms-report-preview">{fullReport.previewLine}</div>
                  <PremiumSenseBadge score={fullReport.rebuildPercent} />
                  <div className="ctms-report-metrics" style={{ marginTop: 20 }}>
                    <div className="ctms-report-metric"><span>{fullReport.tensionPercent}%</span><small>Poziom napięcia</small></div>
                    <div className="ctms-report-metric"><span>{fullReport.driftPercent}%</span><small>Rozjazd</small></div>
                    <div className="ctms-report-metric"><span>{fullReport.rebuildPercent}%</span><small>Szansa zmiany</small></div>
                  </div>
                  {fullReport.sections.map((section, idx) => (
                    <div key={idx} className="ctms-preview-section" style={{ marginTop: 20 }}>
                      <h3 className={section.tone === "danger" ? "ctms-tone-danger" : section.tone === "gold" ? "ctms-tone-gold" : ""}>{section.title}</h3>
                      <p>{section.text}</p>
                    </div>
                  ))}
                  <div className="ctms-preview-section" style={{ marginTop: 20 }}>
                    <h3>Wniosek końcowy</h3>
                    <p>{fullReport.closing}</p>
                  </div>
                </div>

                <div className="ctms-actions" style={{ marginTop: 18 }}>
                  <button className="ctms-primary" onClick={() => void downloadPDF()} style={{ width: "100%", minHeight: 56 }}>Pobierz raport jako PDF</button>
                  <button className="ctms-text-btn" onClick={resetFlow} style={{ width: "100%", minHeight: 48 }}>Zakończ i wróć na stronę główną</button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
