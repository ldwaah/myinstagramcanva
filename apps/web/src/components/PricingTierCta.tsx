"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  getPricingTierById,
  signupHrefForTier,
  type PricingTierId,
} from "@/lib/pricing";

type PricingTierCtaProps = {
  tierId: PricingTierId;
  label: string;
  className?: string;
};

export function PricingTierCta({ tierId, label, className }: PricingTierCtaProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const tier = getPricingTierById(tierId);

  async function handleClick() {
    setLoading(true);
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = (await sessionRes.json()) as { loggedIn?: boolean };

      if (!session.loggedIn) {
        router.push(signupHrefForTier(tierId));
        return;
      }

      const sitesRes = await fetch("/api/sites");
      const sitesData = (await sitesRes.json()) as { sites?: { id: string }[] };
      const site = sitesData.sites?.[0];

      if (!site) {
        router.push(`/onboarding?tier=${tierId}`);
        return;
      }

      const res = await fetch("/api/checkout/tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.id, tier: tier.tier }),
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (!res.ok) {
        router.push(`/dashboard?siteId=${site.id}&tier=${tier.tier}&checkout=tier`);
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      <span className="hero-create-btn__text">{loading ? "…" : label}</span>
    </button>
  );
}
