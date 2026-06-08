# AI generation strategy

Brief for how My Instagram Canva produces sites that look professionally designed—not generic AI output.

## Current architecture

| Layer | Role | Token cost |
|-------|------|------------|
| **Instagram fetch** | Profile, posts, reels, colours | None |
| **Heuristic content** (`content.ts`) | Seed copy from bio, niche templates | None |
| **OpenAI** (`llm.ts`) | Short structured JSON copy only | Low (~500 tokens) |
| **Post-processing** (`sanitize-copy.ts`) | Strip em dashes, banned phrases, truncate | None |
| **Element library** (`ai-extractor/`) | Layout, CSS, HTML composition | None |
| **Theme extraction** (`palette.ts`) | Accent colours from IG images | None |
| **Inline template** (`render.ts` fallback) | Legacy full-page HTML if library fails | None |

**OpenAI never generates HTML or CSS.** It returns a strict JSON schema (`StructuredSiteCopy`) mapped to `{{PLACEHOLDER}}` tokens in pre-built snippets.

**Design comes from the library.** Layout recipes (`layouts/*.json`) stitch 60+ modular elements with palettes and design-system tokens. `suggestLayoutForNiche()` picks layouts from quiz + niche heuristics—no LLM required for structure.

## Recommendation

**Keep OpenAI for short structured copy only.** Minimise tokens with:

- `gpt-4o-mini` + JSON schema (`response_format: json_schema`)
- Seed copy in the user message (rewrite, don't invent from scratch)
- `copy-tone.md` + anti-slop rules in the system prompt
- `sanitize-copy.ts` as a hard safety net after every LLM response

**Let the element library own layout and visual design.** Sparse Squarespace-style recipes, palette presets from IG accent, and CTA limiting (`layout-cta-limit.ts`) keep pages calm—one hero button, two buttons max per page.

Default pipeline:

```
IG data → seed copy → OpenAI JSON (optional) → sanitize → buildElementTokens → composeFromLayout → render
```

## Alternatives considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Claude for voice** | Strong natural tone | Extra vendor, no schema mode in current stack | Revisit for BYOK Collaborator edits |
| **No LLM for layout** | Zero slop risk, deterministic | Copy stays template-flat without rewrite pass | **Adopted** — heuristics + library |
| **Vision model for style** | Could classify IG aesthetic | Cost, latency, overkill for v1 | Future: pick palette/layout from feed screenshots |
| **LLM generates full HTML** | Flexible | Purple gradients, button spam, em dashes | **Rejected** |
| **Remove OpenAI entirely** | Cheapest | Loses bio-specific rewrites | Too flat for premium tier |

## Verdict

**Keep OpenAI, constrain it heavily.** World-class output comes from:

1. **Professional design system** — curated elements, not invented markup
2. **Sparse layouts** — minimal visual style → `lifestyle-minimal` / `profile-minimal`
3. **Copy guardrails** — British English, banned phrases, no dashes, word limits
4. **Post-processing** — never trust raw LLM strings
5. **Real IG data** — photos, stats, bio drive specificity

OpenAI is a copy polisher, not a web designer. The library is the designer.

## Quality gates (automated)

- `sanitizeStructuredCopy()` — no em dashes, no banned phrases
- `limitLayoutCtas()` — ≤2 `el-btn` elements in composed HTML
- `visualStyle: minimal` quiz answer → sparse layout recipe
- Tests: `scripts/test-anti-slop.mjs` for `official4dads` sample

## Structured pipeline status

The structured copy pipeline (JSON schema → token map → library compose) is **complete**:

- [x] `generateStructuredCopy()` with strict schema
- [x] `applyStructuredCopy()` merges into `SiteContentData`
- [x] `useElementLibrary: true` default in generation
- [x] Quiz-driven layout hints + minimal visual style
- [x] Sanitisation + CTA limiting (this hardening pass)

Future (not blocking):

- LLM layout selection via `element-selection.md` (optional; heuristics work today)
- Vision-based palette override from post thumbnails
