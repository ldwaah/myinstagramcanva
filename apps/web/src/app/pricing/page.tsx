import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PROTECTION_NOTE, PRICING_TIERS, TRIAL_COPY, signupHrefForTier } from "@/lib/pricing";
import { buildPricingMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPricingMetadata();

export default function PricingPage() {
  return (
    <main className="landing landing--art">
      <SiteHeader />
      <section className="pricing-page">
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="landing-grain" aria-hidden />
        <div className="mic-container pricing-page__inner">
          <h1 className="pricing-page__title">Plans that grow with your business</h1>
          <p className="pricing-page__sub">
            {TRIAL_COPY} Choose the level of help you need, from AI-generated sites to full
            done-for-you setup.
          </p>

          <div className="pricing-page__grid">
            {PRICING_TIERS.map((t) => (
              <article
                key={t.id}
                className={`pricing-tier${t.featured ? " pricing-tier--featured" : ""}`}
              >
                {t.featured && <span className="pricing-tier__badge">Most Popular</span>}
                <h2 className="pricing-tier__name">{t.name}</h2>
                <p className="pricing-tier__price">
                  {t.price}
                  <span className="pricing-tier__period">/month</span>
                </p>
                <p className="pricing-tier__headline">{t.headline}</p>
                <p className="pricing-tier__description">{t.description}</p>
                <ul className="pricing-tier__features">
                  {t.includes.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {t.notIncluded && t.notIncluded.length > 0 && (
                  <ul className="pricing-tier__excludes" aria-label={`Not included in ${t.name}`}>
                    {t.notIncluded.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                {t.protectionNote && (
                  <p className="pricing-tier__note">{t.protectionNote}</p>
                )}
                <Link
                  href={signupHrefForTier(t.id)}
                  className="pricing-tier__cta hero-create-btn landing-cta-shimmer"
                >
                  <span className="hero-create-btn__text">{t.cta}</span>
                </Link>
              </article>
            ))}
          </div>

          <p className="pricing-page__protection">{PROTECTION_NOTE}</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
