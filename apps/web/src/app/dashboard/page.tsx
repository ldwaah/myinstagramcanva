"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DashboardNav } from "@/components/DashboardNav";
import { LockedFeatureCard } from "@/components/LockedFeatureCard";
import { MicButton } from "@/components/MicButton";
import { MicCard } from "@/components/MicCard";
import { SitePreviewFrame } from "@/components/SitePreviewFrame";
import { TrialWelcomeBanner } from "@/components/TrialWelcomeBanner";
import { canUseFeature } from "@/lib/features";
import { getTenantPreviewUrl, getTenantPublicUrl } from "@/lib/site-urls";

interface Site {
  id: string;
  username: string;
  status: string;
  tier: string | null;
  trialEndsAt: string | null;
  subdomain: string;
  generationJobs: { status: string }[];
  instagramProfile?: { lastSyncedAt: string | null } | null;
}

const TIERS = ["STARTER", "TAILORED", "PRO", "STUDIO"] as const;
const TIER_PRICES: Record<string, string> = {
  STARTER: "£27",
  TAILORED: "£54",
  PRO: "£101",
  STUDIO: "£299",
};

function DashboardContent() {
  const params = useSearchParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [hasCollaborator, setHasCollaborator] = useState(false);

  const site = sites[0];
  const tier = site?.tier ?? null;

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
    fetch("/api/ai/key")
      .then((r) => r.json())
      .then((d) => setHasCollaborator(d.subscription?.status === "active"));
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  async function checkout(tierName: string) {
    if (!site) return;
    const res = await fetch("/api/checkout/tier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: site.id, tier: tierName }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function syncFromInstagram() {
    if (!site) return;
    setSyncingId(site.id);
    await fetch(`/api/sites/${site.id}/sync`, { method: "POST" });
    setSyncingId(null);
    load();
  }

  if (loading) {
    return (
      <AppShell actions={<DashboardNav />}>
        <p className="app-loading">Loading…</p>
      </AppShell>
    );
  }

  if (!site) {
    return (
      <AppShell actions={<DashboardNav />}>
        <MicCard glass glow className="dash-empty">
          <MicButton href="/onboarding" shimmer>
            Create your site
          </MicButton>
        </MicCard>
      </AppShell>
    );
  }

  const previewUrl = getTenantPreviewUrl(site.username);
  const generating = site.status === "GENERATING" || site.generationJobs[0]?.status === "RUNNING";
  const showWelcome = !welcomeDismissed && (params.get("welcome") === "1" || params.get("generating") === "1");

  return (
    <AppShell actions={<DashboardNav />}>
      <TrialWelcomeBanner
        show={showWelcome}
        trialEndsAt={site.trialEndsAt}
        onDismiss={() => setWelcomeDismissed(true)}
      />

      <MicCard glass glow className="dash-site-card">
        <div className="dash-site-card__grid">
          <div>
            <h2>@{site.username}</h2>
            <p className="dash-url">{site.subdomain || getTenantPublicUrl(site.username).replace(/^https?:\/\//, "")}</p>
            <div className="dash-site-card__actions">
              <MicButton variant="ghost" href={previewUrl} external>
                Open
              </MicButton>
              <MicButton variant="gradient-outline" disabled={!!syncingId || generating} onClick={syncFromInstagram}>
                {syncingId ? "Syncing…" : "Sync IG"}
              </MicButton>
            </div>
          </div>
          <SitePreviewFrame username={site.username} previewUrl={previewUrl} status={site.status} generating={generating} />
        </div>
      </MicCard>

      <div className="dash-features" id="upgrade">
        <LockedFeatureCard feature="crm" locked={!canUseFeature("crm", tier)} onUpgrade={() => checkout("TAILORED")} />
        <LockedFeatureCard feature="affiliates" locked={!canUseFeature("affiliates", tier)} onUpgrade={() => checkout("STARTER")} />
        <LockedFeatureCard feature="ai_collaborator" locked={!canUseFeature("ai_collaborator", tier, hasCollaborator)} />
        <LockedFeatureCard feature="calendar" locked={!canUseFeature("calendar", tier)} onUpgrade={() => checkout("PRO")} />
      </div>

      {!tier && (
        <div className="dash-pricing">
          {TIERS.map((t) => (
            <MicButton key={t} shimmer onClick={() => checkout(t)}>
              {t} {TIER_PRICES[t]}
            </MicButton>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
