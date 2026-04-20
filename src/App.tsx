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

type EntryId = "betrayal" | "uncertainty" | "stagnation" | "toxic_loops";

type Option = { label: string; tags: string[] };
type Question = { id: number; lead: string; text: string; options: Option[] };
type Answer = { questionId: number; text: string; tags: string[] };

type PreviewIndicator = { label: string; value: number };
type PreviewReport = {
  score: number;
  badge?: "green" | "yellow" | "red";
  headline: string;
  mirror: string;
  indicators: PreviewIndicator[];
  summary: string;
  next: string;
};

type FullReport = {
  headline: string;
  subheadline?: string;
  previewLine?: string;
  tensionPercent?: number;
  driftPercent?: number;
  rebuildPercent?: number;
  sections?: { title: string; text: string; tone?: "normal" | "gold" | "danger" }[];
  closing?: string;
};

type CheckpointData = {
  title?: string;
  headline?: string;
  insight?: string;
  question?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "";

const ENTRY_POINTS: { id: EntryId; title: string; desc: string }[] = [
  {
    id: "betrayal",
    title: "Zdrada, kłamstwo albo utrata zaufania",
    desc: "Tu liczy się nie tylko sam fakt. Liczy się też to, co ta historia zrobiła z Twoim poczuciem bezpieczeństwa.",
  },
  {
    id: "uncertainty",
    title: "Nie wiem, na czym stoję",
    desc: "Dla chaosu, niedopowiedzeń, emocjonalnych okruszków i sygnałów, które bardziej mieszają niż wyjaśniają.",
  },
  {
    id: "stagnation",
    title: "To trwa, ale coś ewidentnie gaśnie",
    desc: "Nie wszystko kończy się wybuchem. Czasem relacja po prostu cicho przestaje dawać sens i energię.",
  },
  {
    id: "toxic_loops",
    title: "Kręcimy się w kółko i wracamy do tego samego",
    desc: "Dla cyklu napięcie – ulga – powrót – kolejny zjazd. Bez realnej zmiany, za to z coraz większym kosztem.",
  },
];

const QUESTIONS_BY_ENTRY: Record<EntryId, Question[]> = {
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

const CHECKPOINT_STEPS = [1];

function PremiumSenseBadge({ score }: { score: number }) {
  const meta =
    score >= 70
      ? {
          tone: "good",
          title: "Wysoki potencjał sensu",
          desc: "Ten układ nie wygląda z automatu na emocjonalny wrak. Nadal trzeba patrzeć na fakty, ale nie wszystko tu idzie w stronę katastrofy.",
        }
      : score >= 40
      ? {
          tone: "mid",
          title: "Układ chwiejny",
          desc: "Tu nie ma jeszcze prostego wyroku. Jest za to realne ryzyko dalszego rozjazdu, jeśli zostawisz to bez twardej oceny faktów.",
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

function normalizePreview(raw: any): PreviewReport {
  const indicators = Array.isArray(raw?.indicators) ? raw.indicators : [];
  const tension = Number(raw?.tensionPercent) || Number(indicators.find((x: any) => /napi/i.test(x.label || ""))?.value) || 41;
  const drift = Number(raw?.driftPercent) || Number(indicators.find((x: any) => /rozjazd|asymetr/i.test(x.label || ""))?.value) || 48;
  const rebuild = Number(raw?.rebuildPercent) || Number(raw?.score) || Number(indicators.find((x: any) => /szansa|sens/i.test(x.label || ""))?.value) || 57;

  return {
    headline: raw?.headline || "Tu bardziej widać chwiejność niż spójność.",
    subheadline: raw?.summary || "To nie wygląda jeszcze na stabilny grunt.",
    previewLine: raw?.mirror || raw?.previewLine || "Największy problem nie wygląda tu na brak uczuć, tylko na brak jasności i stabilności.",
    tensionPercent: tension,
    driftPercent: drift,
    rebuildPercent: rebuild,
    sections: Array.isArray(raw?.sections) ? raw.sections : [],
    closing: raw?.next || "Pełny raport pokazuje dominujące mechanizmy, ryzyka i najbardziej prawdopodobny kierunek rozwoju.",
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [legalModal, setLegalModal] = useState<LegalKey>(null);
  const [consents, setConsents] = useState<boolean[]>(new Array(CONSENTS.length).fill(false));
  const [selectedPath, setSelectedPath] = useState<EntryId | "">("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [interviews, setInterviews] = useState<{ aiPrompt: string; userText: string }[]>([]);
  const [sessionToken, setSessionToken] = useState("");
  const [currentAiObservation, setCurrentAiObservation] = useState("");
  const [currentUserText, setCurrentUserText] = useState("");
  const [preview, setPreview] = useState<PreviewReport | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [email, setEmail] = useState("");
  const [loadingLabel, setLoadingLabel] = useState("Przetwarzanie...");
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const reportRef = useRef<HTMLDivElement | null>(null);
  const sessionFingerprint = useMemo(() => getSessionId(), []);
  const questions = selectedPath ? QUESTIONS_BY_ENTRY[selectedPath] : [];
  const currentQuestion = questions[step] || null;

  function startLoader(label: string) {
    setLoadingLabel(label);
    setLoading(true);
  }

  function stopLoader() {
    setLoading(false);
    setLoadingLabel("Przetwarzanie...");
  }

  function resetFlow() {
    clearAppState();
    stopLoader();
    setScreen("landing");
    setSelectedPath("");
    setStep(0);
    setAnswers([]);
    setInterviews([]);
    setSessionToken("");
    setCurrentAiObservation("");
    setCurrentUserText("");
    setPreview(null);
    setFullReport(null);
    setEmail("");
    setReportError("");
  }

  useEffect(() => {
    const saved = getAppState() as any;
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const cancel = params.get("cancel") || params.get("cancelled");
    const token = params.get("token");

    if (getConsentState()) setConsents(new Array(CONSENTS.length).fill(true));

    if (cancel === "1" || cancel === "true") {
      window.history.replaceState({}, document.title, window.location.pathname);
      if (saved?.preview) {
        setPreview(saved.preview);
        setSelectedPath(saved.selectedPath || "");
        setAnswers(saved.answers || []);
        setInterviews(saved.interviews || []);
        setEmail(saved.email || "");
        setSessionToken(saved.sessionToken || "");
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

    if (saved && saved.screen && saved.screen !== "landing") {
      setScreen(saved.screen);
      setSelectedPath(saved.selectedPath || "");
      setStep(saved.step || 0);
      setAnswers(saved.answers || []);
      setInterviews(saved.interviews || []);
      setSessionToken(saved.sessionToken || "");
      setPreview(saved.preview || null);
      setEmail(saved.email || "");
      setCurrentAiObservation(saved.currentAiObservation || "");
      setCurrentUserText(saved.currentUserText || "");
    }
  }, []);

  useEffect(() => {
    if (screen === "landing" || screen === "paid_report") return;
    saveAppState({
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
    });
  }, [screen, selectedPath, step, answers, interviews, sessionToken, preview, email, currentAiObservation, currentUserText]);

  async function handleStartConsents() {
    if (!consents.every(Boolean)) return;
    saveConsentState(true);
    setScreen("entry");
  }

  async function handleSelectPath(pathId: EntryId) {
    startLoader("Przygotowuję sesję...");
    try {
      const res = await fetch(`${API_BASE}/api/session/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryKey: pathId, consent: { acceptedAt: new Date().toISOString() } }),
      });
      const data = await res.json();
      if (!data.ok || !data.token) throw new Error("Brak tokenu sesji.");
      setSessionToken(data.token);
      setSelectedPath(pathId);
      setStep(0);
      setAnswers([]);
      setInterviews([]);
      setPreview(null);
      setCurrentAiObservation("");
      setCurrentUserText("");
      setScreen("chat");
    } catch (error) {
      console.error(error);
      alert("Nie udało się rozpocząć sesji.");
    } finally {
      stopLoader();
    }
  }

  async function handleAnswer(opt: Option) {
    if (!currentQuestion) return;
    const newAnswers = [
      ...answers,
      { questionId: currentQuestion.id, text: opt.label, tags: opt.tags },
    ];
    setAnswers(newAnswers);

    if (CHECKPOINT_STEPS.includes(step)) {
      startLoader("AI składa fakty do kupy...");
      try {
        const res = await fetch(`${API_BASE}/api/checkpoint`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: selectedPath, answers: newAnswers, interviews }),
        });
        const data = await res.json();
        setCurrentAiObservation(
          data?.checkpoint?.question ||
            data?.checkpoint?.insight ||
            "Tu system widzi niespójność. Napisz bez wygładzania, czego nie chcesz nazwać wprost."
        );
      } catch (error) {
        console.error(error);
        setCurrentAiObservation(
          "Tu system widzi rozjazd między tym, co chcesz utrzymać, a tym, co realnie opisujesz. Napisz, co najbardziej Cię tu męczy."
        );
      } finally {
        stopLoader();
      }
      setScreen("checkpoint");
      return;
    }

    if (step === questions.length - 1) {
      await submitFinalAnalysis(newAnswers, interviews);
      return;
    }

    setStep((prev) => prev + 1);
  }

  async function submitOpenResponse() {
    if (!currentUserText.trim()) {
      alert("Tu musisz napisać coś własnego.");
      return;
    }
    const newInterviews = [...interviews, { aiPrompt: currentAiObservation, userText: currentUserText.trim() }];
    setInterviews(newInterviews);
    setCurrentUserText("");
    setStep((prev) => prev + 1);
    if (step + 1 >= questions.length) {
      await submitFinalAnalysis(answers, newInterviews);
      return;
    }
    setScreen("chat");
  }

  async function submitFinalAnalysis(answerList: Answer[], interviewList: { aiPrompt: string; userText: string }[]) {
    startLoader("Buduję wstępny raport...");
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selectedPath, answers: answerList, interviews: interviewList }),
      });
      const data = await res.json();
      if (!data.ok || !data.preview) throw new Error("Brak preview.");
      setPreview(normalizePreview(data.preview));
      setScreen("preview");
    } catch (error) {
      console.error(error);
      alert("Nie udało się zbudować wstępnego raportu.");
    } finally {
      stopLoader();
    }
  }

  async function captureEmail() {
    if (!email.includes("@") || !sessionToken) return;
    try {
      await fetch(`${API_BASE}/api/capture-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, email }),
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePayment() {
    if (!email.includes("@")) {
      alert("Podaj prawidłowy e-mail.");
      return;
    }
    if (!sessionToken) {
      alert("Brak tokenu sesji.");
      return;
    }

    startLoader("Przekierowuję do płatności...");
    try {
      const res = await fetch(`${API_BASE}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          email,
          consentAcceptedAt: new Date().toISOString(),
          payload: { path: selectedPath, answers, interviews },
        }),
      });
      const data = await res.json();
      const checkoutUrl = data?.checkoutUrl || data?.url;
      if (!data.ok || !checkoutUrl) throw new Error("Brak linku do checkoutu.");
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);
      stopLoader();
      alert("Błąd inicjalizacji płatności.");
    }
  }

  async function handleSuccessReturn(token: string) {
    startLoader("Płatność przyjęta. Pobieram raport premium...");
    setReportError("");
    try {
      const res = await fetch(`${API_BASE}/api/report/${token}`);
      const data = await res.json();
      if (!data.ok || !data.report) throw new Error("Raport nie jest dostępny.");
      setFullReport(data.report);
      setScreen("paid_report");
      clearAppState();
    } catch (error) {
      console.error(error);
      setReportError("Płatność wróciła, ale raport nie został poprawnie załadowany. Wróć na stronę główną i spróbuj ponownie.");
      setScreen("landing");
    } finally {
      stopLoader();
    }
  }

  async function downloadPDF() {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: "#050505", scale: 2, useCORS: true });
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
    pdf.save("CzyToMaSens_Raport_Premium.pdf");
  }

  const progress = questions.length ? Math.round(((step + 1) / questions.length) * 100) : 0;

  return (
    <div className="ctms-app" style={{ minHeight: "100dvh" }}>
      {legalModal && (
        <div className="ctms-legal-overlay" onClick={() => setLegalModal(null)}>
          <div className="ctms-legal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ctms-legal-header">
              <h3>{legalModal === "terms" ? LEGAL_CONTENT.terms.title : LEGAL_CONTENT.privacy.title}</h3>
              <button onClick={() => setLegalModal(null)}>✕</button>
            </div>
            <p className="whitespace-pre-wrap">{legalModal === "terms" ? LEGAL_CONTENT.terms.body : LEGAL_CONTENT.privacy.body}</p>
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
                <div className="ctms-actions" style={{ marginTop: 18, width: "100%" }}>
                  <button className="ctms-text-btn" onClick={resetFlow} style={{ width: "100%", minHeight: 48 }}>
                    Przerwij i wróć na stronę główną
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "landing" && (
            <motion.section key="landing" className="ctms-landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-landing-glow ctms-landing-glow-left" />
              <div className="ctms-landing-glow ctms-landing-glow-right" />
              <div className="ctms-center ctms-narrow">
                <p className="ctms-eyebrow">CzyToMaSens</p>
                <h1 className="ctms-brand">
                  Przestań zgadywać.<br />
                  Zobacz, co ta relacja<br />
                  naprawdę z Tobą robi.
                </h1>
                <p className="ctms-hero-main">
                  To nie jest test z internetu ani plastikowy chatbot. To chłodne, premium lustro relacji — zbudowane po to,
                  żeby oddzielić fakty od nadziei, napięcie od bliskości i realny sens od emocjonalnej mgły.
                </p>
                <div className="ctms-actions" style={{ marginTop: 24 }}>
                  <button className="ctms-primary" onClick={() => setScreen("consents")} style={{ width: "100%", minHeight: 56 }}>
                    Rozpocznij analizę
                  </button>
                </div>
                {reportError ? <p className="ctms-copy" style={{ marginTop: 12, color: "var(--danger)" }}>{reportError}</p> : null}
                <div className="ctms-footer-links">
                  <button onClick={() => setLegalModal("terms")}>Regulamin</button>
                  <button onClick={() => setLegalModal("privacy")}>Polityka prywatności</button>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "consents" && (
            <motion.section key="consents" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <h1 className="ctms-title">Zanim wejdziesz głębiej</h1>
                  <p className="ctms-copy">To narzędzie ma być ostre, ale uczciwe. Zanim ruszysz dalej, musisz świadomie zaakceptować zasady gry.</p>
                  <div className="ctms-list">
                    {CONSENTS.map((txt, i) => (
                      <label key={i} className="ctms-checkbox-row" style={{ padding: "12px 0" }}>
                        <input type="checkbox" checked={consents[i]} onChange={(e) => { const next = [...consents]; next[i] = e.target.checked; setConsents(next); }} />
                        <span>{txt}</span>
                      </label>
                    ))}
                  </div>
                  <div className="ctms-actions" style={{ marginTop: 24 }}>
                    <button className={consents.every(Boolean) ? "ctms-primary" : "ctms-primary ctms-primary-disabled"} disabled={!consents.every(Boolean)} onClick={handleStartConsents} style={{ width: "100%", minHeight: 54 }}>
                      Akceptuję i wchodzę dalej
                    </button>
                    <button className="ctms-text-btn" onClick={resetFlow} style={{ width: "100%", minHeight: 54 }}>
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
                  <div className="ctms-copy">Tu nie wybierasz kategorii. Wybierasz problem, od którego system ma zacząć analizę.</div>
                  <h2 className="ctms-question">Co Cię tu naprawdę przyprowadza?</h2>
                  <div className="ctms-list">
                    {ENTRY_POINTS.map((opt) => (
                      <button key={opt.id} className="ctms-card-btn" onClick={() => handleSelectPath(opt.id)} style={{ minHeight: 64, padding: "18px 20px" }}>
                        <span className="ctms-card-main">{opt.title}</span>
                        <span className="ctms-card-note">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "chat" && currentQuestion && (
            <motion.section key={`chat-${selectedPath}-${step}`} className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-topbar" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="ctms-text-btn" onClick={() => { if (step > 0) setStep(step - 1); else setScreen("entry"); }}>Cofnij</button>
                    <button className="ctms-text-btn" onClick={resetFlow}>Od początku</button>
                    <button className="ctms-text-btn" onClick={() => setScreen("entry")}>Zmień punkt wejścia</button>
                  </div>
                  <div className="ctms-progress-wrap">
                    <span>{progress}%</span>
                    <div className="ctms-progress-track"><div className="ctms-progress-fill" style={{ width: `${progress}%` }} /></div>
                  </div>
                </div>
                <div className="ctms-question-card">
                  <div className="ctms-copy">{ENTRY_POINTS.find((x) => x.id === selectedPath)?.title} • {currentQuestion.lead}</div>
                  <h2 className="ctms-question">{currentQuestion.text}</h2>
                  <div className="ctms-list">
                    {currentQuestion.options.map((opt, i) => (
                      <button key={i} className="ctms-card-btn" onClick={() => handleAnswer(opt)} style={{ minHeight: 56, padding: "18px 20px", marginBottom: 12 }}>
                        <span className="ctms-card-main">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "checkpoint" && (
            <motion.section key="checkpoint" className="ctms-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <div className="ctms-copy" style={{ color: "var(--danger)" }}>Wykryto niespójność</div>
                  <div className="ctms-report-preview">{currentAiObservation}</div>
                  <textarea className="ctms-textarea" value={currentUserText} onChange={(e) => setCurrentUserText(e.target.value)} placeholder="Napisz bez wygładzania. Tu nie chodzi o ładną wersję." style={{ fontSize: 16, minHeight: 130 }} />
                  <div className="ctms-actions" style={{ marginTop: 18 }}>
                    <button className="ctms-primary ctms-full" onClick={submitOpenResponse} style={{ minHeight: 54 }}>Zatwierdź i idź dalej</button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "preview" && preview && (
            <motion.section key="preview" className="ctms-report-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="ctms-report-shell">
                <div className="ctms-report-card">
                  <div className="ctms-report-head">
                    <div>
                      <div className="ctms-eyebrow">Wstępny raport</div>
                      <h2 className="ctms-report-title">{preview.headline}</h2>
                      <p className="ctms-report-sub">{preview.subheadline}</p>
                    </div>
                    <div className="ctms-score-box">
                      <div className="ctms-score">15 zł</div>
                      <div className="ctms-score-label">pełna analiza premium</div>
                    </div>
                  </div>
                  <div className="ctms-report-preview">„{preview.previewLine}”</div>
                  <PremiumSenseBadge score={preview.rebuildPercent} />
                  <div className="ctms-report-metrics">
                    <div className="ctms-report-metric"><span>{preview.tensionPercent}%</span><small>Poziom napięcia</small></div>
                    <div className="ctms-report-metric"><span>{preview.driftPercent}%</span><small>Rozjazd</small></div>
                    <div className="ctms-report-metric"><span>{preview.rebuildPercent}%</span><small>Szansa zmiany</small></div>
                  </div>
                  <div className="ctms-preview-section"><p>{preview.closing}</p></div>
                  <div className="ctms-payment-card">
                    <h3 className="ctms-title" style={{ fontSize: 24, marginBottom: 10 }}>Odblokuj pełny raport</h3>
                    <p className="ctms-copy">Dostaniesz pełny dokument premium: metryki, scenariusze, analizę mechanizmów i końcowy werdykt systemu.</p>
                    <input className="ctms-input ctms-mb" type="email" placeholder="Adres e-mail do raportu" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => void captureEmail()} style={{ fontSize: 16, minHeight: 52 }} />
                    <div className="ctms-actions" style={{ gap: 10, marginTop: 10 }}>
                      <button className="ctms-primary ctms-full" onClick={handlePayment} style={{ minHeight: 56 }}>Pobierz pełną analizę — 15 PLN</button>
                      <button className="ctms-text-btn" onClick={() => setScreen("chat")} style={{ width: "100%", minHeight: 48 }}>Wróć do pytań</button>
                      <button className="ctms-text-btn" onClick={resetFlow} style={{ width: "100%", minHeight: 48 }}>Zacznij od początku</button>
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
                  <div className="ctms-eyebrow">Raport premium</div>
                  <h2 className="ctms-report-title">{fullReport.headline}</h2>
                  {fullReport.subheadline ? <p className="ctms-report-sub">{fullReport.subheadline}</p> : null}
                  {typeof fullReport.rebuildPercent === "number" ? <PremiumSenseBadge score={fullReport.rebuildPercent} /> : null}
                  {fullReport.sections?.map((sec, i) => (
                    <div key={i} className="ctms-preview-section" style={{ marginTop: 24 }}>
                      <h3 className={sec.tone === "danger" ? "ctms-tone-danger" : sec.tone === "gold" ? "ctms-tone-gold" : ""}>{sec.title}</h3>
                      <p style={{ lineHeight: 1.7 }}>{sec.text}</p>
                    </div>
                  ))}
                  {fullReport.closing ? <div className="ctms-report-preview" style={{ marginTop: 24 }}>{fullReport.closing}</div> : null}
                </div>
                <div className="ctms-report-actions" style={{ flexDirection: "column", gap: 12 }}>
                  <button className="ctms-primary" onClick={() => void downloadPDF()} style={{ width: "100%", minHeight: 56 }}>Pobierz raport jako PDF</button>
                  <button className="ctms-text-btn" onClick={resetFlow} style={{ width: "100%", minHeight: 54 }}>Zakończ i wróć na stronę główną</button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
