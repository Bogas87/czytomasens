import React from "react";
import { motion } from "framer-motion";
import type { EntryConfig } from "../data/paths";
import { PATH_CONTEXT } from "../data/paths";
import type { InterviewExchange } from "../types";
import { Kicker, PrimaryButton, Progress, SecondaryButton, Surface } from "./Layout";

const MIN_OPEN_LENGTH = 20;
const chapterMeta = [
  { eyebrow: "KADR ZDARZENIA", title: "Jeden konkretny moment", purpose: "Opisz to, co dałoby się zobaczyć albo usłyszeć. Bez zgadywania intencji." },
  { eyebrow: "MECHANIZM POD SPODEM", title: "Kto wykonał kolejny ruch", purpose: "Liczy się kolejność działań, odpowiedzialność i to, co wydarzyło się później." },
  { eyebrow: "PRÓBA PRAWDY", title: "Najlepszy kontrargument", purpose: "Na końcu sprawdzamy również fakt, który może osłabić pierwszą wersję." },
];
function fallbackQuestion(path: EntryConfig, step: number): string {
  const config = PATH_CONTEXT[path.key];
  return [config.scenePrompt, config.mechanismPrompt, config.realityPrompt][Math.min(step, 2)];
}

export function OpenInterview({ path, step, question, focus, observation, draft, history, loading, onDraft, onSubmit, onSkip }: {
  path: EntryConfig; step: number; question: string; focus: string; observation: string; draft: string;
  history: InterviewExchange[]; loading: boolean; onDraft: (value: string) => void; onSubmit: () => void; onSkip: () => void;
}) {
  const chapter = chapterMeta[Math.min(step, 2)];
  const effectiveQuestion = question || fallbackQuestion(path, step);
  const previous = history[history.length - 1];
  const length = draft.trim().length;
  const canSubmit = length >= MIN_OPEN_LENGTH;
  return (
    <Surface className="ctms-interview">
      <header className="ctms-interview-top">
        <Progress current={step + 1} total={3} label="Pytania otwarte" />
        <span>{chapter.eyebrow}</span>
      </header>
      <div className="ctms-interview-body">
        <div className="ctms-interview-chapter">
          <b>{String(step + 1).padStart(2, "0")}</b>
          <div><h2>{chapter.title}</h2><p>{chapter.purpose}</p></div>
        </div>
        {previous && step > 0 && <div className="ctms-trace"><span>FRAGMENT, DO KTÓREGO WRACAMY</span><blockquote>{previous.answer.length > 220 ? `${previous.answer.slice(0, 219)}…` : previous.answer}</blockquote></div>}
        {observation && <motion.div className="ctms-observation" initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}><span>CO WYMAGA SPRAWDZENIA</span><p>{observation}</p></motion.div>}
        {focus && <p className="ctms-focus">Cel pytania: {focus}</p>}
        <h1 className={effectiveQuestion.length > 150 ? "is-long" : ""}>{effectiveQuestion}</h1>
        <label className="ctms-writing">
          <span>OPISZ KONKRETNIE</span>
          <textarea value={draft} onChange={(e)=>onDraft(e.target.value)} maxLength={5000} rows={8}
            placeholder={step===0 ? "Kiedy to było? Co dokładnie zrobiła lub powiedziała druga osoba? Co zrobiłeś lub zrobiłaś Ty? Co wydarzyło się później?" : step===1 ? "Zapisz kolejność działań obu stron i to, co wydarzyło się później." : "Podaj także fakt, który może nie pasować do Twojego pierwszego wyjaśnienia."} />
          <div><small>{length===0 ? "Minimum 20 znaków albo pomiń pytanie." : length<MIN_OPEN_LENGTH ? `Dopisz jeszcze ${MIN_OPEN_LENGTH-length} znaków albo pomiń.` : "Odpowiedź ma wystarczającą długość."}</small><small>{length} / 5000</small></div>
        </label>
        <div className="ctms-interview-actions">
          <PrimaryButton onClick={onSubmit} disabled={loading || !canSubmit}>{loading ? "Przygotowujemy kolejne pytanie…" : step<2 ? "Przejdź dalej" : "Zamknij ten wątek"}</PrimaryButton>
          <SecondaryButton onClick={onSkip} disabled={loading}>Pomiń pytanie</SecondaryButton>
        </div>
      </div>
    </Surface>
  );
}

export function FinalContext({ path, value, consent, onChange, onConsent, onSubmit, onSkip }: {
  path: EntryConfig; value: string; consent: boolean; onChange: (value: string) => void; onConsent: (value: boolean) => void; onSubmit: () => void; onSkip: () => void;
}) {
  const config = PATH_CONTEXT[path.key];
  const length = value.trim().length;
  const canSubmit = consent && length >= MIN_OPEN_LENGTH;
  return (
    <Surface className="ctms-final-context">
      <header><Kicker>SZERSZY KONTEKST — OPCJONALNIE</Kicker><span>05 / 06</span></header>
      <h1>Czy jest coś, co mogłoby uczciwie zmienić znaczenie tej historii?</h1>
      <p>{config.finalPrompt}</p>
      <div className="ctms-context-hints"><span>Dodaj fakt wspierający ocenę.</span><span>Dodaj także kontrprzykład.</span><span>Nie wpisuj danych identyfikujących drugą osobę.</span></div>
      <label className="ctms-writing">
        <span>DODATKOWY KONTEKST</span>
        <textarea value={value} onChange={(e)=>onChange(e.target.value)} maxLength={9000} rows={9} placeholder="Dopisz wcześniejsze próby naprawy, ważne okoliczności, własne błędy albo kontrprzykłady." />
        <div><small>{length===0 ? "Minimum 20 znaków albo pomiń ten etap." : length<MIN_OPEN_LENGTH ? `Dopisz jeszcze ${MIN_OPEN_LENGTH-length} znaków albo pomiń.` : "Kontekst zostanie uwzględniony."}</small><small>{length} / 9000</small></div>
      </label>
      <label className="ctms-consent"><input type="checkbox" checked={consent} onChange={(e)=>onConsent(e.target.checked)} /><span>Wyrażam zgodę na przetworzenie treści wyłącznie w celu przygotowania wyniku. Akceptuję Regulamin i Politykę prywatności.</span></label>
      <div className="ctms-interview-actions"><PrimaryButton onClick={onSubmit} disabled={!canSubmit}>Uwzględnij kontekst</PrimaryButton><SecondaryButton onClick={onSkip} disabled={!consent}>Pomiń dodatkowy kontekst</SecondaryButton></div>
    </Surface>
  );
}
