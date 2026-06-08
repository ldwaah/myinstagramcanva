# What makes WordPress / Squarespace / Wix sites look professional

Notes distilled from high-quality creator and small-business sites (including internal reference builds). Use these as quality checks — not as templates to copy.

## Whitespace

- Generous vertical rhythm between sections (64–96px minimum).
- Content never touches viewport edges on mobile — 16–24px horizontal padding.
- Headlines breathe: margin-bottom 16–24px before body copy.
- Grids have consistent gutters; avoid cramming more columns than the content supports.

## Typography

- **Restraint wins**: one distinctive display face + one readable body face.
- Squarespace sites often use: large serif or geometric sans headings, neutral sans body.
- WordPress premium themes: strong h1, muted meta text (eyebrows, captions), limited font weights (400, 500, 600 — not every weight loaded).
- Wix: centered hero type with generous letter-spacing on uppercase labels.
- Avoid: Inter + purple gradient (the "AI default" look).

## Image treatment

- Hero images: full-bleed or contained in a deliberate frame — never floating without context.
- Portfolio grids: uniform cell size OR intentional size variation (masonry), not random.
- Overlays: subtle gradient vignette for text-on-photo legibility — not heavy black boxes.
- Reels/video: poster frame + play affordance; aspect-ratio locked with `object-fit: cover`.

## Navigation

- Sticky header, 56–72px height, logo left, links center or right, one primary CTA.
- Mobile: full-screen overlay menu or slide-down — not cramped hamburger dropdowns.
- Active section optional; at minimum: Work/Posts, About, Contact, social link.

## Section patterns (from reference builds)

| Pattern | Use when |
|---------|----------|
| Eyebrow + split headline + sub + dual CTAs | Strong brand voice, visual niche |
| Stats strip (3 numbers) | Social proof without clutter |
| Horizontal film rail / carousel | Photography, fashion, sports portfolios |
| Split about (image + copy + bullet list) | Personal brands, coaches, photographers |
| Numbered service cards | Clear offer breakdown |
| Contact link rows (label + value) | Low-friction booking without heavy forms |
| Minimal footer + legal links | Every site |

## Color

- Dark editorial (near-black bg, warm off-white text, one sharp accent) reads premium for visual creators.
- Light neutral (warm gray bg, charcoal text, muted accent) reads trustworthy for coaches and consultants.
- Accent used sparingly: CTAs, one headline word, section tags — not backgrounds.

## What to avoid (AI slop signals)

- Gradient text on white backgrounds
- "Trusted by thousands" with no real data
- Generic stock-photo placeholders with no alt text
- 6+ font families loaded
- Inconsistent border-radius (mixing 4px, 12px, 24px, full pill everywhere)
- Center-aligned everything with no visual anchor
- Fake testimonial carousels

## Kane-site patterns (extracted, not copied)

The Khiago Visuals reference build demonstrates:

1. **Section indexing** — `01 · Portfolio`, `02 · About` tags create editorial rhythm.
2. **Cinematic hero** — full-bleed photo, vignette, multi-line display title, ticker marquee.
3. **Stats strip** — three concise metrics between hero and work.
4. **Film rail gallery** — horizontal scroll with frame meta (category + number).
5. **Reel grid** — video cards with overlay play + IG deep link.
6. **About split** — framed image, location badge, bullet list, phone CTA.
7. **Service cards** — numbered, equal-height, short descriptions.
8. **Contact block** — large heading, link rows, single primary action.
9. **Restrained footer** — copyright, terms/privacy only.

These patterns are reimplemented as original elements in `elements/` with generic tokens and distinct CSS — not a theme clone.
