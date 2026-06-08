import type { SiteTheme } from "./palette";

const ACCENT_PALETTE = [
  "#E1306C",
  "#833AB4",
  "#F77737",
  "#405DE6",
  "#5851DB",
  "#C13584",
  "#FD1D1D",
  "#FCAF45",
  "#c8ff00",
  "#00d4aa",
];

export const FONT_PAIRS = [
  { display: "Playfair Display", body: "Source Sans 3", google: "Playfair+Display:wght@600;700&family=Source+Sans+3:wght@400;600" },
  { display: "Syne", body: "DM Sans", google: "Syne:wght@600;700;800&family=DM+Sans:wght@400;500;700" },
  { display: "Cormorant Garamond", body: "Lato", google: "Cormorant+Garamond:wght@600;700&family=Lato:wght@400;700" },
  { display: "Bebas Neue", body: "DM Sans", google: "Bebas+Neue&family=DM+Sans:wght@400;500;700" },
  { display: "Oswald", body: "Inter", google: "Oswald:wght@500;600;700&family=Inter:wght@400;500;600" },
  { display: "Libre Baskerville", body: "Work Sans", google: "Libre+Baskerville:wght@700&family=Work+Sans:wght@400;500;600" },
  { display: "Space Grotesk", body: "IBM Plex Sans", google: "Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500" },
  { display: "Fraunces", body: "Nunito Sans", google: "Fraunces:opsz,wght@9..144,600;700&family=Nunito+Sans:wght@400;600" },
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

export function layoutVariantForUsername(username: string): "profile" | "cinematic" {
  return hashString(username + ":layout") % 3 === 0 ? "cinematic" : "profile";
}

/** Best-effort dominant color from an image URL (falls back to username hash). */
export async function accentFromImageUrl(
  imageUrl: string | undefined,
  username: string
): Promise<string> {
  const { extractThemeFromImages } = await import("./palette");
  const urls = imageUrl ? [imageUrl] : [];
  const theme = await extractThemeFromImages(urls, username);
  return theme.accent;
}

export function themeCssVariables(theme: SiteTheme, fonts: { display: string; body: string }): string {
  return `
:root {
  --ig-pink: ${theme.accent};
  --ig-purple: ${theme.accent2};
  --accent: ${theme.accent};
  --accent-2: ${theme.accent2};
  --accent-dim: ${theme.accentDim};
  --ig-gradient: ${theme.gradient};
  --gradient: ${theme.gradient};
  --bg: ${theme.bg};
  --surface: ${theme.surface};
  --surface-2: ${theme.surface2};
  --text: ${theme.text};
  --muted: ${theme.muted};
  --border: ${theme.border};
  --font-display: "${fonts.display}", Georgia, serif;
  --font-body: "${fonts.body}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font: var(--font-body);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
body.theme-dark { color-scheme: dark; }
body.theme-light { color-scheme: light; }
h1, h2, h3, .logo, .hero-title { font-family: var(--font-display); }
`.trim();
}

export function injectThemeIntoCss(
  css: string,
  themeOrAccent: SiteTheme | string,
  fonts: { display: string; body: string }
): string {
  const theme: SiteTheme =
    typeof themeOrAccent === "string"
      ? {
          accent: themeOrAccent,
          accent2: themeOrAccent,
          accentDim: `rgba(225, 48, 108, 0.15)`,
          gradient: `linear-gradient(135deg, ${themeOrAccent}, ${themeOrAccent})`,
          bg: "#fafafa",
          surface: "#ffffff",
          surface2: "#f5f5f5",
          text: "#262626",
          muted: "#8e8e8e",
          border: "#dbdbdb",
          isDark: false,
        }
      : themeOrAccent;

  const themeBlock = themeCssVariables(theme, fonts) + "\n";
  return (
    themeBlock +
    css
      .replace(/#e1306c/gi, theme.accent)
      .replace(/#E1306C/g, theme.accent)
      .replace(/#833ab4/gi, theme.accent2)
      .replace(/#833AB4/g, theme.accent2)
  );
}
