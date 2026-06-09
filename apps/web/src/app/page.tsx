import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroWebsitePreview } from "@/components/landing/HeroWebsitePreview";
import { HomeExampleCard } from "@/components/landing/HomeExampleCard";
import { HomeFaqAccordion } from "@/components/landing/HomeFaqAccordion";
import { HomeStepFlow } from "@/components/landing/HomeStepFlow";
import { HOME_EXAMPLES } from "@/lib/example-sites";
import { TRIAL_COPY } from "@/lib/pricing";
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

      <section className="hero-split">
        <div className="landing-aurora hero-basics__aurora" aria-hidden />
        <div className="landing-grain" aria-hidden />

        <div className="mic-container hero-split__inner">
          <div className="hero-split__left">
            <h1 className="hero-split__title">
              Turn your Instagram into a live website in minutes
            </h1>
            <p className="hero-split__sub">
              Paste your handle. Let AI build your site. Customise, preview and publish without
              coding.
            </p>
            <HomeStepFlow />
            <p className="hero-split__trial">{TRIAL_COPY}</p>
          </div>
          <div className="hero-split__right">
            <HeroWebsitePreview />
          </div>
        </div>
      </section>

      <section id="examples" className="home-examples">
        <div className="mic-container home-examples__inner">
          <h2 className="home-examples__title">Built for real creators</h2>
          <p className="home-examples__sub">
            See how different profiles turn into polished websites with your Instagram at the centre.
          </p>
          <div className="home-examples__grid">
            {HOME_EXAMPLES.map((example) => (
              <HomeExampleCard key={example.slug} example={example} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-faq">
        <div className="mic-container home-faq__inner">
          <h2 className="home-faq__title">Frequently asked questions</h2>
          <HomeFaqAccordion />
          <p className="home-faq__pricing">
            Compare plans on our{" "}
            <Link href="/pricing">pricing page</Link>.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
