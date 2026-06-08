import type { GenerateInput } from "./types";
import { quizContextForPrompt } from "./quiz";
import { getCompositionGuide } from "./element-library";
import { sanitizeStructuredCopy } from "./sanitize-copy";

/** Copy-only JSON from OpenAI — never HTML/CSS. */
export interface StructuredSiteCopy {
  heroTitle: string | string[];
  heroSubtitle: string;
  heroEyebrow?: string;
  aboutBody: string;
  ctaText?: string;
  services: { title: string; description: string }[];
  promoteTitle?: string;
  links?: { label: string; url: string }[];
  aboutBullets?: string[];
  metaDescription?: string;
  marqueeText?: string;
  contactSubtitle?: string;
  servicesTitle?: string;
}

const COPY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["heroTitle", "heroSubtitle", "aboutBody", "services"],
  properties: {
    heroTitle: {
      oneOf: [
        { type: "string", maxLength: 120 },
        {
          type: "array",
          items: { type: "string", maxLength: 40 },
          minItems: 1,
          maxItems: 3,
        },
      ],
    },
    heroSubtitle: { type: "string", maxLength: 280 },
    heroEyebrow: { type: "string", maxLength: 80 },
    aboutBody: { type: "string", maxLength: 600 },
    ctaText: { type: "string", maxLength: 40 },
    services: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description"],
        properties: {
          title: { type: "string", maxLength: 60 },
          description: { type: "string", maxLength: 200 },
        },
      },
    },
    promoteTitle: { type: "string", maxLength: 80 },
    links: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "url"],
        properties: {
          label: { type: "string", maxLength: 40 },
          url: { type: "string", maxLength: 200 },
        },
      },
    },
    aboutBullets: {
      type: "array",
      maxItems: 5,
      items: { type: "string", maxLength: 100 },
    },
    metaDescription: { type: "string", maxLength: 160 },
    marqueeText: { type: "string", maxLength: 120 },
    contactSubtitle: { type: "string", maxLength: 200 },
    servicesTitle: { type: "string", maxLength: 60 },
  },
} as const;

const ANTI_SLOP_RULES = `
## Anti-slop rules (strict)

- British English spelling (colour, organise, favourite).
- Short sentences. Plain, human tone. No corporate jargon.
- Never use em dashes (—) or en dashes (–). Use commas or full stops.
- No exclamation marks in headlines or eyebrows.
- One CTA phrase only (ctaText field). Never suggest more than two actions on the page.
- Return JSON only. Never HTML, CSS, or markdown.

## Banned phrases (never use)

welcome to my website, unlock, elevate, dive in, game-changer, crafted with care,
your journey starts here, passionate about, synergy, leverage, cutting-edge,
world-class solutions, empowering you, take it to the next level.

## Word limits

- heroTitle: 3–8 words total (split across lines if array)
- heroSubtitle: max 35 words
- heroEyebrow: max 8 words
- aboutBody: max 80 words
- ctaText: 2–4 words, action verb (e.g. "Book a call")
- service titles: max 5 words each
- service descriptions: max 25 words each
`.trim();

function normalizeHeroTitle(value: string | string[]): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 3);
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 3) return words.length ? words : [value];
  const third = Math.ceil(words.length / 3);
  return [
    words.slice(0, third).join(" "),
    words.slice(third, third * 2).join(" "),
    words.slice(third * 2).join(" ") || "",
  ].filter(Boolean);
}

export function applyStructuredCopy<T extends Record<string, unknown>>(
  base: T,
  copy: StructuredSiteCopy
): T & StructuredSiteCopy & { heroTitle: string[]; contactTitle?: string } {
  const sanitized = sanitizeStructuredCopy(copy);
  const heroTitle = normalizeHeroTitle(sanitized.heroTitle);
  return {
    ...base,
    ...sanitized,
    heroTitle,
    contactTitle: sanitized.ctaText ?? (base.contactTitle as string | undefined),
  };
}

function buildSystemPrompt(): string {
  const guide = getCompositionGuide();
  return [
    "You write premium website copy for creators. Return JSON only — never HTML, CSS, or markdown.",
    "Match the creator's Instagram voice and niche. Be specific, not generic.",
    "Layout and design come from a pre-built element library — you only fill copy tokens.",
    ANTI_SLOP_RULES,
    guide.copyTone ? `\n## Niche tone guide\n${guide.copyTone}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Request structured copy from OpenAI (JSON schema only, no HTML). */
export async function generateStructuredCopy(
  input: GenerateInput,
  apiKey: string,
  seed: {
    heroEyebrow: string;
    heroTitle: string[];
    heroSubtitle: string;
    aboutBody: string;
    aboutBullets: string[];
    services: { title: string; description: string }[];
    contactSubtitle: string;
    metaDescription: string;
    marqueeText: string;
    servicesTitle: string;
  }
): Promise<StructuredSiteCopy | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "site_copy",
            strict: true,
            schema: COPY_SCHEMA,
          },
        },
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(),
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Write website copy tokens for a pre-built layout. Improve the seed copy — do not repeat it verbatim.",
              niche: input.niche,
              layoutHint: input.layoutHint,
              quizContext: quizContextForPrompt(input.quizAnswers),
              username: input.username,
              biography: input.profile?.biography,
              followers: input.profile?.followers,
              postCount: input.profile?.postCount,
              tagline: input.tagline,
              seed,
              rules: [
                "Use the biography verbatim where it fits — do not replace real IG bio with generic filler.",
                "Reference specific details from the bio (location, role, niche, offers).",
                "If biography is empty, infer tone from username and niche only.",
              ],
            }),
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[llm] OpenAI error", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StructuredSiteCopy;
    return sanitizeStructuredCopy(parsed);
  } catch (err) {
    console.error("[llm] generateStructuredCopy failed", err);
    return null;
  }
}
