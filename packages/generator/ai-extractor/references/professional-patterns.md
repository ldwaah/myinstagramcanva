# Professional web design patterns

Research notes distilled from Squarespace templates, WordPress premium themes (Astra, Kadence, GeneratePress), Webflow showcases, Framer sites, and modern SaaS landing pages. Use as quality checks — **do not copy copyrighted themes wholesale**.

## Whitespace

- Section padding: `clamp(64px, 10vw, 96px)` vertical minimum.
- Mobile horizontal padding: 16–24px; content never touches edges.
- Headline margin-bottom: 16–24px before body copy.
- Grid gutters: 16px (dense) or 24px (editorial).
- One "breathing" section (divider or pull quote) per 3–4 content blocks.

## Typography hierarchy

- Eyebrow (12px uppercase, letter-spacing 0.12–0.16em) → H1 (clamp 2.5–4.5rem) → H2 (clamp 1.75–2.5rem) → body (16–18px).
- Squarespace: centred hero type, generous letter-spacing on labels.
- WordPress premium: strong H1, muted meta text, weights 400/500/600 only.
- Webflow/Framer: asymmetric headlines with offset visual blocks.
- **Avoid**: Inter + purple gradient (the generic AI default).

## Hero patterns

| Pattern | Platform inspiration | Best niche |
|---------|---------------------|------------|
| Centred minimal + dual CTA | Squarespace Bedford | Coaches, consultants |
| Split image/text | Kadence, Astra | Personal brands |
| Full-bleed + vignette | Webflow portfolio | Photographers |
| Gradient mesh (no photo) | SaaS landings | Tech, business |
| Overlap portrait panel | GeneratePress | Fitness, lifestyle |
| Numbered editorial tag | Magazine templates | Fashion, editorial |

## Gallery patterns

| Pattern | Use when |
|---------|----------|
| Uniform 3-col grid | Instagram feed mirror |
| Masonry offset | Portrait-heavy portfolios |
| Horizontal carousel/film rail | Fashion, sports, sequential work |
| Bento asymmetric | Creative directors, food |
| Featured + row | Campaign highlight |
| Reel strip (9:16) | Video-first creators |

## Navigation

- Sticky header: 56–72px, blur backdrop on scroll (Webflow standard).
- Mobile: full-screen overlay, not cramped dropdowns.
- Editorial split-nav: logo centred, links split (Squarespace supply templates).
- One primary CTA in nav (pill or solid).

## Cards and sections

- Feature cards: icon + title + 2-line description (SaaS pattern).
- Stat cards: large number, small uppercase label.
- Pricing: 3 tiers, middle emphasised with border/shadow.
- Testimonials: real quotes only; gradient avatar placeholder if no photo.
- FAQ: native `<details>` accordion — accessible, no JS.

## Colour systems

- Neutral base + one accent extracted from user IG palette.
- Dark editorial: `#0f1117` bg, `#f5f5f4` text — photographers, luxury.
- Warm stone: `#faf9f7` bg — coaches, food, lifestyle.
- Accent on CTAs and one headline word — not backgrounds.

## Motion (CSS only)

- Fade-in on scroll: `opacity` + `translateY(16px)`, 0.6s ease.
- Hover lift: `translateY(-2px)` on buttons, `scale(1.04)` on images.
- Marquee ticker: duplicated text, 25s linear infinite.
- **Respect** `prefers-reduced-motion`.

## Anti-AI-slop checklist

- [ ] No purple gradient on white
- [ ] No "Welcome to my website" copy
- [ ] Max 2 font families
- [ ] Consistent border-radius (2px or 4px, not mixed)
- [ ] Real padding on every section
- [ ] Accessible labels on all sections
- [ ] Placeholder gradients/SVG — no copyrighted theme screenshots
