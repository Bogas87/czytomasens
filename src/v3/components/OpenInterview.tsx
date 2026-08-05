import React from "react";
import { motion } from "framer-motion";
import type { EntryConfig } from "../data/paths";
import { PATH_CONTEXT } from "../data/paths";
import type { InterviewExchange } from "../types";
import { Kicker, PrimaryButton, Progress, SecondaryButton, Surface } from "./Layout";

const MIN_OPEN_LENGTH = 20;

const chapterMeta = [
  {
    eyebrow: "KADR ZDARZENIA",
    title: "Najpierw potrzebny jest jeden konkretny moment.",
    purpose: "Opisz to, co dałoby się zobaczyć albo usłyszeć. Bez zgadywania intencji drugiej osoby.",
  },
  {
    eyebrow: "MECHANIZM POD SPODEM",
    title: "Teraz sprawdzamy, kto wykonał kolejny ruch.",
    purpose: "Liczy się kolejność działań, odpowiedzialność i to, co wydarzyło się po trudnym momencie.",
  },
  {
    eyebrow: "PRÓBA PRAWDY",
    title: "Na końcu szukamy faktu, który może osłabić pierwszą wersję.",
    purpose: "Dobry odczyt nie tylko potwierdza. Sprawdza również najlepszy kontrargument.",
  },
];

function fallbackQuestion(path: EntryConfig, step: number): string {
  const config = PATH_CONTEXT[path.key];
  return [config.scenePrompt, config.mechanismPrompt, config.realityPrompt][Math.min(step, 2)];
}

export function OpenInterview({
  path,
  step,
  question,
  focus,
  observation,
  draft,
  history,
  loading,
  onDraft,
  onSubmit,
  onSkip,
}: {
  path: EntryConfig;
  step: number;
  question: string;
  focus: string;
  observation: string;
  draft: string;
  history: InterviewExchange[];
  loading: boolean;
  onDraft: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const chapter = chapterMeta[Math.min(step, 2)];
  const effectiveQuestion = question || fallbackQuestion(path, step);
  const previous = history[history.length - 1];
  const length = draft.trim().length;
  const canSubmit = length >= MIN_OPEN_LENGTH;

  return (
    <Surface className="v3-interview">
      <header className="v3-interview-header">
        <Progress current={step + 1} total={3} label="Pytania otwarte" />
        <Kicker>{chapter.eyebrow}</Kicker>
      </header>

      <div className="v3-interview-intro">
        <span>{String(step + 1).padStart(2, "0")}</span>
        <div>
          <h2>{chapter.title}</h2>
          <p>{chapter.purpose}</p>
        </div>
      </div>

      <div className="v3-interview-content">
        {previous && step > 0 && (
          <div className="v3-previous-trace">
            <span>FRAGMENT, DO KTÓREGO WRACAMY</span>
            <blockquote>{previous.answer.length > 240 ? `${previous.answer.slice(0, 239)}…` : previous.answer}</blockquote>
          </div>
        )}

        {observation && (
          <motion.div
            className="v3-observation"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>CO W TYM MATERIALE WYMAGA SPRAWDZENIA</span>
            <p>{observation}</p>
          </motion.div>
        )}

        <h1 className={effectiveQuestion.length > 155 ? "v3-open-question is-long" : "v3-open-question"}>
          {effectiveQuestion}
        </h1>

        <label className="v3-writing-surface">
          <span>OPISZ KONKRETNIE</span>
          <textarea
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder={
              step === 0
                ? "Kiedy to było? Co dokładnie zrobiła lub powiedziała druga osoba? Co zrobiłeś lub zrobiłaś Ty? Co wydarzyło się później?"
                : step === 1
                  ? "Zapisz kolejność działań obu stron i to, co faktycznie wydarzyło się po tym zdarzeniu."
                  : "Podaj również fakt, który może nie pasować do Twojego pierwszego wyjaśnienia sytuacji."
            }
            maxLength={5000}
            rows={8}
          />
          <div className="v3-writing-meta">
            <small>
              {length === 0
                ? "Minimum 20 znaków albo wybierz pominięcie pytania."
                : length < MIN_OPEN_LENGTH
                  ? `Dopisz jeszcze ${MIN_OPEN_LENGTH - length} znaków albo pomiń pytanie.`
                  : "Odpowiedź ma wystarczającą długość."}
            </small>
            <small>{length} / 5000</small>
          </div>
        </label>

        <div className="v3-interview-actions">
          <PrimaryButton onClick={onSubmit} disabled={loading || !canSubmit}>
            {loading ? "Przygotowujemy kolejne pytanie…" : step < 2 ? "Przejdź dalej" : "Zamknij ten wątek"}
          </PrimaryButton>
          <SecondaryButton onClick={onSkip} disabled={loading}>
            Pomiń — nie mam dość danych
          </SecondaryButton>
        </div>
      </div>
    </Surface>
  );
}

export function FinalContext({
  path,
  value,
  consent,
  onChange,
  onConsent,
  onSubmit,
  onSkip,
}: {
  path: EntryConfig;
  value: string;
  consent: boolean;
  onChange: (value: string) => void;
  onConsent: (value: boolean) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const config = PATH_CONTEXT[path.key];
  const length = value.trim().length;
  const canSubmit = consent && length >= MIN_OPEN_LENGTH;

  return (
    <Surface className="v3-final-context">
      <div className="v3-section-intro">
        <Kicker>SZERSZY KONTEKST — ETAP OPCJONALNY</Kicker>
        <h1>Czy jest coś, co mogłoby uczciwie zmienić znaczenie opisanej historii?</h1>
        <p>{config.finalPrompt}</p>
      </div>

      <div className="v3-final-context-guides">
        <div><span>01</span><p>Dodaj fakt, który wspiera Twoją obecną ocenę.</p></div>
        <div><span>02</span><p>Dodaj również to, co może ją osłabić.</p></div>
        <div><span>03</span><p>Nie wpisuj nazwisk, adresów ani danych identyfikujących drugą osobę.</p></div>
      </div>

      <label className="v3-writing-surface v3-writing-surface-large">
        <span>DODATKOWY KONTEKST</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Dopisz wcześniejsze próby naprawy, ważne okoliczności, własne błędy albo kontrprzykłady."
          maxLength={9000}
          rows={9}
        />
        <div className="v3-writing-meta">
          <small>
            {length === 0
              ? "Możesz uzupełnić minimum 20 znaków albo pominąć ten etap."
              : length < MIN_OPEN_LENGTH
                ? `Dopisz jeszcze ${MIN_OPEN_LENGTH - length} znaków albo pomiń ten etap.`
                : "Kontekst zostanie uwzględniony w analizie."}
          </small>
          <small>{length} / 9000</small>
        </div>
      </label>

      <label className="v3-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => onConsent(event.target.checked)}
        />
        <span>
          Wyrażam zgodę na przetworzenie treści podanych w analizie wyłącznie w celu przygotowania wyniku.
          Akceptuję Regulamin i Politykę prywatności.
        </span>
      </label>

      <div className="v3-final-context-actions">
        <PrimaryButton onClick={onSubmit} disabled={!canSubmit}>
          Uwzględnij kontekst i przygotuj wynik
        </PrimaryButton>
        <SecondaryButton onClick={onSkip} disabled={!consent}>
          Pomiń dodatkowy kontekst
        </SecondaryButton>
      </div>
    </Surface>
  );
}
