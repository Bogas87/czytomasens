import React from "react";
import type { EntryKey } from "../data/paths";
import type { ForceValue, RelationshipContext } from "../types";
import { Kicker, PrimaryButton, SecondaryButton, Surface } from "./Layout";

const forceItems = [
  { key: "initiative", label: "Kto częściej inicjuje kontakt lub ważną rozmowę?" },
  { key: "repair", label: "Kto częściej wraca po konflikcie i próbuje naprawić sytuację?" },
  { key: "emotionalLabor", label: "Kto częściej pilnuje atmosfery i emocji obu stron?" },
  { key: "clarity", label: "Kto częściej domaga się jasności i konkretu?" },
];

const forceOptions: Array<{ value: ForceValue; label: string; short: string }> = [
  { value: "definitely_me", label: "zdecydowanie ja", short: "ja" },
  { value: "mostly_me", label: "częściej ja", short: "raczej ja" },
  { value: "balanced", label: "podobnie", short: "podobnie" },
  { value: "mostly_other", label: "częściej druga osoba", short: "raczej druga osoba" },
  { value: "definitely_other", label: "zdecydowanie druga osoba", short: "druga osoba" },
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

function ChoiceGrid({
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
      {options.map((option, index) => {
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
            <span>{active ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <strong>{option}</strong>
          </button>
        );
      })}
    </div>
  );
}

const steps = [
  { title: "Rozkład odpowiedzialności", subtitle: "Zobacz, kto częściej uruchamia i podtrzymuje ważne procesy w relacji." },
  { title: "Koszt relacji", subtitle: "Wybierz maksymalnie trzy rzeczy, które zabierają Ci najwięcej energii." },
  { title: "To, co uruchamia się w Tobie", subtitle: "Nazwij maksymalnie trzy stany, które najczęściej towarzyszą tej sytuacji." },
  { title: "Zdanie, którego nie chcesz już omijać", subtitle: "Wybierz jedno. Raport sprawdzi również najmocniejszy kontrargument." },
];

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
  const [step, setStep] = React.useState(0);
  const forceComplete = forceItems.every((item) => value.forceMap[item.key]);
  const complete = forceComplete && value.burdens.length >= 1 && value.emotions.length >= 1 && Boolean(value.truth);
  const canAdvance = [forceComplete, value.burdens.length >= 1, value.emotions.length >= 1, Boolean(value.truth)][step];

  const next = () => {
    if (!canAdvance) return;
    if (step < 3) setStep((current) => current + 1);
    else if (complete) onContinue();
  };

  return (
    <Surface className="ctms-stage ctms-context ctms-context-flow">
      <div className="ctms-context-progress" aria-label={`Mapa relacji: etap ${step + 1} z 4`}>
        <div>
          <Kicker>MAPA RELACJI · KROK 3 Z 4</Kicker>
          <span>{String(step + 1).padStart(2, "0")} / 04</span>
        </div>
        <div className="ctms-context-progress-track"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      </div>

      <div className="ctms-context-frame">
        <aside className="ctms-context-intro">
          <span className="ctms-context-step-index">{String(step + 1).padStart(2, "0")}</span>
          <h1>{steps[step].title}</h1>
          <p>{steps[step].subtitle}</p>
          <div className="ctms-context-quiet-note">
            <strong>Nie tworzymy punktacji.</strong>
            <span>Tu chodzi o proporcje, koszt i to, co faktycznie wraca — nie o ocenę Ciebie ani drugiej osoby.</span>
          </div>
        </aside>

        <div className="ctms-context-workspace">
          {step === 0 && (
            <div className="ctms-force-list ctms-force-list-premium">
              {forceItems.map((item, itemIndex) => (
                <div className="ctms-force-row" key={item.key}>
                  <div className="ctms-force-question">
                    <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                    <strong>{item.label}</strong>
                  </div>
                  <div className="ctms-force-options" role="group" aria-label={item.label}>
                    {forceOptions.map((option) => {
                      const active = value.forceMap[item.key] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          title={option.label}
                          className={active ? "is-selected" : ""}
                          aria-pressed={active}
                          onClick={() => onChange({
                            ...value,
                            forceMap: { ...value.forceMap, [item.key]: option.value },
                          })}
                        >
                          <span className="ctms-scale-dot" aria-hidden="true" />
                          <small>{option.short}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <ChoiceGrid
              options={burdensByPath[path]}
              selected={value.burdens}
              limit={3}
              onChange={(burdens) => onChange({ ...value, burdens })}
            />
          )}

          {step === 2 && (
            <ChoiceGrid
              options={emotionsByPath[path]}
              selected={value.emotions}
              limit={3}
              onChange={(emotions) => onChange({ ...value, emotions })}
            />
          )}

          {step === 3 && (
            <div className="ctms-truth-list">
              {truthsByPath[path].map((truth, index) => {
                const active = value.truth === truth;
                return (
                  <button
                    type="button"
                    key={truth}
                    className={active ? "is-selected" : ""}
                    aria-pressed={active}
                    onClick={() => onChange({ ...value, truth })}
                  >
                    <span>{active ? "✓" : String(index + 1).padStart(2, "0")}</span>
                    <strong>„{truth}”</strong>
                  </button>
                );
              })}
            </div>
          )}

          <div className="ctms-context-actions">
            {step > 0 ? <SecondaryButton onClick={() => setStep((current) => Math.max(0, current - 1))}>Wstecz</SecondaryButton> : <span />}
            <PrimaryButton onClick={next} disabled={!canAdvance}>
              {step < 3 ? "Dalej" : "Przejdź do konkretnej historii"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Surface>
  );
}
