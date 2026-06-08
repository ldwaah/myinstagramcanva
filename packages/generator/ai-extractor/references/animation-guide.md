# Animation guide

Performant CSS-only animation patterns for ai-extractor elements.

## Principles

1. **Animate transform and opacity only** — avoids layout thrashing.
2. **Duration**: 150ms (micro), 250ms (standard), 400ms (images), 600ms (reveal).
3. **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for most transitions.
4. **One motion type per viewport** — don't combine parallax + scroll reveal + marquee on the same scroll position.

## Scroll reveal

```css
.el-reveal { opacity: 0; transform: translateY(16px); transition: 0.6s ease; }
.el-reveal.is-visible { opacity: 1; transform: translateY(0); }
```

Toggle `.is-visible` via Intersection Observer in `main.js` — threshold 0.15.

## Hover states

| Element | Effect |
|---------|--------|
| Buttons | `translateY(-2px)` + accent shadow |
| Gallery cells | `scale(1.04)` on image |
| Cards | `translateY(-2px)` + border colour shift |
| Text links | underline + arrow `translateX(4px)` |

## Marquee ticker

- Duplicate content 2–4× in track.
- `animation: el-marquee-scroll 25s linear infinite`.
- Pause on `prefers-reduced-motion: reduce`.

## Hero entrance

- Optional `.el-hero-enter` with `animation: el-fade-in-up 0.8s ease` on load.
- Stagger children with `animation-delay: 0.1s, 0.2s, 0.3s`.

## Parallax

- `background-attachment: fixed` on desktop only.
- Disable on mobile (`@media (max-width: 768px) { background-attachment: scroll; }`).
- Max one parallax section per page.

## What to avoid

- Particle backgrounds, custom cursors, loading spinners.
- `animation` on `width`, `height`, `top`, `left`.
- Autoplay video with sound.
- Scroll-jacking.
