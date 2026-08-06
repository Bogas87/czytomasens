import React from "react";
import { motion } from "framer-motion";
import type { EntryConfig, EntryKey } from "../data/paths";
import { Kicker, Surface } from "./Layout";

const pathLabels: Record<EntryKey, string> = {
  unease: "NIEPOKÓJ", betrayal: "ZAUFANIE", uncertain: "NIEJASNOŚĆ", asymmetry: "NIERÓWNOWAGA",
  conflict: "KONFLIKT", stagnation: "STAGNACJA", returning: "POWRÓT", triangle: "TRZECIA OSOBA", loop: "POWTARZAJĄCY SIĘ CYKL",
};

export function PathSelection({ paths, onSelect }: { paths: EntryConfig[]; onSelect: (key: EntryKey) => void }) {
  return (
    <Surface className="ctms-paths">
      <header className="ctms-stage-head">
        <div>
          <Kicker>WYBIERZ PUNKT WEJŚCIA</Kicker>
          <h1>Co sprawiło, że właśnie dzisiaj chcesz przyjrzeć się tej relacji?</h1>
          <p>Wybierz sytuację najbliższą temu, co przeżywasz. Jedno kliknięcie prowadzi od razu do pytań.</p>
        </div>
        <span>01 / 06</span>
      </header>

      <div className="ctms-path-grid">
        {paths.map((path, index) => (
          <motion.button
            key={path.key}
            type="button"
            className="ctms-path-card"
            onClick={() => onSelect(path.key)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.025, 0.18) }}
          >
            <span className="ctms-path-no">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <span className="ctms-path-type">{pathLabels[path.key]}</span>
              <strong>{path.title}</strong>
              <p>{path.subtitle}</p>
            </div>
            <span className="ctms-path-arrow" aria-hidden="true">→</span>
          </motion.button>
        ))}
      </div>
      <p className="ctms-stage-note">Nie musisz znaleźć idealnej kategorii. Dalsze pytania doprecyzują kierunek.</p>
    </Surface>
  );
}
