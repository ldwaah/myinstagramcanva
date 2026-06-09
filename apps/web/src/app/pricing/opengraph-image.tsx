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
        subtitle="14-day free trial. No card required. Plans from £27/month."
      />
    ),
    { ...size },
  );
}
