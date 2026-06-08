"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const NICHES = [
  { value: "PHOTOGRAPHER", label: "Photographer" },
  { value: "MUSICIAN", label: "Musician" },
  { value: "ACTOR", label: "Actor" },
  { value: "COACH", label: "Coach" },
  { value: "TRAINER", label: "Trainer" },
  { value: "OTHER", label: "Other" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [niche, setNiche] = useState<string>("OTHER");
  const [tagline, setTagline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createSite(e: React.FormEvent) {
    e.preventDefault();
    if (username.length < 3) {
      setError("Instagram username must be at least 3 characters");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        niche,
        tagline: tagline || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create site");
      setLoading(false);
      return;
    }
    router.push(`/dashboard?siteId=${data.siteId}&generating=1`);
  }

  return (
    <main className="mic-container" style={{ padding: "3rem 0", maxWidth: "560px" }}>
      <h1 style={{ fontFamily: "var(--font-syne)" }}>Connect your Instagram</h1>
      <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
        Enter your username or connect Instagram. We&apos;ll build a tailored site with your colors, fonts, and photos.
        Your 21-day free trial starts when generation completes.
      </p>

      <form onSubmit={createSite} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        <div>
          <label className="mic-label">Instagram username</label>
          <input
            className="mic-input"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
            placeholder="khiagovisuals"
            required
            minLength={3}
            autoFocus
          />
        </div>

        <a href="/api/auth/instagram" className="mic-btn mic-btn-ghost" style={{ textAlign: "center" }}>
          Or connect Instagram (Business/Creator)
        </a>

        <div>
          <label className="mic-label">What best describes you? (optional)</label>
          <select
            className="mic-input"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          >
            {NICHES.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mic-label">Tagline override (optional)</label>
          <input className="mic-input" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>

        {username.length >= 3 && (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Preview URL: <strong>{username}.myinstagramcanva.vercel.app</strong> (or custom domain later)
          </p>
        )}

        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

        <button className="mic-btn mic-btn-primary" type="submit" disabled={loading || username.length < 3}>
          {loading ? "Starting generation…" : "Generate my website"}
        </button>
      </form>
    </main>
  );
}
