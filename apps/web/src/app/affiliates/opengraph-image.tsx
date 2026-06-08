import { ImageResponse } from "next/og";
import { OgBrandCard } from "@/lib/og-brand";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "My Instagram Canva affiliate program";

export default function Image() {
  return new ImageResponse(
    (
      <OgBrandCard
        eyebrow="Affiliate program"
        title="Earn on every referral"
        subtitle="Share your link · 30-day attribution · commission on every sale."
      />
    ),
    { ...size },
  );
}
