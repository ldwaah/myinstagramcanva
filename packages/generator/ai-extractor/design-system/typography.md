# Typography system

Professional font pairings and type scale rules for ai-extractor elements.

## Font pairings (Google Fonts)

Use **one display + one body** per site. Load via `palette.fonts.googleUrl`.

| Pairing | Display | Body | Best for |
|---------|---------|------|----------|
| Editorial classic | Cormorant Garamond | DM Sans | Photographers, fashion, coaches |
| Modern geometric | Syne | Inter | Tech, SaaS-style personal brands |
| Warm humanist | Fraunces | Source Sans 3 | Food, lifestyle, wellness |
| Sharp editorial | Playfair Display | Lato | Luxury, beauty, editorial |
| Clean Swiss | Space Grotesk | Work Sans | Business, consultants, studios |
| Friendly rounded | Outfit | Nunito Sans | Fitness, family brands, creators |

## Type scale

| Role | Size | Weight | Tracking | Line-height |
|------|------|--------|----------|-------------|
| Eyebrow / tag | 0.7–0.75rem | 500 | 0.12–0.16em uppercase | 1.4 |
| H1 (hero) | clamp(2.25rem, 6vw, 4.5rem) | 400 | normal | 1.08–1.15 |
| H2 (section) | clamp(1.75rem, 4vw, 2.5rem) | 400 | normal | 1.15 |
| H3 (card) | 1.25rem | 500–600 | normal | 1.25 |
| Body | 1–1.125rem | 400 | normal | 1.65 |
| Caption / meta | 0.75–0.875rem | 400 | 0.08em (labels) | 1.5 |
| Button | 0.8125–0.875rem | 500 | 0.02em | 1 |

## Rules

- **One accent emphasis per heading** — use `<em>` for a single italic word, not whole sentences.
- **Max two families** — never load more than display + body.
- **Limit weights** — 400, 500, 600 only; avoid loading 300 or 800 unless essential.
- **Clamp all display sizes** — heroes and section titles must scale on mobile.
- Body text max-width: **65ch** (≈560–720px container).

## CSS variables

Elements reference:

```css
font-family: var(--el-font-display, Georgia, serif);  /* headings */
font-family: var(--el-font-body, system-ui, sans-serif); /* body — inherit on sections */
```

Palettes set `--el-font-display` and `--el-font-body` at compose time.
