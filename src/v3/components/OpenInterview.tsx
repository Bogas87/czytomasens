import React from "react";
import type { EntryConfig } from "../data/paths";
import { PATH_CONTEXT } from "../data/paths";
import type { InterviewExchange } from "../types";
import { Kicker, PrimaryButton, Progress, SecondaryButton, Surface } from "./Layout";

const MIN_LENGTH = 20;

const stepMeta = [
  {
    label: "Konkretne zdarzenie",
    description: "Opisz jedną sytuację tak, aby można było odtworzyć jej kolejność bez dopowiadania intencji.",
  },
  {
    label: "Mechanizm i odpowiedzialność",
    description: "Sprawdźmy, kto wykonuje kolejny ruch i kto ponosi koszt utrzymania kontaktu lub spokoju.",
  },
  {
    label: "Kontrsygnał",
    description: "Poszukaj faktu, który może osłabić Twoje pierwsze wyjaśnienie sytuacji.",
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
  const meta = stepMeta[Math.min(step, 2)];
  const currentQuestion = question || fallbackQuestion(path, step);
  const previous = history[history.length - 1];
  const length = draft.trim().length;
  const canSubmit = length >= MIN_LENGTH;

  return (
    <Surface className="ctms-interview">
      <div className="ctms-interview-header">
        <Progress current={step + 1} total={3} label="Pytania otwarte" />
        <div>
          <Kicker>{meta.label}</Kicker>
          <p>{meta.description}</p>
        </div>
      </div>

      <div className="ctms-interview-content">
        {previous && step > 0 && (
          <aside className="ctms-previous-answer">
            <span>Fragment poprzedniej odpowiedzi</span>
            <p>{previous.answer.length > 260 ? `${previous.answer.slice(0, 259)}…` : previous.answer}</p>
          </aside>
        )}

        {observation && (
          <aside className="ctms-observation">
            <span>Dlaczego pytamy właśnie o to</span>
            <p>{observation}</p>
          </aside>
        )}

        <h1>{currentQuestion}</h1>
        {focus && <p className="ctms-focus">Cel pytania: {focus.replace(/_/g, " ")}</p>}

        <label className="ctms-writing-field">
          <span>Twoja odpowiedź</span>
          <textarea
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder={
              step === 0
                ? "Kiedy to było? Co dokładnie powiedziała lub zrobiła druga osoba? Co zrobiłeś lub zrobiłaś Ty? Co wydarzyło się później?"
                : step === 1
                  ? "Zapisz kolejność działań obu stron i to, kto wrócił do tematu, przeprosił, wyjaśnił albo naprawił sytuację."
                  : "Podaj również fakt, który nie pasuje do Twojej pierwszej wersji albo pokazuje zachowanie drugiej strony w innym świetle."
            }
            rows={8}
            maxLength={5000}
          />
          <div className="ctms-field-meta">
            <span>
              {length === 0
                ? "Minimum 20 znaków albo pomiń pytanie, jeżeli nie masz wystarczających danych."
                : length < MIN_LENGTH
                  ? `Dopisz jeszcze ${MIN_LENGTH - length} znaków albo pomiń pytanie.`
                  : "Odpowiedź ma wystarczającą długość."}
            </span>
            <strong>{length}/5000</strong>
          </div>
        </label>

        <div className="ctms-actions ctms-actions-split">
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
    <Surface className="ctms-stage ctms-final-context">
      <div className="ctms-stage-head">
        <Kicker>KROK 4 Z 4</Kicker>
        <h1>Czy brakuje jeszcze czegoś, co może zmienić znaczenie tej historii?</h1>
        <p>{PATH_CONTEXT[path.key].finalPrompt}</p>
      </div>

      <div className="ctms-context-hints">
        <article><strong>Dodaj</strong><p>ważne wcześniejsze próby naprawy, konkretne zmiany albo okoliczności, które potwierdzają Twój odczyt.</p></article>
        <article><strong>Nie pomijaj</strong><p>własnych błędów i faktów, które uczciwie osłabiają Twoją pierwszą wersję.</p></article>
        <article><strong>Nie wpisuj</strong><p>nazwisk, adresów, numerów telefonu ani danych pozwalających zidentyfikować drugą osobę.</p></article>
      </div>

      <label className="ctms-writing-field">
        <span>Dodatkowy kontekst — opcjonalny</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Dopisz tylko informacje, które mogą realnie zmienić ocenę opisanych zdarzeń."
          rows={9}
          maxLength={9000}
        />
        <div className="ctms-field-meta">
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

      <label className="ctms-consent">
        <input type="checkbox" checked={consent} onChange={(event) => onConsent(event.target.checked)} />
        <span>
          Zgadzam się na przetworzenie podanych treści wyłącznie w celu przygotowania wyniku oraz akceptuję Regulamin i Politykę prywatności.
        </span>
      </label>

      <div className="ctms-actions ctms-actions-split">
        <PrimaryButton onClick={onSubmit} disabled={!consent || !hasValidText}>Uwzględnij kontekst i przygotuj odczyt</PrimaryButton>
        <SecondaryButton onClick={onSkip} disabled={!consent}>Pomiń dodatkowy kontekst</SecondaryButton>
      </div>
    </Surface>
  );
}
