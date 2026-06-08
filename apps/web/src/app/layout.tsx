import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ReferralTracker } from "@/components/ReferralTracker";
import { buildRootMetadata, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildRootMetadata();

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
      <body>
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
