# WordPress premium theme patterns

Patterns from Astra, Kadence, GeneratePress, and Blocksy — the most common premium theme aesthetics for creator and business sites.

## Astra / Kadence aesthetics

- Clean, lightweight layouts with strong typography hierarchy.
- Hero: split layout (text left, image right) or centred with background.
- Service blocks: 3-column icon/title/description cards.
- Testimonial: quote + avatar + name in card format.
- CTA band: full-width coloured strip with headline + button.

## GeneratePress patterns

- Minimal chrome — content-first, thin borders, subtle shadows.
- Overlap sections: image extends beyond container edge.
- Sticky navigation with shrink on scroll.
- Footer widget columns (3–4).

## Common block patterns

| Block | Element mapping |
|-------|----------------|
| Cover block hero | hero-full-bleed, media-video-hero |
| Media & text | hero-split, about-split |
| Columns (3) | about-services-numbered, section-pricing-table |
| Testimonials | card-testimonial-quote, section-testimonial-row |
| Contact form | contact-form-strip, contact-split-panel |
| Stats counter | about-stats, card-stat-highlight |

## Design tokens (theme defaults)

- Container width: 1200px (Astra), 1140px (Kadence).
- Base font size: 16px (17px Kadence).
- Border radius: 3–5px (GeneratePress), 0px (Astra minimal).
- Button padding: 12px 24px (medium), 10px 20px (small).

## Colour approach

- Global palette: primary, secondary, text, background, accent.
- Kadence: header/footer can differ from body background.
- Accent used on buttons, links, and active nav — not section fills.

## Performance habits

- System font fallbacks until web fonts load.
- Lazy-load all images below fold.
- Minimal JS — accordions via `<details>`, menus via CSS/ light JS.
