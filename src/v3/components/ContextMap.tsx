import React from "react";
import type { EntryKey } from "../data/paths";
import type { ForceValue, RelationshipContext } from "../types";
import { Kicker, PrimaryButton, Surface } from "./Layout";

const forceItems = [
  { key: "initiative", label: "Kto częściej inicjuje kontakt lub ważną rozmowę?" },
  { key: "repair", label: "Kto częściej wraca po konflikcie i próbuje naprawić sytuację?" },
  { key: "emotionalLabor", label: "Kto częściej pilnuje atmosfery i emocji obu stron?" },
  { key: "clarity", label: "Kto częściej domaga się jasności i konkretu?" },
];

const forceOptions: Array<{ value: ForceValue; label: string }> = [
  { value: "definitely_me", label: "zdecydowanie ja" },
  { value: "mostly_me", label: "częściej ja" },
  { value: "balanced", label: "podobnie" },
  { value: "mostly_other", label: "częściej druga osoba" },
  { value: "definitely_other", label: "zdecydowanie druga osoba" },
];

const burdensByPath: Record<EntryKey, string[]> = {
  unease: ["ciągłe analizowanie", "brak jasności", "czujność", "lęk przed kolejnym sygnałem", "przejmowanie odpowiedzialności", "trudność z odpuszczeniem"],
  betrayal: ["brak zaufania", "monitorowanie", "obrazy z przeszłości", "kontrolowanie", "odbudowa za dwie osoby", "lęk przed powtórką"],
  uncertain: ["czekanie", "niejasne deklaracje", "dopowiadanie znaczeń", "brak decyzji", "nierówny kontakt", "lęk przed utratą"],
  asymmetry: ["inicjowanie wszystkiego", "naprawianie atmosfery", "brak wzajemności", "zmęczenie", "poczucie niewidzialności", "odpowiedzialność za relację"],
  conflict: ["nawracające kłótnie", "unikanie tematu", "chodzenie na palcach", "brak domknięcia", "eskalacja", "samokontrola"],
  stagnation: ["samotność obok siebie", "rutyna", "brak bliskości", "brak wspólnego kierunku", "obowiązki zamiast więzi", "rezygnacja"],
  returning: ["idealizowanie przeszłości", "lęk przed kolejnym rozpadem", "brak dowodów zmiany", "tęsknota", "powrót starego schematu", "presja decyzji"],
  triangle: ["porównywanie", "zazdrość", "ukrywanie", "brak lojalności", "niezaspokojone potrzeby", "chaos decyzyjny"],
  loop: ["ulga po powrocie", "powtarzalność", "utrata granic", "lęk przed samotnością", "kolejne obietnice", "wyczerpanie cyklem"],
};

const emotionsByPath: Record<EntryKey, string[]> = {
  unease: ["niepokój", "czujność", "smutek", "złość", "wstyd", "nadzieja"],
  betrayal: ["lęk", "złość", "upokorzenie", "wstyd", "tęsknota", "nieufność"],
  uncertain: ["niepewność", "nadzieja", "frustracja", "lęk", "samotność", "zawieszenie"],
  asymmetry: ["zmęczenie", "żal", "złość", "poczucie winy", "samotność", "nadzieja"],
  conflict: ["złość", "lęk", "bezsilność", "wstyd", "ulga po ciszy", "napięcie"],
  stagnation: ["pustka", "smutek", "obojętność", "tęsknota", "rezygnacja", "lęk przed zmianą"],
  returning: ["tęsknota", "euforia", "nieufność", "lęk", "nadzieja", "wstyd"],
  triangle: ["zazdrość", "podniecenie", "wina", "lęk", "złość", "zagubienie"],
  loop: ["ulga", "lęk", "głód bliskości", "złość", "wyczerpanie", "nadzieja"],
};

const truthsByPath: Record<EntryKey, string[]> = {
  unease: ["Czuję więcej napięcia niż spokoju.", "Nie mam jeszcze dość faktów.", "Boję się odpowiedzi, którą już częściowo znam."],
  betrayal: ["Przeprosiny nie odbudowały jeszcze zaufania.", "To ja częściej pilnuję odbudowy.", "Nie wiem, czy potrafię uwierzyć w zmianę."],
  uncertain: ["Niejasność stała się sposobem funkcjonowania.", "Czekam na decyzję, której druga osoba nie podejmuje.", "Być może nadaję pojedynczym sygnałom zbyt dużą wagę."],
  asymmetry: ["Gdy przestaję się starać, relacja wyraźnie słabnie.", "Często robię za dwie osoby.", "Nie sprawdziłem lub nie sprawdziłam jeszcze, co zostaje bez mojego wysiłku."],
  conflict: ["Po rozmowie wraca spokój, ale nie zawsze zmiana.", "Boję się kolejnego konfliktu bardziej niż niewyjaśnionego problemu.", "Oboje możemy dokładać coś do tego mechanizmu."],
  stagnation: ["Historia i obowiązki nie są tym samym co bliskość.", "Nie wiem, czy jeszcze wybieramy siebie.", "Dobre momenty istnieją, ale nie wiem, czy tworzą kierunek."],
  returning: ["Tęsknota nie jest dowodem zmiany.", "Wciąż porównuję teraźniejszość z najlepszym wspomnieniem.", "Nie wiem, co dziś naprawdę jest inne."],
  triangle: ["Trzecia osoba mogła odsłonić problem, którego nie stworzyła.", "Nie wszystkie intencje są mi znane.", "Muszę oddzielić fakty od porównań i wyobrażeń."],
  loop: ["Ulga po powrocie nie jest jeszcze naprawą.", "Granica przesuwa się po każdym kolejnym cyklu.", "Wiem, w którym momencie zwykle rezygnuję z własnego kryterium."],
};

function ToggleList({
  options,
  selected,
  limit,
  onChange,
}: {
  options: string[];
  selected: string[];
  limit: number;
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="ctms-choice-grid">
      {options.map((option) => {
        const active = selected.includes(option);
        const blocked = !active && selected.length >= limit;
        return (
          <button
            key={option}
            type="button"
            className={active ? "is-selected" : ""}
            aria-pressed={active}
            aria-disabled={blocked}
            onClick={() => {
              if (active) return onChange(selected.filter((item) => item !== option));
              if (blocked) return;
              onChange([...selected, option]);
            }}
          >
            <span>{active ? "✓" : ""}</span>
            <strong>{option}</strong>
          </button>
        );
      })}
    </div>
  );
}

export function ContextMap({
  path,
  value,
  onChange,
  onContinue,
}: {
  path: EntryKey;
  value: RelationshipContext;
  onChange: (value: RelationshipContext) => void;
  onContinue: () => void;
}) {
  const forceComplete = forceItems.every((item) => value.forceMap[item.key]);
  const complete = forceComplete && value.burdens.length >= 1 && value.emotions.length >= 1 && Boolean(value.truth);

  return (
    <Surface className="ctms-stage ctms-context">
      <div className="ctms-stage-head">
        <Kicker>KROK 3 Z 4</Kicker>
        <h1>Jak rozkłada się ciężar tej relacji?</h1>
        <p>Te odpowiedzi nie tworzą punktacji. Pomagają odróżnić sam problem od kosztu jego ciągłego podtrzymywania.</p>
      </div>

      <div className="ctms-context-stack">
        <section className="ctms-context-block">
          <div className="ctms-block-head">
            <span>01</span>
            <div>
              <h2>Rozkład odpowiedzialności</h2>
              <p>Wybierz jedną odpowiedź w każdym wierszu.</p>
            </div>
          </div>
          <div className="ctms-force-list">
            {forceItems.map((item) => (
              <div className="ctms-force-row" key={item.key}>
                <strong>{item.label}</strong>
                <div className="ctms-force-options">
                  {forceOptions.map((option) => {
                    const active = value.forceMap[item.key] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={active ? "is-selected" : ""}
                        aria-pressed={active}
                        onClick={() => onChange({
                          ...value,
                          forceMap: { ...value.forceMap, [item.key]: option.value },
                        })}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="ctms-context-columns">
          <section className="ctms-context-block">
            <div className="ctms-block-head">
              <span>02</span>
              <div><h2>Co najbardziej Cię obciąża?</h2><p>Wybierz maksymalnie trzy elementy.</p></div>
            </div>
            <ToggleList options={burdensByPath[path]} selected={value.burdens} limit={3} onChange={(burdens) => onChange({ ...value, burdens })} />
          </section>

          <section className="ctms-context-block">
            <div className="ctms-block-head">
              <span>03</span>
              <div><h2>Co najczęściej się w Tobie uruchamia?</h2><p>Wybierz maksymalnie trzy stany.</p></div>
            </div>
            <ToggleList options={emotionsByPath[path]} selected={value.emotions} limit={3} onChange={(emotions) => onChange({ ...value, emotions })} />
          </section>
        </div>

        <section className="ctms-context-block">
          <div className="ctms-block-head">
            <span>04</span>
            <div><h2>Zdanie, którego nie chcesz już omijać</h2><p>Wybierz jedno. Raport sprawdzi również najmocniejszy kontrargument.</p></div>
          </div>
          <div className="ctms-truth-list">
            {truthsByPath[path].map((truth) => {
              const active = value.truth === truth;
              return (
                <button
                  type="button"
                  key={truth}
                  className={active ? "is-selected" : ""}
                  aria-pressed={active}
                  onClick={() => onChange({ ...value, truth })}
                >
                  <span>{active ? "✓" : ""}</span>
                  <strong>„{truth}”</strong>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="ctms-actions">
        <PrimaryButton onClick={onContinue} disabled={!complete}>Przejdź do konkretnej historii</PrimaryButton>
      </div>
    </Surface>
  );
}
