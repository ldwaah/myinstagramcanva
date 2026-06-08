"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const NICHES = [
  "PHOTOGRAPHER",
  "MUSICIAN",
  "ACTOR",
  "COACH",
  "TRAINER",
  "OTHER",
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState<(typeof NICHES)[number]>("PHOTOGRAPHER");
  const [username, setUsername] = useState("");
  const [tagline, setTagline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createSite() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, niche, tagline: tagline || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create site");
      return;
    }
    const data = await res.json();
    router.push(`/dashboard?siteId=${data.siteId}&generating=1`);
  }

  return (
    <main className="mic-container" style={{ padding: "3rem 0", maxWidth: "560px" }}>
      <h1 style={{ fontFamily: "var(--font-syne)" }}>Create your site</h1>
      <p style={{ color: "var(--muted)" }}>Step {step} of 3</p>

      {step === 1 && (
        <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <p>What best describes you?</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {NICHES.map((n) => (
              <button
                key={n}
                type="button"
                className="mic-btn mic-btn-ghost"
                style={{ borderColor: niche === n ? "var(--accent)" : undefined }}
                onClick={() => setNiche(n)}
              >
                {n.charAt(0) + n.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <button className="mic-btn mic-btn-primary" onClick={() => setStep(2)}>Continue</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <div>
            <label className="mic-label">Instagram username</label>
            <input
              className="mic-input"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
              placeholder="khiagovisuals"
            />
          </div>
          <a href="/api/auth/instagram" className="mic-btn mic-btn-ghost" style={{ textAlign: "center" }}>
            Or connect Instagram (Business/Creator)
          </a>
          <div>
            <label className="mic-label">Tagline override (optional)</label>
            <input className="mic-input" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <button className="mic-btn mic-btn-primary" onClick={() => setStep(3)} disabled={username.length < 3}>
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <div className="mic-card">
            <p><strong>Username:</strong> @{username}</p>
            <p><strong>Subdomain:</strong> {username}.myinstagramcanva.com</p>
            <p><strong>Niche:</strong> {niche}</p>
            <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>14-day free trial starts when generation completes.</p>
          </div>
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
          <button className="mic-btn mic-btn-primary" onClick={createSite} disabled={loading}>
            {loading ? "Generating..." : "Generate my website"}
          </button>
        </div>
      )}
    </main>
  );
}
