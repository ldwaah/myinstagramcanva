"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CollaboratorIntroModal } from "@/components/CollaboratorIntroModal";
import { CollaboratorKeyModal } from "@/components/CollaboratorKeyModal";
import { MicButton } from "@/components/MicButton";
import { SponsorCredit } from "@/components/SponsorCredit";

type AiPlan = "BYOK" | "MANAGED";

function CollaboratorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [sites, setSites] = useState<{ id: string; username: string }[]>([]);
  const [siteId, setSiteId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [hasSub, setHasSub] = useState(false);
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [editsRemaining, setEditsRemaining] = useState<number | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
    if (params.get("success") === "1") {
      const urlPlan = params.get("plan") as AiPlan | null;
      if (urlPlan === "BYOK") setKeyModalOpen(true);
    }
  }, [params]);

  async function refreshStatus() {
    const res = await fetch("/api/ai/key");
    const data = await res.json();
    const active = data.subscription?.status === "active";
    const userPlan = (data.subscription?.plan as AiPlan) ?? null;

    setHasSub(active);
    setPlan(userPlan);
    setHasKey(Boolean(data.hasKey));

    if (userPlan === "MANAGED" && data.credits) {
      setEditsRemaining(
        (data.credits.editsRemaining ?? 0) + (data.credits.freeEditsRemaining ?? 0)
      );
    } else {
      setEditsRemaining(null);
    }

    if (active && userPlan === "BYOK" && !data.hasKey) {
      setKeyModalOpen(true);
    }
  }

  async function checkout(selectedPlan: AiPlan) {
    setCheckoutLoading(true);
    const res = await fetch("/api/checkout/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan }),
    });
    const data = await res.json();
    setCheckoutLoading(false);
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
    if (res.ok) refreshStatus();
  }

  const canEdit = hasSub && (plan === "MANAGED" || hasKey);

  return (
    <div className="dash-minimal dash-minimal--editor">
      <div className="landing-aurora app-shell__aurora" aria-hidden />
      <header className="dash-minimal__header">
        <Link href="/dashboard" className="dash-minimal__back">
          ← Dashboard
        </Link>
      </header>

      <main className="dash-minimal__main dash-minimal__main--collab">
        {!hasSub ? (
          <CollaboratorIntroModal
            inline
            onCheckout={checkout}
            loading={checkoutLoading}
          />
        ) : (
          <div className="dash-minimal__card mic-card mic-card--glass mic-card--glow collab-editor-card">
            <h1 className="collab-editor-card__title">AI Collaborator</h1>
            {plan === "MANAGED" && editsRemaining !== null && (
              <p className="collab-editor-card__sub">
                Managed plan · {editsRemaining} edit{editsRemaining === 1 ? "" : "s"} remaining
                this period
              </p>
            )}
            {plan === "BYOK" && (
              <p className="collab-editor-card__sub">
                Bring Your Own Key · unlimited edits with your OpenAI account
              </p>
            )}

            <select
              className="mic-input"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  @{s.username}
                </option>
              ))}
            </select>
            <textarea
              className="mic-input"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="For example: Make the hero headline shorter and more confident…"
            />
            <MicButton shimmer onClick={runEdit} disabled={loading || !canEdit}>
              {loading ? "Applying…" : "Apply and publish"}
            </MicButton>
            {plan === "BYOK" && !hasKey && (
              <button
                type="button"
                className="dash-minimal__domain-link"
                onClick={() => setKeyModalOpen(true)}
              >
                Connect your OpenAI key to start editing
              </button>
            )}
            {message && <p className="collab-editor-card__msg">{message}</p>}
          </div>
        )}
      </main>

      <footer className="dash-minimal__footer">
        <SponsorCredit />
      </footer>

      <CollaboratorKeyModal
        open={keyModalOpen}
        onClose={() => {
          setKeyModalOpen(false);
          if (!hasKey) router.push("/dashboard");
        }}
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
