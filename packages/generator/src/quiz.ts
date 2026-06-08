import type { Niche } from "./types";

export type QuizAnswerKey =
  | "brandType"
  | "primaryGoal"
  | "offering"
  | "promoting"
  | "externalLink"
  | "visualStyle"
  | "contentFocus";

export type QuizAnswers = Partial<Record<QuizAnswerKey, string>>;

export type NicheLayoutHint =
  | "musician"
  | "influencer"
  | "photographer"
  | "coach"
  | "fitness"
  | "food"
  | "fashion"
  | "business"
  | "creator";

/** Map quiz answers → Prisma/generator Niche enum */
export function nicheFromQuizAnswers(answers: QuizAnswers | null | undefined): Niche {
  if (!answers?.brandType) return "OTHER";

  const brand = answers.brandType.toLowerCase();
  const map: Record<string, Niche> = {
    musician: "MUSICIAN",
    influencer: "INFLUENCER",
    photographer: "PHOTOGRAPHER",
    coach: "COACH",
    fitness: "TRAINER",
    food: "OTHER",
    fashion: "OTHER",
    business: "OTHER",
    creator: "OTHER",
    other: "OTHER",
  };
  return map[brand] ?? "OTHER";
}

/** Layout hint for suggestLayoutForNiche when niche is OTHER or for fine-tuning */
export function layoutHintFromQuiz(answers: QuizAnswers | null | undefined): NicheLayoutHint {
  if (answers?.visualStyle === "minimal") return "creator";

  if (!answers?.brandType) return "creator";

  const brand = answers.brandType.toLowerCase();
  const hints: Record<string, NicheLayoutHint> = {
    musician: "musician",
    influencer: "influencer",
    photographer: "photographer",
    coach: "coach",
    fitness: "fitness",
    food: "food",
    fashion: "fashion",
    business: "business",
    creator: "creator",
    other: "creator",
  };
  if (hints[brand]) return hints[brand];

  const focus = answers.contentFocus?.toLowerCase();
  if (focus === "fitness") return "fitness";
  if (focus === "food") return "food";
  if (focus === "fashion") return "fashion";
  if (focus === "business") return "business";

  return "creator";
}

/** Summarise quiz for LLM copy prompts */
export function quizContextForPrompt(answers: QuizAnswers | null | undefined): string {
  if (!answers || Object.keys(answers).length === 0) return "";
  const lines = Object.entries(answers)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`);
  return lines.join("; ");
}
