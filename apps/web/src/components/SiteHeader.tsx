"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { InstagramCanvaLogo } from "@/components/InstagramCanvaLogo";

interface SiteHeaderProps {
  variant?: "landing" | "minimal";
}

type SessionState = {
  loggedIn: boolean;
  hasSites?: boolean;
};

export function SiteHeader({ variant = "landing" }: SiteHeaderProps) {
  const [session, setSession] = useState<SessionState>({ loggedIn: false });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: SessionState) => setSession(data))
      .catch(() => setSession({ loggedIn: false }));
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setSigningOut(false);
    }
  }

  const showPricing = variant === "landing";

  return (
    <header className={`landing-header${variant === "minimal" ? " landing-header--minimal" : ""}`}>
      <div className="mic-container landing-header__inner">
        <Link href="/" className="landing-logo">
          <InstagramCanvaLogo size={28} className="landing-logo__mark" />
          Instagram Canva
        </Link>
        <nav className={`landing-nav${variant === "minimal" ? " landing-nav--minimal" : ""}`}>
          {showPricing && (
            <>
              <Link href="/pricing" className="landing-nav__pricing">
                Pricing
              </Link>
              <Link href="/affiliates" className="landing-nav__affiliates">
                Affiliates
              </Link>
            </>
          )}
          {session.loggedIn ? (
            <>
              <Link href="/dashboard">My account</Link>
              <button
                type="button"
                className="landing-nav__signout"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
              <Link href="/dashboard" className="landing-nav__cta landing-cta-shimmer">
                <span className="landing-nav__cta-text">My dashboard</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="landing-nav__cta landing-cta-shimmer">
                <span className="landing-nav__cta-text">Start free trial</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
