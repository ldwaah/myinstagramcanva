import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Instagram Canva",
  description: "Turn your Instagram into a website in minutes",
  themeColor: "#E1306C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
