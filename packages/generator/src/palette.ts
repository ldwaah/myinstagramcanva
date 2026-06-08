import sharp from "sharp";
import { accentFromUsername, hashString } from "./theme";

export interface SiteTheme {
  accent: string;
  accent2: string;
  accentDim: string;
  gradient: string;
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  isDark: boolean;
}

type Rgb = { r: number; g: number; b: number };

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

/** Extract a cohesive theme from profile + post imagery. */
export async function extractThemeFromImages(
  imageUrls: string[],
  username: string
): Promise<SiteTheme> {
  const urls = [...new Set(imageUrls.filter((u) => u?.startsWith("http")))].slice(0, 6);
  const buckets = new Map<string, number>();

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: FETCH_HEADERS, signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const { data, info } = await sharp(buf)
        .resize(64, 64, { fit: "cover" })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const step = 3;
      for (let i = 0; i < data.length; i += step * 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r + g + b < 30 || r + g + b > 740) continue;
        const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }

      void info;
    } catch {
      /* skip broken image */
    }
  }

  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  const dominant: Rgb[] = sorted.slice(0, 5).map(([key]) => {
    const [r, g, b] = key.split("-").map((n) => Number(n) * 24 + 12);
    return { r: clamp(r), g: clamp(g), b: clamp(b) };
  });

  if (!dominant.length) {
    return themeFromAccent(accentFromUsername(username), username);
  }

  return buildThemeFromPalette(dominant, username);
}

function isNeutralHex(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return Math.max(r, g, b) - Math.min(r, g, b) < 18;
}

export function buildThemeFromPalette(colors: Rgb[], username: string): SiteTheme {
  let accent = pickAccent(colors, username);
  if (isNeutralHex(accent)) {
    accent = vibrantAccentFromUsername(username, colors[0]);
  }
  const accent2 = shiftHue(accent, hashString(username) % 2 === 0 ? 35 : -28);
  const luminance = relativeLuminance(accent);
  const avgBrightness =
    colors.reduce((sum, c) => sum + (c.r + c.g + c.b) / 3, 0) / colors.length;
  const isDark = avgBrightness < 118 || luminance < 0.35;

  const bg = isDark ? "#0a0b0c" : "#fafafa";
  const surface = isDark ? "#121416" : "#ffffff";
  const surface2 = isDark ? "#1a1d21" : "#f5f5f5";
  const text = isDark ? "#f2f0eb" : "#262626";
  const muted = isDark ? "#8a8f96" : "#8e8e8e";
  const border = isDark ? "rgba(242, 240, 235, 0.12)" : "#dbdbdb";

  return {
    accent,
    accent2,
    accentDim: hexToRgba(accent, isDark ? 0.18 : 0.12),
    gradient: `linear-gradient(135deg, ${accent}, ${accent2})`,
    bg,
    surface,
    surface2,
    text,
    muted,
    border,
    isDark,
  };
}

export function themeFromAccent(accent: string, username: string): SiteTheme {
  const colors: Rgb[] = [
    hexToRgb(accent),
    hexToRgb(shiftHue(accent, 40)),
    hexToRgb(shiftHue(accent, -30)),
  ];
  return buildThemeFromPalette(colors, username);
}

function pickAccent(colors: Rgb[], username: string): string {
  const scored = colors.map((c) => {
    const max = Math.max(c.r, c.g, c.b);
    const min = Math.min(c.r, c.g, c.b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const lum = (c.r + c.g + c.b) / 3;
    const score = sat * 120 + (lum > 50 && lum < 210 ? 40 : 0);
    return { c, score, sat };
  });
  scored.sort((a, b) => b.score - a.score);
  const avgSat = scored.slice(0, 3).reduce((sum, s) => sum + s.sat, 0) / Math.min(3, scored.length);
  if (!scored.length || avgSat < 0.15) {
    return vibrantAccentFromUsername(username, colors[0]);
  }
  const pick = scored[hashString(username) % Math.min(3, scored.length)]?.c || colors[0];
  return boostSaturation(rgbToHex(pick));
}

/** When IG imagery is mostly neutral (B&W sports, etc.), derive a bold accent from username + content hue. */
function vibrantAccentFromUsername(username: string, hint?: Rgb): string {
  const fallback = accentFromUsername(username);
  if (!hint) return fallback;
  const contentHue = rgbToHsl(hint.r, hint.g, hint.b)[0];
  const seedHue = (contentHue + hashString(username) * 37) % 360;
  const [r, g, b] = hslToRgb(seedHue, 0.72, 0.55);
  return rgbToHex({ r, g, b });
}

function boostSaturation(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  if (max < 40) return hex;
  const scale = 210 / max;
  return rgbToHex({
    r: clamp(Math.round(r * scale)),
    g: clamp(Math.round(g * scale)),
    b: clamp(Math.round(b * scale)),
  });
}

function shiftHue(hex: string, degrees: number): string {
  const { r, g, b } = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const nh = (h + degrees + 360) % 360;
  const [nr, ng, nb] = hslToRgb(nh, Math.min(1, s * 1.1), l);
  return rgbToHex({ r: nr, g: ng, b: nb });
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(255, n));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h / 360 + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h / 360) * 255),
    Math.round(hue2rgb(p, q, h / 360 - 1 / 3) * 255),
  ];
}
