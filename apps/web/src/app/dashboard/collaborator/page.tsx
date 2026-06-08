"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CollaboratorKeyModal } from "@/components/CollaboratorKeyModal";
import { MicButton } from "@/components/MicButton";
import { SponsorCredit } from "@/components/SponsorCredit";

function CollaboratorContent() {
  const params = useSearchParams();
  const [sites, setSites] = useState<{ id: string; username: string }[]>([]);
  const [siteId, setSiteId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [hasSub, setHasSub] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((d) => {
        setSites(d.sites || []);
        if (d.sites?.[0]) setSiteId(d.sites[0].id);
      });
    refreshStatus();
  }, []);

  useEffect(() => {
    if (params.get("success") === "1") setKeyModalOpen(true);
  }, [params]);

  async function refreshStatus() {
    const res = await fetch("/api/ai/key");
    const data = await res.json();
    setHasSub(data.subscription?.status === "active");
    setHasKey(Boolean(data.hasKey));
    if (data.subscription?.status === "active" && !data.hasKey) setKeyModalOpen(true);
  }

  async function subscribe() {
    const res = await fetch("/api/checkout/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "BYOK" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function runEdit() {
    if (!siteId || !prompt) return;
    setLoading(true);
    const res = await fetch("/api/ai/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, prompt }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? "Published." : data.error);
  }

  return (
    <div className="dash-minimal dash-minimal--editor">
      <div className="landing-aurora app-shell__aurora" aria-hidden />
      <header className="dash-minimal__header">
        <Link href="/dashboard" className="dash-minimal__back">
          ← Dashboard
        </Link>
      </header>

      <main className="dash-minimal__main">
        <div className="dash-minimal__card mic-card mic-card--glass mic-card--glow collab-editor-card">
          <h1 className="collab-editor-card__title">AI Collaborator</h1>

          {!hasSub ? (
            <>
              <p className="collab-editor-card__sub">£10/month · unlimited edits with your OpenAI key.</p>
              <MicButton shimmer onClick={subscribe}>
                Subscribe
              </MicButton>
            </>
          ) : (
            <>
              <select className="mic-input" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    @{s.username}
                  </option>
                ))}
              </select>
              <textarea
                className="mic-input"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Make the hero bolder…"
              />
              <MicButton shimmer onClick={runEdit} disabled={loading || !hasKey}>
                {loading ? "Applying…" : "Apply"}
              </MicButton>
              {!hasKey && (
                <button type="button" className="dash-minimal__domain-link" onClick={() => setKeyModalOpen(true)}>
                  Add OpenAI key
                </button>
              )}
              {message && <p className="collab-editor-card__msg">{message}</p>}
            </>
          )}
        </div>
      </main>

      <footer className="dash-minimal__footer">
        <SponsorCredit />
      </footer>

      <CollaboratorKeyModal
        open={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        onSaved={() => {
          setHasKey(true);
          refreshStatus();
        }}
      />
    </div>
  );
}

export default function CollaboratorPage() {
  return (
    <Suspense>
      <CollaboratorContent />
    </Suspense>
  );
}
