"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface Site {
  id: string;
  username: string;
  status: string;
  tier: string | null;
  trialEndsAt: string | null;
  subdomain: string;
  needsAdminTweak: boolean;
  generationJobs: { status: string }[];
}

const TIERS = ["STARTER", "TAILORED", "PRO", "STUDIO"] as const;

const TIER_LABELS: Record<string, string> = {
  STARTER: "£27",
  TAILORED: "£54",
  PRO: "£101",
  STUDIO: "£299",
};

function DashboardContent() {
  const params = useSearchParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/sites");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    setSites(data.sites || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  async function checkout(siteId: string, tier: string) {
    const res = await fetch("/api/checkout/tier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, tier }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function mockPay(siteId: string, tier: string) {
    await fetch("/api/checkout/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, tier }),
    });
    load();
  }

  if (loading) return <p className="mic-container" style={{ padding: "3rem 0" }}>Loading...</p>;

  return (
    <main className="mic-container" style={{ padding: "2rem 0 4rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="mic-gradient-text" style={{ fontWeight: 700 }}>Dashboard</h1>
        <nav style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/onboarding" className="mic-btn mic-btn-ghost">New site</Link>
          <Link href="/dashboard/ai-changer" className="mic-btn mic-btn-ghost">AI Changer</Link>
          <Link href="/dashboard/crm" className="mic-btn mic-btn-ghost">Leads & CRM</Link>
          <Link href="/dashboard/domains" className="mic-btn mic-btn-ghost">Domains</Link>
          <Link href="/dashboard/admin" className="mic-btn mic-btn-ghost">Admin</Link>
          <button
            className="mic-btn mic-btn-ghost"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
          >
            Log out
          </button>
        </nav>
      </header>

      {params.get("generating") && (
        <p className="mic-banner" style={{ marginBottom: "1rem" }}>Your site is being generated…</p>
      )}

      {!sites.length && (
        <div className="mic-card">
          <p>No sites yet.</p>
          <Link href="/onboarding" className="mic-btn mic-btn-primary" style={{ marginTop: "1rem" }}>Create your first site</Link>
        </div>
      )}

      <div style={{ display: "grid", gap: "1rem" }}>
        {sites.map((site) => {
          const job = site.generationJobs[0];
          const previewUrl = `/site/${site.username}`;
          const isTailoredPending = site.tier === "TAILORED" && site.needsAdminTweak;

          return (
            <article key={site.id} className="mic-card">
              {isTailoredPending && (
                <div className="mic-banner" style={{ marginBottom: "1rem" }}>
                  Our team will tailor your site within 48 hours. You&apos;ll get an email when it&apos;s ready. Leads from your embedded form appear in Leads &amp; CRM.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontWeight: 700 }}>@{site.username}</h2>
                  <p style={{ color: "var(--muted)" }}>
                    Status: {site.status} {site.tier ? `· ${site.tier}` : ""}
                  </p>
                  {site.trialEndsAt && !site.tier && (
                    <p style={{ color: "var(--accent)" }}>Trial ends {new Date(site.trialEndsAt).toLocaleDateString()}</p>
                  )}
                  {site.tier === "TAILORED" && !site.needsAdminTweak && (
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
                      Lead form active · view submissions in Leads &amp; CRM
                    </p>
                  )}
                  {job?.status === "RUNNING" && <p>Generating…</p>}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="mic-btn mic-btn-ghost">Preview</a>
                  {(site.tier === "TAILORED" || site.tier === "PRO" || site.tier === "STUDIO") && (
                    <Link href="/dashboard/crm" className="mic-btn mic-btn-ghost">View leads</Link>
                  )}
                </div>
              </div>

              {!site.tier && (
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {TIERS.map((tier) => (
                    <button key={tier} className="mic-btn mic-btn-primary" onClick={() => checkout(site.id, tier)}>
                      {tier} ({TIER_LABELS[tier]})
                    </button>
                  ))}
                  <button className="mic-btn mic-btn-ghost" onClick={() => mockPay(site.id, "TAILORED")}>Dev: mock Tailored</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
