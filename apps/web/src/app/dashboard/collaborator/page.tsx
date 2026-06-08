"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DashboardNav } from "@/components/DashboardNav";
import { MicButton } from "@/components/MicButton";
import { MicCard } from "@/components/MicCard";

export default function CollaboratorPage() {
  const [sites, setSites] = useState<{ id: string; username: string }[]>([]);
  const [siteId, setSiteId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<{
    subscription?: { plan: string; status: string } | null;
    credits?: { freeEditsRemaining: number; editsRemaining: number };
    maskedKey?: string | null;
  }>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/sites").then((r) => r.json()).then((d) => {
      setSites(d.sites || []);
      if (d.sites?.[0]) setSiteId(d.sites[0].id);
    });
    fetch("/api/ai/key").then((r) => r.json()).then(setStatus);
  }, []);

  const hasSub = status.subscription?.status === "active";
  const totalEdits = (status.credits?.freeEditsRemaining || 0) + (status.credits?.editsRemaining || 0);

  async function subscribe(plan: "BYOK" | "MANAGED") {
    const res = await fetch("/api/checkout/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function saveKey() {
    const res = await fetch("/api/ai/key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    setMessage(res.ok ? "Key saved" : (await res.json()).error);
    fetch("/api/ai/key").then((r) => r.json()).then(setStatus);
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
    <AppShell title="AI Collaborator" subtitle="Unlimited AI edits to your site." actions={<DashboardNav />}>
      <div className="collab-plans">
        <MicCard glass className="collab-plan">
          <h3>BYOK</h3>
          <p className="collab-plan__price">£10/mo</p>
          <p className="collab-plan__line">Your OpenAI key · unlimited edits</p>
          <MicButton shimmer onClick={() => subscribe("BYOK")}>Subscribe</MicButton>
        </MicCard>
        <MicCard glass glow className="collab-plan">
          <h3>Managed</h3>
          <p className="collab-plan__price">£18/mo</p>
          <p className="collab-plan__line">We host AI · 30 edits/mo</p>
          <MicButton shimmer onClick={() => subscribe("MANAGED")}>Subscribe</MicButton>
        </MicCard>
      </div>

      {hasSub && (
        <MicCard glass className="collab-editor">
          <p>Edits left: <strong>{totalEdits}</strong></p>
          {status.subscription?.plan === "BYOK" && (
            <>
              <input className="mic-input" type="password" placeholder="sk-…" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              <MicButton variant="ghost" onClick={saveKey}>Save key</MicButton>
            </>
          )}
          <select className="mic-input" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>@{s.username}</option>
            ))}
          </select>
          <textarea className="mic-input" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Make the hero bolder…" />
          <MicButton shimmer onClick={runEdit} disabled={loading}>
            {loading ? "Applying…" : "Apply"}
          </MicButton>
          {message && <p>{message}</p>}
        </MicCard>
      )}
    </AppShell>
  );
}
