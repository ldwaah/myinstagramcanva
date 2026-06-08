# AI Extractor — Element Library

Reusable layout and section patterns for Instagram-to-website generation. The generator composes sites from these **modular elements** instead of inventing full HTML/CSS on every run — reducing LLM token usage and improving visual consistency.

## Structure

```
ai-extractor/
  elements/       — HTML + scoped CSS snippets with JSON metadata
  palettes/       — Color system presets (Squarespace-style neutrals + accent)
  layouts/        — Page wireframes that reference element IDs
  references/     — Design quality notes (whitespace, typography, image treatment)
```

## How the generator uses this library

1. **Load** — `element-library.ts` scans `elements/**/meta.json` at build/runtime.
2. **Match** — Pick elements by `tags` (e.g. `creator`, `photographer`, `instagram`) and `style` (e.g. `squarespace-minimal`).
3. **Compose** — A layout JSON (see `layouts/`) lists element IDs in order: nav → hero → gallery → about → contact → footer.
4. **Hydrate** — Replace `{{PLACEHOLDER}}` tokens with IG profile data (name, handle, bio, images, stats).
5. **Theme** — Apply a palette from `palettes/` or derive accent from the user's IG brand colors.
6. **Emit** — Concatenate scoped CSS + HTML into the final `index.html`.

### Token budget

| `tokens` value | Meaning |
|----------------|---------|
| `low`          | Static structure; LLM only fills copy and image URLs |
| `medium`       | Minor layout tweaks (hide optional blocks) |
| `high`         | Requires LLM to customize structure — avoid when possible |

Prefer `low`-token elements. Reserve LLM calls for copywriting and palette selection, not layout invention.

### Placeholder tokens

Elements use `{{TOKEN}}` syntax:

| Token | Source |
|-------|--------|
| `{{BRAND_NAME}}` | IG full name or display name |
| `{{HANDLE}}` | Instagram username |
| `{{HERO_EYEBROW}}` | Location / niche line |
| `{{HERO_TITLE}}` | Headline (may be split across lines in cinematic variants) |
| `{{HERO_SUBTITLE}}` | Bio excerpt or tagline |
| `{{AVATAR_URL}}` | Profile picture |
| `{{HERO_IMAGE_URL}}` | Hero or featured post image |
| `{{IG_URL}}` | `https://instagram.com/{handle}` |
| `{{PHONE}}` | Business phone if available |
| `{{YEAR}}` | Current year |
| `{{MARQUEE_TEXT}}` | Ticker / marquee copy |
| `{{SPONSOR_NAME}}` | Platform sponsor label |
| `{{SPONSOR_URL}}` | Sponsor link |

Gallery and list blocks use `{{ITEMS}}` — replaced by the generator with repeated child markup.

## Anti-AI-slop guidelines

These rules keep generated sites looking like professional WordPress / Squarespace / Wix builds — not generic AI output.

### Copy

- **Never** use "Welcome to my website", "Your journey starts here", or filler lorem ipsum.
- Headlines should be **specific** to the creator's niche (e.g. "Matchday frames" not "Capturing moments").
- Eyebrows carry context: location, specialty, availability — not "Hello, I'm…".

### Typography

- **Max two font families**: one display/heading, one body. Use Google Fonts pairs already proven in elements.
- Clear hierarchy: eyebrow (12–13px uppercase) → h1 (clamp 2.5–4rem) → h2 (clamp 1.75–2.5rem) → body (16–18px).
- Line-height: 1.5–1.65 for body; 1.1–1.2 for display headings.
- Limit bold: one accent word per heading (`<em>`), not entire sentences.

### Spacing (8px grid)

Use multiples of 8: 8, 16, 24, 32, 40, 48, 64, 80, 96, 128.

- Section padding: `clamp(64px, 10vw, 96px)` vertical.
- Content max-width: 1120–1200px.
- Gap between grid items: 16 or 24px.

### Color

- Default to **neutral palettes** in `palettes/` — warm stone, cool slate, or editorial dark.
- Accent comes from the user's IG brand or chosen palette — **not** default purple gradients on white.
- One accent color + neutrals. Avoid rainbow gradients and glassmorphism unless the niche demands it.

### Images

- Professional aspect ratios: 4:5 (portrait), 3:2 (landscape), 1:1 (grid), 16:9 (hero/video).
- Always set `width`, `height`, `loading="lazy"` (except hero `fetchpriority="high"`).
- Object-fit: cover for grids; contain for logos.

### Motion & effects

- Subtle only: fade-in on scroll, horizontal ticker. No excessive parallax or particle backgrounds.
- Skip custom cursors, grain overlays, and loaders unless explicitly requested.

### Section structure

- Numbered section tags (`01 · Portfolio`) add editorial polish.
- Every section needs an accessible `aria-label` or `aria-labelledby`.
- Footer includes copyright + optional sponsor credit slot.

## Adding new elements

1. Create a folder under the appropriate `elements/` category.
2. Add `meta.json`, `snippet.html`, and `styles.css`.
3. Scope all CSS under a unique root class (e.g. `.el-hero-split`).
4. Set `"tokens": "low"` when structure is fixed.
5. Tag generously so the matcher can find the right block.

## Layout recipes

See `layouts/*.json` for pre-composed page orders. Example:

```json
{
  "id": "creator-portfolio",
  "elements": ["nav-minimal", "hero-cinematic", "gallery-carousel", "about-split", "contact-cta-band", "footer-sponsor"]
}
```

The generator will resolve this list, hydrate tokens, merge CSS, and emit a complete page.
