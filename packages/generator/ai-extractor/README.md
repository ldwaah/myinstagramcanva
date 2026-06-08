# AI Extractor — Element Library

Reusable layout and section patterns for Instagram-to-website generation. The generator composes sites from **60+ modular elements** instead of inventing full HTML/CSS on every run — reducing LLM token usage and improving visual consistency.

## Structure

```
ai-extractor/
  design-system/   — tokens.css, typography.md, colors.md, animations.css
  elements/        — HTML + scoped CSS + meta.json + element.md (60+ elements)
    heroes/        — 10 variants
    galleries/     — 7 variants
    navigation/    — 5 variants
    footers/       — 5 variants
    about/         — 6 variants
    contact/       — 5 variants
    buttons/       — 8 variants
    cards/         — 5 variants
    sections/      — 6 variants
    media/         — 2 variants
    typography/    — type scale reference
  palettes/        — 11 colour system presets
  layouts/         — 11 full page compositions
  references/      — Professional design research notes
  prompts/         — LLM system prompt fragments
```

## How the generator uses this library

1. **Load** — `element-library.ts` scans `elements/**/meta.json` at build/runtime.
2. **Design system** — `getDesignSystem()` returns tokens, typography, colours, animations.
3. **Match** — `suggestLayoutForNiche(niche)` or LLM picks layout by tags/niche.
4. **Compose** — Layout JSON lists element IDs: nav → hero → gallery → about → contact → footer.
5. **Hydrate** — Replace `{{PLACEHOLDER}}` tokens with IG profile data.
6. **Theme** — Apply palette; override `--el-accent` from user's IG brand colours.
7. **Emit** — Concatenate design-system CSS + element CSS + HTML into `index.html`.

### Composition flow (full)

```
niche + IG data
  → suggestLayoutForNiche() or LLM element-selection prompt
  → resolveLayout(layoutId) → element list + palette
  → buildElementTokens(content) → {{TOKEN}} map
  → composeFromLayout() → html + css
  → renderSiteHtmlFromLibrary() → complete index.html
```

Enable via `renderSiteHtml(content, siteId, apiBase, { useElementLibrary: true })`.

### Token budget

| `tokens` value | Meaning |
|----------------|---------|
| `low`          | Static structure; LLM only fills copy and image URLs |
| `medium`       | Minor layout tweaks (hide optional blocks, repeat ITEMS) |
| `high`         | Requires media URLs or structural customisation — use sparingly |

Prefer `low`-token elements. Reserve LLM calls for copywriting and palette selection.

### Placeholder tokens

| Token | Source |
|-------|--------|
| `{{BRAND_NAME}}` | IG full name |
| `{{HANDLE}}` | Instagram username |
| `{{HERO_EYEBROW}}` | Location / niche line |
| `{{HERO_TITLE}}` | Headline |
| `{{HERO_SUBTITLE}}` | Bio excerpt or tagline |
| `{{AVATAR_URL}}` | Profile picture |
| `{{HERO_IMAGE_URL}}` | Hero or featured post image |
| `{{IG_URL}}` | Instagram profile URL |
| `{{STATS_ROW}}` / `{{STATS_ITEMS}}` | Follower metrics |
| `{{ITEMS}}` | Repeated gallery/card markup |
| `{{SITE_ID}}` | Site ID for forms |

See `prompts/copy-tone.md` for copy guidelines per niche.

## Anti-AI-slop guidelines

- **Never** use "Welcome to my website" or purple gradient defaults.
- Headlines must be **specific** to the creator's niche.
- Max **two font families** from palette presets.
- **8px spacing grid** — see `design-system/tokens.css`.
- Accent from user IG palette — not hard-coded brand colours.
- Placeholder gradients/SVG shapes — no copyrighted theme assets.
- British English in all generated copy.

## Adding new elements

1. Create folder under `elements/{category}/{id}/`.
2. Add `meta.json` (include `niche` array), `snippet.html`, `styles.css`, `element.md`.
3. Scope CSS under unique root class (e.g. `.el-hero-split`).
4. Set `"tokens": "low"` when structure is fixed.
5. Tag generously for `pickElementsByTags()`.

Or run `node packages/generator/scripts/scaffold-ai-extractor.mjs` to extend the scaffold script.

## API reference

```ts
loadElements()           // all LibraryElement[]
loadPalettes()           // all PalettePreset[]
loadLayouts()            // all LayoutRecipe[]
getDesignSystem()        // tokens, typography, colours, animations
getCompositionGuide()    // composition-rules.md + prompts
suggestLayoutForNiche()  // niche string → layoutId
composeFromLayout()      // layoutId + tokens → html + css
```
