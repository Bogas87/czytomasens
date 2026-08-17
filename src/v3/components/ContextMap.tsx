import React from "react";
import type { EntryKey } from "../data/paths";
import type { ForceValue, RelationshipContext } from "../types";
import { Kicker, PrimaryButton, SecondaryButton, Surface } from "./Layout";

const forceItems = [
  { key: "initiative", label: "Kto częściej inicjuje kontakt lub ważną rozmowę?" },
  { key: "repair", label: "Kto częściej wraca po konflikcie i próbuje domknąć temat?" },
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

const stepMeta = [
  { index: "01", title: "Rozkład odpowiedzialności", label: "KTO WYKONUJE RUCH", note: "Zobacz proporcje bez robienia z nich wyniku." },
  { index: "02", title: "Koszt relacji", label: "CO ZABIERA ENERGIĘ", note: "Wybierz maksymalnie trzy rzeczy, które naprawdę wracają." },
  { index: "03", title: "To, co uruchamia się w Tobie", label: "CO DZIEJE SIĘ W ŚRODKU", note: "Nazwij stany, nie ocenę siebie." },
  { index: "04", title: "Zdanie, którego nie chcesz już omijać", label: "NAJMOCNIEJSZA TEZA", note: "Raport sprawdzi również kontrargument." },
];

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
    <div className="ctms-v9-choice-grid">
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
            <span className="ctms-v9-choice-number">{String(index + 1).padStart(2, "0")}</span>
            <strong>{option}</strong>
            <span className="ctms-v9-choice-mark">{active ? "✓" : ""}</span>
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
  const [step, setStep] = React.useState(0);
  const forceComplete = forceItems.every((item) => value.forceMap[item.key]);
  const complete = forceComplete && value.burdens.length >= 1 && value.emotions.length >= 1 && Boolean(value.truth);
  const canAdvance = [forceComplete, value.burdens.length >= 1, value.emotions.length >= 1, Boolean(value.truth)][step];

  const next = () => {
    if (!canAdvance) return;
    if (step < 3) setStep((current) => current + 1);
    else if (complete) onContinue();
  };

  const prev = () => setStep((current) => Math.max(0, current - 1));

  return (
    <Surface className="ctms-stage ctms-context-flow ctms-v9-context">
      <div className="ctms-v9-context-top">
        <div>
          <Kicker>MAPA RELACJI · KROK 3 Z 4</Kicker>
          <p>Nie tworzymy punktacji. Zbieramy proporcje, koszt i to, co powtarza się w Twoim doświadczeniu.</p>
        </div>
        <div className="ctms-v9-context-counter">{String(step + 1).padStart(2, "0")} <span>/ 04</span></div>
      </div>
      <div className="ctms-v9-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>

      <div className="ctms-v9-context-layout">
        <aside className="ctms-v9-context-side">
          <span className="ctms-v9-context-index">{stepMeta[step].index}</span>
          <Kicker>{stepMeta[step].label}</Kicker>
          <h1>{stepMeta[step].title}</h1>
          <p>{stepMeta[step].note}</p>

          <div className="ctms-v9-side-divider" />
          <div className="ctms-v9-context-principle">
            <strong>Co tu sprawdzamy?</strong>
            <p>
              Nie to, kto ma rację. Interesuje nas rozkład wysiłku, powtarzalność i to,
              czy pojedyncze emocje układają się w stabilny mechanizm.
            </p>
          </div>
          <div className="ctms-v9-context-art" aria-hidden="true" />
        </aside>

        <div className="ctms-v9-context-main">
          {step === 0 && (
            <div className="ctms-v9-force-list">
              {forceItems.map((item, itemIndex) => (
                <article key={item.key} className="ctms-v9-force-row">
                  <div className="ctms-v9-force-question">
                    <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                    <strong>{item.label}</strong>
                  </div>
                  <div className="ctms-v9-force-scale" role="group" aria-label={item.label}>
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
                          <i />
                          <span>{option.short}</span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="ctms-v9-workspace-heading">
                <strong>Co najbardziej obciąża tę relację?</strong>
                <span>{value.burdens.length}/3 wybrane</span>
              </div>
              <ChoiceGrid options={burdensByPath[path]} selected={value.burdens} limit={3} onChange={(burdens) => onChange({ ...value, burdens })} />
            </>
          )}

          {step === 2 && (
            <>
              <div className="ctms-v9-workspace-heading">
                <strong>Co najczęściej pojawia się w Tobie?</strong>
                <span>{value.emotions.length}/3 wybrane</span>
              </div>
              <ChoiceGrid options={emotionsByPath[path]} selected={value.emotions} limit={3} onChange={(emotions) => onChange({ ...value, emotions })} />
            </>
          )}

          {step === 3 && (
            <>
              <div className="ctms-v9-workspace-heading">
                <strong>Które zdanie jest dziś najbliżej tego, czego nie chcesz już omijać?</strong>
                <span>wybierz jedno</span>
              </div>
              <div className="ctms-v9-truth-list">
                {truthsByPath[path].map((truth, index) => {
                  const active = value.truth === truth;
                  return (
                    <button
                      key={truth}
                      type="button"
                      className={active ? "is-selected" : ""}
                      onClick={() => onChange({ ...value, truth })}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{truth}</strong>
                      <i>{active ? "✓" : ""}</i>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="ctms-v9-context-actions">
            <SecondaryButton onClick={prev} disabled={step === 0}>Wstecz</SecondaryButton>
            <div className="ctms-v9-context-stepdots">
              {[0, 1, 2, 3].map((dot) => <i key={dot} className={dot <= step ? "is-active" : ""} />)}
            </div>
            <PrimaryButton onClick={next} disabled={!canAdvance}>
              {step < 3 ? "Dalej" : "Przejdź do konkretnej historii"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Surface>
  );
}
