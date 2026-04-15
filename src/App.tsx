import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./index.css";
import { TERMS, PRIVACY, CONSENTS } from "./legalContent";
import {
  getSessionId,
  getPatterns,
  savePatterns,
  getConsentState,
  saveConsentState,
} from "./memory";
import { questions as QUESTION_BANK, options as BASE_OPTIONS } from "./questions";

type Screen =
  | "landing"
  | "consents"
  | "entry"
  | "chat"
  | "checkpoint"
  | "open_response"
  | "preview"
  | "processing"
  | "paid_report";

type Mode = "soft" | "hard";
type LegalKey = "terms" | "privacy" | null;

type Option = {
  label: string;
  tags: string[];
  note: string;
};

type Question = {
  id: number;
  phase: string;
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
  sections?: PreviewSection[];
  closing?: string;
};

type FullReport = {
  headline: string;
  subheadline: string;
  previewLine: string;
  tensionPercent: number;
  driftPercent: number;
  rebuildPercent: number;
  sections: PreviewSection[];
  closing: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const LEGAL_CONTENT = {
  terms: TERMS,
  privacy: PRIVACY,
};

const ENTRY_POINTS = [
  {
    id: "chaos",
    label: "Wracamy do siebie i nie wiem dlaczego",
    note: "Tu zwykle chodzi o cykl napięcia, nie o wielką miłość.",
  },
  {
    id: "betrayal",
    label: "Ktoś mnie zranił / zdrada / brak zaufania",
    note: "Tu trzeba oddzielić skruchę od iluzji i kontrolę od bezpieczeństwa.",
  },
  {
    id: "crush",
    label: "Podkochuję się i nie wiem, czy to realne",
    note: "Tu łatwo pomylić wzajemność z projekcją i głodem sygnałów.",
  },
  {
    id: "faded",
    label: "Uczucie wygasło i nie wiem, czy to koniec",
    note: "Najtrudniejsze rzeczy często nie wybuchają. Po prostu gasną.",
  },
  {
    id: "breakup",
    label: "Jesteśmy po rozstaniu i nie wiem, czy wracać",
    note: "Tu trzeba odróżnić tęsknotę od uzależnienia od znanego schematu.",
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ż/g, "z")
    .replace(/ź/g, "z")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

function getOptionMeta(label: string, phase: string, questionId: number) {
  const phaseTag = slugify(phase);
  const questionTag = `q${questionId}_${phaseTag}`;

  if (label === "Tak, wyraźnie") {
    return {
      tags: [questionTag, `${phaseTag}_plus`, "clarity", "stability"],
      note: "To zwykle jest sygnał, że fundament w tym obszarze jeszcze trzyma.",
    };
  }

  if (label === "Momentami tak") {
    return {
      tags: [questionTag, `${phaseTag}_mixed`, "ambivalence", "mixed_signals"],
      note: "Tu zwykle zaczyna się szara strefa: coś działa, ale nie daje pełnego oparcia.",
    };
  }

  if (label === "Raczej nie") {
    return {
      tags: [questionTag, `${phaseTag}_minus`, "deficit", "tension"],
      note: "To już pachnie kosztem emocjonalnym, a nie pojedynczym potknięciem.",
    };
  }

  return {
    tags: [questionTag, `${phaseTag}_red`, "red_flag", "serious_misalignment"],
    note: "Tu raczej nie chodzi o detal. To wygląda jak realna wyrwa w mechanizmie relacji.",
  };
}

const QUESTIONS: Question[] = QUESTION_BANK.map((q) => ({
  ...q,
  options: BASE_OPTIONS.map((opt) => {
    const meta = getOptionMeta(opt.label, q.phase, q.id);
    return {
      label: opt.label,
      tags: meta.tags,
      note: meta.note,
    };
  }),
}));

const CHECKPOINTS = [3, 8, QUESTIONS.length - 1];

function LogoMark() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <p className="ctms-eyebrow" style={{ marginBottom: 10 }}>
        czy to ma sens
      </p>
      <div
        style={{
          fontSize: "clamp(28px, 3.8vw, 46px)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        CzyTo<span style={{ color: "var(--gold)" }}>Ma</span>Sens
      </div>
    </div>
  );
}

function getPreviewBullets(preview: PreviewReport) {
  const bullets: string[] = [];

  if (preview.tensionPercent >= 65) {
    bullets.push("Między Wami jest więcej napięcia niż realnego ukojenia.");
  } else {
    bullets.push("Napięcie nie dominuje całego obrazu, ale i tak warto patrzeć na źródło niepokoju.");
  }

  if (preview.driftPercent >= 55) {
    bullets.push("To, co sobie o tej relacji opowiadasz, może już nie zgadzać się z faktami.");
  } else {
    bullets.push("Rozjazd nie musi być skrajny, ale coś już zaczyna się rozsuwać.");
  }

  if (preview.rebuildPercent >= 55) {
    bullets.push("Zmiana jest jeszcze możliwa, ale raczej nie bez konkretu i nazwania mechanizmu.");
  } else {
    bullets.push("Sama nadzieja może już nie wystarczyć, jeśli układ od dawna działa tym samym torem.");
  }

  return bullets;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [mode, setMode] = useState<Mode>("soft");
  const [legalModal, setLegalModal] = useState<LegalKey>(null);
  const [consents, setConsents] = useState<boolean[]>(
    new Array(CONSENTS.length).fill(false)
  );

  const [selectedPath, setSelectedPath] = useState<string>("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [interviews, setInterviews] = useState<InterviewNode[]>([]);
  const [patterns, setPatterns] = useState<string[]>(getPatterns());

  const [sessionToken, setSessionToken] = useState<string>("");
  const [currentAiObservation, setCurrentAiObservation] = useState("");
  const [currentUserText, setCurrentUserText] = useState("");
  const [preview, setPreview] = useState<PreviewReport | null>(null);
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [email, setEmail] = useState("");
  const [loadingLabel, setLoadingLabel] = useState("Przetwarzanie...");
  const reportRef = useRef<HTMLDivElement | null>(null);

  const allConsentsChecked = consents.every(Boolean);
  const currentQuestion = QUESTIONS[step];
  const sessionFingerprint = useMemo(() => getSessionId(), []);
  const progress = currentQuestion
    ? Math.round(((step + 1) / QUESTIONS.length) * 100)
    : 0;

  const selectedEntry = ENTRY_POINTS.find((item) => item.id === selectedPath);

  useEffect(() => {
    const savedConsent = getConsentState();
    if (savedConsent) {
      setConsents(new Array(CONSENTS.length).fill(true));
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const success = params.get("success");

    if (success === "1" && token) {
      setScreen("processing");
      setLoadingLabel("Odbieranie pełnego raportu...");
      fetchPaidReportUntilReady(token);
    }
  }, []);

  async function fetchPaidReportUntilReady(token: string) {
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`${API_BASE}/api/report/${token}`);
        const data = await res.json();

        if (data.ok && data.report) {
          setFullReport(data.report);
          setScreen("paid_report");
          return;
        }

        if (attempts < 20) {
          setTimeout(poll, 2500);
          return;
        }

        alert("Raport jeszcze się nie przygotował. Odśwież stronę za chwilę.");
        setScreen("preview");
      } catch (error) {
        console.error("Fetch report error:", error);
        if (attempts < 20) {
          setTimeout(poll, 2500);
          return;
        }
        alert("Nie udało się pobrać raportu.");
        setScreen("preview");
      }
    };

    poll();
  }

  async function createSessionIfNeeded() {
    if (sessionToken) return sessionToken;

    const res = await fetch(`${API_BASE}/api/session/create`, {
      method: "POST",
    });
    const data = await res.json();

    if (!data.ok || !data.token) {
      throw new Error("Nie udało się utworzyć sesji.");
    }

    setSessionToken(data.token);
    return data.token;
  }

  async function handleStart(selectedMode: Mode) {
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

    try {
      const token = await createSessionIfNeeded();

      await fetch(`${API_BASE}/api/session/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          payload: {
            mode,
            path: pathId,
            answers: [],
            interviews: [],
            patterns,
            fingerprint: sessionFingerprint,
          },
        }),
      });

      setScreen("chat");
    } catch (error) {
      console.error(error);
      alert("Nie udało się zapisać startu analizy.");
    }
  }

  async function handleAnswer(opt: Option) {
    if (!currentQuestion) return;

    const newAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        text: opt.label,
        tags: opt.tags,
      },
    ];

    const mergedPatterns = [...new Set([...patterns, ...opt.tags])];

    setAnswers(newAnswers);
    setPatterns(mergedPatterns);
    savePatterns(mergedPatterns);

    if (CHECKPOINTS.includes(step)) {
      setScreen("checkpoint");
      setLoadingLabel("AI składa fakty do kupy...");

      try {
        const res = await fetch(`${API_BASE}/api/checkpoint`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            path: selectedPath,
            answers: newAnswers,
            interviews,
            patterns: mergedPatterns,
          }),
        });

        const data = await res.json();

        setCurrentAiObservation(
          data?.checkpoint?.question ||
            data?.observation ||
            "Tu jest niespójność. Napisz szczerze, czego bronisz albo czego nie chcesz nazwać wprost."
        );
      } catch (error) {
        console.error(error);
        setCurrentAiObservation(
          "Tu system widzi wzorzec, ale brakuje jednego brakującego ogniwa. Napisz bez wygładzania, co naprawdę się powtarza."
        );
      }

      setScreen("open_response");
      return;
    }

    setStep((prev) => prev + 1);
  }

  async function submitOpenResponse() {
    if (!currentUserText.trim()) {
      alert("Tu musisz napisać coś własnego.");
      return;
    }

    const newInterviews = [
      ...interviews,
      {
        aiPrompt: currentAiObservation,
        userText: currentUserText.trim(),
      },
    ];

    setInterviews(newInterviews);
    setCurrentUserText("");

    const token = await createSessionIfNeeded();

    if (step === QUESTIONS.length - 1) {
      setScreen("processing");
      setLoadingLabel("Budowanie wstępnej diagnozy...");

      try {
        const res = await fetch(`${API_BASE}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            mode,
            path: selectedPath,
            input: newInterviews.map((i) => i.userText).join("\n\n"),
            answers,
            interviews: newInterviews,
            patterns,
            sessionId: sessionFingerprint,
          }),
        });

        const data = await res.json();

        if (!data.ok || !data.preview) {
          throw new Error("Brak preview");
        }

        const mergedPatterns = Array.isArray(data.patterns)
          ? [...new Set([...patterns, ...data.patterns])]
          : patterns;

        setPatterns(mergedPatterns);
        savePatterns(mergedPatterns);
        setPreview(data.preview);

        await fetch(`${API_BASE}/api/session/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            payload: {
              mode,
              path: selectedPath,
              answers,
              interviews: newInterviews,
              patterns: mergedPatterns,
              customText: newInterviews.map((i) => i.userText).join("\n\n"),
              fingerprint: sessionFingerprint,
            },
            preview: data.preview,
          }),
        });

        setScreen("preview");
      } catch (error) {
        console.error(error);
        alert("Wystąpił błąd końcowej analizy.");
        setScreen("chat");
      }

      return;
    }

    try {
      await fetch(`${API_BASE}/api/session/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          payload: {
            mode,
            path: selectedPath,
            answers,
            interviews: newInterviews,
            patterns,
            customText: newInterviews.map((i) => i.userText).join("\n\n"),
            fingerprint: sessionFingerprint,
          },
        }),
      });
    } catch (error) {
      console.error(error);
    }

    setStep((prev) => prev + 1);
    setScreen("chat");
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

    setScreen("processing");
    setLoadingLabel("Przekierowanie do płatności...");

    try {
      const token = await createSessionIfNeeded();

      const res = await fetch(`${API_BASE}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          payload: {
            mode,
            path: selectedPath,
            answers,
            interviews,
            patterns,
            customDescription: interviews.map((i) => i.userText).join("\n\n"),
            sessionId: sessionFingerprint,
          },
          preview,
        }),
      });

      const data = await res.json();

      const checkoutLink = data.checkoutUrl || data.url;
      if (!data.ok || !checkoutLink) {
        throw new Error("Brak linku do checkoutu");
      }

      window.location.href = checkoutLink;
    } catch (error) {
      console.error(error);
      alert("Błąd inicjalizacji płatności.");
      setScreen("preview");
    }
  }

  async function downloadPDF() {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      backgroundColor: "#050505",
      scale: 2,
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

    pdf.save("czy-to-ma-sens-raport.pdf");
  }

  return (
    <div className="ctms-app">
      {legalModal && (
        <div className="ctms-legal-overlay">
          <div className="ctms-legal-modal">
            <div className="ctms-legal-header">
              <h3>{LEGAL_CONTENT[legalModal].title}</h3>
              <button onClick={() => setLegalModal(null)}>✕</button>
            </div>
            <p style={{ whiteSpace: "pre-wrap" }}>{LEGAL_CONTENT[legalModal].body}</p>
          </div>
        </div>
      )}

      <div className="ctms-shell">
        <AnimatePresence mode="wait">
          {screen === "landing" && (
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
                <LogoMark />

                <h1 className="ctms-brand" style={{ marginTop: 12 }}>
                  Nie szukasz pocieszenia.
                  <br />
                  Szukasz <span>prawdy.</span>
                </h1>

                <p className="ctms-hero-main">
                  To nie jest kolejny test kompatybilności. To analityczny system oceny
                  mechanizmów relacyjnych, który nie głaszcze po głowie, tylko pokazuje,
                  gdzie naprawdę jesteś.
                </p>

                <p className="ctms-hero-sub">
                  Zobaczysz, co w tym układzie buduje bliskość, co ją podkopuje i dokąd to
                  najpewniej zmierza, jeśli nic się nie zmieni.
                </p>

                <div className="ctms-tags">
                  <div className="ctms-tag">analiza schematu relacji</div>
                  <div className="ctms-tag">wykrywanie niespójności i iluzji</div>
                  <div className="ctms-tag">wstępna diagnoza przed pełnym raportem</div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: 22,
                  }}
                >
                  <button className="ctms-primary" onClick={() => handleStart("soft")}>
                    Chcę zobaczyć to spokojnie
                  </button>
                  <button className="ctms-primary ctms-light" onClick={() => handleStart("hard")}>
                    Chcę kubeł zimnej wody
                  </button>
                </div>
              </div>

              <div className="ctms-footer-links">
                <button onClick={() => setLegalModal("terms")}>Regulamin</button>
                <button onClick={() => setLegalModal("privacy")}>Polityka prywatności</button>
              </div>
            </motion.section>
          )}

          {screen === "consents" && (
            <motion.section
              key="consents"
              className="ctms-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <LogoMark />
                  <h1 className="ctms-title" style={{ marginTop: 18 }}>
                    Zanim zaczniemy, ustalmy zasady.
                  </h1>
                  <p className="ctms-copy">
                    To narzędzie nie ma Cię pocieszać. Ma analizować mechanizmy, wyłapywać
                    niespójności i pokazywać, gdzie naprawdę jesteś. Zanim wejdziesz dalej,
                    musisz świadomie zaakceptować, czym ten system jest — i czym nie jest.
                  </p>

                  <div className="ctms-list">
                    {CONSENTS.map((txt, i) => (
                      <label
                        key={i}
                        className="ctms-card-btn"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={consents[i]}
                          onChange={(e) => {
                            const next = [...consents];
                            next[i] = e.target.checked;
                            setConsents(next);
                          }}
                          style={{
                            marginTop: 3,
                            accentColor: "var(--gold)",
                            width: 18,
                            height: 18,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 17, lineHeight: 1.65 }}>{txt}</span>
                      </label>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      marginTop: 26,
                      flexWrap: "wrap",
                    }}
                  >
                    <button className="ctms-text-btn" onClick={() => setScreen("landing")}>
                      wróć
                    </button>
                    <button
                      className={
                        allConsentsChecked ? "ctms-primary" : "ctms-primary ctms-primary-disabled"
                      }
                      onClick={handleConsentsContinue}
                      disabled={!allConsentsChecked}
                    >
                      Rozpocznij analizę
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "entry" && (
            <motion.section
              key="entry"
              className="ctms-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <LogoMark />
                  <h1 className="ctms-title" style={{ marginTop: 18 }}>
                    Co Cię tu sprowadza?
                  </h1>
                  <p className="ctms-copy">
                    Wybierz to, co najbardziej pasuje. Ta decyzja ustawi ton pytań, checkpointów
                    i końcowej diagnozy.
                  </p>

                  <div className="ctms-list">
                    {ENTRY_POINTS.map((item) => (
                      <button
                        key={item.id}
                        className="ctms-card-btn"
                        onClick={() => handlePathSelect(item.id)}
                      >
                        <span className="ctms-card-main">{item.label}</span>
                        <span className="ctms-card-note">{item.note}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "chat" && currentQuestion && (
            <motion.section
              key={`chat-${step}`}
              className="ctms-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-question-shell">
                <div className="ctms-topbar">
                  <button className="ctms-text-btn" onClick={() => setScreen("entry")}>
                    zmień wejście
                  </button>

                  <div className="ctms-progress-wrap">
                    <span>{progress}%</span>
                    <div className="ctms-progress-track">
                      <div className="ctms-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="ctms-question-card">
                  <p className="ctms-eyebrow">{currentQuestion.phase}</p>
                  <p className="ctms-copy" style={{ marginBottom: 18 }}>
                    {currentQuestion.lead}
                  </p>

                  {selectedEntry && (
                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "var(--soft)",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      Punkt wyjścia: {selectedEntry.label}
                    </p>
                  )}

                  <h2 className="ctms-question">{currentQuestion.text}</h2>

                  <div className="ctms-list">
                    {currentQuestion.options.map((opt, i) => (
                      <button key={i} className="ctms-card-btn" onClick={() => handleAnswer(opt)}>
                        <span className="ctms-card-main">{opt.label}</span>
                        <span className="ctms-card-note">{opt.note}</span>
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      color: "var(--soft)",
                      fontSize: 13,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Pytanie {step + 1} z {QUESTIONS.length}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "checkpoint" && (
            <motion.section
              key="checkpoint"
              className="ctms-page ctms-processing-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="ctms-processing-card">
                <div className="ctms-spinner ctms-spinner-big" />
                <p>{loadingLabel}</p>
              </div>
            </motion.section>
          )}

          {screen === "open_response" && (
            <motion.section
              key="open-response"
              className="ctms-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="ctms-question-shell">
                <div className="ctms-question-card">
                  <p className="ctms-eyebrow" style={{ color: "var(--danger)" }}>
                    Wniosek analityka
                  </p>

                  <div
                    style={{
                      border: "1px solid rgba(252,165,165,0.22)",
                      background: "rgba(252,165,165,0.08)",
                      borderRadius: 24,
                      padding: 22,
                      marginBottom: 24,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 25,
                        lineHeight: 1.6,
                        color: "#f3f4f6",
                        fontWeight: 600,
                      }}
                    >
                      „{currentAiObservation}”
                    </p>
                  </div>

                  <h2 className="ctms-question" style={{ marginBottom: 12 }}>
                    Odpowiedz bez wygładzania.
                  </h2>

                  <p className="ctms-copy">
                    Tu nie chodzi o ładną odpowiedź. Chodzi o tę prawdziwą. To właśnie ona decyduje,
                    czy końcowy raport będzie trafny, czy tylko poprawny.
                  </p>

                  <textarea
                    className="ctms-textarea"
                    placeholder="Napisz szczerze, co się tu naprawdę dzieje..."
                    value={currentUserText}
                    onChange={(e) => setCurrentUserText(e.target.value)}
                  />

                  <div className="ctms-counter">{currentUserText.length} znaków</div>

                  <button className="ctms-primary ctms-full" onClick={submitOpenResponse}>
                    Przekaż do analizy
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "processing" && (
            <motion.section
              key="processing"
              className="ctms-page ctms-processing-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="ctms-processing-card">
                <div className="ctms-spinner ctms-spinner-big" />
                <p>{loadingLabel}</p>
              </div>
            </motion.section>
          )}

          {screen === "preview" && preview && (
            <motion.section
              key="preview"
              className="ctms-report-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="ctms-report-shell">
                <div className="ctms-report-card">
                  <div className="ctms-report-line" />

                  <div className="ctms-report-head">
                    <div>
                      <p className="ctms-eyebrow">Wstępna diagnoza</p>
                      <h1 className="ctms-report-title">{preview.headline}</h1>
                      <p className="ctms-report-sub">{preview.subheadline}</p>
                    </div>

                    <div className="ctms-score-box">
                      <div className="ctms-score">{preview.rebuildPercent}%</div>
                      <div className="ctms-score-label">pole do zmiany</div>
                    </div>
                  </div>

                  <div className="ctms-report-metrics">
                    <div className="ctms-report-metric">
                      <span>{preview.tensionPercent}%</span>
                      <small>napięcie</small>
                    </div>
                    <div className="ctms-report-metric">
                      <span>{preview.driftPercent}%</span>
                      <small>rozjazd</small>
                    </div>
                    <div className="ctms-report-metric">
                      <span>{preview.rebuildPercent}%</span>
                      <small>szansa zmiany</small>
                    </div>
                  </div>

                  <div className="ctms-report-preview">„{preview.previewLine}”</div>

                  <div className="ctms-report-section">
                    <h3>Co już widać</h3>
                    <p>
                      {getPreviewBullets(preview).map((item, idx) => (
                        <span key={idx}>
                          • {item}
                          <br />
                        </span>
                      ))}
                    </p>
                  </div>

                  {(preview.sections || []).slice(0, 2).map((sec, i) => (
                    <div className="ctms-report-section" key={i}>
                      <h3 className={sec.tone === "danger" ? "danger" : ""}>{sec.title}</h3>
                      <p>{sec.text}</p>
                    </div>
                  ))}

                  <div className="ctms-report-footer">
                    <p>
                      To jest tylko pierwszy poziom. Pełny raport rozpisuje mechanizm szerzej,
                      pokazuje punkty zapalne, niespójności, realny kierunek i to, czego jeszcze
                      nie chcesz nazwać wprost.
                    </p>
                  </div>

                  <div className="ctms-payment-card ctms-mt">
                    <p className="ctms-eyebrow">Odblokuj pełny raport</p>
                    <h2 className="ctms-title ctms-mb">49 zł</h2>
                    <p className="ctms-copy">
                      Dostaniesz pełniejszy raport z rozbiciem mechanizmu, kierunku relacji i
                      ukrytych kosztów tego układu.
                    </p>

                    <input
                      type="email"
                      className="ctms-input"
                      placeholder="Podaj e-mail do wysyłki raportu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <button className="ctms-primary ctms-full ctms-mt" onClick={handlePayment}>
                      Odkryj pełny mechanizm
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "paid_report" && fullReport && (
            <motion.section
              key="paid-report"
              className="ctms-report-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="ctms-report-shell">
                <div className="ctms-report-card" ref={reportRef}>
                  <div className="ctms-report-line" />

                  <div className="ctms-report-head">
                    <div>
                      <p className="ctms-eyebrow">Pełna analiza relacji</p>
                      <h1 className="ctms-report-title">{fullReport.headline}</h1>
                      <p className="ctms-report-sub">{fullReport.subheadline}</p>
                    </div>

                    <div className="ctms-score-box">
                      <div className="ctms-score">{fullReport.rebuildPercent}%</div>
                      <div className="ctms-score-label">pole do zmiany</div>
                    </div>
                  </div>

                  <div className="ctms-report-metrics">
                    <div className="ctms-report-metric">
                      <span>{fullReport.tensionPercent}%</span>
                      <small>napięcie</small>
                    </div>
                    <div className="ctms-report-metric">
                      <span>{fullReport.driftPercent}%</span>
                      <small>rozjazd</small>
                    </div>
                    <div className="ctms-report-metric">
                      <span>{fullReport.rebuildPercent}%</span>
                      <small>szansa zmiany</small>
                    </div>
                  </div>

                  <div className="ctms-report-preview">„{fullReport.previewLine}”</div>

                  {fullReport.sections.map((sec, i) => (
                    <div className="ctms-report-section" key={i}>
                      <h3 className={sec.tone === "danger" ? "danger" : ""}>{sec.title}</h3>
                      <p style={{ whiteSpace: "pre-wrap" }}>{sec.text}</p>
                    </div>
                  ))}

                  <div className="ctms-report-footer">
                    <p>„{fullReport.closing}”</p>
                  </div>
                </div>

                <div className="ctms-report-actions">
                  <button className="ctms-primary" onClick={downloadPDF}>
                    Pobierz PDF
                  </button>
                  <button
                    className="ctms-text-btn"
                    onClick={() => {
                      window.location.href = "/";
                    }}
                  >
                    zakończ
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
ja wkleiłem to co mi wysłałeś i tak wygląda 