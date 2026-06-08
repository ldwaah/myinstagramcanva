import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroVisualScene } from "@/components/landing/HeroVisualScene";
import { SponsorCredit } from "@/components/SponsorCredit";
import { buildAffiliatesMetadata } from "@/lib/seo";

export const metadata: Metadata = buildAffiliatesMetadata();

const steps = [
  {
    title: "Create a free account",
    body: "Sign up in a minute. No card required to join the programme and get your personal link.",
  },
  {
    title: "Get your referral link",
    body: "Open your affiliate dashboard and copy a unique link for signup or the homepage.",
  },
  {
    title: "Share with creators",
    body: "Post it on social, drop it in your newsletter, or send it to friends who need a website.",
  },
  {
    title: "Earn when they buy",
    body: "If someone signs up through your link and buys a qualifying plan within 30 days, you earn commission on that sale.",
  },
];

const earnOn = [
  "Starter, Tailored, Pro and Studio package purchases",
  "Sales made within 30 days of clicking your link",
  "Commission on qualifying purchases (rate set in your dashboard)",
];

const attributionPoints = [
  "When someone clicks your link, we remember it for 30 days.",
  "If they create an account and buy a qualifying plan in that window, the sale is attributed to you.",
  "After 30 days, a fresh click starts a new attribution window.",
];

export default function AffiliatesPage() {
  return (
    <main className="landing landing--art">
      <SiteHeader variant="minimal" />

      <section className="hero-basics hero-basics--art hero-basics--short">
        <HeroVisualScene />
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="landing-grain" aria-hidden />

        <div className="hero-basics__content">
          <p className="hero-basics__eyebrow">Affiliate programme</p>
          <h1 className="hero-basics__title hero-basics__title--solo">
            Earn when you refer
            <span className="hero-basics__title-accent"> creators</span>
          </h1>
          <p className="affiliate-hero__lead">
            Share Instagram Canva with people who want a website built from their Instagram. When they
            buy a qualifying plan through your link, you earn commission.
          </p>
        </div>
      </section>

      <section className="affiliate-page">
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="landing-grain" aria-hidden />
        <div className="mic-container affiliate-page__inner">
          <article className="affiliate-section mic-card mic-card--glass">
            <h2 className="affiliate-section__title">What is the programme?</h2>
            <p className="affiliate-section__body">
              The Instagram Canva affiliate programme lets you recommend our service and earn when
              your referrals become paying customers. It is free to join. You get a personal link to
              share, and we track signups and sales that come through it.
            </p>
          </article>

          <article className="affiliate-section">
            <h2 className="affiliate-section__title">How it works</h2>
            <ol className="affiliate-steps">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span className="affiliate-steps__num">{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article className="affiliate-section mic-card mic-card--glass">
            <h2 className="affiliate-section__title">What you earn on</h2>
            <p className="affiliate-section__body">
              You earn commission on qualifying purchases made by people who signed up through your
              referral link. We do not publish rates on this page; your dashboard shows what applies
              to your account.
            </p>
            <ul className="affiliate-section__list">
              {earnOn.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="affiliate-section mic-card mic-card--glass">
            <h2 className="affiliate-section__title">30-day attribution</h2>
            <p className="affiliate-section__body">
              In plain terms: your link carries a 30-day window. If someone clicks it today and buys
              within the next 30 days, you get credit for that sale.
            </p>
            <ul className="affiliate-section__list">
              {attributionPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="affiliate-section affiliate-section--cta" id="terms">
            <h2 className="affiliate-section__title">Terms summary</h2>
            <p className="affiliate-section__body">
              Commissions are paid on approved qualifying sales. Self-referrals, fraudulent traffic and
              misleading promotion are not allowed. We may change rates or pause the programme with
              notice. Full details are in our{" "}
              <Link href="/terms#affiliates">Terms &amp; Conditions (affiliates section)</Link>.
            </p>
            <div className="affiliate-cta">
              <Link href="/signup?intent=affiliate" className="hero-create-btn landing-cta-shimmer">
                <span className="hero-create-btn__text">Get your referral link</span>
              </Link>
              <p className="affiliate-cta__note">
                Create a free account to get your link. Already registered?{" "}
                <Link href="/login?redirect=%2Fdashboard%2Faffiliates">Log in</Link> to open your
                affiliate dashboard.
              </p>
            </div>
          </article>
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
