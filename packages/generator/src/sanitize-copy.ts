import type { StructuredSiteCopy } from "./llm";

/** Phrases that read as generic AI copy — removed case-insensitively. */
const BANNED_LITERAL = [
  "welcome to my website",
  "crafted with care",
  "dive in",
  "game-changer",
  "game changer",
  "unlock your",
  "unlock the",
  "elevate your",
  "elevate the",
  "your journey starts here",
  "passionate about",
  "synergy",
  "leverage",
  "cutting-edge",
  "cutting edge",
  "world-class solutions",
  "empowering you",
] as const;

const BANNED_REGEX_PATTERNS = [/take your .+ to the next level/gi] as const;

export const BANNED_PHRASES = [...BANNED_LITERAL] as readonly string[];

const BANNED_LITERAL_REGEX = BANNED_LITERAL.map(
  (p) => new RegExp(p.replace(/\s+/g, "\\s+"), "gi"),
);

/** Per-field character limits (post-schema safety net). */
export const FIELD_LIMITS: Record<string, number> = {
  heroEyebrow: 80,
  heroSubtitle: 280,
  aboutBody: 600,
  ctaText: 40,
  promoteTitle: 80,
  metaDescription: 160,
  marqueeText: 120,
  contactSubtitle: 200,
  servicesTitle: 60,
  serviceTitle: 60,
  serviceDescription: 200,
  linkLabel: 40,
  bullet: 100,
  heroTitleLine: 40,
};

const EM_DASH = /\u2014/g;
const EN_DASH = /\u2013/g;

function stripBannedPhrases(text: string): string {
  let out = text;
  for (const re of BANNED_LITERAL_REGEX) {
    out = out.replace(re, "");
  }
  for (const re of BANNED_REGEX_PATTERNS) {
    out = out.replace(re, "");
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

/** Replace em/en dashes with commas or full stops. */
export function normalizeDashes(text: string): string {
  return text
    .replace(EM_DASH, ", ")
    .replace(EN_DASH, "-")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\s+,/g, ",")
    .replace(/,\s+$/g, "")
    .trim();
}

/** Remove exclamation marks from headline-style strings. */
export function stripHeadlineExclamations(text: string): string {
  return text.replace(/!+/g, "").trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > max * 0.6) return cut.slice(0, lastSpace).trim();
  return cut.trim();
}

function sanitizeString(
  value: string,
  opts: { headline?: boolean; max?: number } = {},
): string {
  let out = normalizeDashes(value);
  out = stripBannedPhrases(out);
  if (opts.headline) out = stripHeadlineExclamations(out);
  if (opts.max) out = truncate(out, opts.max);
  return out;
}

/** Sanitise a single copy field for layout token hydration. */
export function sanitizeCopyField(
  value: string,
  field: keyof typeof FIELD_LIMITS | "heroTitle" | "default" = "default",
): string {
  const max = FIELD_LIMITS[field === "heroTitle" ? "heroTitleLine" : field];
  return sanitizeString(value, {
    headline: field === "heroTitle" || field === "heroEyebrow" || field === "servicesTitle",
    max,
  });
}

/** Full post-LLM pass on structured copy JSON. */
export function sanitizeStructuredCopy(copy: StructuredSiteCopy): StructuredSiteCopy {
  const heroTitle = Array.isArray(copy.heroTitle)
    ? copy.heroTitle
        .map((line) => sanitizeCopyField(line, "heroTitle"))
        .filter(Boolean)
        .slice(0, 3)
    : sanitizeCopyField(copy.heroTitle, "heroTitle");

  const services = copy.services.map((s) => ({
    title: sanitizeCopyField(s.title, "serviceTitle"),
    description: sanitizeCopyField(s.description, "serviceDescription"),
  }));

  const links = copy.links?.map((l) => ({
    label: sanitizeCopyField(l.label, "linkLabel"),
    url: l.url,
  }));

  const aboutBullets = copy.aboutBullets?.map((b) => sanitizeCopyField(b, "bullet"));

  return {
    ...copy,
    heroTitle,
    heroEyebrow: copy.heroEyebrow
      ? sanitizeCopyField(copy.heroEyebrow, "heroEyebrow")
      : undefined,
    heroSubtitle: sanitizeCopyField(copy.heroSubtitle, "heroSubtitle"),
    aboutBody: sanitizeCopyField(copy.aboutBody, "aboutBody"),
    ctaText: copy.ctaText ? sanitizeCopyField(copy.ctaText, "ctaText") : undefined,
    promoteTitle: copy.promoteTitle
      ? sanitizeCopyField(copy.promoteTitle, "promoteTitle")
      : undefined,
    metaDescription: copy.metaDescription
      ? sanitizeCopyField(copy.metaDescription, "metaDescription")
      : undefined,
    marqueeText: copy.marqueeText
      ? sanitizeCopyField(copy.marqueeText, "marqueeText")
      : undefined,
    contactSubtitle: copy.contactSubtitle
      ? sanitizeCopyField(copy.contactSubtitle, "contactSubtitle")
      : undefined,
    servicesTitle: copy.servicesTitle
      ? sanitizeCopyField(copy.servicesTitle, "servicesTitle")
      : undefined,
    services,
    links,
    aboutBullets,
  };
}

/** True if text still contains em dash after normalisation (for tests). */
export function containsEmDash(text: string): boolean {
  return EM_DASH.test(text) || text.includes("—");
}
