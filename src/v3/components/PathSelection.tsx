
import React from "react";
import { motion } from "framer-motion";
import type { EntryConfig, EntryKey } from "../data/paths";
import { Kicker, Surface } from "./Layout";

const pathLabels: Record<EntryKey, string> = {
  unease: "NIEPOKÓJ",
  betrayal: "ZAUFANIE",
  uncertain: "NIEJASNOŚĆ",
  asymmetry: "NIERÓWNOWAGA",
  conflict: "KONFLIKT",
  stagnation: "STAGNACJA",
  returning: "POWRÓT",
  triangle: "TRZECIA OSOBA",
  loop: "POWTARZAJĄCY SIĘ CYKL",
};

export function PathSelection({
  paths,
  onSelect,
}: {
  paths: EntryConfig[];
  onSelect: (key: EntryKey) => void;
}) {
  return (
    <Surface className="v3-paths">
      <div className="v3-section-intro">
        <Kicker>WYBIERZ PUNKT WEJŚCIA</Kicker>
        <h1>Co sprawiło, że właśnie dzisiaj otworzyłeś tę analizę?</h1>
        <p>
          Nie wybierasz diagnozy. Wybierasz miejsce, od którego zaczniemy porządkować fakty.
          Jedno dotknięcie prowadzi od razu dalej.
        </p>
      </div>
      <div className="v3-path-grid">
        {paths.map((path, index) => (
          <motion.button
            key={path.key}
            type="button"
            className="v3-path-card"
            onClick={() => onSelect(path.key)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.035, 0.25) }}
          >
            <span className="v3-path-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="v3-path-type">{pathLabels[path.key]}</span>
            <strong>{path.title}</strong>
            <p>{path.subtitle}</p>
            <span className="v3-path-go" aria-hidden="true">→</span>
          </motion.button>
        ))}
      </div>
      <div className="v3-path-note">
        <strong>Nie widzisz idealnej ścieżki?</strong>
        <span>Wybierz tę, która jest najbliżej. Pytania później skorygują kierunek na podstawie Twoich odpowiedzi.</span>
      </div>
    </Surface>
  );
}
