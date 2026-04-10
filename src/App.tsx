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

type PreviewReport = {
  headline: string;
  subheadline: string;
  previewLine: string;
  tensionPercent: number;
  driftPercent: number;
  rebuildPercent: number;
  sections?: {
    title: string;
    text: string;
    tone?: "normal" | "gold" | "danger";
  }[];
  closing?: string;
};

type FullReport = {
  headline: string;
  subheadline: string;
  previewLine: string;
  tensionPercent: number;
  driftPercent: number;
  rebuildPercent: number;
  sections: {
    title: string;
    text: string;
    tone?: "normal" | "gold" | "danger";
  }[];
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

const QUESTIONS: Question[] = [
  {
    id: 1,
    phase: "Rozpoznanie",
    lead: "Zacznijmy od tego, jak ten układ działa na Ciebie od środka.",
    text: "Czy przy tej osobie częściej czujesz spokój czy napięcie?",
    options: [
      { label: "Zdecydowanie napięcie i stres", tags: ["napięcie", "stres"] },
      { label: "To sinusoida, raz tak, raz tak", tags: ["chaos", "niestabilność"] },
      { label: "Zazwyczaj czuję spokój", tags: ["spokój"] },
    ],
  },
  {
    id: 2,
    phase: "Rozpoznanie",
    lead: "To, co zostaje po kontakcie, zwykle mówi więcej niż deklaracje.",
    text: "Po trudnej rozmowie zostaje w Tobie ulga czy ścisk w żołądku?",
    options: [
      { label: "Ścisk, analizuję wszystko w kółko", tags: ["lękowy_styl", "niepewność"] },
      { label: "Zależy od tego, jak się dogadamy", tags: ["warunkowe_bezpieczeństwo"] },
      { label: "Ulga, potrafimy zamykać tematy", tags: ["komunikacja"] },
    ],
  },
  {
    id: 3,
    phase: "Bezpieczeństwo",
    lead: "Relacja nie musi być idealna. Ale nie może być polem minowym.",
    text: "Czy możesz być sobą bez obawy, że zostaniesz ukarany emocjonalnie, np. ciszą?",
    options: [
      { label: "Często gryzę się w język, żeby nie było awantury", tags: ["chodzenie_na_palcach", "tłumienie"] },
      { label: "Zdarzają się ciche dni, ale potem mija", tags: ["karanie_ciszą"] },
      { label: "Tak, mówię wprost bez strachu", tags: ["bezpieczeństwo"] },
    ],
  },
  {
    id: 4,
    phase: "Bezpieczeństwo",
    lead: "Tu nie chodzi tylko o uczucia, ale o grunt pod nogami.",
    text: "Czy w tej relacji jest więcej stabilności niż chaosu?",
    options: [
      { label: "To wieczny chaos i gaszenie pożarów", tags: ["toksyczny_układ", "chaos"] },
      { label: "Są okresy spokoju, ale wraca dramat", tags: ["cykl_napięcia"] },
      { label: "Zdecydowanie stabilność", tags: ["stabilność"] },
    ],
  },
  {
    id: 5,
    phase: "Wzajemność",
    lead: "Bilans nie zawsze musi być 50/50, ale nie może być jednostronny.",
    text: "Kto częściej inicjuje naprawę po konflikcie?",
    options: [
      { label: "Prawie zawsze ja", tags: ["brak_wzajemności", "ratowanie"] },
      { label: "Różnie, zależy od sytuacji", tags: ["równowaga"] },
      { label: "Częściej druga strona", tags: ["wycofanie"] },
    ],
  },
  {
    id: 6,
    phase: "Komunikacja",
    lead: "Tu warto być uczciwym wobec siebie, nie tylko wobec historii, którą sobie opowiadasz.",
    text: "Czy między Wami coś się realnie wyjaśnia, czy krążycie wokół tych samych problemów?",
    options: [
      { label: "Ciągle wracamy do tego samego", tags: ["nierozwiązane_konflikty", "schemat"] },
      { label: "Odkładamy rzeczy, żeby był święty spokój", tags: ["zamiatanie_pod_dywan"] },
      { label: "Tak, potrafimy domykać tematy", tags: ["rozwój"] },
    ],
  },
  {
    id: 7,
    phase: "Granice",
    lead: "Relacja psuje się tam, gdzie granice przestają coś znaczyć.",
    text: "Czy Twoje granice są szanowane, nawet gdy komuś jest to nie po drodze?",
    options: [
      { label: "Moje granice są podważane albo ignorowane", tags: ["brak_szacunku", "przekraczanie_granic"] },
      { label: "Muszę o nie mocno walczyć", tags: ["walka_o_siebie"] },
      { label: "Tak, są naturalnie respektowane", tags: ["szacunek"] },
    ],
  },
  {
    id: 8,
    phase: "Granice",
    lead: "To jest moment na niewygodną szczerość.",
    text: "Czy łapiesz się na usprawiedliwianiu zachowań, które czujesz jako raniące?",
    options: [
      { label: "Bardzo często. Tłumaczę to sobie i innym", tags: ["racjonalizacja", "iluzja"] },
      { label: "Tylko w mniejszych sprawach", tags: ["kompromis"] },
      { label: "Nie, jeśli coś mnie rani, nazywam to wprost", tags: ["świadomość"] },
    ],
  },
  {
    id: 9,
    phase: "Prawda",
    lead: "Nie każda więź opiera się na tym samym. Czasem to lęk, nie bliskość.",
    text: "Czy to, co Was łączy, to na pewno coś więcej niż lęk przed samotnością lub brak alternatywy?",
    options: [
      { label: "Boję się odejść, choć wiem, że to mnie niszczy", tags: ["lęk_przed_samotnością", "zależność"] },
      { label: "Mam wątpliwości, ale wierzę, że to miłość", tags: ["nadzieja", "niepewność"] },
      { label: "Jestem pewien/pewna naszych uczuć", tags: ["pewność"] },
    ],
  },
  {
    id: 10,
    phase: "Przyszłość",
    lead: "Ostatnie pytanie jest o logikę układu, nie o chwilowy nastrój.",
    text: "Gdyby przez najbliższe 5 lat nic się w tej relacji nie zmieniło, to…",
    options: [
      { label: "Zwariowałbym / zwariowałabym", tags: ["punkt_krytyczny", "brak_akceptacji"] },
      { label: "Byłoby ciężko, ale jakoś bym trwał / trwała", tags: ["stagnacja"] },
      { label: "Byłoby w porządku", tags: ["akceptacja"] },
    ],
  },
];

const CHECKPOINTS = [2, 6, QUESTIONS.length - 1];

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
      setLoadingLabel("AI analizuje Twoje odpowiedzi...");

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
            "System widzi niespójność. Opisz ją własnymi słowami."
        );
      } catch (error) {
        console.error(error);
        setCurrentAiObservation(
          "System widzi wzorzec, ale nie ma jeszcze pełnego obrazu. Napisz szczerze, czego tu bronisz albo czego nie chcesz nazwać wprost."
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
        <div className="ctms-modal">
          <div className="ctms-modal-content">
            <div className="ctms-legal-header">
              <h3>{LEGAL_CONTENT[legalModal].title}</h3>
              <button onClick={() => setLegalModal(null)}>✖</button>
            </div>
            <p className="whitespace-pre-wrap">{LEGAL_CONTENT[legalModal].body}</p>
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
              <div className="ctms-center ctms-narrow">
                <p className="ctms-eyebrow">czy to ma sens</p>
                <h1 className="ctms-brand">
                  Nie szukasz pocieszenia.
                  <br />
                  Szukasz prawdy.
                </h1>
                <p style={{ maxWidth: 760, color: "var(--muted)", fontSize: 18, lineHeight: 1.7 }}>
                  To nie jest test kompatybilności. To analityczny system oceny mechanizmów relacyjnych.
                  Pokazuje, gdzie jesteś, do czego to zmierza i co najpewniej się wydarzy, jeśli nic się nie zmieni.
                </p>

                <div className="ctms-actions" style={{ marginTop: 28 }}>
                  <button className="ctms-primary" onClick={() => handleStart("soft")}>
                    Chcę zobaczyć to spokojnie
                  </button>
                  <button className="ctms-primary danger" onClick={() => handleStart("hard")}>
                    Chcę kubeł zimnej wody
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 28,
                    display: "flex",
                    gap: 16,
                    justifyContent: "center",
                    color: "var(--soft)",
                    fontSize: 14,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  <span onClick={() => setLegalModal("terms")}>Regulamin</span>
                  <span onClick={() => setLegalModal("privacy")}>Polityka prywatności</span>
                </div>
              </div>
            </motion.section>
          )}

          {screen === "consents" && (
            <motion.section
              key="consents"
              className="ctms-landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-center ctms-narrow">
                <p className="ctms-eyebrow">czy to ma sens</p>
                <h1
                  style={{
                    fontSize: "clamp(34px, 6vw, 72px)",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    margin: "0 0 18px",
                    fontWeight: 800,
                  }}
                >
                  Zanim zaczniemy,
                  <br />
                  ustalmy zasady.
                </h1>

                <p
                  style={{
                    maxWidth: 760,
                    color: "var(--muted)",
                    fontSize: 18,
                    lineHeight: 1.7,
                    marginBottom: 34,
                  }}
                >
                  To narzędzie nie ma Cię głaskać. Ma analizować mechanizmy, łapać niespójności
                  i pokazywać, gdzie naprawdę jesteś. Zanim wejdziesz dalej, musisz świadomie
                  zaakceptować, czym ten system jest — i czym nie jest.
                </p>

                <div
                  style={{
                    width: "100%",
                    maxWidth: 860,
                    textAlign: "left",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 28,
                    padding: "28px 26px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {CONSENTS.map((txt, i) => (
                      <label
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          padding: "14px 12px",
                          borderRadius: 18,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)",
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
                            marginTop: 4,
                            width: 18,
                            height: 18,
                            accentColor: "#c5a059",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            color: "var(--text)",
                            fontSize: 17,
                            lineHeight: 1.6,
                          }}
                        >
                          {txt}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      flexWrap: "wrap",
                      marginTop: 28,
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <button
                      className="ctms-text-btn"
                      onClick={() => setScreen("landing")}
                      style={{ minWidth: 140 }}
                    >
                      Wróć
                    </button>

                    <button
                      className="ctms-primary"
                      disabled={!allConsentsChecked}
                      onClick={handleConsentsContinue}
                      style={{ minWidth: 220 }}
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
              className="ctms-landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ctms-center ctms-narrow">
                <p className="ctms-eyebrow">czy to ma sens</p>
                <h1
                  style={{
                    fontSize: "clamp(34px, 6vw, 72px)",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    margin: "0 0 18px",
                    fontWeight: 800,
                  }}
                >
                  Co Cię tu
                  <br />
                  sprowadza?
                </h1>

                <p
                  style={{
                    maxWidth: 760,
                    color: "var(--muted)",
                    fontSize: 18,
                    lineHeight: 1.7,
                    marginBottom: 34,
                  }}
                >
                  Wybierz to, co najbardziej pasuje. Ta decyzja ustawi ton, pytania i kierunek całej dalszej analizy.
                </p>

                <div
                  style={{
                    width: "100%",
                    maxWidth: 860,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {ENTRY_POINTS.map((item) => (
                    <button
                      key={item.id}
                      className="ctms-option-btn"
                      style={{
                        textAlign: "left",
                        padding: "20px 22px",
                        borderRadius: 24,
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.04)",
                      }}
                      onClick={() => handlePathSelect(item.id)}
                    >
                      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                        {item.label}
                      </div>
                      <div style={{ color: "var(--soft)", fontSize: 14 }}>{item.note}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {screen === "chat" && currentQuestion && (
            <motion.section
              key={`chat-${step}`}
              className="ctms-chat-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-gold text-xs uppercase tracking-widest">
                {currentQuestion.phase}
              </span>
              <p className="text-gray-400 text-sm mb-4 italic mt-1">{currentQuestion.lead}</p>
              <h2 className="mb-6">{currentQuestion.text}</h2>

              <div className="ctms-options flex flex-col gap-3">
                {currentQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    className="ctms-option-btn text-left p-4 bg-white/5 border border-white/10 rounded-xl hover:border-gold hover:bg-white/10 transition-all"
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 18, color: "var(--soft)", fontSize: 13 }}>
                Pytanie {step + 1} z {QUESTIONS.length}
              </div>
            </motion.section>
          )}

          {screen === "checkpoint" && (
            <motion.section
              key="checkpoint"
              className="ctms-processing text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl">{loadingLabel}</p>
            </motion.section>
          )}

          {screen === "open_response" && (
            <motion.section
              key="open-response"
              className="ctms-chat-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-danger/10 border border-danger/30 p-6 rounded-2xl mb-6">
                <h3 className="text-danger mb-2 text-sm uppercase tracking-widest font-bold">
                  Wniosek analityka
                </h3>
                <p className="text-gray-200 text-lg">“{currentAiObservation}”</p>
              </div>

              <h2 className="mb-4">Odpowiedz bez wygładzania.</h2>
              <textarea
                className="w-full h-40 bg-black/50 border border-white/20 p-4 rounded-xl text-white outline-none focus:border-gold resize-none"
                placeholder="Napisz szczerze, co się tu naprawdę dzieje..."
                value={currentUserText}
                onChange={(e) => setCurrentUserText(e.target.value)}
              />

              <button className="ctms-primary w-full mt-6" onClick={submitOpenResponse}>
                Przekaż do analizy
              </button>
            </motion.section>
          )}

          {screen === "processing" && (
            <motion.section
              key="processing"
              className="ctms-processing text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl">{loadingLabel}</p>
            </motion.section>
          )}

          {screen === "preview" && preview && (
            <motion.section
              key="preview"
              className="ctms-report-card mx-auto max-w-3xl bg-black/40 border border-white/10 p-8 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="border-b border-white/10 pb-6 mb-6">
                <span className="text-gray-500 text-sm uppercase tracking-widest">
                  Wstępna diagnoza
                </span>
                <h1 className="text-4xl mt-2 mb-2">{preview.headline}</h1>
                <p className="text-gray-400">{preview.subheadline}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                  <div className="text-4xl text-danger font-bold mb-1">
                    {preview.tensionPercent}%
                  </div>
                  <div className="text-gray-500 text-sm uppercase">Napięcie</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                  <div className="text-4xl text-white font-bold mb-1">
                    {preview.driftPercent}%
                  </div>
                  <div className="text-gray-500 text-sm uppercase">Rozjazd</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                  <div className="text-4xl text-gold font-bold mb-1">
                    {preview.rebuildPercent}%
                  </div>
                  <div className="text-gray-500 text-sm uppercase">Szansa zmiany</div>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8 italic text-gray-300 text-lg text-center">
                “{preview.previewLine}”
              </div>

              {preview.sections?.[0] && (
                <div className="border border-white/10 p-6 rounded-2xl bg-black/30 mb-8">
                  <h3 className="text-xl mb-3">{preview.sections[0].title}</h3>
                  <p className="text-gray-300 leading-relaxed">{preview.sections[0].text}</p>
                </div>
              )}

              <div className="bg-black/60 p-8 rounded-2xl border border-gold/40 text-center shadow-[0_0_30px_rgba(197,160,89,0.1)]">
                <h3 className="text-2xl text-gold mb-3">Odblokuj pełny raport AI</h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Preview pokazuje tylko pierwszy poziom. Pełny raport rozbija mechanizm na czynniki,
                  pokazuje ukryte motywy i prognozuje kierunek, jeśli nic się nie zmieni.
                </p>

                <input
                  type="email"
                  placeholder="Podaj e-mail do wysyłki raportu"
                  className="w-full bg-black border border-white/20 rounded-xl p-4 mb-4 text-white text-center outline-none focus:border-gold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  className="ctms-primary w-full !bg-gold !text-black hover:!bg-white transition-colors py-4 text-lg font-bold"
                  onClick={handlePayment}
                >
                  Odkryj pełny mechanizm — 49 PLN
                </button>
              </div>
            </motion.section>
          )}

          {screen === "paid_report" && fullReport && (
            <motion.section
              key="paid-report"
              className="ctms-report-card mx-auto max-w-4xl p-4 md:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div ref={reportRef}>
                <span className="text-gold text-sm uppercase tracking-widest font-bold">
                  Pełna analiza relacji
                </span>
                <h1 className="text-4xl md:text-5xl mt-2 mb-4">{fullReport.headline}</h1>
                <p className="text-gray-400 text-xl mb-8">{fullReport.subheadline}</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                    <div className="text-4xl text-danger font-bold mb-1">
                      {fullReport.tensionPercent}%
                    </div>
                    <div className="text-gray-500 text-sm uppercase">Napięcie</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                    <div className="text-4xl text-white font-bold mb-1">
                      {fullReport.driftPercent}%
                    </div>
                    <div className="text-gray-500 text-sm uppercase">Rozjazd</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                    <div className="text-4xl text-gold font-bold mb-1">
                      {fullReport.rebuildPercent}%
                    </div>
                    <div className="text-gray-500 text-sm uppercase">Szansa zmiany</div>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-xl border-l-4 border-gold mb-10 text-xl italic text-gray-200 shadow-lg">
                  “{fullReport.previewLine}”
                </div>

                <div className="flex flex-col gap-6 mb-10">
                  {fullReport.sections.map((sec, i) => (
                    <div
                      key={i}
                      className="border border-white/10 p-6 md:p-8 rounded-2xl bg-black/40"
                    >
                      <h3
                        className={`text-2xl mb-4 font-bold ${
                          sec.tone === "danger"
                            ? "text-danger"
                            : sec.tone === "gold"
                            ? "text-gold"
                            : "text-white"
                        }`}
                      >
                        {sec.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {sec.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-12 p-8 border-t border-white/10">
                  <p className="text-2xl text-gray-200 mb-8 italic">“{fullReport.closing}”</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center mt-4">
                <button className="ctms-primary" onClick={downloadPDF}>
                  Pobierz PDF
                </button>
                <button
                  className="ctms-text-btn"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                >
                  Zakończ
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}