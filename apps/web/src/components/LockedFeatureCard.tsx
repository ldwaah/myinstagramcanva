import Link from "next/link";
import type { FeatureKey } from "@/lib/features";
import { FEATURE_META } from "@/lib/features";
import { MicCard } from "./MicCard";

interface LockedFeatureCardProps {
  feature: FeatureKey;
  locked: boolean;
  href?: string;
  onUpgrade?: () => void;
  children?: React.ReactNode;
}

export function LockedFeatureCard({
  feature,
  locked,
  href,
  onUpgrade,
  children,
}: LockedFeatureCardProps) {
  const meta = FEATURE_META[feature];

  if (!locked && children) {
    return <MicCard glass className="feature-card">{children}</MicCard>;
  }

  if (!locked && href) {
    return (
      <Link href={href} className="feature-card feature-card--link">
        <MicCard glass className="feature-card__inner">
          <h3>{meta.title}</h3>
          <p>{meta.description}</p>
        </MicCard>
      </Link>
    );
  }

  return (
    <MicCard glass className="feature-card feature-card--locked">
      <span className="feature-card__lock" aria-hidden>🔒</span>
      <h3>{meta.title}</h3>
      <p>{meta.description}</p>
      {onUpgrade ? (
        <button type="button" className="mic-btn mic-btn-ghost feature-card__cta" onClick={onUpgrade}>
          {meta.upgradeLabel}
        </button>
      ) : feature === "ai_collaborator" ? (
        <Link href="/dashboard/collaborator" className="mic-btn mic-btn-ghost feature-card__cta">
          {meta.upgradeLabel}
        </Link>
      ) : (
        <span className="feature-card__cta feature-card__cta--muted">{meta.upgradeLabel}</span>
      )}
    </MicCard>
  );
}
