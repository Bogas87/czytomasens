import React from "react";
import type { EntryConfig } from "../data/paths";
import { PATH_CONTEXT } from "../data/paths";
import type { InterviewExchange } from "../types";
import { Kicker, PrimaryButton, Progress, SecondaryButton, Surface } from "./Layout";

const MIN_LENGTH = 20;

const stepMeta = [
  { label: "Konkretne zdarzenie", description: "Jedna scena, którą da się odtworzyć bez zgadywania intencji." },
  { label: "Mechanizm i odpowiedzialność", description: "Kto wykonuje kolejny ruch i kto ponosi koszt utrzymania kontaktu albo spokoju." },
  { label: "Kontrsygnał", description: "Fakt, który może osłabić Twoje pierwsze wyjaśnienie sytuacji." },
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
  const meta = stepMeta[Math.min(step, 2)];
  const currentQuestion = question || fallbackQuestion(path, step);
  const previous = history[history.length - 1];
  const length = draft.trim().length;
  const canSubmit = length >= MIN_LENGTH;

  return (
    <Surface className="ctms-v9-interview">
      <aside className="ctms-v9-interview-rail">
        <div className="ctms-v9-interview-progress">
          <span>DOPRECYZOWANIE</span>
          <strong>{String(step + 1).padStart(2, "0")} <i>/ 03</i></strong>
        </div>
        <Progress current={step + 1} total={3} label="Doprecyzowanie" />

        <div className="ctms-v9-interview-meta">
          <Kicker>{meta.label}</Kicker>
          <p>{meta.description}</p>
        </div>

        <div className="ctms-v9-interview-note">
          <strong>Twoje słowa są materiałem.</strong>
          <p>Nie musisz pisać ładnie. Liczy się kolejność, konkret i to, co rzeczywiście się wydarzyło.</p>
        </div>

        <div className="ctms-v9-interview-art" aria-hidden="true" />
      </aside>

      <div className="ctms-v9-interview-main" data-focus={focus || undefined}>
        <div className="ctms-v9-interview-photo" aria-hidden="true" />

        {previous && step > 0 && (
          <aside className="ctms-v9-previous">
            <span>WCZEŚNIEJ NAPISAŁEŚ / NAPISAŁAŚ</span>
            <p>{previous.answer.length > 220 ? `${previous.answer.slice(0, 219)}…` : previous.answer}</p>
          </aside>
        )}

        {observation && (
          <aside className="ctms-v9-observation">
            <span>DLACZEGO PYTAMY WŁAŚNIE O TO</span>
            <p>{observation}</p>
          </aside>
        )}

        <div className="ctms-v9-interview-copy">
          <Kicker>{meta.label}</Kicker>
          <h1>{currentQuestion}</h1>
        </div>

        <label className="ctms-v9-writing">
          <span>Twoja odpowiedź</span>
          <textarea
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder={
              step === 0
                ? "Kiedy to było? Co dokładnie powiedziała lub zrobiła druga osoba? Co zrobiłeś lub zrobiłaś Ty? Co wydarzyło się później?"
                : step === 1
                  ? "Zapisz kolejność działań obu stron i to, kto wrócił do tematu, wyjaśnił albo naprawił sytuację."
                  : "Podaj również fakt, który nie pasuje do Twojej pierwszej wersji albo pokazuje zachowanie drugiej strony w innym świetle."
            }
            rows={8}
            maxLength={5000}
          />
          <div className="ctms-v9-field-meta">
            <span>
              {length === 0
                ? "Minimum 20 znaków albo pomiń pytanie, jeśli nie masz wystarczających danych."
                : length < MIN_LENGTH
                  ? `Dopisz jeszcze ${MIN_LENGTH - length} znaków albo pomiń pytanie.`
                  : "Wystarczy. Możesz przejść dalej."}
            </span>
            <strong>{length}/5000</strong>
          </div>
        </label>

        <div className="ctms-v9-interview-actions">
          <PrimaryButton onClick={onSubmit} disabled={loading || !canSubmit}>
            {loading ? "Przygotowujemy kolejne pytanie…" : step < 2 ? "Przejdź dalej" : "Zamknij ten wątek"}
          </PrimaryButton>
          <SecondaryButton onClick={onSkip} disabled={loading}>Pomiń — nie mam dość danych</SecondaryButton>
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
  const length = value.trim().length;
  const hasValidText = length >= MIN_LENGTH;

  return (
    <Surface className="ctms-v9-final">
      <div className="ctms-v9-final-copy">
        <Kicker>OSTATNI KONTEKST</Kicker>
        <h1>Czy jest coś, co mogłoby uczciwie zmienić znaczenie tej historii?</h1>
        <p>{PATH_CONTEXT[path.key].finalPrompt}</p>
      </div>

      <div className="ctms-v9-final-layout">
        <aside className="ctms-v9-final-guidance">
          <article><span>01</span><div><strong>Dodaj</strong><p>ważne próby naprawy, konkretne zmiany i fakty, które wspierają Twój odczyt.</p></div></article>
          <article><span>02</span><div><strong>Uwzględnij</strong><p>własne błędy i zdarzenia, które osłabiają pierwszą wersję.</p></div></article>
          <article><span>03</span><div><strong>Pomiń dane osobowe</strong><p>nazwiska, adresy, telefony i inne informacje identyfikujące drugą osobę.</p></div></article>
          <div className="ctms-v9-final-art" aria-hidden="true" />
        </aside>

        <div className="ctms-v9-final-work">
          <label className="ctms-v9-writing">
            <span>Dodatkowy kontekst — opcjonalny</span>
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Dopisz tylko informacje, które mogą realnie zmienić ocenę opisanych zdarzeń."
              rows={9}
              maxLength={9000}
            />
            <div className="ctms-v9-field-meta">
              <span>
                {length === 0
                  ? "Możesz uzupełnić minimum 20 znaków albo pominąć ten etap."
                  : length < MIN_LENGTH
                    ? `Dopisz jeszcze ${MIN_LENGTH - length} znaków albo pomiń etap.`
                    : "Kontekst zostanie uwzględniony w pierwszym odczycie."}
              </span>
              <strong>{length}/9000</strong>
            </div>
          </label>

          <label className="ctms-v9-consent">
            <input type="checkbox" checked={consent} onChange={(event) => onConsent(event.target.checked)} />
            <span>Zgadzam się na przetworzenie podanych treści wyłącznie w celu przygotowania wyniku oraz akceptuję Regulamin i Politykę prywatności.</span>
          </label>

          <div className="ctms-v9-final-actions">
            <PrimaryButton onClick={onSubmit} disabled={!consent || !hasValidText}>Uwzględnij i przygotuj odczyt</PrimaryButton>
            <SecondaryButton onClick={onSkip} disabled={!consent}>Pomiń dodatkowy kontekst</SecondaryButton>
          </div>
        </div>
      </div>
    </Surface>
  );
}
