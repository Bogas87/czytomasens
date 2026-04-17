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

type EntryOption = {
  id: string;
  title: string;
  desc: string;
};

type QuestionOption = {
  label: string;
  tags: string[];
};

type Question = {
  id: number;
  lead: string;
  text: string;
  options: QuestionOption[];
};

type Answer = {
  questionId: number;
  text: string;
  tags: string[];
};

type CheckpointResponse = {
  title?: string;
  headline?: string;
  insight?: string;
  question?: string;
};

type PreviewIndicator = {
  label: string;
  value: number;
};

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

const API_BASE = import.meta.env.VITE_API_BASE || "";

const ENTRY_OPTIONS: EntryOption[] = [
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

const QUESTIONS_BY_ENTRY: Record<string, Question[]> = {
  betrayal: [
    {
      id: 1,
      lead: "Zdrada nie kończy się na samym fakcie. Najwięcej mówi to, co dzieje się później.",
      text: "Czy po pęknięciu zaufania druga strona wzięła pełną odpowiedzialność, czy próbowała rozmyć winę?",
      options: [
        { label: "Rozmywała winę i mieszała odpowiedzialność", tags: ["betrayal", "gaslighting", "avoidance"] },
        { label: "Brała odpowiedzialność, ale niespójnie", tags: ["betrayal", "instability"] },
        { label: "Naprawdę wzięła odpowiedzialność", tags: ["repair_attempt"] },
      ],
    },
    {
      id: 2,
      lead: "Po zdradzie liczą się czyny, nie PR naprawczy.",
      text: "Czy po tej historii czujesz dziś więcej bezpieczeństwa, czy nadal głównie napięcie i czujność?",
      options: [
        { label: "Głównie napięcie i czujność", tags: ["hypervigilance", "stress"] },
        { label: "To się waha, nie jest stabilne", tags: ["instability"] },
        { label: "Powoli wraca bezpieczeństwo", tags: ["repair_attempt", "hope"] },
      ],
    },
    {
      id: 3,
      lead: "To jest moment, w którym trzeba oddzielić miłość od lęku przed stratą.",
      text: "Gdybyś dziś miał być brutalnie szczery, to bardziej zostajesz z wiary w zmianę czy z lęku przed rozpadem?",
      options: [
        { label: "Bardziej z lęku przed rozpadem", tags: ["fear_of_loss", "attachment"] },
        { label: "Po części z jednego i drugiego", tags: ["ambivalence"] },
        { label: "Bardziej z realnej wiary w zmianę", tags: ["repair_attempt", "hope"] },
      ],
    },
  ],
  uncertainty: [
    {
      id: 1,
      lead: "Niejasność bywa przypadkiem. Ale bywa też wygodnym narzędziem.",
      text: "Czy druga strona daje Ci uwagę głównie wtedy, gdy zaczynasz się wycofywać?",
      options: [
        { label: "Tak, dokładnie tak to działa", tags: ["breadcrumbing", "intermittent_reinforcement"] },
        { label: "Czasem tak, ale nie zawsze", tags: ["instability"] },
        { label: "Nie, tego akurat nie widzę", tags: ["neutral"] },
      ],
    },
    {
      id: 2,
      lead: "Słowa bez zgodności z czynami są tylko mgłą.",
      text: "Czy deklaracje tej osoby regularnie rozjeżdżają się z jej realnym zachowaniem?",
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
        { label: "To zależy, bo jeszcze nie umiem tego ocenić", tags: ["unclear"] },
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
      text: "Gdybyś przestał inicjować kontakt, rozmowy i naprawę napięcia, czy to dalej by się toczyło?",
      options: [
        { label: "Nie, to by praktycznie zgasło", tags: ["asymmetry", "one_sided"] },
        { label: "Pewnie osłabłoby bardzo mocno", tags: ["asymmetry"] },
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
        { label: "Tak, dokładnie tak to wygląda", tags: ["cycle", "trauma_bond", "instability"] },
        { label: "W dużej mierze tak", tags: ["cycle", "instability"] },
        { label: "Nie, to nie jest aż tak cykliczne", tags: ["neutral"] },
      ],
    },
    {
      id: 2,
      lead: "Granice zwykle nie pękają od razu. Najpierw się przesuwają.",
      text: "Czy dziś zgadzasz się na rzeczy, które jeszcze rok temu byłyby dla Ciebie nie do przyjęcia?",
      options: [
        { label: "Tak, i to mnie niepokoi", tags: ["boundary_erosion", "adaptation"] },
        { label: "Trochę tak", tags: ["boundary_shift"] },
        { label: "Nie, granice nadal mam dość jasne", tags: ["boundaries"] },
      ],
    },
    {
      id: 3,
      lead: "Tu zwykle kończy się ładna narracja, a zaczynają fakty.",
      text: "Gdyby nic się nie zmieniło przez kolejne 6 miesięcy, to bardziej byś w tym trwał czy się dusił?",
      options: [
        { label: "Dusiłbym się coraz bardziej", tags: ["suffocation", "cost"] },
        { label: "Trwałbym, ale z coraz większym kosztem", tags: ["stagnation", "cost"] },
        { label: "To zależy, bo jeszcze nie umiem tego ocenić", tags: ["unclear"] },
      ],
    },
  ],
};

function PremiumBadge({ score }: { score: number }) {
  const tone =
    score >= 70
      ? {
          label: "Rokujące / względnie stabilne",
          color: "var(--gold)",
          bg: "rgba(197,160,89,0.08)",
        }
      : score >= 40
      ? {
          label: "Układ niestabilny",
          color: "#facc15",
          bg: "rgba(250,204,21,0.08)",
        }
      : {
          label: "Wzorzec wysokiego ryzyka",
          color: "var(--danger)",
          bg: "rgba(248,163,163,0.08)",
        };

  return (
    <div
      style={{
        marginTop: 24,
        padding: "22px 18px",
        borderRadius: 22,
        border: `1px solid ${tone.color}`,
        background: tone.bg,
        textAlign: "center",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.65)",
          marginBottom: 8,
        }}
      >
        Na ile to ma sens
      </div>
      <div
        style={{
          fontSize: "clamp(48px, 12vw, 72px)",
          fontWeight: 900,
          lineHeight: 1,
          color: tone.color,
        }}
      >
        {score}%
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 15,
          color: "#fff",
        }}
      >
        {tone.label}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [legalModal, setLegalModal] = useState<LegalKey>(null);
  const [acceptedConsents, setAcceptedConsents] = useState<boolean[]>([false, false, false]);
  const [entryKey, setEntryKey] = useState<string>("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [checkpointPrompt, setCheckpointPrompt] = useState<CheckpointResponse | null>(null);
  const [openResponse, setOpenResponse] = useState("");
  const [previewReport, setPreviewReport] = useState<PreviewReport | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [email, setEmail] = useState("");
  const [digitalConsent, setDigitalConsent] = useState(false);

  const reportRef = useRef<HTMLDivElement | null>(null);
  const sessionToken = useMemo(() => getSessionId(), []);
  const questions = entryKey ? QUESTIONS_BY_ENTRY[entryKey] || QUESTIONS_BY_ENTRY.uncertainty : [];

  useEffect(() => {
    const saved = getAppState();
    if (saved && saved.screen && saved.screen !== "landing") {
      if (saved.screen) setScreen(saved.screen);
      if (saved.entryKey) setEntryKey(saved.entryKey);
      if (typeof saved.step === "number") setStep(saved.step);
      if (saved.answers) setAnswers(saved.answers);
      if (saved.previewReport) setPreviewReport(saved.previewReport);
      if (saved.email) setEmail(saved.email);
      if (saved.openResponse) setOpenResponse(saved.openResponse);
      if (saved.checkpointPrompt) setCheckpointPrompt(saved.checkpointPrompt);
    }

    if (getConsentState()) {
      setAcceptedConsents([true, true, true]);
    }

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const token = params.get("token");

    if (success === "1" && token) {
      handleSuccessReturn(token);
    }
  }, []);

  useEffect(() => {
    if (screen !== "landing" && screen !== "paid_report") {
      saveAppState({
        screen,
        entryKey,
        step,
        answers,
        previewReport,
        email,
        openResponse,
        checkpointPrompt,
      });
    }
  }, [screen, entryKey, step, answers, previewReport, email, openResponse, checkpointPrompt]);

  const startLoader = (msg: string) => {
    setLoading(true);
    setLoadingMsg(msg);
  };

  const stopLoader = () => {
    setLoading(false);
    setLoadingMsg("");
  };

  const handleStart = () => {
    setScreen("consents");
  };

  const handleConsentsSubmit = async () => {
    if (!acceptedConsents.every(Boolean)) return;

    saveConsentState(true);
    startLoader("Przygotowuję sesję...");

    try {
      const res = await fetch(`${API_BASE}/api/session/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: { acceptedAt: new Date().toISOString() } }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error("Nie udało się utworzyć sesji.");
      }

      setScreen("entry");
    } catch (error) {
      console.error(error);
      alert("Nie udało się rozpocząć sesji.");
    } finally {
      stopLoader();
    }
  };

  const handleEntrySelect = async (key: string) => {
    setEntryKey(key);
    setStep(0);
    setAnswers({});
    setPreviewReport(null);
    setCheckpointPrompt(null);
    setOpenResponse("");
    setScreen("chat");
  };

  const handleAnswerSelect = async (questionId: number, option: QuestionOption) => {
    const newAnswers = {
      ...answers,
      [questionId]: {
        questionId,
        text: option.label,
        tags: option.tags,
      },
    };

    setAnswers(newAnswers);

    const isCheckpointMoment = step === 1;
    const isLastQuestion = step === questions.length - 1;

    if (isCheckpointMoment) {
      startLoader("Analizuję dotychczasowy wzorzec...");
      try {
        const res = await fetch(`${API_BASE}/api/analyze/checkpoint`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entryKey,
            answers: Object.values(newAnswers),
          }),
        });

        const data = await res.json();

        if (!data.ok) {
          throw new Error("Brak checkpointu");
        }

        setCheckpointPrompt({
          title: data.checkpoint?.headline || data.checkpoint?.title || "Wykryto niespójność",
          insight:
            data.checkpoint?.insight ||
            "Tu widać rozjazd między tym, co chcesz utrzymać, a tym, co faktycznie opisujesz.",
          question:
            data.checkpoint?.question ||
            "Napisz wprost, czego najbardziej nie chcesz tu nazwać po imieniu.",
        });

        setScreen("checkpoint");
      } catch (error) {
        console.error(error);
        setCheckpointPrompt({
          title: "Wykryto niespójność",
          insight: "Tu widać napięcie między nadzieją a faktami.",
          question: "Napisz bez wygładzania, co najbardziej Cię tu męczy.",
        });
        setScreen("checkpoint");
      } finally {
        stopLoader();
      }
      return;
    }

    if (isLastQuestion) {
      await fetchPreview(newAnswers);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleCheckpointSubmit = async () => {
    if (openResponse.trim().length < 8) {
      alert("Napisz to pełnym zdaniem.");
      return;
    }

    const nextStep = step + 1;
    setStep(nextStep);
    setScreen("chat");
  };

  const fetchPreview = async (currentAnswers: Record<number, Answer>) => {
    startLoader("Buduję wstępne lustro sytuacji...");

    try {
      const res = await fetch(`${API_BASE}/api/analyze/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryKey,
          answers: Object.values(currentAnswers),
          note: openResponse,
        }),
      });

      const data = await res.json();

      if (!data.ok || !data.preview) {
        throw new Error("Brak preview");
      }

      setPreviewReport(data.preview);
      setScreen("preview");
    } catch (error) {
      console.error(error);
      alert("Nie udało się wygenerować wstępnego raportu.");
    } finally {
      stopLoader();
    }
  };

  const handleEmailBlur = async () => {
    if (!email.includes("@")) return;

    try {
      await fetch(`${API_BASE}/api/capture-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          email,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePayment = async () => {
    if (!email.includes("@")) {
      alert("Podaj prawidłowy e-mail.");
      return;
    }

    if (!digitalConsent) {
      alert("Zaznacz zgodę na treść cyfrową.");
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
          payload: {
            entryKey,
            answers: Object.values(answers),
            note: openResponse,
          },
        }),
      });

      const data = await res.json();

      if (!data.ok || !data.checkoutUrl) {
        throw new Error("Błąd checkoutu");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error(error);
      alert("Nie udało się uruchomić płatności.");
      stopLoader();
    }
  };

  const handleSuccessReturn = async (token: string) => {
    startLoader("Odbieram pełny raport...");

    try {
      const res = await fetch(`${API_BASE}/api/report/${token}`);
      const data = await res.json();

      if (!data.ok || !data.report) {
        throw new Error("Raport jeszcze niegotowy");
      }

      setFullReport(data.report);
      setScreen("paid_report");
      clearAppState();
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error(error);
      alert("Raport jeszcze się przygotowuje. Sprawdź ponownie za chwilę albo zajrzyj do maila.");
      setScreen("landing");
    } finally {
      stopLoader();
    }
  };

  const resetFlow = () => {
    clearAppState();
    setScreen("landing");
    setEntryKey("");
    setStep(0);
    setAnswers({});
    setCheckpointPrompt(null);
    setOpenResponse("");
    setPreviewReport(null);
    setFullReport(null);
    setEmail("");
    setDigitalConsent(false);
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
      {legalModal && (
        <div className="ctms-legal-overlay" onClick={() => setLegalModal(null)}>
          <div className="ctms-legal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ctms-legal-header">
              <h3>{legalModal === "terms" ? TERMS.title : PRIVACY.title}</h3>
              <button onClick={() => setLegalModal(null)}>✕</button>
            </div>
            <div className="ctms-legal-body">
              {legalModal === "terms" ? TERMS.body : PRIVACY.body}
            </div>
          </div>
        </div>
      )}

      <div className="ctms-shell">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.section
              key="processing"
              className="ctms-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-processing-card ctms-center">
                <div className="ctms-spinner ctms-spinner-big" />
                <p>{loadingMsg}</p>
              </div>
            </motion.section>
          )}

          {!loading && screen === "landing" && (
            <motion.section
              key="landing"
              className="ctms-landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
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
                  To nie jest test z internetu ani plastikowy chatbot. To chłodne,
                  premium lustro relacji — zbudowane po to, żeby oddzielić fakty od
                  nadziei, napięcie od bliskości i realny sens od emocjonalnej mgły.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: 14,
                    marginTop: 26,
                    width: "100%",
                  }}
                >
                  <div className="ctms-card-btn" style={{ cursor: "default" }}>
                    <span className="ctms-card-main">Rozmowa zamiast suchego quizu</span>
                    <span className="ctms-card-note">
                      System prowadzi Cię warstwowo, a nie traktuje jak kolejny formularz.
                    </span>
                  </div>

                  <div className="ctms-card-btn" style={{ cursor: "default" }}>
                    <span className="ctms-card-main">Checkpoint w środku flow</span>
                    <span className="ctms-card-note">
                      AI zatrzymuje Cię wtedy, gdy wykrywa niespójność i każe dopowiedzieć prawdę.
                    </span>
                  </div>

                  <div className="ctms-card-btn" style={{ cursor: "default" }}>
                    <span className="ctms-card-main">Wstępne lustro i raport premium</span>
                    <span className="ctms-card-note">
                      Najpierw widzisz kierunek. Potem decydujesz, czy chcesz wejść głębiej.
                    </span>
                  </div>
                </div>

                <div className="ctms-actions" style={{ marginTop: 28 }}>
                  <button
                    className="ctms-primary"
                    onClick={handleStart}
                    style={{ width: "100%", minHeight: "56px" }}
                  >
                    Rozpocznij analizę
                  </button>
                </div>

                <div className="ctms-footer-links">
                  <button onClick={() => setLegalModal("terms")}>Regulamin</button>
                  <button onClick={() => setLegalModal("privacy")}>Polityka prywatności</button>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "consents" && (
            <motion.section
              key="consents"
              className="ctms-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <h1 className="ctms-title">Zanim wejdziesz głębiej</h1>
                  <p className="ctms-copy">
                    To narzędzie ma być ostre, ale uczciwe. Zanim ruszysz dalej,
                    musisz świadomie zaakceptować zasady gry.
                  </p>

                  <div className="ctms-list">
                    {CONSENTS.map((txt, i) => (
                      <label key={i} className="ctms-checkbox-row" style={{ padding: "12px 0" }}>
                        <input
                          type="checkbox"
                          checked={acceptedConsents[i]}
                          onChange={(e) => {
                            const next = [...acceptedConsents];
                            next[i] = e.target.checked;
                            setAcceptedConsents(next);
                          }}
                        />
                        <span>{txt}</span>
                      </label>
                    ))}
                  </div>

                  <div className="ctms-actions" style={{ marginTop: 24 }}>
                    <button
                      className={
                        acceptedConsents.every(Boolean)
                          ? "ctms-primary"
                          : "ctms-primary ctms-primary-disabled"
                      }
                      disabled={!acceptedConsents.every(Boolean)}
                      onClick={handleConsentsSubmit}
                      style={{ width: "100%", minHeight: "54px" }}
                    >
                      Akceptuję i wchodzę dalej
                    </button>

                    <button
                      className="ctms-text-btn"
                      onClick={() => setScreen("landing")}
                      style={{ width: "100%", minHeight: "54px" }}
                    >
                      Wróć
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "entry" && (
            <motion.section
              key="entry"
              className="ctms-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <div className="ctms-copy">
                    Tu nie wybierasz “kategorii”. Wybierasz problem, od którego system ma zacząć analizę.
                  </div>
                  <h2 className="ctms-question">Co Cię tu naprawdę przyprowadza?</h2>

                  <div className="ctms-list">
                    {ENTRY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        className="ctms-card-btn"
                        onClick={() => handleEntrySelect(opt.id)}
                        style={{ minHeight: "64px", padding: "18px 20px" }}
                      >
                        <span className="ctms-card-main">{opt.title}</span>
                        <span className="ctms-card-note">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "chat" && questions.length > 0 && (
            <motion.section
              key={`chat-${entryKey}-${step}`}
              className="ctms-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-question-shell">
                <div
                  className="ctms-topbar"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 14,
                  }}
                >
                  <button className="ctms-text-btn" onClick={() => setScreen("entry")}>
                    Zmień punkt wejścia
                  </button>

                  <div className="ctms-progress-wrap">
                    <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
                    <div className="ctms-progress-track">
                      <div
                        className="ctms-progress-fill"
                        style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="ctms-question-card">
                  <div className="ctms-copy">{questions[step].lead}</div>
                  <h2 className="ctms-question">{questions[step].text}</h2>

                  <div className="ctms-list">
                    {questions[step].options.map((opt, i) => (
                      <button
                        key={i}
                        className="ctms-card-btn"
                        onClick={() => handleAnswerSelect(questions[step].id, opt)}
                        style={{ minHeight: "56px", padding: "18px 20px", marginBottom: 12 }}
                      >
                        <span className="ctms-card-main">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "checkpoint" && checkpointPrompt && (
            <motion.section
              key="checkpoint"
              className="ctms-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <div className="ctms-copy" style={{ color: "var(--danger)" }}>
                    {checkpointPrompt.title || "Wykryto niespójność"}
                  </div>

                  <div className="ctms-report-preview">
                    {checkpointPrompt.insight ||
                      "W odpowiedziach widać rozjazd między tym, co próbujesz utrzymać, a tym, co faktycznie opisujesz."}
                  </div>

                  <h2 className="ctms-question" style={{ marginTop: 16 }}>
                    {checkpointPrompt.question ||
                      "Napisz bez wygładzania, co najbardziej nie daje Ci tu spokoju."}
                  </h2>

                  <textarea
                    className="ctms-textarea"
                    value={openResponse}
                    onChange={(e) => setOpenResponse(e.target.value)}
                    placeholder="Napisz konkretnie. Tu nie chodzi o ładną wersję."
                    style={{ fontSize: "16px", minHeight: "130px" }}
                  />

                  <div className="ctms-actions" style={{ marginTop: 18 }}>
                    <button
                      className="ctms-primary ctms-full"
                      onClick={handleCheckpointSubmit}
                      style={{ minHeight: "54px" }}
                    >
                      Zatwierdź i idź dalej
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "preview" && previewReport && (
            <motion.section
              key="preview"
              className="ctms-report-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-report-shell">
                <div className="ctms-report-card">
                  <div className="ctms-eyebrow">Wstępne lustro relacji</div>
                  <h2 className="ctms-report-title" style={{ fontSize: "clamp(28px, 7vw, 42px)" }}>
                    {previewReport.headline}
                  </h2>

                  <div className="ctms-report-preview" style={{ marginTop: 16 }}>
                    {previewReport.mirror}
                  </div>

                  <PremiumBadge score={previewReport.score} />

                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      marginTop: 22,
                    }}
                  >
                    {previewReport.indicators?.map((item, i) => (
                      <div key={i} className="ctms-report-metric">
                        <span>{item.value}%</span>
                        <small>{item.label}</small>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 22,
                      padding: "18px 18px",
                      borderRadius: 18,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <p style={{ margin: 0, lineHeight: 1.65 }}>{previewReport.summary}</p>
                  </div>

                  <div
                    style={{
                      filter: "blur(6px)",
                      opacity: 0.38,
                      userSelect: "none",
                      pointerEvents: "none",
                      marginTop: 22,
                    }}
                  >
                    <div className="ctms-preview-section">
                      <h3 style={{ marginBottom: 8 }}>Dominujący mechanizm</h3>
                      <p>
                        Tu system rozpisuje, co naprawdę napędza ten układ: lęk, asymetrię,
                        chaos sygnałów, przesunięcie granic albo zależność od chwil ulgi.
                      </p>
                    </div>

                    <div className="ctms-preview-section">
                      <h3 style={{ marginBottom: 8 }}>Najbardziej prawdopodobny kierunek</h3>
                      <p>
                        Pełna wersja pokazuje, czy to idzie w stronę stabilizacji, dalszego rozjazdu
                        czy powolnego wypalania pod przykrywką “jakoś to trwa”.
                      </p>
                    </div>
                  </div>

                  <div className="ctms-payment-card" style={{ marginTop: -24, position: "relative", zIndex: 10 }}>
                    <h3 className="ctms-title" style={{ fontSize: 26, marginBottom: 8 }}>
                      Odblokuj pełny raport premium
                    </h3>

                    <p className="ctms-copy" style={{ fontSize: 14 }}>
                      Dostaniesz rozwinięte mechanizmy, ryzyka, kierunek rozwoju i końcowy werdykt systemu.
                    </p>

                    <input
                      type="email"
                      className="ctms-input ctms-mb"
                      placeholder="Adres e-mail do raportu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      style={{ fontSize: "16px", minHeight: "52px" }}
                    />

                    <label className="ctms-checkbox-row" style={{ padding: "10px 0" }}>
                      <input
                        type="checkbox"
                        checked={digitalConsent}
                        onChange={(e) => setDigitalConsent(e.target.checked)}
                      />
                      <span style={{ fontSize: 13 }}>
                        Wyrażam zgodę na natychmiastowe dostarczenie treści cyfrowej i utratę prawa do odstąpienia od umowy.
                      </span>
                    </label>

                    <div className="ctms-actions" style={{ marginTop: 10 }}>
                      <button
                        className="ctms-primary ctms-full"
                        onClick={handlePayment}
                        style={{ minHeight: "56px" }}
                      >
                        Pobierz pełną analizę — 15 PLN
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!loading && screen === "paid_report" && fullReport && (
            <motion.section
              key="paid_report"
              className="ctms-report-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-report-shell">
                <div className="ctms-report-card" ref={reportRef}>
                  <div className="ctms-eyebrow">Raport premium</div>
                  <h2 className="ctms-report-title">{fullReport.headline}</h2>

                  {fullReport.subheadline ? (
                    <p className="ctms-report-sub">{fullReport.subheadline}</p>
                  ) : null}

                  {typeof fullReport.rebuildPercent === "number" ? (
                    <PremiumBadge score={fullReport.rebuildPercent} />
                  ) : null}

                  {fullReport.sections?.map((sec, i) => (
                    <div key={i} className="ctms-preview-section" style={{ marginTop: 24 }}>
                      <h3
                        className={
                          sec.tone === "danger"
                            ? "ctms-tone-danger"
                            : sec.tone === "gold"
                            ? "ctms-tone-gold"
                            : ""
                        }
                      >
                        {sec.title}
                      </h3>
                      <p style={{ lineHeight: 1.7 }}>{sec.text}</p>
                    </div>
                  ))}

                  {fullReport.closing ? (
                    <div className="ctms-report-preview" style={{ marginTop: 26 }}>
                      {fullReport.closing}
                    </div>
                  ) : null}
                </div>

                <div className="ctms-report-actions" style={{ flexDirection: "column", gap: 12 }}>
                  <button
                    className="ctms-primary"
                    onClick={downloadPDF}
                    style={{ width: "100%", minHeight: "56px" }}
                  >
                    Pobierz raport jako PDF
                  </button>

                  <button
                    className="ctms-text-btn"
                    onClick={resetFlow}
                    style={{ width: "100%", minHeight: "54px" }}
                  >
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