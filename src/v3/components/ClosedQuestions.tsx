import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EntryConfig } from "../data/paths";
import type { AnswerMap } from "../types";
import { Progress, Surface } from "./Layout";

export function ClosedQuestions({ path, index, answers, onAnswer }: {
  path: EntryConfig; index: number; answers: AnswerMap;
  onAnswer: (questionId: string, optionId: string, score: number) => void;
}) {
  const question = path.questions[index];
  const total = path.questions.length;
  if (!question) return null;

  const titleClass = question.text.length > 145 ? "is-long" : question.text.length > 100 ? "is-medium" : "";

  return (
    <Surface className="ctms-question">
      <header className="ctms-question-top">
        <Progress current={index + 1} total={total} label="Pytania zamknięte" />
        <span>{path.title}</span>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          className="ctms-question-body"
          key={question.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <div className="ctms-question-meta">
            <span>PYTANIE {String(index + 1).padStart(2, "0")}</span>
            <p>{question.lead}</p>
          </div>
          <h1 className={titleClass}>{question.text}</h1>

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
                  <span>{String(optionIndex + 1).padStart(2, "0")}</span>
                  <strong>{option.label}</strong>
                  <i aria-hidden="true">{selected ? "✓" : ""}</i>
                </button>
              );
            })}
          </div>
          <p className="ctms-question-note">Wybierz odpowiedź opisującą powtarzający się układ, a nie pojedynczy dzień.</p>
        </motion.div>
      </AnimatePresence>
    </Surface>
  );
}
