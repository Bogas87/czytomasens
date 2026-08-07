import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EntryConfig } from "../data/paths";
import type { AnswerMap } from "../types";
import { Progress, Surface } from "./Layout";

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

  return (
    <Surface className="ctms-question">
      <aside className="ctms-question-header">
        <span className="ctms-question-path">ANALIZA RELACJI</span>
        <strong className="ctms-question-stage-number">{String(index + 1).padStart(2, "0")}</strong>
        <Progress current={index + 1} total={path.questions.length} label="Pytanie" />
        <div className="ctms-question-rail-copy">
          <span>Wybrana ścieżka</span>
          <p>{path.title}</p>
        </div>
        <div className="ctms-question-rail-note">
          <strong>Nie ma dobrych ani złych odpowiedzi.</strong>
          <p>Wybierz to, co najlepiej opisuje powtarzający się układ — nie pojedynczy dzień.</p>
        </div>
      </aside>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          className="ctms-question-content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <p className="ctms-question-lead">{question.lead}</p>
          <h1>{question.text}</h1>

          <div className="ctms-answer-list">
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={selected ? "is-selected" : ""}
                  aria-pressed={selected}
                  onClick={() => onAnswer(question.id, option.id, option.score)}
                >
                  <span className="ctms-answer-index">{String(optionIndex + 1).padStart(2, "0")}</span>
                  <strong>{option.label}</strong>
                  <span className="ctms-answer-check" aria-hidden="true">{selected ? "✓" : "→"}</span>
                </button>
              );
            })}
          </div>

          <p className="ctms-question-note">Wybierz odpowiedź, aby przejść dalej.</p>
        </motion.div>
      </AnimatePresence>
    </Surface>
  );
}
