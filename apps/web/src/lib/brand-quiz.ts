export type QuizQuestionId =
  | "brandType"
  | "primaryGoal"
  | "offering"
  | "promoting"
  | "externalLink"
  | "visualStyle"
  | "contentFocus";

export interface QuizOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface QuizQuestion {
  id: QuizQuestionId;
  question: string;
  options: QuizOption[];
}

export const BRAND_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "brandType",
    question: "What best describes you?",
    options: [
      { value: "musician", label: "Musician / artist", emoji: "🎵" },
      { value: "influencer", label: "Influencer / creator", emoji: "✨" },
      { value: "photographer", label: "Photographer", emoji: "📸" },
      { value: "coach", label: "Life coach / mentor", emoji: "💡" },
      { value: "fitness", label: "Fitness / trainer", emoji: "💪" },
      { value: "food", label: "Food / chef", emoji: "🍳" },
      { value: "fashion", label: "Fashion / beauty", emoji: "👗" },
      { value: "business", label: "Business / consultant", emoji: "💼" },
      { value: "other", label: "Something else", emoji: "🌟" },
    ],
  },
  {
    id: "primaryGoal",
    question: "What do you want visitors to do first?",
    options: [
      { value: "book", label: "Book a session", emoji: "📅" },
      { value: "buy", label: "Buy something", emoji: "🛒" },
      { value: "listen", label: "Listen to music", emoji: "🎧" },
      { value: "browse", label: "Browse my gallery", emoji: "🖼️" },
      { value: "contact", label: "Get in touch", emoji: "💬" },
    ],
  },
  {
    id: "offering",
    question: "Do you sell products or services?",
    options: [
      { value: "products", label: "Yes — products", emoji: "📦" },
      { value: "services", label: "Yes — services", emoji: "🤝" },
      { value: "both", label: "Both", emoji: "⚡" },
      { value: "neither", label: "Neither right now", emoji: "🙂" },
    ],
  },
  {
    id: "promoting",
    question: "Promoting something specific right now?",
    options: [
      { value: "album", label: "Album / release", emoji: "💿" },
      { value: "product", label: "Product / collab", emoji: "🏷️" },
      { value: "event", label: "Event / tour", emoji: "🎤" },
      { value: "course", label: "Course / programme", emoji: "📚" },
      { value: "nothing", label: "Nothing specific", emoji: "✓" },
    ],
  },
  {
    id: "externalLink",
    question: "Want a link to an external page?",
    options: [
      { value: "linktree", label: "Linktree-style links", emoji: "🔗" },
      { value: "shop", label: "Shop / store", emoji: "🛍️" },
      { value: "spotify", label: "Spotify / streaming", emoji: "🎶" },
      { value: "booking", label: "Booking page", emoji: "📆" },
      { value: "none", label: "None for now", emoji: "—" },
    ],
  },
  {
    id: "visualStyle",
    question: "How would you describe your look?",
    options: [
      { value: "dark", label: "Dark & moody", emoji: "🌙" },
      { value: "bright", label: "Bright & clean", emoji: "☀️" },
      { value: "editorial", label: "Editorial & bold", emoji: "📰" },
      { value: "warm", label: "Warm & friendly", emoji: "🤎" },
      { value: "minimal", label: "Minimal & calm", emoji: "◻️" },
    ],
  },
  {
    id: "contentFocus",
    question: "What do you post most?",
    options: [
      { value: "photos", label: "Photos & stills", emoji: "📷" },
      { value: "reels", label: "Reels & video", emoji: "🎬" },
      { value: "products", label: "Products & promos", emoji: "🏷️" },
      { value: "tips", label: "Tips & education", emoji: "📖" },
      { value: "lifestyle", label: "Lifestyle moments", emoji: "🌿" },
    ],
  },
];

export const QUIZ_STORAGE_KEY = "mic_brand_quiz_answers";

export type QuizAnswers = Partial<Record<QuizQuestionId, string>>;

export function saveQuizToStorage(siteId: string, answers: QuizAnswers) {
  try {
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ siteId, answers, savedAt: Date.now() }));
  } catch {
    /* private browsing */
  }
}

export function loadQuizFromStorage(siteId: string): QuizAnswers | null {
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { siteId: string; answers: QuizAnswers };
    return parsed.siteId === siteId ? parsed.answers : null;
  } catch {
    return null;
  }
}
