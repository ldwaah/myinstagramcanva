import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SponsorCredit } from "@/components/SponsorCredit";
import { TRIAL_DAYS } from "@/lib/trial-constants";

const tiers = [
  {
    name: "Starter",
    price: "£27",
    tagline: "AI site from your Instagram",
    features: [
      "Website built from your public Instagram",
      "Your colours, posts & profile style",
      "Mobile-ready, hosted for you",
      "Custom domain support",
    ],
  },
  {
    name: "Tailored",
    price: "£54",
    tagline: "Lead form + human design",
    featured: true,
    features: [
      "Everything in Starter",
      "Built-in lead capture form",
      "Our team designs & polishes your site",
      "One round of human-led revisions",
    ],
  },
  {
    name: "Pro",
    price: "£101",
    tagline: "Calendar + marketing funnel",
    features: [
      "Everything in Tailored",
      "Booking calendar integration",
      "Marketing funnel pages",
      "Email capture & nurture flows",
    ],
  },
  {
    name: "Studio",
    price: "£299",
    tagline: "CRM + email & SMS campaigns",
    features: [
      "Everything in Pro",
      "Built-in CRM for your leads",
      "Email campaign tools",
      "SMS outreach & automations",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="landing landing--art">
      <SiteHeader />
      <section className="pricing-page">
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="landing-grain" aria-hidden />
        <div className="mic-container pricing-page__inner">
          <h1 className="pricing-page__title">Simple, transparent pricing</h1>
          <p className="pricing-page__sub">
            Every plan starts with a {TRIAL_DAYS}-day free trial. Go live anytime. Put a card on file,
            cancel before the trial ends, and you won&apos;t be charged.
          </p>

          <div className="pricing-page__grid">
            {tiers.map((t) => (
              <article
                key={t.name}
                className={`pricing-tier${t.featured ? " pricing-tier--featured" : ""}`}
              >
                {t.featured && <span className="pricing-tier__badge">Most popular</span>}
                <h2 className="pricing-tier__name">{t.name}</h2>
                <p className="pricing-tier__price">{t.price}</p>
                <p className="pricing-tier__tagline">{t.tagline}</p>
                <ul className="pricing-tier__features">
                  {t.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="pricing-page__addon mic-card mic-card--glass">
            <h3 className="pricing-page__addon-title">AI Collaborator</h3>
            <p className="pricing-page__addon-price">from £10/mo</p>
            <p className="pricing-page__addon-desc">
              Unlimited AI edits to your site using your own OpenAI key. Add it anytime from your dashboard.
            </p>
          </div>

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
