import { ImageResponse } from "next/og";
import { OgBrandCard } from "@/lib/og-brand";
import { SITE_TAGLINE } from "@/lib/seo";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "My Instagram Canva. Turn your Instagram into a website";

export default function Image() {
  return new ImageResponse(
    (
      <OgBrandCard
        title="Turn your Instagram into a professional website"
        subtitle={SITE_TAGLINE}
      />
    ),
    { ...size },
  );
}
