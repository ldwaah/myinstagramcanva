/** Elements that add redundant primary CTAs — dropped in sparse layouts. */
export const SPARSE_SKIP_ELEMENTS = new Set([
  "section-booking-cta",
  "contact-cta-band",
  "section-album-promo",
  "section-testimonial-row",
  "section-marquee-ticker",
  "section-product-grid",
  "about-split",
]);

/** Sparse layout recipes — Squarespace-style, one hero CTA + link contact. */
export const SPARSE_LAYOUT_ELEMENTS: Record<string, string[]> = {
  "coach-services": [
    "nav-minimal",
    "hero-profile",
    "about-stats",
    "section-services-list",
    "about-bio",
    "contact-link-grid",
    "footer-minimal",
  ],
  "influencer-shop": [
    "nav-overlay-mobile",
    "hero-profile",
    "gallery-grid",
    "about-bio",
    "contact-link-grid",
    "footer-social",
  ],
  "photographer-dark": [
    "nav-minimal",
    "hero-profile",
    "gallery-grid",
    "about-bio",
    "contact-link-grid",
    "footer-minimal",
  ],
  "musician-promo": [
    "nav-minimal",
    "hero-profile",
    "gallery-grid",
    "about-bio",
    "contact-link-grid",
    "footer-social",
  ],
  "fitness-coach": [
    "nav-minimal",
    "hero-profile",
    "about-stats",
    "section-services-list",
    "about-bio",
    "contact-link-grid",
    "footer-minimal",
  ],
};

const BTN_SELECTOR =
  /<(?:a|button)\b[^>]*\bclass="[^"]*\bel-btn\b[^"]*"[^>]*>[\s\S]*?<\/(?:a|button)>/gi;

const HERO_ACTION_BLOCKS = [
  /(<div class="el-hero-profile__actions">)[\s\S]*?(<\/div>)/,
  /(<div class="el-hero-cinematic__actions">)[\s\S]*?(<\/div>)/,
  /(<div class="el-hero-split__actions">)[\s\S]*?(<\/div>)/,
  /(<div class="el-hero-minimal__actions">)[\s\S]*?(<\/div>)/,
  /(<div class="el-hero-announcement__actions">)[\s\S]*?(<\/div>)/,
  /(<div class="el-hero-overlap-portrait__actions">)[\s\S]*?(<\/div>)/,
  /(<div class="el-hero-gradient-mesh__actions">)[\s\S]*?(<\/div>)/,
];

function extractPrimaryButton(block: string): string | null {
  const matches = [...block.matchAll(BTN_SELECTOR)];
  const primary = matches.find((m) => /el-btn--primary/.test(m[0]));
  return primary?.[0] ?? matches[0]?.[0] ?? null;
}

/** Keep one primary button per hero action block. */
export function limitHeroCtas(html: string): string {
  let out = html;
  for (const re of HERO_ACTION_BLOCKS) {
    out = out.replace(re, (full, open: string, close: string) => {
      const primary = extractPrimaryButton(full);
      if (!primary) return full;
      const indent = open.includes("profile") ? "        " : "      ";
      return `${open}\n${indent}${primary}\n      ${close}`;
    });
  }
  return out;
}

/** Remove standalone section-level button CTAs after the first primary site-wide. */
export function limitPageCtas(html: string, maxButtons = 2): string {
  let seen = 0;
  return html.replace(BTN_SELECTOR, (match) => {
    seen += 1;
    if (seen <= maxButtons) return match;
    return "";
  });
}

/** Full CTA pass: one hero primary, max two buttons total on page. */
export function limitLayoutCtas(html: string): string {
  return limitPageCtas(limitHeroCtas(html), 2);
}

/** Count el-btn anchors/buttons in composed HTML (for tests). */
export function countLayoutCtas(html: string): number {
  return (html.match(BTN_SELECTOR) ?? []).length;
}
