import Link from "next/link";
import type { ReactNode } from "react";
import { InstagramCanvaLogo } from "@/components/InstagramCanvaLogo";
import { TRIAL_DAYS } from "@/lib/trial-constants";
import { MicCard } from "./MicCard";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="landing-aurora auth-layout__aurora" aria-hidden />
      <div className="landing-grain" aria-hidden />
      <div className="auth-layout__grid">
        <aside className="auth-layout__brand">
          <Link href="/" className="landing-logo auth-layout__logo">
            <InstagramCanvaLogo size={28} className="landing-logo__mark" />
            Instagram Canva
          </Link>
          <h1 className="auth-layout__headline">
            Turn your Instagram into a
            <span className="auth-layout__headline-accent"> stunning website</span>
          </h1>
          <p className="auth-layout__pitch">
            AI-built sites with your photos, fonts, and brand colors. {TRIAL_DAYS}-day free trial, no
            credit card required.
          </p>
          <ul className="auth-layout__perks">
            <li>Live in under 5 minutes</li>
            <li>Instagram-inspired design</li>
            <li>Hosted on your own subdomain</li>
          </ul>
        </aside>
        <section className="auth-layout__panel">
          <MicCard glass glow padding="lg">
            <h2 className="auth-layout__form-title">{title}</h2>
            <p className="auth-layout__form-sub">{subtitle}</p>
            {children}
          </MicCard>
        </section>
      </div>
    </div>
  );
}
