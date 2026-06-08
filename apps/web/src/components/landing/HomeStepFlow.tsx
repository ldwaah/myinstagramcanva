"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { getTenantPreviewUrl } from "@/lib/site-urls";
import { TRIAL_DAYS } from "@/lib/trial-constants";

type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1, title: "Enter your username", subtitle: "Type your public Instagram handle" },
  { num: 2, title: "AI builds your site", subtitle: "We match your posts, colours & style" },
  { num: 3, title: "Go live", subtitle: "Preview it, then publish when ready" },
] as const;

export function HomeStepFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [siteId, setSiteId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [goLiveLoading, setGoLiveLoading] = useState(false);

  const pollUntilReady = useCallback(async (id: string, uname: string) => {
    for (let i = 0; i < 60; i++) {
      const res = await fetch(`/api/preview/status?siteId=${id}`);
      if (!res.ok) break;
      const data = await res.json();
      if (data.ready) {
        setPreviewUrl(data.previewUrl || getTenantPreviewUrl(uname));
        setStep(3);
        return;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    setPreviewUrl(getTenantPreviewUrl(uname));
    setStep(3);
  }, []);

  async function handleUsername(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep(2);

    const res = await fetch("/api/preview/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not start");
      setStep(1);
      return;
    }

    setSiteId(data.siteId);
    await pollUntilReady(data.siteId, data.username);
  }

  async function handleGoLive() {
    if (!siteId) return;
    setGoLiveLoading(true);
    setError("");

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (!session.loggedIn) {
      router.push(`/signup?siteId=${siteId}&username=${encodeURIComponent(username)}`);
      return;
    }

    const res = await fetch("/api/checkout/go-live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId }),
    });
    const data = await res.json();

    if (data.needsAuth) {
      router.push(`/signup?siteId=${siteId}`);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    if (data.ok) {
      router.push("/dashboard?goLive=success");
      return;
    }

    setError(data.error || "Go live failed");
    setGoLiveLoading(false);
  }

  return (
    <div className="home-step-flow">
      <div className="home-step-flow__steps" aria-label="Create your site in three steps">
        {STEPS.map((s, i) => (
          <div key={s.num} className="home-step-flow__step">
            {i > 0 && <span className="home-step-flow__line" aria-hidden />}
            <div className={`home-step-flow__step-inner${step >= s.num ? " is-on" : ""}`}>
              <span className="home-step-flow__dot">{s.num}</span>
              <span className="home-step-flow__step-title">{s.title}</span>
              <span className="home-step-flow__step-sub">{s.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <form className="home-step-flow__panel mic-card mic-card--glass" onSubmit={handleUsername}>
          <label className="home-step-flow__panel-heading" htmlFor="ig-username">
            Your Instagram username
          </label>
          <div className="home-step-flow__input-row">
            <span className="home-step-flow__at">@</span>
            <input
              id="ig-username"
              className="mic-input home-step-flow__input"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
              placeholder="yourname"
              required
              autoFocus
            />
          </div>
          {error && <p className="home-step-flow__error">{error}</p>}
          <button type="submit" className="hero-create-btn landing-cta-shimmer">
            <span className="hero-create-btn__text">Continue</span>
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="home-step-flow__panel mic-card mic-card--glass home-step-flow__loading">
          <p className="home-step-flow__panel-heading">Building your site…</p>
          <div className="home-step-flow__spinner" aria-hidden />
          <p className="home-step-flow__muted">This usually takes a minute or two.</p>
        </div>
      )}

      {step === 3 && (
        <div className="home-step-flow__panel mic-card mic-card--glass home-step-flow__done">
          <p className="home-step-flow__panel-heading">Your site is ready</p>
          <p className="home-step-flow__username">@{username.replace(/^@/, "")}</p>
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="home-step-flow__link">
              {previewUrl} →
            </a>
          )}
          <p className="home-step-flow__trial">{TRIAL_DAYS}-day free trial when you go live</p>
        </div>
      )}

      {step === 3 && (
        <div className="home-step-flow__sticky">
          <button
            type="button"
            className="hero-create-btn landing-cta-shimmer home-step-flow__golive"
            onClick={handleGoLive}
            disabled={goLiveLoading}
          >
            <span className="hero-create-btn__text">{goLiveLoading ? "…" : "Go live"}</span>
          </button>
          <p className="home-step-flow__sticky-note">
            Card on file · cancel anytime before trial ends ·{" "}
            <Link href="/pricing">see pricing</Link>
          </p>
        </div>
      )}
    </div>
  );
}
