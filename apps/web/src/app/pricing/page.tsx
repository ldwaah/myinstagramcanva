import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SponsorCredit } from "@/components/SponsorCredit";
import { TRIAL_DAYS } from "@/lib/trial-constants";

const tiers = [
  { name: "Starter", price: "£27", line: "AI site from your Instagram" },
  { name: "Tailored", price: "£54", line: "Lead form + we design it for you", featured: true },
  { name: "Pro", price: "£101", line: "Calendar + marketing funnel" },
  { name: "Studio", price: "£299", line: "CRM + email & SMS campaigns" },
];

export default function PricingPage() {
  return (
    <main className="landing landing--art">
      <SiteHeader />
      <section className="pricing-page">
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="mic-container pricing-page__inner">
          <h1 className="pricing-page__title">Pricing</h1>
          <p className="pricing-page__sub">
            {TRIAL_DAYS}-day free trial on your site. Go live anytime — card on file, cancel before trial ends.
          </p>
          <div className="landing-pricing-min pricing-page__grid">
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
          <p className="pricing-page__collab">
            AI Collaborator from £10/mo — unlimited AI edits with your OpenAI key.
          </p>
          <Link href="/signup" className="hero-create-btn landing-cta-shimmer pricing-page__cta">
            <span className="hero-create-btn__text">Start free trial</span>
          </Link>
        </div>
      </section>
      <footer className="landing-footer landing-footer--minimal">
        <div className="mic-container landing-footer__inner">
          <SponsorCredit className="landing-footer__sponsor" />
        </div>
      </footer>
    </main>
  );
}
