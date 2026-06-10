import { ImageResponse } from "next/og";
import { OgBrandCard } from "@/lib/og-brand";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Join My Instagram Canva. Free trial";

export default function Image() {
  return new ImageResponse(
    (
      <OgBrandCard
        eyebrow="You're invited"
        title="Start your free trial"
        subtitle="We create your website from your Instagram. 14-day free trial."
      />
    ),
    { ...size },
  );
}
