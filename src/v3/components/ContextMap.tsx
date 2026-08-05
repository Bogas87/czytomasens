
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
  asymmetry: ["Gdy przestaję się starać, relacja wyraźnie słabnie.", "Często robię za dwie osoby.", "Nie sprawdziłem/sprawdziłam jeszcze, co zostaje bez mojego wysiłku."],
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
    <div className="v3-toggle-grid">
      {options.map((option, index) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            className={active ? "v3-toggle is-active" : "v3-toggle"}
            onClick={() => {
              if (active) return onChange(selected.filter((item) => item !== option));
              if (selected.length >= limit) return;
              onChange([...selected, option]);
            }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{option}</strong>
            <small>{active ? "wybrane" : ""}</small>
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
    <Surface className="v3-context">
      <div className="v3-section-intro">
        <Kicker>MAPA KONTEKSTU</Kicker>
        <h1>Zanim poprosimy o historię, sprawdźmy, jak rozkłada się ciężar.</h1>
        <p>
          To nie jest scoring. Te wybory pomagają dobrać pytania, które rozstrzygają brakujące informacje.
        </p>
      </div>

      <section className="v3-context-block">
        <div className="v3-context-head">
          <span>01</span>
          <div><h2>Rozkład odpowiedzialności</h2><p>Wybierz po jednej odpowiedzi w każdym wierszu.</p></div>
        </div>
        <div className="v3-force-table">
          {forceItems.map((item) => (
            <div className="v3-force-row" key={item.key}>
              <strong>{item.label}</strong>
              <div>
                {forceOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={value.forceMap[item.key] === option.value ? "is-active" : ""}
                    onClick={() => onChange({
                      ...value,
                      forceMap: { ...value.forceMap, [item.key]: option.value },
                    })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="v3-context-block">
        <div className="v3-context-head">
          <span>02</span>
          <div><h2>Co najbardziej Cię obciąża?</h2><p>Wybierz maksymalnie trzy elementy.</p></div>
        </div>
        <ToggleList
          options={burdensByPath[path]}
          selected={value.burdens}
          limit={3}
          onChange={(burdens) => onChange({ ...value, burdens })}
        />
      </section>

      <section className="v3-context-block">
        <div className="v3-context-head">
          <span>03</span>
          <div><h2>Co najczęściej się w Tobie uruchamia?</h2><p>Wybierz maksymalnie trzy emocje lub stany.</p></div>
        </div>
        <ToggleList
          options={emotionsByPath[path]}
          selected={value.emotions}
          limit={3}
          onChange={(emotions) => onChange({ ...value, emotions })}
        />
      </section>

      <section className="v3-context-block">
        <div className="v3-context-head">
          <span>04</span>
          <div><h2>Zdanie, którego nie chcesz już omijać</h2><p>Wybierz jedno. Raport później sprawdzi także najlepszy kontrargument.</p></div>
        </div>
        <div className="v3-truth-list">
          {truthsByPath[path].map((truth, index) => (
            <button
              type="button"
              key={truth}
              className={value.truth === truth ? "is-active" : ""}
              onClick={() => onChange({ ...value, truth })}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <blockquote>„{truth}”</blockquote>
            </button>
          ))}
        </div>
      </section>

      <PrimaryButton onClick={onContinue} disabled={!complete}>
        Przejdź do konkretnej historii
      </PrimaryButton>
    </Surface>
  );
}
