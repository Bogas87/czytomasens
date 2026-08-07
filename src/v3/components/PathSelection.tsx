import React from "react";
import type { EntryConfig, EntryKey } from "../data/paths";
import { Kicker, Surface } from "./Layout";

const labels: Record<EntryKey, string> = {
  unease: "Niepokój",
  betrayal: "Zaufanie",
  uncertain: "Niejasność",
  asymmetry: "Nierównowaga",
  conflict: "Konflikt",
  stagnation: "Oddalenie",
  returning: "Powrót",
  triangle: "Trzecia osoba",
  loop: "Powtarzający się cykl",
};

export function PathSelection({
  paths,
  onSelect,
}: {
  paths: EntryConfig[];
  onSelect: (key: EntryKey) => void;
}) {
  return (
    <Surface className="ctms-stage ctms-path-stage">
      <div className="ctms-stage-head ctms-path-head">
        <Kicker>WYBÓR ŚCIEŻKI</Kicker>
        <h1>Wybierz to, co dziś najbardziej prosi się o nazwanie.</h1>
        <p>
          Nie wybierasz diagnozy. Wybierasz punkt wejścia. Każda ścieżka prowadzi do innego zestawu pytań,
          a odpowiedzi później korygują pierwsze założenie.
        </p>
      </div>

      <div className="ctms-path-grid">
        {paths.map((path, index) => (
          <button
            key={path.key}
            type="button"
            className="ctms-path-card"
            onClick={() => onSelect(path.key)}
          >
            <span className="ctms-path-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="ctms-path-copy">
              <small>{labels[path.key]}</small>
              <strong>{path.title}</strong>
              <span>{path.subtitle}</span>
            </span>
            <span className="ctms-path-arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </div>

      <p className="ctms-stage-note">
        Nie musisz mieć pewności. Wybierz ścieżkę najbliższą temu, co teraz czujesz i obserwujesz.
      </p>
    </Surface>
  );
}
