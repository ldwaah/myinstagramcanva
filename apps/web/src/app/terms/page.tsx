import Link from "next/link";
import { SponsorCredit } from "@/components/SponsorCredit";

export default function TermsPage() {
  return (
    <main className="mic-container legal-page">
      <Link href="/" className="legal-page__back">
        ← Home
      </Link>
      <h1>Terms &amp; Conditions</h1>
      <p className="legal-page__updated">Last updated: 8 June 2026</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to My Instagram Canva (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). These
          Terms &amp; Conditions govern your use of our website creation service and any related
          products or services.
        </p>
        <p>By using our service, you agree to be bound by these Terms.</p>
      </section>

      <section>
        <h2>2. Our Service</h2>
        <p>
          My Instagram Canva allows users to generate and host AI-powered websites using content
          from connected Instagram profiles.
        </p>
        <p>
          Features and functionality may vary depending on the package selected and may be updated,
          modified, or improved from time to time.
        </p>
      </section>

      <section>
        <h2>3. Free Trial</h2>
        <p>We may offer a free trial period of fourteen (14) days.</p>
        <p>
          During the trial period, you will have access to the features specified at the time of
          registration.
        </p>
        <p>
          At the end of the 14-day trial period, your selected subscription plan will automatically
          begin and the payment method provided will be charged unless you cancel before the trial
          expires.
        </p>
        <p>
          You may cancel your trial at any time before the end of the trial period to avoid being
          charged.
        </p>
      </section>

      <section>
        <h2>4. Subscription &amp; Payments</h2>
        <p>
          Subscriptions are billed monthly in advance and automatically renew until cancelled.
        </p>
        <p>
          By subscribing, you authorise us to charge your chosen payment method for all applicable
          subscription fees.
        </p>
        <p>
          Pricing is displayed on our website and may be updated from time to time. Any pricing
          changes will apply to future billing periods.
        </p>
        <p>
          Failure to make payment may result in suspension or termination of your service.
        </p>
      </section>

      <section>
        <h2>5. Cancellation</h2>
        <p>
          You may cancel your subscription at any time through your account settings or by contacting
          us.
        </p>
        <p>Cancellation will take effect at the end of the current billing period.</p>
        <p>No partial month credits will be provided for unused subscription periods.</p>
      </section>

      <section>
        <h2>6. Refund Policy</h2>
        <p>
          Due to the nature of digital services and website generation, fees paid for subscription
          periods already commenced are generally non-refundable unless required by applicable law.
        </p>
        <p>Nothing in these Terms affects your statutory rights.</p>
      </section>

      <section>
        <h2>7. User Content</h2>
        <p>You retain ownership of all content imported from your Instagram account.</p>
        <p>By using our service, you confirm that:</p>
        <ul>
          <li>You own or have permission to use all uploaded content.</li>
          <li>Your content does not infringe the rights of any third party.</li>
          <li>Your content complies with all applicable laws and regulations.</li>
        </ul>
        <p>We are not responsible for user-generated content.</p>
      </section>

      <section>
        <h2>8. Acceptable Use</h2>
        <p>You agree not to use the service for:</p>
        <ul>
          <li>Illegal activities.</li>
          <li>Fraudulent or misleading content.</li>
          <li>Spam or unsolicited marketing.</li>
          <li>Impersonation of individuals or organisations.</li>
          <li>Content that infringes intellectual property rights.</li>
        </ul>
        <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
      </section>

      <section>
        <h2>9. Intellectual Property</h2>
        <p>
          All software, branding, designs, systems, AI workflows and technology used to operate My
          Instagram Canva remain our property or the property of our licensors.
        </p>
        <p>
          You may not copy, reverse engineer, distribute or resell any part of the platform without
          written permission.
        </p>
      </section>

      <section>
        <h2>10. Service Availability</h2>
        <p>
          We aim to provide continuous access to the service but do not guarantee uninterrupted or
          error-free operation.
        </p>
        <p>
          We may temporarily suspend access for maintenance, upgrades, security reasons, or
          circumstances beyond our control.
        </p>
      </section>

      <section>
        <h2>11. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, My Instagram Canva shall not be liable for:
        </p>
        <ul>
          <li>Loss of profits.</li>
          <li>Loss of revenue.</li>
          <li>Loss of business opportunities.</li>
          <li>Data loss.</li>
          <li>Indirect or consequential damages arising from the use of the service.</li>
        </ul>
        <p>
          Our total liability shall not exceed the amount paid by you during the preceding twelve
          (12) months.
        </p>
      </section>

      <section>
        <h2>12. Termination</h2>
        <p>We may suspend or terminate your account if:</p>
        <ul>
          <li>You breach these Terms.</li>
          <li>Required payments are not made.</li>
          <li>Continued access presents security, legal or operational risks.</li>
        </ul>
        <p>
          Upon termination, access to your website and associated services may be withdrawn.
        </p>
      </section>

      <section>
        <h2>13. Privacy</h2>
        <p>Your use of the service is also governed by our Privacy Policy.</p>
      </section>

      <section>
        <h2>14. Changes to These Terms</h2>
        <p>We may update these Terms from time to time.</p>
        <p>
          Updated versions will be posted on this page and continued use of the service after
          changes are published constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>15. Contact</h2>
        <p>For questions regarding these Terms, please contact:</p>
        <p>
          <strong>My Instagram Canva</strong>
          <br />
          Email:{" "}
          <a href="mailto:support@myinstagramcanva.com">support@myinstagramcanva.com</a>
        </p>
      </section>

      <section id="affiliates">
        <h2>16. Affiliate programme</h2>
        <p>
          Our affiliate programme allows approved participants to earn commission on qualifying
          purchases referred through a personal tracking link.
        </p>
        <ul>
          <li>
            Attribution lasts 30 days from the visitor&apos;s most recent click on your referral link.
          </li>
          <li>
            Commission applies to qualifying package purchases (Starter, Tailored, Pro and Studio) as
            displayed in your affiliate dashboard.
          </li>
          <li>
            Self-referrals, fraudulent traffic, cookie stuffing and misleading promotion are prohibited.
          </li>
          <li>
            We may withhold or reverse commission on refunded, disputed or invalid transactions.
          </li>
          <li>
            Rates, eligibility and payout schedules may change with reasonable notice posted on this page
            or in your dashboard.
          </li>
          <li>
            We may suspend or terminate affiliate accounts that breach these Terms or applicable law.
          </li>
        </ul>
        <p>
          For affiliate support, email{" "}
          <a href="mailto:support@myinstagramcanva.com">support@myinstagramcanva.com</a>.
        </p>
      </section>

      <SponsorCredit className="legal-page__sponsor" />
    </main>
  );
}
