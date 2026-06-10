import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./landing-premium.css";
import { buildRootMetadata, buildViewport, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildRootMetadata();
export const viewport: Viewport = buildViewport();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = organizationJsonLd();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
