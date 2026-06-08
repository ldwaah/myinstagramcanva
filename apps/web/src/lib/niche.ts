import type { Niche } from "@mic/db";
import { nicheFromQuizAnswers, layoutHintFromQuiz, type QuizAnswers } from "@mic/generator";

export { nicheFromQuizAnswers, layoutHintFromQuiz };
export type { QuizAnswers };

const BIO_NICHE_PATTERNS: Array<{ pattern: RegExp; niche: Niche; hint: string }> = [
  { pattern: /\b(photographer|photography|portrait|wedding photo)\b/i, niche: "PHOTOGRAPHER", hint: "photographer" },
  { pattern: /\b(musician|singer|artist|band|producer|dj)\b/i, niche: "MUSICIAN", hint: "musician" },
  { pattern: /\b(coach|coaching|mentor|mindset)\b/i, niche: "COACH", hint: "coach" },
  { pattern: /\b(trainer|fitness|gym|hyrox|workout)\b/i, niche: "TRAINER", hint: "fitness" },
  { pattern: /\b(influencer|creator|content creator|ugc)\b/i, niche: "INFLUENCER", hint: "influencer" },
  { pattern: /\b(chef|food|recipe|baker|restaurant)\b/i, niche: "OTHER", hint: "food" },
  { pattern: /\b(fashion|beauty|stylist|model)\b/i, niche: "OTHER", hint: "fashion" },
  { pattern: /\b(consultant|agency|business|founder|ceo)\b/i, niche: "OTHER", hint: "business" },
];

/** Combine quiz answers with Instagram bio keywords to pick niche + layout hint. */
export function classifyNiche(
  quizAnswers: QuizAnswers | Record<string, string> | null | undefined,
  biography?: string | null
): { niche: Niche; layoutHint: string } {
  const answers = (quizAnswers ?? {}) as QuizAnswers;
  const fromQuiz = nicheFromQuizAnswers(answers);
  const layoutHint =
    (quizAnswers as Record<string, string> | null | undefined)?.layoutHint ??
    layoutHintFromQuiz(answers);

  if (answers.brandType && fromQuiz !== "OTHER") {
    return { niche: fromQuiz as Niche, layoutHint };
  }

  const bio = biography?.toLowerCase() ?? "";
  for (const { pattern, niche, hint } of BIO_NICHE_PATTERNS) {
    if (pattern.test(bio)) {
      return { niche, layoutHint: layoutHint === "creator" ? hint : layoutHint };
    }
  }

  return { niche: fromQuiz as Niche, layoutHint };
}
