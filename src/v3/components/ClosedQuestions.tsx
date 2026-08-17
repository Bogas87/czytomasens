import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EntryConfig } from "../data/paths";
import type { AnswerMap } from "../types";
import { Progress, Surface } from "./Layout";

const stageLabels = [
  "Wasza dynamika",
  "Komunikacja",
  "Bliskość i potrzeby",
  "Wyzwania",
  "Kontekst i przyszłość",
];

export function ClosedQuestions({
  path,
  index,
  answers,
  onAnswer,
}: {
  path: EntryConfig;
  index: number;
  answers: AnswerMap;
  onAnswer: (questionId: string, optionId: string, score: number) => void;
}) {
  const question = path.questions[index];
  if (!question) return null;
  const total = path.questions.length;
  const activeStage = Math.min(stageLabels.length - 1, Math.floor((index / Math.max(total, 1)) * stageLabels.length));

  return (
    <Surface className="ctms-question ctms-v7-question">
      <aside className="ctms-v7-question-rail">
        <span className="ctms-v7-rail-label">TWÓJ PROCES ZROZUMIENIA</span>
        <div className="ctms-v7-counter"><strong>{String(index + 1).padStart(2, "0")}</strong><span>/ {String(total).padStart(2, "0")}</span></div>
        <Progress current={index + 1} total={total} label="Pytanie" />
        <p>Na podstawie Twoich odpowiedzi powstaje dopasowana analiza.</p>

        <div className="ctms-v7-stage-list">
          {stageLabels.map((label, i) => (
            <div key={label} className={i === activeStage ? "is-active" : i < activeStage ? "is-done" : ""}>
              <b>{String(i + 2).padStart(2, "0")}</b><span>{label}</span>
            </div>
          ))}
        </div>

        <div className="ctms-v7-private">
          <b>▣</b>
          <div>
            <strong>Twoje surowe odpowiedzi pozostają prywatne</strong>
            <p>Odpowiadasz tylko Ty. Szczegóły nie są udostępniane innym osobom.</p>
          </div>
        </div>

        <div className="ctms-v7-rail-art" aria-hidden="true" />
      </aside>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          className="ctms-v7-question-main"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <div className="ctms-v7-question-image" aria-hidden="true" />

          <div className="ctms-v7-question-copy">
            <span className="ctms-v7-question-kicker">{question.lead || stageLabels[activeStage]}</span>
            <h1>{question.text}</h1>
            <p>Wybierz to, co jest najbliższe Twojemu doświadczeniu z ostatnich tygodni.</p>
          </div>

          <div className="ctms-v7-answer-list">
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === option.id;
              const icon = ["☼","⚖","☁","ϟ","?"][optionIndex % 5];
              return (
                <button
                  key={option.id}
                  type="button"
                  className={selected ? "is-selected" : ""}
                  aria-pressed={selected}
                  onClick={() => onAnswer(question.id, option.id, option.score)}
                >
                  <span className="ctms-v7-answer-icon">{icon}</span>
                  <strong>{option.label}</strong>
                  <span className="ctms-v7-answer-radio">{selected ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>

          <div className="ctms-v7-question-foot">
            <span>▣ Możesz wrócić do poprzednich odpowiedzi w każdej chwili.</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </Surface>
  );
}
