"use client";

import { useEffect, useState } from "react";
import { TRIAL_DAYS } from "@/lib/trial-constants";
import { MicButton } from "./MicButton";

interface TrialWelcomeBannerProps {
  show: boolean;
  trialEndsAt?: string | null;
  onDismiss?: () => void;
}

export function TrialWelcomeBanner({ show, trialEndsAt, onDismiss }: TrialWelcomeBannerProps) {
  const [visible, setVisible] = useState(show);
  const [daysLeft, setDaysLeft] = useState(TRIAL_DAYS);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (!trialEndsAt) {
      setDaysLeft(TRIAL_DAYS);
      return;
    }
    const end = new Date(trialEndsAt).getTime();
    const now = Date.now();
    const left = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    setDaysLeft(left || TRIAL_DAYS);
  }, [trialEndsAt]);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <div className="trial-welcome" role="status">
      <div className="trial-welcome__confetti" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="trial-welcome__particle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="trial-welcome__glow" aria-hidden />
      <div className="trial-welcome__content">
        <p className="trial-welcome__eyebrow">You&apos;re in</p>
        <h2 className="trial-welcome__title">
          Welcome to your <span className="mic-gradient-text">{TRIAL_DAYS}-day free trial</span>
        </h2>
        <p className="trial-welcome__sub">
          {trialEndsAt
            ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left on your trial.`
            : `Your full ${TRIAL_DAYS}-day trial starts when your site finishes generating.`}
          {" "}Upgrade anytime before it ends to keep your site live.
        </p>
        <div className="trial-welcome__actions">
          <MicButton href="/onboarding" shimmer>
            Create your site
          </MicButton>
          <button type="button" className="mic-btn mic-btn-ghost trial-welcome__dismiss" onClick={dismiss}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
