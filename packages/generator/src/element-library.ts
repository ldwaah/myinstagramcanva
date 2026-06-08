import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** Root of the ai-extractor library (sibling to src/) */
export const AI_EXTRACTOR_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "ai-extractor");

export type ElementTokenBudget = "low" | "medium" | "high";

export interface ElementMeta {
  id: string;
  category: string;
  tags: string[];
  style: string;
  tokens: ElementTokenBudget;
  description?: string;
}

export interface LibraryElement extends ElementMeta {
  html: string;
  css: string;
  dir: string;
}

export interface PalettePreset {
  id: string;
  name: string;
  style: string;
  description?: string;
  tokens: Record<string, string>;
  fonts?: { display: string; body: string; googleUrl: string };
}

export interface LayoutRecipe {
  id: string;
  name: string;
  description?: string;
  palette: string;
  tags?: string[];
  elements: string[];
}

export interface ElementLibraryOptions {
  /** Override library root (for tests) */
  root?: string;
}

let cachedElements: LibraryElement[] | null = null;
let cachedPalettes: PalettePreset[] | null = null;
let cachedLayouts: LayoutRecipe[] | null = null;

function readText(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8").trim() : "";
}

function walkElementDirs(root: string): string[] {
  const dirs: string[] = [];
  const elementsRoot = join(root, "elements");
  if (!existsSync(elementsRoot)) return dirs;

  for (const category of readdirSync(elementsRoot)) {
    const categoryPath = join(elementsRoot, category);
    if (!statSync(categoryPath).isDirectory()) continue;
    for (const id of readdirSync(categoryPath)) {
      const dir = join(categoryPath, id);
      if (statSync(dir).isDirectory() && existsSync(join(dir, "meta.json"))) {
        dirs.push(dir);
      }
    }
  }
  return dirs;
}

/** Load all elements from ai-extractor/elements/ */
export function loadElements(options: ElementLibraryOptions = {}): LibraryElement[] {
  if (cachedElements && !options.root) return cachedElements;

  const root = options.root ?? AI_EXTRACTOR_ROOT;
  const elements = walkElementDirs(root).map((dir) => {
    const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8")) as ElementMeta;
    return {
      ...meta,
      html: readText(join(dir, "snippet.html")),
      css: readText(join(dir, "styles.css")),
      dir,
    };
  });

  if (!options.root) cachedElements = elements;
  return elements;
}

/** Load palette presets from ai-extractor/palettes/ */
export function loadPalettes(options: ElementLibraryOptions = {}): PalettePreset[] {
  if (cachedPalettes && !options.root) return cachedPalettes;

  const root = options.root ?? AI_EXTRACTOR_ROOT;
  const dir = join(root, "palettes");
  if (!existsSync(dir)) return [];

  const palettes = readdirSync(dir)
    .filter((f: string) => f.endsWith(".json"))
    .map((f: string) => JSON.parse(readFileSync(join(dir, f), "utf8")) as PalettePreset);

  if (!options.root) cachedPalettes = palettes;
  return palettes;
}

/** Load layout recipes from ai-extractor/layouts/ */
export function loadLayouts(options: ElementLibraryOptions = {}): LayoutRecipe[] {
  if (cachedLayouts && !options.root) return cachedLayouts;

  const root = options.root ?? AI_EXTRACTOR_ROOT;
  const dir = join(root, "layouts");
  if (!existsSync(dir)) return [];

  const layouts = readdirSync(dir)
    .filter((f: string) => f.endsWith(".json"))
    .map((f: string) => JSON.parse(readFileSync(join(dir, f), "utf8")) as LayoutRecipe);

  if (!options.root) cachedLayouts = layouts;
  return layouts;
}

/** Find elements matching any of the given tags (all tags must match if matchAll=true) */
export function pickElementsByTags(
  tags: string[],
  options: ElementLibraryOptions & { matchAll?: boolean } = {},
): LibraryElement[] {
  const elements = loadElements(options);
  const normalized = tags.map((t) => t.toLowerCase());
  return elements.filter((el) => {
    const elTags = el.tags.map((t) => t.toLowerCase());
    if (options.matchAll) return normalized.every((t) => elTags.includes(t));
    return normalized.some((t) => elTags.includes(t));
  });
}

/** Resolve a single element by id */
export function getElementById(id: string, options: ElementLibraryOptions = {}): LibraryElement | undefined {
  return loadElements(options).find((el) => el.id === id);
}

/** Resolve layout recipe and hydrate element list */
export function resolveLayout(layoutId: string, options: ElementLibraryOptions = {}): {
  layout: LayoutRecipe;
  elements: LibraryElement[];
  palette: PalettePreset | undefined;
} | undefined {
  const layout = loadLayouts(options).find((l) => l.id === layoutId);
  if (!layout) return undefined;

  const elements = layout.elements
    .map((id) => getElementById(id, options))
    .filter((el): el is LibraryElement => el !== undefined);

  const palette = loadPalettes(options).find((p) => p.id === layout.palette);
  return { layout, elements, palette };
}

/** Token map for hydrating {{PLACEHOLDER}} syntax in snippets */
export type ElementTokenMap = Record<string, string>;

/** Replace {{TOKEN}} placeholders in HTML/CSS strings */
export function hydrateTokens(template: string, tokens: ElementTokenMap): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => tokens[key] ?? "");
}

/**
 * Compose a page body from a layout recipe.
 *
 * Future LLM integration (llm.ts):
 * 1. LLM picks layout + palette based on niche/tags (no HTML generation).
 * 2. LLM writes copy only → mapped to token keys (HERO_TITLE, ABOUT_BODY, etc.).
 * 3. This function stitches pre-built snippets → minimal tokens spent.
 */
export function composeFromLayout(
  layoutId: string,
  tokens: ElementTokenMap,
  options: ElementLibraryOptions = {},
): { html: string; css: string; layout: LayoutRecipe; elementIds: string[] } | undefined {
  const resolved = resolveLayout(layoutId, options);
  if (!resolved) return undefined;

  const { layout, elements, palette } = resolved;
  const cssParts: string[] = [];
  const htmlParts: string[] = [];

  if (palette) {
    const vars = Object.entries(palette.tokens)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");
    cssParts.push(`:root {\n${vars}\n}`);
    if (palette.fonts) {
      cssParts.push(`:root { --el-font-display: "${palette.fonts.display}", serif; --el-font-body: "${palette.fonts.body}", sans-serif; }`);
    }
  }

  for (const el of elements) {
    cssParts.push(el.css);
    htmlParts.push(hydrateTokens(el.html, tokens));
  }

  return {
    html: htmlParts.join("\n\n"),
    css: cssParts.join("\n\n"),
    layout,
    elementIds: elements.map((e) => e.id),
  };
}

/** Suggest a layout id from niche/tags heuristics (no LLM required) */
export function suggestLayout(tags: string[]): string {
  const t = tags.map((x) => x.toLowerCase());
  if (t.some((x) => ["photographer", "visual", "sports"].includes(x))) return "creator-portfolio";
  if (t.some((x) => ["coach", "trainer", "business"].includes(x))) return "split-landing";
  return "profile-minimal";
}

/** Clear in-memory cache (useful in tests) */
export function clearElementLibraryCache(): void {
  cachedElements = null;
  cachedPalettes = null;
  cachedLayouts = null;
}
