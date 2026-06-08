import Link from "next/link";
import { InstagramCanvaLogo } from "@/components/InstagramCanvaLogo";
import { HeroVisualScene } from "@/components/landing/HeroVisualScene";
import { SponsorCredit } from "@/components/SponsorCredit";

const bullets = ["Share your link", "30-day attribution", "Earn on every sale"];

export default function AffiliatesPage() {
  return (
    <main className="landing landing--art">
      <header className="landing-header landing-header--minimal">
        <div className="mic-container landing-header__inner">
          <Link href="/" className="landing-logo">
            <InstagramCanvaLogo size={28} className="landing-logo__mark" />
            Instagram Canva
          </Link>
          <nav className="landing-nav landing-nav--minimal">
            <Link href="/login">Log in</Link>
          </nav>
        </div>
      </header>

      <section className="hero-basics hero-basics--art hero-basics--short">
        <HeroVisualScene />
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="landing-grain" aria-hidden />

        <div className="hero-basics__content">
          <h1 className="hero-basics__title hero-basics__title--solo">
            Earn on
            <span className="hero-basics__title-accent"> every referral</span>
          </h1>
          <ul className="affiliate-bullets">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <Link href="/dashboard/affiliates" className="hero-create-btn landing-cta-shimmer">
            Get my link
          </Link>
        </div>
      </section>

      <footer className="landing-footer landing-footer--minimal">
        <div className="mic-container landing-footer__inner">
          <SponsorCredit className="landing-footer__sponsor" />
          <span className="landing-footer__muted">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
