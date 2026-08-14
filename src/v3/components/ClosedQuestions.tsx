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
    <Surface className="ctms-question ctms-question-prestige">
      <aside className="ctms-question-header">
        <span className="ctms-question-path">ANALIZA PRYWATNA</span>
        <div className="ctms-question-orbit" aria-hidden="true">
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          <span>/ {String(path.questions.length).padStart(2, "0")}</span>
        </div>
        <Progress current={index + 1} total={path.questions.length} label="Pytanie" />
        <div className="ctms-question-rail-copy">
          <span>Wybrany obszar</span>
          <p>{path.title}</p>
        </div>
        <div className="ctms-question-private-note">
          <span aria-hidden="true">◇</span>
          <div>
            <strong>Twoje odpowiedzi pozostają prywatne.</strong>
            <p>Wybierz to, co najlepiej opisuje powtarzający się układ, a nie pojedynczy dzień.</p>
          </div>
        </div>
      </aside>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          className="ctms-question-content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <div className="ctms-question-copy">
            <p className="ctms-question-lead">{question.lead}</p>
            <h1>{question.text}</h1>
            <p className="ctms-question-helper">Nie szukaj idealnej odpowiedzi. Wybierz tę, która najczęściej pasuje do Twojego doświadczenia.</p>
          </div>

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
                  <span className="ctms-answer-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>

          <p className="ctms-question-note">Wybór zapisuje się automatycznie. Możesz wrócić do poprzedniego pytania.</p>
        </motion.div>
      </AnimatePresence>
    </Surface>
  );
}
