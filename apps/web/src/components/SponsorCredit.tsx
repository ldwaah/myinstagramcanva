const EVOLVE_ONE_URL = "https://evolveone.ai";

interface SponsorCreditProps {
  className?: string;
}

/** Understated footer credit — plain text with link on brand name only. */
export function SponsorCredit({ className = "" }: SponsorCreditProps) {
  return (
    <p className={`sponsor-credit ${className}`.trim()}>
      Powered by{" "}
      <a href={EVOLVE_ONE_URL} target="_blank" rel="noopener noreferrer">
        EvolveOne.ai
      </a>
    </p>
  );
}
