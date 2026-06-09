"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: SessionState) => setSession(data))
      .catch(() => setSession({ loggedIn: false }));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setSigningOut(false);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const navLinks = (
    <>
      <Link href="/pricing" className="landing-nav__pricing" onClick={closeMenu}>
        Pricing
      </Link>
      <Link href="/#examples" className="landing-nav__examples" onClick={closeMenu}>
        Examples
      </Link>
      <Link href="/affiliates" className="landing-nav__affiliates" onClick={closeMenu}>
        Affiliates
      </Link>
      {session.loggedIn ? (
        <>
          <Link href="/dashboard" className="landing-nav__login" onClick={closeMenu}>
            My account
          </Link>
          <button
            type="button"
            className="landing-nav__signout"
            onClick={() => {
              closeMenu();
              void handleSignOut();
            }}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
          <Link
            href="/dashboard"
            className="landing-nav__cta landing-cta-shimmer"
            onClick={closeMenu}
          >
            <span className="landing-nav__cta-text">My dashboard</span>
          </Link>
        </>
      ) : (
        <>
          <Link href="/login" className="landing-nav__login" onClick={closeMenu}>
            Login
          </Link>
          <Link
            href="/signup"
            className="landing-nav__cta landing-cta-shimmer"
            onClick={closeMenu}
          >
            <span className="landing-nav__cta-text">Start free trial</span>
          </Link>
        </>
      )}
    </>
  );

  const mobileMenu =
    mounted && menuOpen
      ? createPortal(
          <div className="landing-nav__overlay" role="presentation">
            <button
              type="button"
              className="landing-nav__backdrop"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <aside
              id="landing-nav-mobile"
              className="landing-nav landing-nav--drawer is-open"
              aria-label="Mobile"
            >
              <div className="landing-nav__drawer-head">
                <span className="landing-nav__drawer-title">Menu</span>
                <button
                  type="button"
                  className="landing-nav__close"
                  aria-label="Close menu"
                  onClick={closeMenu}
                >
                  <span className="landing-nav__close-icon" aria-hidden />
                </button>
              </div>
              <div className="landing-nav__drawer-links">{navLinks}</div>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <header
      className={`landing-header${variant === "minimal" ? " landing-header--minimal" : ""}${menuOpen ? " landing-header--menu-open" : ""}`}
    >
      <div className="mic-container landing-header__inner">
        <Link href="/" className="landing-logo">
          <InstagramCanvaLogo size={28} className="landing-logo__mark" />
          My Instagram Canva
        </Link>

        <nav
          className={`landing-nav landing-nav--desktop${variant === "minimal" ? " landing-nav--minimal" : ""}`}
          aria-label="Main"
        >
          {navLinks}
        </nav>

        <button
          type="button"
          className={`landing-nav__toggle${menuOpen ? " is-open" : ""}`}
          aria-expanded={menuOpen}
          aria-controls="landing-nav-mobile"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="landing-nav__toggle-bar" />
          <span className="landing-nav__toggle-bar" />
          <span className="landing-nav__toggle-bar" />
        </button>
      </div>
      {mobileMenu}
    </header>
  );
}
