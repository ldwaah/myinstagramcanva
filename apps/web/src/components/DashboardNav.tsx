"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/dashboard/collaborator", label: "Collaborator", icon: "✦" },
  { href: "/dashboard#upgrade", label: "Upgrade", icon: "↑" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="dash-nav dash-nav--desktop">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`dash-nav__link${pathname === link.href || (link.href === "/dashboard/collaborator" && pathname.includes("collaborator")) ? " dash-nav__link--active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          className="dash-nav__link"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
        >
          Log out
        </button>
      </nav>

      <nav className="dash-mobile-nav" aria-label="Dashboard">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`dash-mobile-nav__item${pathname === link.href ? " dash-mobile-nav__item--active" : ""}`}
          >
            <span aria-hidden>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
