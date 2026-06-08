import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ReferralTracker } from "@/components/ReferralTracker";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: "My Instagram Canva",
  description: "Turn your Instagram into a website in minutes",
  themeColor: "#E1306C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
