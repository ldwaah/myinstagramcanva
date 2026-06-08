import Link from "next/link";
import { InstagramCanvaLogo } from "@/components/InstagramCanvaLogo";

interface SiteHeaderProps {
  variant?: "landing" | "minimal";
}

export function SiteHeader({ variant = "landing" }: SiteHeaderProps) {
  return (
    <header className={`landing-header${variant === "minimal" ? " landing-header--minimal" : ""}`}>
      <div className="mic-container landing-header__inner">
        <Link href="/" className="landing-logo">
          <InstagramCanvaLogo size={28} className="landing-logo__mark" />
          Instagram Canva
        </Link>
        <nav className="landing-nav">
          <Link href="/pricing" className="landing-nav__pricing">
            Pricing
          </Link>
          <Link href="/affiliates">Affiliates</Link>
          <Link href="/login">Log in</Link>
          <Link href="/signup" className="landing-nav__cta landing-cta-shimmer">
            Start free trial
          </Link>
        </nav>
      </div>
    </header>
  );
}
