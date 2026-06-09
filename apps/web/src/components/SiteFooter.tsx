import Link from "next/link";
import { SponsorCredit } from "@/components/SponsorCredit";

export function SiteFooter() {
  return (
    <footer className="landing-footer landing-footer--site">
      <div className="mic-container landing-footer__inner landing-footer__inner--site">
        <nav className="landing-footer__nav" aria-label="Footer">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="mailto:hello@myinstagramcanva.com">Contact</Link>
        </nav>
        <SponsorCredit className="landing-footer__sponsor" />
        <span className="landing-footer__muted">© {new Date().getFullYear()} My Instagram Canva</span>
      </div>
    </footer>
  );
}
