import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { HomeExampleCard } from "@/components/landing/HomeExampleCard";
import { HomeFaqAccordion } from "@/components/landing/HomeFaqAccordion";
import { PricingSection } from "@/components/landing/PricingSection";
import { RequestWebsiteForm } from "@/components/landing/RequestWebsiteForm";
import { CORE_OFFER, HOW_IT_WORKS, WHY_CHOOSE_US } from "@/lib/pricing";
import { HOME_EXAMPLES } from "@/lib/example-sites";
import { buildHomeMetadata } from "@/lib/seo";
import { TRIAL_TAGLINE } from "@/lib/trial-constants";

export const metadata: Metadata = buildHomeMetadata();

const TRUST_BADGES = [
  "Pay once",
  "No monthly hosting fees",
  "Built from your Instagram",
  "14-day free trial",
  "Card required, no charge today",
] as const;

export default function HomePage() {
  return (
    <main className="landing landing--service">
      <SiteHeader />

      <section className="service-hero">
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="landing-grain" aria-hidden />
        <div className="mic-container service-hero__inner">
          <p className="service-hero__eyebrow">{CORE_OFFER}</p>
          <h1 className="service-hero__title">Turn your Instagram into a professional website</h1>
          <p className="service-hero__sub">
            Submit your Instagram handle and we will create a premium website inspired by your
            content, style and brand. Use it free for 14 days. Keep it only if you love it.
          </p>
          <div className="service-hero__ctas">
            <Link href="/#request" className="service-hero__cta service-hero__cta--primary">
              Request my website
            </Link>
            <Link href="/#examples" className="service-hero__cta service-hero__cta--secondary">
              View examples
            </Link>
          </div>
          <ul className="service-hero__badges">
            {TRUST_BADGES.map((badge) => (
              <li key={badge}>{badge}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="service-steps">
        <div className="mic-container service-steps__inner">
          <h2 className="service-section__title">How it works</h2>
          <ol className="service-steps__list">
            {HOW_IT_WORKS.map((step) => (
              <li key={step.step} className="service-steps__item">
                <span className="service-steps__number">{step.step}</span>
                <div>
                  <h3 className="service-steps__heading">{step.title}</h3>
                  <p className="service-steps__text">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PricingSection />

      <section id="examples" className="home-examples">
        <div className="mic-container home-examples__inner">
          <h2 className="service-section__title">Examples</h2>
          <p className="service-section__sub">
            Premium websites shaped from real Instagram profiles. Every site is built by our team,
            not generated from a template.
          </p>
          <div className="home-examples__grid">
            {HOME_EXAMPLES.map((example) => (
              <HomeExampleCard key={example.slug} example={example} />
            ))}
          </div>
        </div>
      </section>

      <section className="service-why">
        <div className="mic-container service-why__inner">
          <h2 className="service-section__title">Why choose us</h2>
          <ul className="service-why__list">
            {WHY_CHOOSE_US.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="home-faq">
        <div className="mic-container home-faq__inner">
          <h2 className="service-section__title">Frequently asked questions</h2>
          <HomeFaqAccordion />
        </div>
      </section>

      <section id="request" className="service-request">
        <div className="mic-container service-request__inner">
          <h2 className="service-section__title">Request your website</h2>
          <p className="service-section__sub">{TRIAL_TAGLINE}</p>
          <Suspense fallback={<p className="request-form__loading">Loading form…</p>}>
            <RequestWebsiteForm />
          </Suspense>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
