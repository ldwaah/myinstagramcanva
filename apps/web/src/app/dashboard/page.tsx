"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CollaboratorDock } from "@/components/CollaboratorDock";
import { CollaboratorKeyModal } from "@/components/CollaboratorKeyModal";
import { DomainModal } from "@/components/DomainModal";
import { InstagramCanvaLogo } from "@/components/InstagramCanvaLogo";
import { SponsorCredit } from "@/components/SponsorCredit";
import { getTenantPreviewUrl } from "@/lib/site-urls";

interface Site {
  id: string;
  username: string;
  status: string;
  generationJobs: { status: string }[];
}

function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCollaborator, setHasCollaborator] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [domainOpen, setDomainOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (params.get("collaborator") === "success") {
      setKeyModalOpen(true);
    }
    const pending = params.get("goLive");
    const siteIdParam = params.get("siteId");
    if (pending === "pending" && siteIdParam) {
      fetch("/api/checkout/go-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: siteIdParam }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.url) window.location.href = data.url;
          else if (data.ok) router.replace("/dashboard?goLive=success");
        });
    }
  }, [params, router]);

  useEffect(() => {
    async function init() {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (!sessionRes.ok || session.loggedIn === false) {
        window.location.href = "/login";
        return;
      }
      setIsAdmin(Boolean(session.isAdmin));

      const sitesRes = await fetch("/api/sites");
      const data = await sitesRes.json();
      const first = data.sites?.[0] as Site | undefined;

      if (!first) {
        router.replace("/onboarding");
        return;
      }

      setSite(first);
      setLoading(false);

      const aiRes = await fetch("/api/ai/key");
      const ai = await aiRes.json();
      setHasCollaborator(ai.subscription?.status === "active");
      setHasApiKey(Boolean(ai.hasKey));
    }

    init();
    const interval = setInterval(async () => {
      const res = await fetch("/api/sites");
      const data = await res.json();
      if (data.sites?.[0]) setSite(data.sites[0]);
    }, 6000);
    return () => clearInterval(interval);
  }, [router]);

  async function subscribeCollaborator() {
    const res = await fetch("/api/checkout/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "BYOK" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  if (loading || !site) {
    return (
      <div className="dash-minimal">
        <div className="landing-aurora app-shell__aurora" aria-hidden />
        <p className="dash-minimal__loading">Loading…</p>
      </div>
    );
  }

  const previewUrl = getTenantPreviewUrl(site.username);
  const generating = site.status === "GENERATING" || site.generationJobs[0]?.status === "RUNNING";
  const needsGoLive = site.status === "DRAFT" || site.status === "PREVIEW";
  const goLiveSuccess = params.get("goLive") === "success";

  async function startGoLive() {
    if (!site) return;
    const res = await fetch("/api/checkout/go-live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: site.id }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="dash-minimal">
      <div className="landing-aurora app-shell__aurora" aria-hidden />
      <div className="landing-grain" aria-hidden />

      <header className="dash-minimal__header">
        <Link href="/" className="landing-logo dash-minimal__logo">
          <InstagramCanvaLogo size={28} className="landing-logo__mark" />
        </Link>
        {isAdmin && (
          <Link href="/dashboard/admin" className="dash-minimal__admin">
            Admin
          </Link>
        )}
      </header>

      <main className="dash-minimal__main">
        <div className="dash-minimal__card mic-card mic-card--glass mic-card--glow">
          <p className="dash-minimal__welcome">Welcome. This is your dashboard.</p>

          <div className="dash-minimal__username-row">
            <span className="dash-minimal__username">@{site.username}</span>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-minimal__arrow"
              aria-label="View website"
            >
              →
            </a>
          </div>

          {goLiveSuccess && (
            <p className="dash-minimal__generating">You&apos;re live. Enjoy your free trial.</p>
          )}

          {generating ? (
            <p className="dash-minimal__generating">Building your site…</p>
          ) : needsGoLive ? (
            <>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="dash-minimal__view-btn dash-minimal__view-btn--muted">
                Preview website
              </a>
              <button type="button" className="dash-minimal__view-btn" onClick={startGoLive}>
                Go live and start your free trial
              </button>
            </>
          ) : (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="dash-minimal__view-btn">
              View website
            </a>
          )}

          <button type="button" className="dash-minimal__domain-link" onClick={() => setDomainOpen(true)}>
            Add your own domain
          </button>
        </div>
      </main>

      <footer className="dash-minimal__footer">
        <SponsorCredit />
      </footer>

      <CollaboratorDock
        hasSubscription={hasCollaborator}
        onSubscribe={subscribeCollaborator}
        onOpenEditor={() => {
          if (hasCollaborator && !hasApiKey) setKeyModalOpen(true);
          else router.push("/dashboard/collaborator");
        }}
      />

      <DomainModal open={domainOpen} onClose={() => setDomainOpen(false)} username={site.username} />
      <CollaboratorKeyModal
        open={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        onSaved={() => {
          setHasApiKey(true);
          router.push("/dashboard/collaborator");
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
