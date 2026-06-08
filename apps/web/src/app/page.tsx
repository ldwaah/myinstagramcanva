import Link from "next/link";
import { CreateHeroButton } from "@/components/landing/CreateHeroButton";
import { HeroVisualScene } from "@/components/landing/HeroVisualScene";
import { SponsorCredit } from "@/components/SponsorCredit";

const tiers = [
  { name: "Starter", price: "£27", line: "Site + hosting" },
  { name: "Tailored", price: "£54", line: "Leads + design", featured: true },
  { name: "Pro", price: "£101", line: "Calendar + funnel" },
  { name: "Studio", price: "£299", line: "CRM + campaigns" },
];

const steps = [
  { icon: "◎", label: "@username" },
  { icon: "✦", label: "AI builds" },
  { icon: "↗", label: "Go live" },
];

export default function HomePage() {
  return (
    <main className="landing landing--art">
      <header className="landing-header landing-header--minimal">
        <div className="mic-container landing-header__inner">
          <Link href="/" className="landing-logo">
            <span className="landing-logo__mark" aria-hidden />
            Home
          </Link>
          <nav className="landing-nav landing-nav--minimal">
            <Link href="/affiliates">Affiliates</Link>
            <Link href="/login">Log in</Link>
          </nav>
        </div>
      </header>

      <section className="hero-basics hero-basics--art">
        <HeroVisualScene />
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="landing-grain" aria-hidden />

        <div className="hero-basics__content">
          <h1 className="hero-basics__title hero-basics__title--solo">
            Create your
            <span className="hero-basics__title-accent"> Instagram Canva</span>
          </h1>
          <CreateHeroButton />
        </div>
      </section>

      <section id="how-it-works" className="landing-strip">
        <div className="mic-container landing-strip__row">
          {steps.map((s) => (
            <div key={s.label} className="landing-strip__item">
              <span className="landing-strip__icon">{s.icon}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="landing-strip landing-strip--pricing">
        <div className="mic-container landing-pricing-min">
          {tiers.map((t) => (
            <article
              key={t.name}
              className={`landing-pricing-min__card${t.featured ? " landing-pricing-min__card--hot" : ""}`}
            >
              <h3>{t.name}</h3>
              <p className="landing-pricing-min__price">{t.price}</p>
              <p className="landing-pricing-min__line">{t.line}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer landing-footer--minimal">
        <div className="mic-container landing-footer__inner">
          <Link href="/affiliates" className="landing-footer__muted">Affiliates</Link>
          <SponsorCredit className="landing-footer__sponsor" />
          <span className="landing-footer__muted">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
