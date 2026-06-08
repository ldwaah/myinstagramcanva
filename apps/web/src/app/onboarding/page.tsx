"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { HeroVisualScene } from "@/components/landing/HeroVisualScene";
import { MicButton } from "@/components/MicButton";
import {
  sanitizeInstagramUsername,
  validateInstagramUsername,
} from "@/lib/instagram-username";

export default function OnboardingPage() {
  const router = useRouter();
  const [rawUsername, setRawUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const username = useMemo(() => sanitizeInstagramUsername(rawUsername), [rawUsername]);
  const localError = rawUsername.trim() ? validateInstagramUsername(username) : null;

  async function createSite(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateInstagramUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: rawUsername, niche: "OTHER" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      setLoading(false);
      return;
    }
    router.push(`/dashboard?siteId=${data.siteId}&generating=1&welcome=1`);
  }

  return (
    <main className="onboarding-screen">
      <HeroVisualScene />
      <div className="landing-aurora hero-basics__aurora" aria-hidden />

      <div className="onboarding-screen__card mic-card mic-card--glass mic-card--glow">
        <h1>Your @username</h1>
        <form onSubmit={createSite} className="onboarding-screen__form">
          <input
            className="mic-input mic-input--magic"
            value={rawUsername}
            onChange={(e) => setRawUsername(e.target.value)}
            placeholder="@khiagovisuals"
            required
            autoFocus
          />
          {username && rawUsername.trim() && !localError && (
            <p className="onboarding-screen__hint">→ @{username}</p>
          )}
          {localError && <p className="auth-form__error">{localError}</p>}
          {error && <p className="auth-form__error">{error}</p>}
          <MicButton type="submit" shimmer disabled={loading || !!localError || username.length < 3}>
            {loading ? "Building…" : "Generate"}
          </MicButton>
        </form>
      </div>
    </main>
  );
}
