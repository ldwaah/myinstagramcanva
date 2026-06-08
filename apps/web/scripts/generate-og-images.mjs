/**
 * Generates static OG PNGs (1200×630) and apple-touch-icon in public/.
 * Run: node scripts/generate-og-images.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

const LOGO = `<svg width="88" height="88" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f09433"/><stop offset="0.25" stop-color="#e6683c"/>
      <stop offset="0.5" stop-color="#dc2743"/><stop offset="0.75" stop-color="#cc2366"/>
      <stop offset="1" stop-color="#bc1888"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#g)" stroke-width="2.5"/>
  <circle cx="16" cy="16" r="6.5" stroke="url(#g)" stroke-width="2"/>
  <circle cx="23.5" cy="8.5" r="1.75" fill="url(#g)"/>
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
      <stop offset="0%" stop-color="#f09433" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="#dc2743" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#bc1888" stop-opacity="0.1"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="10%" r="55%">
      <stop offset="0%" stop-color="#dc2743" stop-opacity="0.35"/>
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
      ? `<text x="80" y="260" fill="#e1306c" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="600" letter-spacing="3">${escapeXml(eyebrow.toUpperCase())}</text>`
      : ""
  }
  <text x="80" y="${titleY}" fill="#ffffff" font-family="system-ui,-apple-system,sans-serif" font-size="64" font-weight="700">${titleSvg}</text>
  <text x="80" y="${titleY + titleLines.length * 72 + 36}" fill="rgba(255,255,255,0.72)" font-family="system-ui,-apple-system,sans-serif" font-size="28">${subSvg}</text>
  <text x="80" y="580" fill="rgba(255,255,255,0.45)" font-family="system-ui,-apple-system,sans-serif" font-size="20">myinstagramcanva.com</text>
</svg>`;
}

const cards = [
  { file: "og-default.png", eyebrow: null, title: "Turn your Instagram into a website", subtitle: "AI-powered sites from your posts, colours & profile — live in minutes." },
  { file: "og-pricing.png", eyebrow: "Pricing", title: "Simple, transparent plans", subtitle: "Free trial on every plan. Starter from £27 — hosted for you." },
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
  <g transform="translate(46, 46)">${LOGO.replace('width="88" height="88"', 'width="88" height="88"')}</g>
</svg>`;
writeFileSync(join(publicDir, "apple-touch-icon.png"), new Resvg(iconSvg, { fitTo: { mode: "width", value: 180 } }).render().asPng());
console.log("Wrote apple-touch-icon.png");
