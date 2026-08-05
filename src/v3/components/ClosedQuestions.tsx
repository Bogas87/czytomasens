
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EntryConfig } from "../data/paths";
import type { AnswerMap } from "../types";
import { Kicker, Progress, Surface } from "./Layout";

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
  const total = path.questions.length;
  if (!question) return null;

  return (
    <Surface className="v3-question-shell">
      <aside className="v3-question-aside">
        <Progress current={index + 1} total={total} label="Pytania zamknięte" />
        <Kicker>{path.title}</Kicker>
        <span className="v3-question-big-no">{String(index + 1).padStart(2, "0")}</span>
        <p>
          Nie szukaj odpowiedzi idealnej. Wybierz tę, która najlepiej opisuje powtarzający się układ,
          a nie najlepszy lub najgorszy dzień.
        </p>
      </aside>

      <div className="v3-question-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.24 }}
          >
            <p className="v3-question-lead">{question.lead}</p>
            <h1 className={question.text.length > 150 ? "v3-question-title v3-question-title-long" : "v3-question-title"}>
              {question.text}
            </h1>

            <div className="v3-answer-list">
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`v3-answer ${selected ? "is-selected" : ""}`}
                    onClick={() => onAnswer(question.id, option.id, option.score)}
                  >
                    <span className="v3-answer-no">{String(optionIndex + 1).padStart(2, "0")}</span>
                    <span className="v3-answer-copy">{option.label}</span>
                    <span className="v3-answer-state" aria-hidden="true">{selected ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Surface>
  );
}
