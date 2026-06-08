const ACCENT_PALETTE = [
  "#E1306C",
  "#833AB4",
  "#F77737",
  "#405DE6",
  "#5851DB",
  "#C13584",
  "#FD1D1D",
  "#FCAF45",
];

export const FONT_PAIRS = [
  { display: "Playfair Display", body: "Source Sans 3", google: "Playfair+Display:wght@600;700&family=Source+Sans+3:wght@400;600" },
  { display: "Syne", body: "DM Sans", google: "Syne:wght@600;700&family=DM+Sans:wght@400;500" },
  { display: "Cormorant Garamond", body: "Lato", google: "Cormorant+Garamond:wght@600;700&family=Lato:wght@400;700" },
] as const;

export function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function accentFromUsername(username: string): string {
  return ACCENT_PALETTE[hashString(username) % ACCENT_PALETTE.length];
}

export function fontPairForUsername(username: string) {
  return FONT_PAIRS[hashString(username) % FONT_PAIRS.length];
}

/** Best-effort dominant color from an image URL (falls back to username hash). */
export async function accentFromImageUrl(
  imageUrl: string | undefined,
  username: string
): Promise<string> {
  const fallback = accentFromUsername(username);
  if (!imageUrl?.startsWith("http")) return fallback;

  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "MyInstagramCanva/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return fallback;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 24) return fallback;

    // Sample RGB bytes from JPEG/PNG header region (cheap heuristic, no native deps)
    let r = 0;
    let g = 0;
    let b = 0;
    let samples = 0;
    const step = Math.max(1, Math.floor(buf.length / 120));
    for (let i = 0; i < buf.length - 2; i += step) {
      r += buf[i];
      g += buf[i + 1];
      b += buf[i + 2];
      samples++;
    }
    r = Math.round(r / samples);
    g = Math.round(g / samples);
    b = Math.round(b / samples);

    // Boost saturation for web accent
    const max = Math.max(r, g, b);
    if (max < 40) return fallback;
    const scale = 220 / max;
    r = Math.min(255, Math.round(r * scale));
    g = Math.min(255, Math.round(g * scale));
    b = Math.min(255, Math.round(b * scale));

    return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  } catch {
    return fallback;
  }
}

export function injectThemeIntoCss(
  css: string,
  accent: string,
  fonts: { display: string; body: string }
): string {
  const themeBlock = `
:root {
  --ig-pink: ${accent};
  --accent: ${accent};
  --font-display: "${fonts.display}", Georgia, serif;
  --font-body: "${fonts.body}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font: var(--font-body);
}
h1, h2, h3, .logo { font-family: var(--font-display); }
`;
  return themeBlock + css.replace(/#e1306c/gi, accent).replace(/#E1306C/g, accent);
}
