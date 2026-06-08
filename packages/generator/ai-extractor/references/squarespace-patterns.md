# Squarespace template patterns

Structural patterns observed across Squarespace 7.1 templates (Bedford, Supply, Nueva, Paloma, etc.). Layout and spacing principles only — not visual copies.

## Layout structure

1. **Header** — logo left or centred, 1–5 nav links, optional CTA button.
2. **Hero** — full-width, 60–100vh, headline + sub + 1–2 buttons.
3. **Content blocks** — alternating image/text or full-width gallery.
4. **Footer** — minimal (copyright) or multi-column (brand, links, social).

## Whitespace signature

- Generous vertical rhythm: 80–120px between major sections on desktop.
- Content max-width ~1140px centred.
- Mobile: single column, 20px side padding.

## Typography

- Template families: often one serif display (headlines) + one sans body.
- Hero headlines: 48–72px desktop, centred or left-aligned.
- Section tags: small caps, letter-spaced, accent colour.
- Body: 16–18px, line-height 1.6–1.8.

## Section types (mapped to elements)

| Squarespace block | ai-extractor element |
|-------------------|---------------------|
| Banner / slideshow | hero-full-bleed, hero-cinematic |
| Gallery grid | gallery-grid, gallery-masonry |
| Gallery carousel | gallery-carousel |
| About / text | about-bio, about-split |
| Form | contact-form-strip, contact-split-panel |
| Newsletter | contact-newsletter, footer-newsletter |
| Footer | footer-minimal, footer-columns |
| Marquee | section-marquee-ticker |

## Image treatment

- Full-bleed heroes with subtle gradient overlay for text legibility.
- Gallery: consistent aspect ratios or intentional masonry variation.
- No floating images without frame or grid context.

## Mobile patterns

- Hamburger → full-screen menu overlay.
- Stack all split layouts to single column.
- Horizontal scroll galleries with snap points.
- Touch targets ≥ 44px.
