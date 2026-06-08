"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MicButton } from "@/components/MicButton";
import { MicCard } from "@/components/MicCard";
import { formatPence } from "@/lib/affiliate-utils";

interface AffiliateData {
  affiliate: {
    code: string;
    referralUrl: string;
    homeReferralUrl: string;
  };
  stats: {
    clicks: number;
    signups: number;
    conversions: number;
    pendingCommission: number;
    paidCommission: number;
  };
}

export default function AffiliatesDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((d) => {
        if (!d.sites?.[0]?.tier) router.replace("/dashboard");
      });
  }, [router]);

  async function load() {
    const res = await fetch("/api/affiliates");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function getLink() {
    setCreating(true);
    const res = await fetch("/api/affiliates", { method: "POST" });
    const json = await res.json();
    setData(json);
    setCreating(false);
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <AppShell>
        <p className="app-loading">Loading…</p>
      </AppShell>
    );
  }

  const affiliate = data?.affiliate;
  const stats = data?.stats;

  return (
    <AppShell
      title="Affiliate dashboard"
      subtitle="Share your link and earn competitive commission on every package sale."
    >
      {!affiliate ? (
        <MicCard glass glow className="dash-empty">
          <h2>Get your referral link</h2>
          <p>One click to generate a unique link you can share anywhere.</p>
          <MicButton shimmer disabled={creating} onClick={getLink}>
            {creating ? "Creating…" : "Get my link"}
          </MicButton>
        </MicCard>
      ) : (
        <>
          <div className="dash-stats-grid">
            {[
              { label: "Clicks", value: stats?.clicks ?? 0 },
              { label: "Signups", value: stats?.signups ?? 0 },
              { label: "Conversions", value: stats?.conversions ?? 0 },
              { label: "Pending", value: formatPence(stats?.pendingCommission ?? 0) },
              { label: "Paid out", value: formatPence(stats?.paidCommission ?? 0) },
            ].map((s) => (
              <MicCard key={s.label} glass className="dash-stat-card">
                <span className="dash-stat-card__value">{s.value}</span>
                <span className="dash-stat-card__label">{s.label}</span>
              </MicCard>
            ))}
          </div>

          <MicCard glass glow className="affiliate-links">
            <h3>Your referral links</h3>
            <div className="affiliate-link-row">
              <code>{affiliate.referralUrl}</code>
              <MicButton variant="ghost" onClick={() => copy(affiliate.referralUrl, "signup")}>
                {copied === "signup" ? "Copied!" : "Copy"}
              </MicButton>
            </div>
            <div className="affiliate-link-row">
              <code>{affiliate.homeReferralUrl}</code>
              <MicButton variant="ghost" onClick={() => copy(affiliate.homeReferralUrl, "home")}>
                {copied === "home" ? "Copied!" : "Copy"}
              </MicButton>
            </div>
            <p className="affiliate-links__note">
              30-day cookie attribution · commission on Starter, Tailored, Pro &amp; Studio purchases
            </p>
          </MicCard>
        </>
      )}
    </AppShell>
  );
}
