import React from "react";
import {
  acceptCoupleExperiment,
  approveCoupleShare,
  completeCoupleIntake,
  createCouple,
  fetchCoupleState,
  joinCouple,
  submitCoupleAnswer,
  submitCrossReflection,
  submitExperimentCheckin,
} from "./api";
import type { CoupleState, ShareSummary, TurnCoach } from "./types";
import "./couple.css";

const TOKEN_KEY = "ctms_couple_participant_v1";
const INVITE_KEY = "ctms_couple_invite_v1";

type Question = {
  id: string;
  title: string;
  helper: string;
  type: "text" | "choice" | "ratings" | "safety";
  options?: Array<{ value: string; label: string }>;
};

const QUESTIONS: Question[] = [
  {
    id: "safety_screen",
    title: "Najpierw bezpieczeństwo.",
    helper: "Ta część jest prywatna. Jeśli wspólna konfrontacja mogłaby zwiększyć ryzyko, system jej nie uruchomi.",
    type: "safety",
  },
  {
    id: "why_now",
    title: "Dlaczego chcecie przyjrzeć się relacji właśnie teraz?",
    helper: "Nie opisuj całej historii. Zacznij od tego, co sprawiło, że ten moment stał się ważny.",
    type: "text",
  },
  {
    id: "desired_direction",
    title: "Czego najbardziej chcesz po tym procesie?",
    helper: "To nie jest obietnica wyniku. System porówna później, czy oboje pracujecie nad tym samym celem.",
    type: "choice",
    options: [
      { value: "understand", label: "Lepiej się zrozumieć" },
      { value: "repair", label: "Spróbować naprawić relację" },
      { value: "resolve", label: "Rozwiązać konkretny konflikt" },
      { value: "decide", label: "Sprawdzić, co dalej z relacją" },
      { value: "uncertain", label: "Jeszcze nie wiem" },
    ],
  },
  {
    id: "relationship_pulse",
    title: "Jak dziś odbierasz Waszą relację?",
    helper: "To jest Twoja perspektywa, nie wynik związku. Oceń każdy obszar od 1 do 10.",
    type: "ratings",
  },
  {
    id: "main_topic",
    title: "Jaki obszar najbardziej Was teraz obciąża?",
    helper: "Wybierz ten, który najlepiej opisuje rdzeń problemu. Poboczne tematy będzie można odłożyć na później.",
    type: "choice",
    options: [
      { value: "communication", label: "Komunikacja i konflikty" },
      { value: "trust", label: "Zaufanie / zazdrość / zdrada" },
      { value: "closeness", label: "Bliskość i intymność" },
      { value: "commitment", label: "Zaangażowanie i wzajemność" },
      { value: "money", label: "Finanse" },
      { value: "family", label: "Dzieci / rodzina / otoczenie" },
      { value: "boundaries", label: "Granice i autonomia" },
      { value: "other", label: "Inny" },
    ],
  },
  {
    id: "concrete_event",
    title: "Opisz jedną konkretną sytuację, która dobrze pokazuje problem.",
    helper: "Co wydarzyło się najpierw, co zrobiła druga osoba, co zrobiłeś Ty i co było potem? Im mniej etykiet, tym lepsze porównanie.",
    type: "text",
  },
  {
    id: "meaning",
    title: "Co wtedy pomyślałeś, że to znaczy?",
    helper: "Tu wolno interpretować. System oddzieli znaczenie, które nadałeś sytuacji, od samego zdarzenia.",
    type: "text",
  },
  {
    id: "emotion_need",
    title: "Co wtedy czułeś i czego potrzebowałeś?",
    helper: "Napisz własnymi słowami. AI może zaproponować hipotezę potrzeby, ale nie przypisze Ci jej bez Twojego potwierdzenia.",
    type: "text",
  },
  {
    id: "big_unknown",
    title: "Czego najbardziej nie wiesz o perspektywie partnera?",
    helper: "Najcenniejsza niewiadoma to taka, na którą druga osoba naprawdę może odpowiedzieć.",
    type: "text",
  },
  {
    id: "own_response",
    title: "Co Ty zwykle robisz, kiedy ten problem się pojawia?",
    helper: "Nie chodzi o winę. Chodzi o Twój element sekwencji: naciskasz, wycofujesz się, tłumaczysz, atakujesz, milczysz, próbujesz naprawiać?",
    type: "text",
  },
  {
    id: "predict_partner",
    title: "Jak myślisz, co partner wskaże jako Twój udział w tym problemie?",
    helper: "Nie zobaczysz jeszcze jego odpowiedzi. Później system porówna Twoje przewidywanie z jego rzeczywistą perspektywą.",
    type: "text",
  },
  {
    id: "resource",
    title: "Co nadal działa między Wami dobrze?",
    helper: "Nie analizujemy tylko kryzysu. Ważne jest też to, co nadal Was łączy i kiedy potraficie działać inaczej.",
    type: "text",
  },
  {
    id: "change_evidence",
    title: "Po czym poznałbyś, że naprawdę coś się poprawiło?",
    helper: "Nie „będziemy lepiej rozmawiać”, tylko zachowanie, które da się zauważyć w codziennym życiu.",
    type: "text",
  },
];

function tokenFromHash(): string {
  const match = window.location.hash.match(/(?:^#|&)p=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.history.replaceState({}, "", `/dla-par#p=${encodeURIComponent(token)}`);
}

function blankShare(): ShareSummary {
  return { summary: "", whatISee: "", whatMatters: "", whatINeed: "", whatIDontKnow: "" };
}

function Header() {
  return (
    <header className="couple-header">
      <a href="/" className="couple-brand">CzyToMaSens<span>·</span><small>DWA SPOJRZENIA</small></a>
      <a href="/" className="couple-home-link">Strona główna</a>
    </header>
  );
}

function Intro({ onCreated }: { onCreated: (token: string, inviteCode?: string) => void }) {
  const [mode, setMode] = React.useState<"choose" | "create" | "join">("choose");
  const [displayName, setDisplayName] = React.useState("");
  const [inviteCode, setInviteCode] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function create() {
    setBusy(true); setError("");
    try {
      const data = await createCouple(displayName.trim(), new Date().toISOString());
      localStorage.setItem(INVITE_KEY, data.inviteCode);
      onCreated(data.participantToken, data.inviteCode);
    } catch (err: any) { setError(err?.message || "Nie udało się utworzyć analizy."); }
    finally { setBusy(false); }
  }

  async function join() {
    setBusy(true); setError("");
    try {
      const data = await joinCouple(inviteCode.trim().toUpperCase(), displayName.trim(), new Date().toISOString());
      onCreated(data.participantToken);
    } catch (err: any) { setError(err?.message || "Nie udało się dołączyć."); }
    finally { setBusy(false); }
  }

  return (
    <main className="couple-intro">
      <section className="couple-hero">
        <span className="couple-kicker">WSPÓLNA ANALIZA RELACJI DLA DWOJGA</span>
        <h1>Ta sama relacja.<br/><em>Dwie prywatne perspektywy.</em></h1>
        <p>
          Każde z Was odpowiada osobno. System nie szuka zwycięzcy. Rekonstruuje wspólną rzeczywistość,
          wykrywa rozbieżności, nadinterpretacje, bagatelizowanie, unikanie i pętle rozmowy, a później
          prowadzi Was przez kontrolowane odniesienie się do perspektywy drugiej osoby.
        </p>
        <div className="couple-principles">
          <div><strong>01</strong><span>Surowe odpowiedzi pozostają prywatne.</span></div>
          <div><strong>02</strong><span>Partner widzi tylko podsumowanie, które zatwierdzisz.</span></div>
          <div><strong>03</strong><span>AI nie rozstrzyga, kto mówi prawdę.</span></div>
          <div><strong>04</strong><span>Zmianę sprawdzacie później w realnym zachowaniu.</span></div>
        </div>
      </section>

      <section className="couple-entry-card">
        {mode === "choose" && (
          <>
            <span className="couple-step">START</span>
            <h2>Jak wchodzisz do wspólnej analizy?</h2>
            <button className="couple-primary" onClick={() => setMode("create")}>Rozpoczynam i zapraszam partnera</button>
            <button className="couple-secondary" onClick={() => setMode("join")}>Mam kod od partnera</button>
          </>
        )}
        {mode !== "choose" && (
          <>
            <button className="couple-back" onClick={() => setMode("choose")}>← Wróć</button>
            <h2>{mode === "create" ? "Utwórz prywatną przestrzeń dla dwojga" : "Dołącz do wspólnej analizy"}</h2>
            <label>
              <span>Jak mamy Cię oznaczać? <small>(opcjonalnie)</small></span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} placeholder="Np. A, Krzysiek, Partner 1" />
            </label>
            {mode === "join" && (
              <label>
                <span>Kod zaproszenia</span>
                <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} maxLength={12} placeholder="NP. 8KQ7M2XZ" />
              </label>
            )}
            <label className="couple-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                Rozumiem, że to prowadzona analiza relacji, a nie psychoterapia. AI może porównywać moje prywatne odpowiedzi
                z odpowiedziami partnera, ale partner zobaczy wyłącznie treści, które później zatwierdzę do udostępnienia.
              </span>
            </label>
            {error && <p className="couple-error">{error}</p>}
            <button className="couple-primary" disabled={!consent || busy || (mode === "join" && inviteCode.trim().length < 6)} onClick={mode === "create" ? create : join}>
              {busy ? "Tworzymy bezpieczną przestrzeń…" : mode === "create" ? "Utwórz Dwa Spojrzenia" : "Dołącz"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}

function SafetyAnswer({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const rows = [
    ["fearReaction", "Boję się, co partner zrobi, jeśli zobaczy moje stanowisko."],
    ["physicalViolence", "W relacji występuje lub ostatnio wystąpiła przemoc fizyczna."],
    ["threats", "Pojawiają się groźby, zastraszanie albo realna obawa odwetu."],
    ["sexualCoercion", "Pojawia się przymus seksualny lub nacisk na zgodę wbrew mojej woli."],
    ["coerciveControl", "Partner kontroluje mój telefon, pieniądze, lokalizację lub kontakty w sposób, którego się obawiam."],
  ];
  const current = value || {};
  return (
    <div className="couple-safety-grid">
      {rows.map(([key, label]) => (
        <label key={key}>
          <span>{label}</span>
          <div>
            <button type="button" className={current[key] === false ? "active" : ""} onClick={() => onChange({ ...current, [key]: false })}>Nie</button>
            <button type="button" className={current[key] === true ? "active risk" : ""} onClick={() => onChange({ ...current, [key]: true })}>Tak</button>
          </div>
        </label>
      ))}
    </div>
  );
}

function Ratings({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const items = [
    ["closeness", "Bliskość"], ["trust", "Zaufanie"], ["safety", "Bezpieczeństwo rozmowy"],
    ["mutuality", "Wzajemność"], ["hope", "Nadzieja na zmianę"],
  ];
  const current = value || {};
  return <div className="couple-ratings">{items.map(([key, label]) => (
    <label key={key}><span>{label}</span><input type="range" min="1" max="10" value={current[key] || 5} onChange={(e) => onChange({ ...current, [key]: Number(e.target.value) })}/><strong>{current[key] || 5}/10</strong></label>
  ))}</div>;
}

function Intake({ token, state, onState }: { token: string; state: CoupleState; onState: (s: CoupleState) => void }) {
  const savedAnswers = state.participant.answers || {};
  const firstMissing = QUESTIONS.findIndex((q) => savedAnswers[q.id] == null);
  const [index, setIndex] = React.useState(firstMissing >= 0 ? firstMissing : QUESTIONS.length - 1);
  const [value, setValue] = React.useState<any>(savedAnswers[QUESTIONS[index]?.id] ?? "");
  const [coach, setCoach] = React.useState<TurnCoach | null>(null);
  const [followUp, setFollowUp] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const q = QUESTIONS[index];

  React.useEffect(() => {
    setValue(state.participant.answers[q?.id] ?? "");
    setCoach(null); setFollowUp(""); setError("");
  }, [index]);

  function valid() {
    if (q.type === "safety") return value && ["fearReaction","physicalViolence","threats","sexualCoercion","coerciveControl"].every((k) => typeof value[k] === "boolean");
    if (q.type === "ratings") return value && Object.keys(value).length >= 5;
    return String(value || "").trim().length >= (q.type === "text" ? 8 : 1);
  }

  async function submit() {
    setBusy(true); setError("");
    try {
      const combined = followUp.trim() ? { primary: value, followUp } : value;
      const result = await submitCoupleAnswer({ participantToken: token, questionId: q.id, question: q.title, answer: combined, phase: "intake" });
      onState(result.state);
      if (result.state.safetyStopped) return;
      if (result.coach?.shouldFollowUp && !followUp && q.type === "text") {
        setCoach(result.coach);
        return;
      }
      setCoach(null); setFollowUp("");
      if (index < QUESTIONS.length - 1) setIndex(index + 1);
      else onState(await completeCoupleIntake(token));
    } catch (err: any) { setError(err?.message || "Nie udało się zapisać odpowiedzi."); }
    finally { setBusy(false); }
  }

  return (
    <main className="couple-stage-wrap">
      <div className="couple-progress"><span style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} /></div>
      <section className="couple-question-card">
        <span className="couple-step">PERSPEKTYWA {state.participant.slot} · {index + 1}/{QUESTIONS.length}</span>
        <h1>{q.title}</h1>
        <p>{q.helper}</p>
        {q.type === "text" && <textarea rows={7} value={typeof value === "string" ? value : (value?.primary || "")} onChange={(e) => setValue(e.target.value)} placeholder="Napisz własnymi słowami…" />}
        {q.type === "choice" && <div className="couple-choice-grid">{q.options?.map((o) => <button type="button" key={o.value} className={value === o.value ? "active" : ""} onClick={() => setValue(o.value)}>{o.label}</button>)}</div>}
        {q.type === "ratings" && <Ratings value={value} onChange={setValue} />}
        {q.type === "safety" && <SafetyAnswer value={value} onChange={setValue} />}

        {coach && (
          <div className="couple-coach">
            <span>AI ZATRZYMUJE SIĘ NA JEDNYM PUNKCIE</span>
            <p>{coach.neutralReflection}</p>
            {coach.flags.slice(0, 2).map((f, i) => <small key={i}>{f.observation}</small>)}
            <strong>{coach.followUpQuestion}</strong>
            <textarea rows={4} value={followUp} onChange={(e) => setFollowUp(e.target.value)} placeholder="Doprecyzuj ten jeden punkt…" />
          </div>
        )}
        {error && <p className="couple-error">{error}</p>}
        <div className="couple-actions">
          {index > 0 && <button className="couple-secondary" onClick={() => setIndex(index - 1)} disabled={busy}>Wstecz</button>}
          <button className="couple-primary" onClick={submit} disabled={busy || !valid() || Boolean(coach && followUp.trim().length < 4)}>{busy ? "Analizuję odpowiedź…" : index === QUESTIONS.length - 1 && !coach ? "Zakończ moją część" : coach ? "Doprecyzuj i idź dalej" : "Dalej"}</button>
        </div>
      </section>
    </main>
  );
}

function Waiting({ state, inviteCode, onRefresh }: { state: CoupleState; inviteCode: string; onRefresh: () => void }) {
  return (
    <main className="couple-stage-wrap">
      <section className="couple-wait-card">
        <span className="couple-kicker">TWOJA CZĘŚĆ JEST ZAPISANA</span>
        <h1>{state.partner.joined ? "Druga perspektywa jeszcze powstaje." : "Zaproś drugą osobę."}</h1>
        <p>Nie pokazujemy postępu partnera pytanie po pytaniu. Wspólna część otworzy się dopiero po zakończeniu wymaganej fazy przez oboje.</p>
        {!state.partner.joined && inviteCode && <div className="couple-invite"><span>KOD DLA PARTNERA</span><strong>{inviteCode}</strong><button onClick={() => navigator.clipboard?.writeText(inviteCode)}>Kopiuj kod</button></div>}
        <button className="couple-primary" onClick={onRefresh}>Sprawdź, czy możemy iść dalej</button>
      </section>
    </main>
  );
}

function ShareReview({ token, state, onState }: { token: string; state: CoupleState; onState: (s: CoupleState) => void }) {
  const [share, setShare] = React.useState<ShareSummary>(state.participant.shareDraft || blankShare());
  const [busy, setBusy] = React.useState(false);
  const perspective = state.participant.privatePerspective;
  async function approve() { setBusy(true); try { onState(await approveCoupleShare(token, share)); } finally { setBusy(false); } }
  return (
    <main className="couple-stage-wrap couple-wide">
      <section className="couple-review-grid">
        <div className="couple-private-card">
          <span className="couple-step">TYLKO DLA CIEBIE</span>
          <h2>Jak system rozumie Twoją narrację</h2>
          <p>{perspective?.summary}</p>
          {(perspective?.narrativeFlags || []).slice(0, 6).map((f, i) => <div className="couple-flag" key={i}><strong>{f.observation}</strong><span>{f.question}</span></div>)}
          <small>Te obserwacje dotyczą konkretnych wypowiedzi, nie Twojej osobowości. Partner ich nie zobaczy.</small>
        </div>
        <div className="couple-share-card">
          <span className="couple-step">DO ZATWIERDZENIA</span>
          <h1>Tak przedstawimy Twoją perspektywę partnerowi.</h1>
          <p>Możesz poprawić każde pole. Surowe wpisy z wywiadu nie są udostępniane.</p>
          {([
            ["summary", "Sedno mojej perspektywy"], ["whatISee", "Co widzę w sytuacji"], ["whatMatters", "Co jest dla mnie ważne"],
            ["whatINeed", "Czego potrzebuję / czego oczekuję"], ["whatIDontKnow", "Czego nadal nie wiem"],
          ] as Array<[keyof ShareSummary,string]>).map(([key,label]) => <label key={key}><span>{label}</span><textarea rows={3} value={share[key]} onChange={(e) => setShare({ ...share, [key]: e.target.value })}/></label>)}
          <button className="couple-primary" disabled={busy || Object.values(share).some((x) => x.trim().length < 4)} onClick={approve}>{busy ? "Zapisuję…" : "Zatwierdzam do wspólnej analizy"}</button>
        </div>
      </section>
    </main>
  );
}

function CrossReflection({ token, state, onState }: { token: string; state: CoupleState; onState: (s: CoupleState) => void }) {
  const qs = state.comparison?.crossQuestions || [];
  const partner = state.partner.shareApproved;
  const [input, setInput] = React.useState<Record<string,string>>({});
  const [busy, setBusy] = React.useState(false);
  async function submit() { setBusy(true); try { onState(await submitCrossReflection(token, input)); } finally { setBusy(false); } }
  return (
    <main className="couple-stage-wrap couple-wide">
      <section className="couple-partner-view">
        <span className="couple-kicker">PERSPEKTYWA DRUGIEJ OSOBY · ZATWIERDZONA PRZEZ AUTORA</span>
        <h1>Najpierw zrozum. Dopiero potem odpowiadaj.</h1>
        {partner && <div className="couple-share-read"><h2>{partner.summary}</h2><p><strong>Jak to widzi:</strong> {partner.whatISee}</p><p><strong>Co jest ważne:</strong> {partner.whatMatters}</p><p><strong>Czego potrzebuje:</strong> {partner.whatINeed}</p><p><strong>Czego nie wie:</strong> {partner.whatIDontKnow}</p></div>}
      </section>
      <section className="couple-cross-card">
        <h2>Twoje odniesienie</h2>
        {qs.map((q, i) => <label key={i}><span>{i + 1}. {q}</span><textarea rows={4} value={input[`q${i}`] || ""} onChange={(e) => setInput({ ...input, [`q${i}`]: e.target.value })}/></label>)}
        <label><span>Co w tej perspektywie było dla Ciebie naprawdę nowe?</span><textarea rows={4} value={input.newInformation || ""} onChange={(e) => setInput({ ...input, newInformation: e.target.value })}/></label>
        <label><span>Z czym nadal się nie zgadzasz — nawet jeśli już lepiej rozumiesz drugą stronę?</span><textarea rows={4} value={input.disagreement || ""} onChange={(e) => setInput({ ...input, disagreement: e.target.value })}/></label>
        <label><span>Co z tego konfliktu należy do Twojej części i możesz zmienić niezależnie od partnera?</span><textarea rows={4} value={input.myPart || ""} onChange={(e) => setInput({ ...input, myPart: e.target.value })}/></label>
        <button className="couple-primary" disabled={busy || Object.values(input).join(" ").trim().length < 40} onClick={submit}>{busy ? "Budujemy drugą syntezę…" : "Zapisz moje odniesienie"}</button>
      </section>
    </main>
  );
}

function JointReport({ token, state, onState }: { token: string; state: CoupleState; onState: (s: CoupleState) => void }) {
  const report = state.finalSynthesis;
  const exp = state.experiment;
  const [busy, setBusy] = React.useState(false);
  const [checkin, setCheckin] = React.useState<Record<string,string>>({});
  if (!report) return <Waiting state={state} inviteCode="" onRefresh={() => fetchCoupleState(token).then(onState)} />;
  async function accept(accepted: boolean) { if (!exp) return; setBusy(true); try { onState(await acceptCoupleExperiment(token, exp.id, accepted)); } finally { setBusy(false); } }
  async function submitCheckin() { if (!exp) return; setBusy(true); try { onState(await submitExperimentCheckin(token, exp.id, checkin)); } finally { setBusy(false); } }
  const due = exp ? new Date(exp.dueAt) : null;
  const dueNow = due ? Date.now() >= due.getTime() : false;
  return (
    <main className="couple-stage-wrap couple-wide">
      <section className="couple-joint-hero">
        <span className="couple-kicker">WSPÓLNY MODEL RELACJI · NIE WERDYKT</span>
        <h1>Co zmieniło się po zobaczeniu dwóch perspektyw?</h1>
        <p>{report.cycle}</p>
      </section>
      <section className="couple-joint-grid">
        <article><span>WSPÓLNY GRUNT</span>{report.commonGround.map((x,i)=><p key={i}>{x}</p>)}</article>
        <article><span>PERSPEKTYWA A PO KONFRONTACJI</span><p>{report.updatedUnderstandingA}</p></article>
        <article><span>PERSPEKTYWA B PO KONFRONTACJI</span><p>{report.updatedUnderstandingB}</p></article>
        <article><span>NADAL SPORNE</span>{report.remainingDisagreements.map((x,i)=><p key={i}>{x}</p>)}</article>
      </section>
      <section className="couple-experiment-card">
        <span className="couple-step">EKSPERYMENT RELACYJNY</span>
        <h2>{report.experiment.title}</h2>
        <p><strong>Hipoteza:</strong> {report.experiment.hypothesis}</p>
        <div className="couple-exp-parts"><div><span>A</span><p>{report.experiment.behaviorA}</p></div><div><span>B</span><p>{report.experiment.behaviorB}</p></div></div>
        <p><strong>Po czym sprawdzicie efekt:</strong> {report.experiment.successCriteria.join(" · ")}</p>
        {exp?.status === "PROPOSED" && <div className="couple-actions"><button className="couple-secondary" onClick={() => accept(false)} disabled={busy}>Nie akceptuję</button><button className="couple-primary" onClick={() => accept(true)} disabled={busy}>Akceptuję swoją część</button></div>}
        {exp?.status === "ACTIVE" && <div className="couple-active-exp"><strong>Eksperyment jest aktywny.</strong><span>Weryfikacja: {due?.toLocaleDateString("pl-PL")}</span></div>}
        {exp?.status === "ACTIVE" && dueNow && !exp.myCheckin && <div className="couple-checkin">
          <label><span>Co rzeczywiście wydarzyło się w czasie eksperymentu?</span><textarea rows={4} value={checkin.whatHappened || ""} onChange={(e)=>setCheckin({...checkin,whatHappened:e.target.value})}/></label>
          <label><span>Czy partner wykonał uzgodnione zachowanie? Podaj konkretny przykład.</span><textarea rows={4} value={checkin.partnerBehavior || ""} onChange={(e)=>setCheckin({...checkin,partnerBehavior:e.target.value})}/></label>
          <label><span>Co Ty zrobiłeś inaczej?</span><textarea rows={4} value={checkin.myBehavior || ""} onChange={(e)=>setCheckin({...checkin,myBehavior:e.target.value})}/></label>
          <label><span>Czy napięcie w tym obszarze realnie się zmieniło?</span><textarea rows={4} value={checkin.effect || ""} onChange={(e)=>setCheckin({...checkin,effect:e.target.value})}/></label>
          <button className="couple-primary" disabled={busy || Object.values(checkin).join(" ").length < 40} onClick={submitCheckin}>Zapisz niezależną weryfikację</button>
        </div>}
        {exp?.result && <div className="couple-result"><span>WERYFIKACJA DWÓCH STRON</span><pre>{JSON.stringify(exp.result, null, 2)}</pre></div>}
      </section>
      <section className="couple-next-question"><span>NASTĘPNA ROZMOWA</span><h2>{report.nextConversationQuestion}</h2></section>
    </main>
  );
}

function SafetyStop() {
  return <main className="couple-stage-wrap"><section className="couple-safety-stop"><span className="couple-kicker">WSPÓLNA KONFRONTACJA ZOSTAŁA ZATRZYMANA</span><h1>Bezpieczeństwo ma pierwszeństwo przed symetrią.</h1><p>Na podstawie prywatnych odpowiedzi ten proces nie powinien teraz ujawniać stanowisk ani prowadzić wspólnej konfrontacji. Twoje odpowiedzi nie zostaną pokazane partnerowi.</p><p>Jeżeli istnieje realne zagrożenie życia lub zdrowia, skorzystaj z pomocy odpowiednich służb lub profesjonalnego wsparcia w bezpiecznych warunkach.</p><a className="couple-primary link" href="/">Wróć do strony głównej</a></section></main>;
}

export function CoupleApp() {
  const [token, setToken] = React.useState(() => tokenFromHash() || localStorage.getItem(TOKEN_KEY) || "");
  const [inviteCode, setInviteCode] = React.useState(() => localStorage.getItem(INVITE_KEY) || "");
  const [state, setState] = React.useState<CoupleState | null>(null);
  const [loading, setLoading] = React.useState(Boolean(token));
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!token) return;
    saveToken(token);
    setLoading(true);
    fetchCoupleState(token).then(setState).catch((err) => {
      setError(err?.message || "Nie udało się otworzyć wspólnej analizy.");
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
    }).finally(() => setLoading(false));
  }, [token]);

  React.useEffect(() => {
    if (!token || !state || state.safetyStopped || state.finalSynthesis) return;
    const waiting = ["WAITING_PARTNER", "WAITING_SHARE", "REVIEW_SHARE", "CROSS_REFLECTION"].includes(state.pairStatus);
    if (!waiting) return;
    const timer = window.setInterval(() => {
      fetchCoupleState(token).then(setState).catch(() => undefined);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [token, state?.pairStatus, state?.finalSynthesis, state?.safetyStopped]);

  function started(nextToken: string, code?: string) {
    saveToken(nextToken); setToken(nextToken);
    if (code) { setInviteCode(code); localStorage.setItem(INVITE_KEY, code); }
  }

  function renderFlow() {
    if (!token) return <Intro onCreated={started} />;
    if (loading || !state) return <main className="couple-loading"><div className="couple-loader"/><p>Otwieramy Twoją prywatną część…</p>{error && <span>{error}</span>}</main>;
    if (state.safetyStopped) return <SafetyStop />;

    const s = state.participant.status;
    if (s === "INTAKE") return <Intake token={token} state={state} onState={setState} />;
    if (s === "REVIEW_SHARE" && !state.participant.shareApproved) return <ShareReview token={token} state={state} onState={setState} />;
    if (s === "CROSS_REFLECTION" && !state.participant.reflectionSubmitted) return <CrossReflection token={token} state={state} onState={setState} />;
    if (state.finalSynthesis) return <JointReport token={token} state={state} onState={setState} />;
    return <Waiting state={state} inviteCode={state.participant.slot === "A" ? inviteCode : ""} onRefresh={() => fetchCoupleState(token).then(setState)} />;
  }

  return <div className="couple-shell"><Header />{renderFlow()}<footer className="couple-footer">CzyToMaSens · Dwa Spojrzenia <span>To narzędzie porządkuje dwie perspektywy. Nie zastępuje psychoterapii, diagnozy ani interwencji kryzysowej.</span></footer></div>;
}
