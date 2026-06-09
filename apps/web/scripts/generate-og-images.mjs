/**
 * Generates static OG PNGs (1200×630) and apple-touch-icon in public/.
 * Run: node scripts/generate-og-images.mjs
 */
import { writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

if (process.env.NETLIFY && existsSync(join(publicDir, "og-default.png"))) {
  console.log("[generate-og] Skipping on Netlify. Committed OG assets present.");
  process.exit(0);
}

const LOGO = `<svg width="88" height="88" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C3AED"/>
      <stop offset="0.5" stop-color="#A855F7"/>
      <stop offset="1" stop-color="#EC4899"/>
    </linearGradient>
  </defs>
  <rect x="2.5" y="2.5" width="27" height="27" rx="7" stroke="url(#g)" stroke-width="2" fill="#7C3AED" fill-opacity="0.08"/>
  <path d="M21.5 2.5H29.5V10.5" stroke="url(#g)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.5 20.5V11.5L10.5 15.5L13.5 11.5V20.5" stroke="url(#g)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 11.5V20.5" stroke="url(#g)" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M22.5 20.5C19.8 20.5 18 18.4 18 16C18 13.6 19.8 11.5 22.5 11.5" stroke="url(#g)" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLines(text, maxChars = 42) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function ogSvg({ eyebrow, title, subtitle }) {
  const titleLines = wrapLines(title, 28);
  const subLines = wrapLines(subtitle, 48);
  const titleY = eyebrow ? 340 : 320;
  const titleSvg = titleLines
    .map(
      (l, i) =>
        `<tspan x="80" dy="${i === 0 ? 0 : 72}">${escapeXml(l)}</tspan>`,
    )
    .join("");
  const subSvg = subLines
    .map(
      (l, i) =>
        `<tspan x="80" dy="${i === 0 ? 0 : 38}">${escapeXml(l)}</tspan>`,
    )
    .join("");

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="#A855F7" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#EC4899" stop-opacity="0.1"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="10%" r="55%">
      <stop offset="0%" stop-color="#A855F7" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <rect width="1200" height="630" fill="url(#bg1)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(80, 72)">${LOGO}</g>
  <text x="188" y="130" fill="#fafafa" font-family="system-ui,-apple-system,sans-serif" font-size="28" font-weight="600">My Instagram Canva</text>
  ${
    eyebrow
      ? `<text x="80" y="260" fill="#A855F7" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="600" letter-spacing="3">${escapeXml(eyebrow.toUpperCase())}</text>`
      : ""
  }
  <text x="80" y="${titleY}" fill="#ffffff" font-family="system-ui,-apple-system,sans-serif" font-size="64" font-weight="700">${titleSvg}</text>
  <text x="80" y="${titleY + titleLines.length * 72 + 36}" fill="rgba(255,255,255,0.72)" font-family="system-ui,-apple-system,sans-serif" font-size="28">${subSvg}</text>
  <text x="80" y="580" fill="rgba(255,255,255,0.45)" font-family="system-ui,-apple-system,sans-serif" font-size="20">myinstagramcanva.com</text>
</svg>`;
}

const cards = [
  { file: "og-default.png", eyebrow: null, title: "Turn your Instagram into a website", subtitle: "AI-powered sites from your posts, colours and profile. Live in minutes." },
  { file: "og-pricing.png", eyebrow: "Pricing", title: "Plans from £27/month", subtitle: "14-day free trial. No card required. Starter, Creator, Pro and Studio." },
  { file: "og-affiliates.png", eyebrow: "Affiliate program", title: "Earn on every referral", subtitle: "Share your link · 30-day attribution · commission on every sale." },
  { file: "og-referral.png", eyebrow: "You're invited", title: "Start your free trial", subtitle: "Turn your Instagram into a professional website in minutes." },
];

for (const card of cards) {
  const svg = ogSvg(card);
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  writeFileSync(join(publicDir, card.file), png);
  console.log(`Wrote ${card.file}`);
}

const iconSvg = `<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="40" fill="#0a0a0a"/>
  <g transform="translate(46, 46)">${LOGO}</g>
</svg>`;
writeFileSync(join(publicDir, "apple-touch-icon.png"), new Resvg(iconSvg, { fitTo: { mode: "width", value: 180 } }).render().asPng());
console.log("Wrote apple-touch-icon.png");
