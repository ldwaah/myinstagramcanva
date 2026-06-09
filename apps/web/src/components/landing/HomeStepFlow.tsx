"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTenantPreviewUrl } from "@/lib/site-urls";
import { TRIAL_TAGLINE } from "@/lib/trial-constants";
import { BrandQuiz } from "@/components/landing/BrandQuiz";
import type { QuizAnswers } from "@/lib/brand-quiz";

type Step = 1 | 2 | 3;

type SessionState = { loggedIn: boolean };

const STEPS = [
  { num: 1, title: "Enter your username", subtitle: "Type your public Instagram handle" },
  { num: 2, title: "AI builds your site", subtitle: "Quick quiz whilst we tailor your layout" },
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const pollRef = useRef(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: SessionState) => setLoggedIn(Boolean(data.loggedIn)))
      .catch(() => setLoggedIn(false));
  }, []);

  const finishWhenReady = useCallback((uname: string, preview?: string) => {
    setPreviewUrl(preview || getTenantPreviewUrl(uname));
    setStep(3);
  }, []);

  const pollUntilReady = useCallback(
    async (id: string, uname: string) => {
      for (let i = 0; i < 90; i++) {
        const res = await fetch(`/api/preview/status?siteId=${id}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError((data as { error?: string }).error || "Could not check build status");
          setStep(1);
          return;
        }
        if (data.failed) {
          setError(data.error || "Generation failed. Please try again.");
          setStep(1);
          return;
        }
        if (data.ready) {
          finishWhenReady(uname, data.previewUrl);
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      setError("Build is taking longer than expected. Please try again.");
      setStep(1);
    },
    [finishWhenReady]
  );

  const startPolling = useCallback(
    (id: string, uname: string) => {
      if (pollRef.current) return;
      pollRef.current = true;
      void pollUntilReady(id, uname).finally(() => {
        pollRef.current = false;
      });
    },
    [pollUntilReady]
  );

  async function handleUsername(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setQuizDone(false);
    pollRef.current = false;
    setStep(2);

    let res: Response;
    try {
      res = await fetch("/api/preview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
    } catch {
      setError("Network error — check your connection and try again.");
      setStep(1);
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.failed) {
      setError(data.error || "Could not start generation");
      setStep(1);
      return;
    }

    setSiteId(data.siteId);
    if (data.ready) {
      finishWhenReady(data.username, data.previewUrl);
      return;
    }
    startPolling(data.siteId, data.username);
  }

  function handleQuizComplete(_answers: QuizAnswers) {
    setQuizDone(true);
  }

  function handleQuizSkip() {
    setQuizDone(true);
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

      {step === 2 && siteId && (
        <div className="home-step-flow__panel mic-card mic-card--glass home-step-flow__building">
          <div className="home-step-flow__building-status">
            <div className="home-step-flow__spinner" aria-hidden />
            <p className="home-step-flow__muted">
              {quizDone
                ? "Tailoring your site — usually ready within 1–2 minutes"
                : "Fetching your Instagram whilst you answer a few questions"}
            </p>
          </div>
          {error && <p className="home-step-flow__error">{error}</p>}
          <BrandQuiz siteId={siteId} onComplete={handleQuizComplete} onSkip={handleQuizSkip} />
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
          <p className="home-step-flow__trial">
            {loggedIn ? "Ready to publish from your dashboard" : TRIAL_TAGLINE}
          </p>
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
          {error && <p className="home-step-flow__error">{error}</p>}
          <p className="home-step-flow__sticky-note">
            {loggedIn ? (
              <>
                Publish from your account · <Link href="/dashboard">open dashboard</Link>
              </>
            ) : (
              <>
                {TRIAL_TAGLINE} · <Link href="/pricing">see pricing</Link>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
