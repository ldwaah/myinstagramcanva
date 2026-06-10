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

const shareTips = [
  "Add your link to your Instagram bio or link-in-bio tool.",
  "Mention it when you recommend a website builder to creator friends.",
  "Drop it in newsletters, DMs or community posts where referrals are welcome.",
];

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
      window.location.href = "/login?redirect=%2Fdashboard%2Faffiliates";
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
      subtitle="Copy your link, share it with creators, and track clicks and commission."
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
            <p className="affiliate-links__intro">
              Share either link. Signups and purchases within 30 days of a click are attributed to you.
            </p>
            <div className="affiliate-link-row">
              <div className="affiliate-link-row__label">Signup link</div>
              <code>{affiliate.referralUrl}</code>
              <MicButton variant="ghost" onClick={() => copy(affiliate.referralUrl, "signup")}>
                {copied === "signup" ? "Copied!" : "Copy link"}
              </MicButton>
            </div>
            <div className="affiliate-link-row">
              <div className="affiliate-link-row__label">Homepage link</div>
              <code>{affiliate.homeReferralUrl}</code>
              <MicButton variant="ghost" onClick={() => copy(affiliate.homeReferralUrl, "home")}>
                {copied === "home" ? "Copied!" : "Copy link"}
              </MicButton>
            </div>
            <p className="affiliate-links__note">
              30-day attribution · commission on Launch, Creator &amp; Bespoke purchases
            </p>
          </MicCard>

          <MicCard glass className="affiliate-share">
            <h3>How to share</h3>
            <ul className="affiliate-share__list">
              {shareTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </MicCard>
        </>
      )}
    </AppShell>
  );
}
