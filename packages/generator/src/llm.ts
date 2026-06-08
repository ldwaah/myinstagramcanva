import type { GenerateInput } from "./types";
import { quizContextForPrompt } from "./quiz";

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
  const heroTitle = normalizeHeroTitle(copy.heroTitle);
  return {
    ...base,
    ...copy,
    heroTitle,
    contactTitle: copy.ctaText ?? (base.contactTitle as string | undefined),
  };
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
            content:
              "You write premium website copy for creators. Return JSON only — never HTML, CSS, or markdown. Match the creator's Instagram voice and niche. Be specific, not generic.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Write website copy tokens for a pre-built layout",
              niche: input.niche,
              layoutHint: input.layoutHint,
              quizContext: quizContextForPrompt(input.quizAnswers),
              username: input.username,
              biography: input.profile?.biography,
              followers: input.profile?.followers,
              tagline: input.tagline,
              seed,
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
    return JSON.parse(raw) as StructuredSiteCopy;
  } catch (err) {
    console.error("[llm] generateStructuredCopy failed", err);
    return null;
  }
}
