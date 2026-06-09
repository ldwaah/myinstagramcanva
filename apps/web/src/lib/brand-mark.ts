/** Shared MIC monogram SVG (canvas frame + lettermark). Not Instagram-branded. */

export const BRAND_GRADIENT_STOPS = [
  { offset: "0%", color: "#7C3AED" },
  { offset: "50%", color: "#A855F7" },
  { offset: "100%", color: "#EC4899" },
] as const;

export const BRAND_GRADIENT_CSS =
  "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)";

/** Inline SVG for OG image generation scripts (unique gradient id per embed). */
export function brandMarkSvg({
  width = 88,
  height = 88,
  gradientId = "mic-grad",
}: {
  width?: number;
  height?: number;
  gradientId?: string;
} = {}): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C3AED"/>
      <stop offset="0.5" stop-color="#A855F7"/>
      <stop offset="1" stop-color="#EC4899"/>
    </linearGradient>
  </defs>
  <rect x="2.5" y="2.5" width="27" height="27" rx="7" stroke="url(#${gradientId})" stroke-width="2" fill="#7C3AED" fill-opacity="0.08"/>
  <path d="M21.5 2.5H29.5V10.5" stroke="url(#${gradientId})" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.5 20.5V11.5L10.5 15.5L13.5 11.5V20.5" stroke="url(#${gradientId})" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 11.5V20.5" stroke="url(#${gradientId})" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M22.5 20.5C19.8 20.5 18 18.4 18 16C18 13.6 19.8 11.5 22.5 11.5" stroke="url(#${gradientId})" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;
}
