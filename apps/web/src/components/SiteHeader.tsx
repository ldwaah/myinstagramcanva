"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { InstagramCanvaLogo } from "@/components/InstagramCanvaLogo";

interface SiteHeaderProps {
  variant?: "landing" | "minimal";
}

export function SiteHeader({ variant = "landing" }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  function closeMenu() {
    setMenuOpen(false);
  }

  const navLinks = (
    <>
      <Link href="/#how-it-works" className="landing-nav__link" onClick={closeMenu}>
        How it works
      </Link>
      <Link href="/#pricing" className="landing-nav__link" onClick={closeMenu}>
        Pricing
      </Link>
      <Link href="/#examples" className="landing-nav__link" onClick={closeMenu}>
        Examples
      </Link>
      <Link href="/#faq" className="landing-nav__link" onClick={closeMenu}>
        FAQ
      </Link>
      <Link
        href="/#request"
        className="landing-nav__cta landing-cta-shimmer"
        onClick={closeMenu}
      >
        <span className="landing-nav__cta-text">Request my website</span>
      </Link>
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
          MyInstagramCanva
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
