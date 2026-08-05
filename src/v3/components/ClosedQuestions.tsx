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

  const titleClass =
    question.text.length > 145
      ? "v3-question-title is-long"
      : question.text.length > 100
        ? "v3-question-title is-medium"
        : "v3-question-title";

  return (
    <Surface className="v3-question-shell">
      <header className="v3-question-header">
        <Progress current={index + 1} total={total} label="Pytania zamknięte" />
        <Kicker>{path.title}</Kicker>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          className="v3-question-content"
          key={question.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="v3-question-counter">PYTANIE {String(index + 1).padStart(2, "0")}</div>
          <p className="v3-question-lead">{question.lead}</p>
          <h1 className={titleClass}>{question.text}</h1>

          <div className="v3-answer-list">
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`v3-answer ${selected ? "is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => onAnswer(question.id, option.id, option.score)}
                >
                  <span className="v3-answer-no">{String(optionIndex + 1).padStart(2, "0")}</span>
                  <span className="v3-answer-copy">{option.label}</span>
                  <span className="v3-answer-state" aria-hidden="true">{selected ? "Wybrane" : ""}</span>
                </button>
              );
            })}
          </div>

          <p className="v3-question-help">
            Wybierz odpowiedź opisującą powtarzający się układ, nie pojedynczy najlepszy lub najgorszy dzień.
          </p>
        </motion.div>
      </AnimatePresence>
    </Surface>
  );
}
