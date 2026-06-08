const EVOLVE_ONE_URL = "https://evolveone.ai";

interface SponsorCreditProps {
  className?: string;
}

/** Understated sponsor line — "Sponsored by" plain text, link on brand name only. */
export function SponsorCredit({ className = "" }: SponsorCreditProps) {
  return (
    <p className={`sponsor-credit ${className}`.trim()}>
      Sponsored by{" "}
      <a href={EVOLVE_ONE_URL} target="_blank" rel="noopener noreferrer">
        Evolve One
      </a>
    </p>
  );
}
