# Composition rules — niche to layout mapping

How the AI (or heuristic picker) should select layouts and elements per Instagram niche.

## Niche → layout

| Niche keywords | Layout ID | Palette |
|----------------|-----------|---------|
| fitness, trainer, gym, wellness | fitness-coach | ocean-fresh |
| fashion, beauty, model, stylist | fashion-editorial | blush-editorial |
| business, coach, consultant, agency | business-consultant | slate-cool |
| food, chef, recipe, restaurant | food-creator | forest-earth |
| photographer, visual, sports | photographer-dark | editorial-dark |
| lifestyle, creator, influencer | lifestyle-minimal | sand-minimal |
| studio, agency, design | studio-agency | charcoal-gold |
| travel, adventure, outdoor | travel-visual | sand-minimal |
| default / general creator | creator-portfolio | editorial-dark |
| coach / landing page | split-landing | neutral-warm |
| minimal profile | profile-minimal | neutral-cool |

## Element selection per section

### Always include
- One navigation variant
- One hero variant
- One contact variant
- One footer variant

### Optional by content
- **Has reels** → gallery-reel-strip or gallery-carousel
- **Has stats (followers etc.)** → about-stats or hero-asymmetric with STATS_ROW
- **Offers services** → about-services-numbered or section-pricing-table
- **Strong photography** → gallery-masonry, gallery-staggered, media-parallax-image
- **Business tier** → contact-split-panel, section-faq-accordion
- **List building** → contact-newsletter or footer-newsletter

## Section order templates

**Portfolio-first** (photographers, fashion):
`nav → hero → gallery → about → contact → footer`

**Coach/business** (consultants, fitness):
`nav → hero → stats/services → testimonials → pricing/faq → contact → footer`

**Creator/minimal** (lifestyle, general):
`nav → hero → marquee → gallery-grid → about-bio → contact-links → footer`

## Palette selection

1. Match niche mood (warm vs cool vs dark).
2. Override `--el-accent` from user's IG brand colour.
3. Never use more than one palette per page.
4. Dark layouts need light text tokens — use editorial-dark or midnight-saas.

## Token budget strategy

- Pick layout with `tokens: "low"` elements only when possible.
- LLM writes copy into `{{PLACEHOLDER}}` keys — not HTML.
- Reserve `tokens: "high"` elements (media-video-hero) for Pro/Studio tiers.

## Quality gates before emit

1. At least one gallery or portfolio section if user has ≥ 6 posts.
2. Contact section matches tier (form for Tailored+, links for Free).
3. No duplicate element categories (one hero, one footer).
4. Marquee appears max once per page.
