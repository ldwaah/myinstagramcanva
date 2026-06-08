import Link from "next/link";

interface SiteHeaderProps {
  variant?: "landing" | "minimal";
}

export function SiteHeader({ variant = "landing" }: SiteHeaderProps) {
  return (
    <header className={`landing-header${variant === "minimal" ? " landing-header--minimal" : ""}`}>
      <div className="mic-container landing-header__inner">
        <Link href="/" className="landing-logo">
          <span className="landing-logo__mark" aria-hidden />
          My Instagram Canva
        </Link>
        <nav className="landing-nav">
          <Link href="/pricing">Pricing</Link>
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
