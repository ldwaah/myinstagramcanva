"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AiChangerPage() {
  const [sites, setSites] = useState<{ id: string; username: string }[]>([]);
  const [siteId, setSiteId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<{
    subscription?: { plan: string; status: string } | null;
    credits?: { freeEditsRemaining: number; editsRemaining: number };
    hasKey?: boolean;
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

  async function saveKey() {
    const res = await fetch("/api/ai/key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Key saved (${data.masked})` : data.error);
    fetch("/api/ai/key").then((r) => r.json()).then(setStatus);
  }

  async function subscribe(plan: "BYOK" | "MANAGED") {
    const res = await fetch("/api/checkout/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function topup() {
    const res = await fetch("/api/checkout/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topup: true }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function runEdit() {
    if (!siteId || !prompt) return;
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/ai/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, prompt }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? "Published! Refresh your site preview." : data.error);
    fetch("/api/ai/key").then((r) => r.json()).then(setStatus);
  }

  const totalEdits = (status.credits?.freeEditsRemaining || 0) + (status.credits?.editsRemaining || 0);

  return (
    <main className="mic-container" style={{ padding: "2rem 0 4rem", maxWidth: "720px" }}>
      <Link href="/dashboard" style={{ color: "var(--muted)" }}>← Dashboard</Link>
      <h1 style={{ fontFamily: "var(--font-syne)", marginTop: "1rem" }}>AI Changer</h1>
      <p style={{ color: "var(--muted)" }}>
        Ask AI to update your website copy, colors, and sections. BYOK £10/mo or Managed £18/mo (30 edits).
      </p>

      <div className="mic-card" style={{ marginTop: "1.5rem" }}>
        <p>Edits remaining: <strong>{totalEdits}</strong></p>
        <p>Plan: {status.subscription?.plan || "None"} ({status.subscription?.status || "inactive"})</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button className="mic-btn mic-btn-primary" onClick={() => subscribe("BYOK")}>Subscribe BYOK £10/mo</button>
          <button className="mic-btn mic-btn-primary" onClick={() => subscribe("MANAGED")}>Subscribe Managed £18/mo</button>
          <button className="mic-btn mic-btn-ghost" onClick={topup}>Top up 10 edits £5</button>
        </div>
      </div>

      <div className="mic-card" style={{ marginTop: "1rem" }}>
        <h3>Your OpenAI key (BYOK)</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Current: {status.maskedKey || "Not set"}</p>
        <input className="mic-input" type="password" placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        <button className="mic-btn mic-btn-ghost" style={{ marginTop: "0.75rem" }} onClick={saveKey}>Save key</button>
      </div>

      <div className="mic-card" style={{ marginTop: "1rem" }}>
        <label className="mic-label">Site</label>
        <select className="mic-input" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          {sites.map((s) => <option key={s.id} value={s.id}>@{s.username}</option>)}
        </select>
        <label className="mic-label" style={{ marginTop: "1rem" }}>What should AI change?</label>
        <textarea className="mic-input" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Make the hero more energetic and change accent color to electric blue" />
        <button className="mic-btn mic-btn-primary" style={{ marginTop: "0.75rem" }} onClick={runEdit} disabled={loading}>
          {loading ? "Applying..." : "Apply AI change"}
        </button>
        {message && <p style={{ marginTop: "0.75rem" }}>{message}</p>}
      </div>
    </main>
  );
}
