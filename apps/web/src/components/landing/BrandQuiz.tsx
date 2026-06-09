"use client";

import { useCallback, useState } from "react";
import {
  BRAND_QUIZ_QUESTIONS,
  saveQuizToStorage,
  type QuizAnswers,
  type QuizQuestionId,
} from "@/lib/brand-quiz";

type BrandQuizProps = {
  siteId: string;
  onComplete: (answers: QuizAnswers) => void;
  onSkip: () => void;
};

export function BrandQuiz({ siteId, onComplete, onSkip }: BrandQuizProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitting, setSubmitting] = useState(false);

  const question = BRAND_QUIZ_QUESTIONS[index];
  const total = BRAND_QUIZ_QUESTIONS.length;
  const isLast = index === total - 1;

  const submitAnswers = useCallback(
    async (finalAnswers: QuizAnswers) => {
      setSubmitting(true);
      saveQuizToStorage(siteId, finalAnswers);
      try {
        await fetch("/api/preview/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId, answers: finalAnswers }),
        });
      } catch {
        /* generation will fall back to defaults */
      }
      onComplete(finalAnswers);
    },
    [siteId, onComplete]
  );

  function handlePick(value: string) {
    const next: QuizAnswers = { ...answers, [question.id]: value };
    setAnswers(next);

    if (isLast) {
      void submitAnswers(next);
      return;
    }
    setIndex((i) => i + 1);
  }

  function handleBack() {
    if (index > 0) setIndex((i) => i - 1);
  }

  return (
    <div className="brand-quiz" aria-live="polite">
      <div className="brand-quiz__header">
        <p className="brand-quiz__eyebrow">Quick brand quiz</p>
        <p className="brand-quiz__hint">Tap an answer. We tailor your site whilst it builds</p>
        <div className="brand-quiz__progress" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
          {BRAND_QUIZ_QUESTIONS.map((q, i) => (
            <span
              key={q.id}
              className={`brand-quiz__dot${i < index ? " is-done" : ""}${i === index ? " is-active" : ""}`}
              aria-hidden
            />
          ))}
        </div>
        <span className="brand-quiz__count">
          {index + 1} of {total}
        </span>
      </div>

      <fieldset className="brand-quiz__question" disabled={submitting}>
        <legend className="brand-quiz__legend">{question.question}</legend>
        <div className="brand-quiz__options">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`brand-quiz__option${answers[question.id as QuizQuestionId] === opt.value ? " is-selected" : ""}`}
              onClick={() => handlePick(opt.value)}
              disabled={submitting}
            >
              {opt.emoji && <span className="brand-quiz__emoji" aria-hidden>{opt.emoji}</span>}
              <span className="brand-quiz__label">{opt.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="brand-quiz__footer">
        {index > 0 && (
          <button type="button" className="brand-quiz__back" onClick={handleBack} disabled={submitting}>
            Back
          </button>
        )}
        <button
          type="button"
          className="brand-quiz__skip"
          onClick={() => void submitAnswers({})}
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Skip quiz"}
        </button>
      </div>
    </div>
  );
}
