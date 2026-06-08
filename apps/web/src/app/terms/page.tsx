import Link from "next/link";
import { SponsorCredit } from "@/components/SponsorCredit";

export default function TermsPage() {
  return (
    <main className="mic-container legal-page">
      <Link href="/" className="legal-page__back">← Home</Link>
      <h1>Terms &amp; Conditions</h1>
      <p className="legal-page__updated">Last updated: {new Date().toLocaleDateString("en-GB")}</p>

      <section>
        <h2>1. Service</h2>
        <p>
          My Instagram Canva provides AI-generated websites from Instagram profiles. Free trials
          include website hosting for the trial period. Paid packages add features as described on
          our pricing page.
        </p>
      </section>

      <section>
        <h2>2. Accounts</h2>
        <p>
          You are responsible for your account credentials and for content generated from your
          Instagram profile. You must have rights to use the media and information on your
          connected Instagram account.
        </p>
      </section>

      <section>
        <h2>3. Payments &amp; trials</h2>
        <p>
          Trials convert to paid plans only when you purchase a package. Subscriptions (including AI
          Collaborator) renew monthly until cancelled.
        </p>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p>
          Do not use the service for unlawful content, spam, or impersonation. We may suspend
          accounts that violate these terms.
        </p>
      </section>

      <p className="legal-page__note">
        This is a placeholder terms page. Replace with your legal counsel&apos;s final document
        before production launch.
      </p>

      <SponsorCredit className="legal-page__sponsor" />
    </main>
  );
}
