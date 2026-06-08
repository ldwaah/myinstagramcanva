import { ImageResponse } from "next/og";
import { OgBrandCard } from "@/lib/og-brand";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "My Instagram Canva pricing";

export default function Image() {
  return new ImageResponse(
    (
      <OgBrandCard
        eyebrow="Pricing"
        title="Simple, transparent plans"
        subtitle="Free trial on every plan. Starter from £27 — hosted for you."
      />
    ),
    { ...size },
  );
}
