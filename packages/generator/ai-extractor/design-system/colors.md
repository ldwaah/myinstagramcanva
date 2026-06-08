# Colour system

How to apply neutral bases and per-user Instagram palette accents.

## Structure

Every palette defines CSS custom properties:

| Token | Role |
|-------|------|
| `--el-bg` | Page background |
| `--el-surface` | Cards, panels, alternate sections |
| `--el-text` | Primary text |
| `--el-muted` | Secondary text, captions |
| `--el-accent` | CTAs, links, section tags |
| `--el-accent-dim` | Hover states, gradients, soft highlights |
| `--el-border` | Dividers, input borders |

## Applying user IG colours

1. **Start with a neutral palette** from `palettes/` matching the site's mood (warm light, cool light, editorial dark).
2. **Extract accent** from the user's IG brand colour or dominant post hue.
3. **Override only `--el-accent` and `--el-accent-dim`** — keep neutrals from the preset for readability.
4. **Contrast check**: accent on white needs ≥ 4.5:1 for button text; on dark backgrounds use light text on accent buttons.
5. **Never** replace `--el-bg` with saturated brand colour — backgrounds stay neutral.

## Accent derivation (generator)

```
accent = user.brandColor || dominantColorFromPosts || palette.tokens['--el-accent']
accentDim = mix(accent, surface, 40%)
```

## Anti-slop colour rules

- One accent + neutrals — no rainbow gradients.
- Accent on **actions and one headline word** — not full section backgrounds.
- Dark editorial: near-black bg (`#0f1117`), warm off-white text (`#f5f5f4`).
- Light neutral: warm stone (`#faf9f7`) or cool slate (`#f8fafc`).
- Avoid: purple-on-white defaults, neon gradients, glassmorphism stacks.

## Dark mode

When `theme.isDark` is true, the generator's `themeCssVariables()` overrides palette tokens. Elements should always reference `var(--el-*)` — never hard-coded hex except as fallbacks.
