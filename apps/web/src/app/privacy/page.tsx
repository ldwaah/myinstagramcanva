import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How My Instagram Canva collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="landing landing--art">
      <SiteHeader variant="minimal" />
      <article className="legal-page mic-container">
        <h1>Privacy Policy</h1>
        <p className="legal-page__updated">Last updated: June 2026</p>

        <section>
          <h2>What we collect</h2>
          <p>
            We collect account details you provide at signup, your public Instagram profile data used
            to generate your website, and usage information needed to run the service.
          </p>
        </section>

        <section>
          <h2>How we use your data</h2>
          <p>
            We use your data to build and host your website, process enquiries, provide support and
            improve the product. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2>Third-party services</h2>
          <p>
            Some plans use third-party tools such as Typeform, email providers or booking platforms.
            Their privacy policies apply when you use those features.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about privacy? Email{" "}
            <a href="mailto:hello@myinstagramcanva.com">hello@myinstagramcanva.com</a> or read our{" "}
            <Link href="/terms">Terms</Link>.
          </p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
