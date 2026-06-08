import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroVisualScene } from "@/components/landing/HeroVisualScene";
import { HomeStepFlow } from "@/components/landing/HomeStepFlow";
import { SponsorCredit } from "@/components/SponsorCredit";
import { buildHomeMetadata, buildReferralMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  if (params.ref?.trim()) {
    return buildReferralMetadata(params.ref.trim());
  }
  return buildHomeMetadata();
}

export default function HomePage() {
  return (
    <main className="landing landing--art">
      <SiteHeader />

      <section className="hero-basics hero-basics--art hero-basics--steps">
        <HeroVisualScene />
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="landing-grain" aria-hidden />

        <div className="hero-basics__content hero-basics__content--wide">
          <p className="hero-basics__eyebrow">Instagram-inspired websites for creators</p>
          <h1 className="hero-basics__title hero-basics__title--solo">
            Turn your Instagram into a
            <span className="hero-basics__title-accent"> website</span>
          </h1>
          <HomeStepFlow />
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
