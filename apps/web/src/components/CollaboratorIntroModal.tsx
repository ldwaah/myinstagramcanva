"use client";

import { useState } from "react";
import { MicButton } from "./MicButton";

type Step = "intro" | "plans";
type Plan = "BYOK" | "MANAGED";

interface CollaboratorIntroModalProps {
  open?: boolean;
  inline?: boolean;
  onClose?: () => void;
  onCheckout: (plan: Plan) => void;
  loading?: boolean;
}

const FEATURES = [
  "Rewrite headlines, hero copy and section text with natural language prompts",
  "Adjust tone, length and emphasis across your whole site",
  "Changes are published automatically so your live site stays up to date",
  "Pick which of your sites to edit from your dashboard",
  "Secure: your content stays tied to your account",
];

export function CollaboratorIntroModal({
  open = true,
  inline = false,
  onClose,
  onCheckout,
  loading = false,
}: CollaboratorIntroModalProps) {
  const [step, setStep] = useState<Step>("intro");

  if (!inline && !open) return null;

  const content = (
    <div
      className={
        inline
          ? "collab-intro collab-intro--inline"
          : "domain-modal__panel domain-modal__panel--wide collab-intro mic-card mic-card--glass mic-card--glow"
      }
    >
      {step === "intro" ? (
        <>
          <div className="collab-intro__header">
            {!inline && onClose && (
              <button
                type="button"
                className="collab-intro__close"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            )}
            <span className="collab-intro__badge">AI Collaborator</span>
            <h2 className="collab-intro__title">Edit your website with AI</h2>
            <p className="collab-intro__lede">
              Describe the change you want in plain English. AI Collaborator updates your
              site copy, republishes the page, and keeps your Instagram-inspired design
              intact.
            </p>
          </div>

          <ul className="collab-intro__features">
            {FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <p className="collab-intro__note">
            Choose a plan on the next step. You will not be asked for an API key until
            after payment (and only if you pick the Bring Your Own Key option).
          </p>

          <div className="collab-intro__actions">
            <MicButton shimmer onClick={() => setStep("plans")}>
              Choose a plan
            </MicButton>
            {!inline && onClose && (
              <button type="button" className="mic-btn mic-btn-ghost" onClick={onClose}>
                Not now
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="collab-intro__header">
            {!inline && onClose && (
              <button
                type="button"
                className="collab-intro__close"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            )}
            <button
              type="button"
              className="collab-intro__back"
              onClick={() => setStep("intro")}
            >
              ← Back
            </button>
            <h2 className="collab-intro__title">Pick your plan</h2>
            <p className="collab-intro__lede">
              Both plans include full access to the AI editor. The difference is how OpenAI
              usage is billed.
            </p>
          </div>

          <div className="collab-plans">
            <div className="collab-plan mic-card">
              <h3 className="collab-plan__name">Bring Your Own Key</h3>
              <p className="collab-plan__price">£10<span>/month</span></p>
              <p className="collab-plan__line">
                Connect your OpenAI API key after checkout. Unlimited edits at your own
                OpenAI cost.
              </p>
              <ul className="collab-plan__bullets">
                <li>Best for frequent editors</li>
                <li>You control spend with OpenAI</li>
                <li>Key stored encrypted</li>
              </ul>
              <MicButton
                shimmer
                disabled={loading}
                onClick={() => onCheckout("BYOK")}
              >
                {loading ? "Redirecting…" : "Subscribe for £10/month"}
              </MicButton>
            </div>

            <div className="collab-plan mic-card collab-plan--featured">
              <span className="collab-plan__tag">No API key needed</span>
              <h3 className="collab-plan__name">Managed</h3>
              <p className="collab-plan__price">£18<span>/month</span></p>
              <p className="collab-plan__line">
                We handle OpenAI for you. Includes 30 AI edits per month, then optional
                top-ups.
              </p>
              <ul className="collab-plan__bullets">
                <li>No OpenAI account required</li>
                <li>30 edits included each month</li>
                <li>Go straight to the editor after payment</li>
              </ul>
              <MicButton
                shimmer
                disabled={loading}
                onClick={() => onCheckout("MANAGED")}
              >
                {loading ? "Redirecting…" : "Subscribe for £18/month"}
              </MicButton>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (inline) return content;

  return (
    <div className="domain-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="domain-modal__backdrop"
        onClick={onClose}
        aria-label="Close"
      />
      {content}
    </div>
  );
}
