
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PATHS, PATH_BY_KEY, PATH_CONTEXT, type EntryKey } from "./data/paths";
import type {
  AnswerMap,
  BoundaryDraft,
  InterviewExchange,
  RelationshipContext,
  ReturnCase,
  SessionState,
  Stage,
  V3CaseModel,
  V3FullReport,
  V3Mirror,
  V3Preview,
} from "./types";
import {
  analyzeV3,
  createCheckout,
  deleteV3Case,
  fetchSignedReport,
  recoverV3,
  requestInterviewQuestion,
  requestMirror,
  saveBoundaries,
  startRealityProtocol,
  startV3Session,
  submitProtocolCheckin,
  submitWeeklyCheckin,
  updateLegacySession,
  trackV3Event,
} from "./api";
import { Shell, LoadingPanel, Surface } from "./components/Layout";
import { Landing } from "./components/Landing";
import { PathSelection } from "./components/PathSelection";
import { ClosedQuestions } from "./components/ClosedQuestions";
import { MidMirror } from "./components/MidMirror";
import { ContextMap } from "./components/ContextMap";
import { FinalContext, OpenInterview } from "./components/OpenInterview";
import { CheckoutPanel, FreePreview } from "./components/Preview";
import { PremiumReport } from "./components/PremiumReport";
import { ReturnFlow } from "./components/ReturnFlow";
import "./styles/v3.css";

const STORAGE_KEY = "ctms_v3_state_20260805";
const STORAGE_TTL = 90 * 24 * 60 * 60 * 1000;

type SelectedAnswer = { optionId: string; score: number };

type PersistedState = {
  savedAt: number;
  stage: Stage;
  selectedPath: EntryKey | null;
  questionIndex: number;
  selectedAnswers: Record<string, SelectedAnswer>;
  mirrorShown: boolean;
  context: RelationshipContext;
  interviewStep: number;
  interviewHistory: InterviewExchange[];
  finalContext: string;
  session: SessionState | null;
  preview: V3Preview | null;
  caseModel: V3CaseModel | null;
  boundaries: BoundaryDraft;
  email: string;
};

const emptyContext: RelationshipContext = {
  forceMap: {},
  burdens: [],
  emotions: [],
  truth: "",
};

const emptyBoundaries: BoundaryDraft = {
  improvementProof: "",
  unacceptableBehavior: "",
  observationWindow: "",
  userCommitment: "",
};

function safeReadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > STORAGE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function localMirror(path: EntryKey, answers: Array<{ question: string; answer: string; score: number }>): V3Mirror {
  const high = answers.filter((item) => item.score >= 2);
  const context = PATH_CONTEXT[path];
  return {
    headline: high.length >= Math.ceil(answers.length / 2)
      ? "W kilku odpowiedziach wraca podobny koszt, ale jego źródło nie jest jeszcze rozstrzygnięte."
      : "Obraz nie jest jednostronny. Widać zarówno zasoby, jak i miejsce wymagające sprawdzenia.",
    observation: high.length
      ? `Najmocniej wracają odpowiedzi związane z napięciem, brakiem jasności albo nierównym ciężarem. To sygnał do sprawdzenia, nie diagnoza.`
      : "Dotychczasowe odpowiedzi nie układają się w prosty obraz kryzysu. Ważne będzie to, co pokaże konkretna sytuacja.",
    unknown: "Nie wiadomo jeszcze, czy opisujesz stały wzorzec, chwilowy kryzys czy reakcję na pojedyncze zdarzenie.",
    nextFocus: context.mechanismPrompt,
  };
}

function fallbackInterviewQuestion(path: EntryKey, step: number): string {
  const config = PATH_CONTEXT[path];
  return [config.scenePrompt, config.mechanismPrompt, config.realityPrompt][Math.min(step, 2)];
}

export function V3App() {
  const initial = React.useMemo(() => safeReadState(), []);
  const [stage, setStage] = React.useState<Stage>(initial?.stage || "landing");
  const [selectedPath, setSelectedPath] = React.useState<EntryKey | null>(initial?.selectedPath || null);
  const [questionIndex, setQuestionIndex] = React.useState(initial?.questionIndex || 0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, SelectedAnswer>>(initial?.selectedAnswers || {});
  const [mirrorShown, setMirrorShown] = React.useState(Boolean(initial?.mirrorShown));
  const [mirror, setMirror] = React.useState<V3Mirror | null>(null);
  const [context, setContext] = React.useState<RelationshipContext>(initial?.context || emptyContext);
  const [interviewStep, setInterviewStep] = React.useState(initial?.interviewStep || 0);
  const [interviewHistory, setInterviewHistory] = React.useState<InterviewExchange[]>(initial?.interviewHistory || []);
  const [interviewQuestion, setInterviewQuestion] = React.useState("");
  const [interviewFocus, setInterviewFocus] = React.useState("");
  const [interviewObservation, setInterviewObservation] = React.useState("");
  const [interviewDraft, setInterviewDraft] = React.useState("");
  const [finalContext, setFinalContext] = React.useState(initial?.finalContext || "");
  const [analysisConsent, setAnalysisConsent] = React.useState(false);
  const [session, setSession] = React.useState<SessionState | null>(initial?.session || null);
  const [preview, setPreview] = React.useState<V3Preview | null>(initial?.preview || null);
  const [caseModel, setCaseModel] = React.useState<V3CaseModel | null>(initial?.caseModel || null);
  const [boundaries, setBoundaries] = React.useState<BoundaryDraft>(initial?.boundaries || emptyBoundaries);
  const [email, setEmail] = React.useState(initial?.email || "");
  const [purchaseConsent, setPurchaseConsent] = React.useState(false);
  const [fullReport, setFullReport] = React.useState<V3FullReport | null>(null);
  const [returnCase, setReturnCase] = React.useState<ReturnCase | null>(null);
  const [recoveryToken, setRecoveryToken] = React.useState("");
  const [recoveryUrl, setRecoveryUrl] = React.useState("");
  const [protocolStarted, setProtocolStarted] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const path = selectedPath ? PATH_BY_KEY[selectedPath] : null;
  const answerMap: AnswerMap = React.useMemo(
    () => Object.fromEntries(Object.entries(selectedAnswers).map(([key, value]) => [key, value.optionId])),
    [selectedAnswers]
  );
  const answerPayload = React.useMemo(() => {
    if (!path) return [];
    return path.questions
      .filter((question) => selectedAnswers[question.id])
      .map((question) => {
        const selected = selectedAnswers[question.id];
        const option = question.options.find((item) => item.id === selected.optionId);
        return {
          question: question.text,
          answer: option?.label || selected.optionId,
          score: selected.score,
        };
      });
  }, [path, selectedAnswers]);

  React.useEffect(() => {
    const publicPaths = ["/artykuly", "/regulamin", "/polityka-prywatnosci", "/rodo", "/kontakt"];
    if (publicPaths.some((item) => window.location.pathname.startsWith(item))) return;
    const payload: PersistedState = {
      savedAt: Date.now(),
      stage,
      selectedPath,
      questionIndex,
      selectedAnswers,
      mirrorShown,
      context,
      interviewStep,
      interviewHistory,
      finalContext,
      session,
      preview,
      caseModel,
      boundaries,
      email,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
  }, [
    stage, selectedPath, questionIndex, selectedAnswers, mirrorShown, context,
    interviewStep, interviewHistory, finalContext, session, preview, caseModel,
    boundaries, email,
  ]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage, questionIndex, interviewStep]);

  React.useEffect(() => {
    const trackedStages: Partial<Record<Stage, string>> = {
      landing: "landing_view", paths: "path_selection_view", questions: "closed_question_view",
      mirror: "mid_mirror_view", context: "context_map_view", interview: "open_interview_view",
      "final-context": "final_context_view", preview: "free_preview_view", checkout: "checkout_view",
      report: "premium_report_view", return: "history_view", crisis: "safety_stop_view",
    };
    const name = trackedStages[stage];
    if (name) void trackV3Event({ caseId: session?.caseId || null, name, properties: { path: selectedPath, questionIndex, interviewStep } });
  }, [stage]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnToken = params.get("v3_return");
    const accessToken = params.get("access_token");
    const accessExp = params.get("exp");
    const accessSig = params.get("sig");
    const success = params.get("success");
    const checkoutToken = params.get("token");
    const cancel = params.get("cancel") || params.get("cancelled");

    if (returnToken) {
      setBusy(true);
      setRecoveryToken(returnToken);
      recoverV3(returnToken)
        .then((data) => {
          setReturnCase(data);
          setStage("return");
        })
        .catch((err) => {
          setError(err?.message || "Nie udało się otworzyć prywatnej historii.");
          setStage("error");
        })
        .finally(() => setBusy(false));
      return;
    }

    if (accessToken && accessExp && accessSig) {
      setBusy(true);
      setStage("analyzing");
      fetchSignedReport(accessToken, accessExp, accessSig)
        .then((report) => {
          if ((report as any)?.version !== "3.0") {
            const next = new URL(window.location.href);
            next.searchParams.set("legacy", "1");
            window.location.href = next.toString();
            return;
          }
          setFullReport(report as V3FullReport);
          setSession((current) => current || {
            sessionToken: accessToken,
            caseId: "",
            recoveryToken: "",
          });
          setStage("report");
        })
        .catch((err) => {
          setError(err?.message || "Raport nie jest jeszcze dostępny albo link wygasł.");
          setStage("error");
        })
        .finally(() => setBusy(false));
      return;
    }

    if (success === "1" && checkoutToken) {
      setSuccessMessage("Płatność została przyjęta. Pełny raport otworzysz z bezpiecznego linku wysłanego na podany adres e-mail.");
      setStage("error");
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (cancel) {
      setStage(preview ? "preview" : "landing");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function choosePath(key: EntryKey) {
    setBusy(true);
    setError("");
    try {
      const nextSession = await startV3Session(key);
      setSession(nextSession);
      setSelectedPath(key);
      setQuestionIndex(0);
      setSelectedAnswers({});
      setMirrorShown(false);
      setMirror(null);
      setContext(emptyContext);
      setInterviewStep(0);
      setInterviewHistory([]);
      setFinalContext("");
      setPreview(null);
      setCaseModel(null);
      setStage("questions");
    } catch (err: any) {
      setError(err?.message || "Nie udało się rozpocząć analizy.");
      setStage("error");
    } finally {
      setBusy(false);
    }
  }

  async function answerQuestion(questionId: string, optionId: string, score: number) {
    if (!path) return;
    const nextAnswers = { ...selectedAnswers, [questionId]: { optionId, score } };
    setSelectedAnswers(nextAnswers);

    const midpoint = Math.floor(path.questions.length / 2) - 1;
    const isLast = questionIndex >= path.questions.length - 1;

    await new Promise((resolve) => window.setTimeout(resolve, 180));

    if (!mirrorShown && questionIndex === midpoint) {
      setMirrorShown(true);
      setStage("mirror");
      setBusy(true);
      const payload = path.questions
        .filter((question) => nextAnswers[question.id])
        .map((question) => {
          const selected = nextAnswers[question.id];
          const option = question.options.find((item) => item.id === selected.optionId);
          return { question: question.text, answer: option?.label || selected.optionId, score: selected.score };
        });
      try {
        if (!session) throw new Error("Brak sesji");
        const result = await requestMirror({
          sessionToken: session.sessionToken,
          path: path.key,
          answers: payload,
        });
        setMirror(result);
      } catch {
        setMirror(localMirror(path.key, payload));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (isLast) {
      setStage("context");
      return;
    }

    setQuestionIndex((value) => value + 1);
  }

  async function loadInterviewQuestion(step: number, history: InterviewExchange[]) {
    if (!path || !session) return;
    setBusy(true);
    try {
      const result = await requestInterviewQuestion({
        sessionToken: session.sessionToken,
        path: path.key,
        step,
        answers: answerPayload,
        context,
        history,
      });
      setInterviewQuestion(result.question || fallbackInterviewQuestion(path.key, step));
      setInterviewFocus(result.focus || ["konkretne zdarzenie", "rozkład odpowiedzialności", "kontrsygnał"][step]);
      setInterviewObservation(result.observation || "");
    } catch {
      setInterviewQuestion(fallbackInterviewQuestion(path.key, step));
      setInterviewFocus(["konkretne zdarzenie", "rozkład odpowiedzialności", "kontrsygnał"][step]);
      setInterviewObservation("");
    } finally {
      setBusy(false);
    }
  }

  async function beginInterview() {
    setInterviewStep(0);
    setInterviewDraft("");
    setInterviewHistory([]);
    setStage("interview");
    await loadInterviewQuestion(0, []);
  }

  async function submitInterview(answerOverride?: string) {
    if (!path) return;
    const answer = answerOverride ?? interviewDraft.trim();
    const nextHistory: InterviewExchange[] = [
      ...interviewHistory,
      {
        question: interviewQuestion || fallbackInterviewQuestion(path.key, interviewStep),
        answer: answer || "Brak wystarczających danych do odpowiedzi.",
        focus: interviewFocus || "brakujący materiał",
        observation: interviewObservation,
      },
    ];
    setInterviewHistory(nextHistory);
    setInterviewDraft("");

    if (interviewStep >= 2) {
      setStage("final-context");
      return;
    }
    const nextStep = interviewStep + 1;
    setInterviewStep(nextStep);
    await loadInterviewQuestion(nextStep, nextHistory);
  }

  async function runAnalysis(finalContextOverride?: string) {
    if (!path || !session) return;
    setStage("analyzing");
    setBusy(true);
    setError("");
    try {
      const input = {
        path: path.key,
        answers: answerPayload,
        context,
        interview: interviewHistory,
        finalContext: finalContextOverride ?? finalContext,
      };
      const result = await analyzeV3({
        sessionToken: session.sessionToken,
        input,
      });
      setPreview(result.preview);
      setCaseModel(result.caseModel);
      if (result.preview.safety?.level === "high-risk") {
        setStage("crisis");
      } else {
        setStage("preview");
      }
    } catch (err: any) {
      setError(err?.message || "Nie udało się przygotować pierwszego odczytu.");
      setStage("error");
    } finally {
      setBusy(false);
    }
  }

  async function buyReport() {
    void trackV3Event({ caseId: session?.caseId || null, name: "checkout_started", properties: { path: selectedPath } });
    if (!session || !path || !caseModel) return;
    setBusy(true);
    setError("");
    try {
      await saveBoundaries({
        sessionToken: session.sessionToken,
        boundaries,
      });
      await updateLegacySession({
        token: session.sessionToken,
        email,
        path: path.key,
        stage: "v3_checkout_started",
        payload: {
          analysisVersion: "3.0",
          entryKey: path.key,
          caseId: session.caseId,
          recoveryToken: session.recoveryToken,
          input: {
            path: path.key,
            answers: answerPayload,
            context,
            interview: interviewHistory,
            finalContext,
          },
          caseModel,
          boundaries,
        },
        preview: preview || caseModel.preview,
        purchaseConsent: {
          accepted: true,
          acceptedAt: new Date().toISOString(),
          version: "2026-08-05-v3",
        },
      });
      const checkout = await createCheckout(session.sessionToken, email, new Date().toISOString());
      window.location.href = checkout.url;
    } catch (err: any) {
      setError(err?.message || "Nie udało się rozpocząć płatności.");
    } finally {
      setBusy(false);
    }
  }

  async function startProtocol() {
    if (!session || !fullReport) return;
    setBusy(true);
    try {
      const data = await startRealityProtocol({
        sessionToken: session.sessionToken,
        report: fullReport,
      });
      setRecoveryToken(data.recoveryToken);
      setRecoveryUrl(data.recoveryUrl);
      setProtocolStarted(true);
    } catch (err: any) {
      setError(err?.message || "Nie udało się uruchomić protokołu.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setStage("landing");
    setSelectedPath(null);
    setQuestionIndex(0);
    setSelectedAnswers({});
    setMirrorShown(false);
    setMirror(null);
    setContext(emptyContext);
    setInterviewStep(0);
    setInterviewHistory([]);
    setFinalContext("");
    setSession(null);
    setPreview(null);
    setCaseModel(null);
    setBoundaries(emptyBoundaries);
    setFullReport(null);
    setError("");
    setSuccessMessage("");
    window.history.replaceState({}, "", "/");
  }

  function back() {
    if (stage === "paths") return setStage("landing");
    if (stage === "questions") {
      if (questionIndex > 0) return setQuestionIndex((value) => value - 1);
      return setStage("paths");
    }
    if (stage === "mirror") return setStage("questions");
    if (stage === "context") return setStage("questions");
    if (stage === "interview") return setStage("context");
    if (stage === "final-context") return setStage("interview");
    if (stage === "preview") return setStage("final-context");
    if (stage === "checkout") return setStage("preview");
    return reset();
  }

  if (busy && (stage === "analyzing" || (!returnCase && stage === "return"))) {
    return (
      <Shell>
        <LoadingPanel
          title={stage === "return" ? "Otwieramy prywatną historię" : "Porównujemy zdarzenia z Twoją narracją"}
          expectedText={
            stage === "return"
              ? "Otworzenie zapisanej historii zwykle trwa kilka sekund."
              : (finalContext.length + interviewHistory.reduce((sum, item) => sum + item.answer.length, 0) > 5000
                  ? "Materiał jest obszerny, ale pierwszy odczyt powinien pojawić się w ciągu kilkunastu sekund."
                  : "Pierwszy odczyt zwykle pojawia się po kilku sekundach.")
          }
          lines={[
            "Oddzielamy obserwowalne zdarzenia od interpretacji.",
            "Szukamy rozbieżności, ale również faktów, które osłabiają pierwszą hipotezę.",
            "Sprawdzamy koszt obecnego układu i brakujące informacje.",
            "Budujemy pierwszy odczyt bez diagnozowania drugiej osoby.",
          ]}
        />
      </Shell>
    );
  }

  return (
    <Shell onBack={stage !== "landing" && stage !== "report" && stage !== "return" ? back : undefined}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${stage}-${questionIndex}-${interviewStep}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {stage === "landing" && <Landing onStart={() => setStage("paths")} />}

          {stage === "paths" && (
            <PathSelection paths={PATHS} onSelect={choosePath} />
          )}

          {stage === "questions" && path && (
            <ClosedQuestions
              path={path}
              index={questionIndex}
              answers={answerMap}
              onAnswer={answerQuestion}
            />
          )}

          {stage === "mirror" && (
            <MidMirror
              mirror={mirror}
              loading={busy}
              onContinue={() => {
                setQuestionIndex((value) => value + 1);
                setStage("questions");
              }}
            />
          )}

          {stage === "context" && path && (
            <ContextMap
              path={path.key}
              value={context}
              onChange={setContext}
              onContinue={beginInterview}
            />
          )}

          {stage === "interview" && path && (
            <OpenInterview
              path={path}
              step={interviewStep}
              question={interviewQuestion}
              focus={interviewFocus}
              observation={interviewObservation}
              draft={interviewDraft}
              history={interviewHistory}
              loading={busy}
              onDraft={setInterviewDraft}
              onSubmit={() => submitInterview()}
              onSkip={() => submitInterview("Brak wystarczających danych do odpowiedzi.")}
            />
          )}

          {stage === "final-context" && path && (
            <FinalContext
              path={path}
              value={finalContext}
              consent={analysisConsent}
              onChange={setFinalContext}
              onConsent={setAnalysisConsent}
              onSubmit={() => runAnalysis()}
              onSkip={() => {
                setFinalContext("");
                void runAnalysis("");
              }}
            />
          )}

          {stage === "analyzing" && (
            <LoadingPanel
              title="Porównujemy Twoje wybory z opisem konkretnej sytuacji"
              lines={[
                "Wyciągamy zdarzenia, które dałoby się zobaczyć albo umieścić na osi czasu.",
                "Oddzielamy emocje, interpretacje, przewidywania i usprawiedliwienia.",
                "Budujemy hipotezę oraz najlepszą alternatywną wersję.",
                "Zaznaczamy to, czego nadal uczciwie nie da się ustalić.",
              ]}
            />
          )}

          {stage === "preview" && preview && (
            <FreePreview preview={preview} onPremium={() => setStage("checkout")} />
          )}

          {stage === "checkout" && (
            <CheckoutPanel
              boundaries={boundaries}
              email={email}
              consent={purchaseConsent}
              saving={busy}
              onBoundaries={setBoundaries}
              onEmail={setEmail}
              onConsent={setPurchaseConsent}
              onBuy={buyReport}
            />
          )}

          {stage === "report" && fullReport && (
            <PremiumReport
              report={fullReport}
              protocolStarted={protocolStarted}
              startingProtocol={busy}
              recoveryUrl={recoveryUrl}
              onStartProtocol={startProtocol}
              onCopyLink={() => navigator.clipboard?.writeText(recoveryUrl)}
            />
          )}

          {stage === "return" && returnCase && (
            <ReturnFlow
              caseData={returnCase}
              loading={busy}
              onProtocolCheckin={async (result) => {
                if (!recoveryToken || !returnCase.activeProtocol) return;
                setBusy(true);
                try {
                  const next = await submitProtocolCheckin({
                    recoveryToken,
                    protocolId: returnCase.activeProtocol.id,
                    result,
                  });
                  setReturnCase(next);
                } finally {
                  setBusy(false);
                }
              }}
              onWeeklyCheckin={async (input) => {
                if (!recoveryToken) return;
                setBusy(true);
                try {
                  const next = await submitWeeklyCheckin({ recoveryToken, input });
                  setReturnCase(next);
                } finally {
                  setBusy(false);
                }
              }}
              onRefresh={async () => {
                if (!recoveryToken) return;
                setBusy(true);
                try { setReturnCase(await recoverV3(recoveryToken)); } finally { setBusy(false); }
              }}
              onDelete={async () => {
                if (!recoveryToken) return;
                if (!window.confirm("Usunąć całą prywatną historię relacji? Tej operacji nie można cofnąć.")) return;
                await deleteV3Case(recoveryToken);
                reset();
              }}
            />
          )}

          {stage === "crisis" && preview?.safety && (
            <Surface className="v3-crisis">
              <div className="v3-kicker">BEZPIECZEŃSTWO MA PIERWSZEŃSTWO</div>
              <h1>{preview.safety.message}</h1>
              <p>
                W tej sytuacji nie proponujemy testu relacyjnego ani eksperymentu z zachowaniem drugiej osoby.
                Analiza internetowa nie jest właściwym narzędziem do oceny bezpośredniego ryzyka.
              </p>
              <ul>{preview.safety.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
              <button className="v3-button v3-button-secondary" onClick={reset}>Zakończ analizę</button>
            </Surface>
          )}

          {stage === "error" && (
            <Surface className="v3-error">
              <div className="v3-kicker">{successMessage ? "PŁATNOŚĆ PRZYJĘTA" : "NIE UDAŁO SIĘ ZAKOŃCZYĆ OPERACJI"}</div>
              <h1>{successMessage || "Coś poszło nie tak."}</h1>
              {error && <p>{error}</p>}
              {!successMessage && (
                <div className="v3-error-actions">
                  <button
                    className="v3-button v3-button-primary"
                    onClick={() => {
                      if (!preview && session && path) {
                        void runAnalysis();
                        return;
                      }
                      setStage(preview ? "preview" : (session && path ? "final-context" : "landing"));
                    }}
                  >
                    {!preview && session && path ? "Spróbuj przygotować wynik ponownie" : "Wróć do ostatniego etapu"}
                  </button>
                  <button className="v3-button v3-button-secondary" onClick={reset}>Zacznij od początku</button>
                </div>
              )}
            </Surface>
          )}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
