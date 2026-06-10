"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  PRICING_TIERS,
  type PricingTierId,
  isPricingTierId,
} from "@/lib/pricing";

const CONTACT_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "booking", label: "Booking link" },
  { value: "other", label: "Other" },
] as const;

type FormState = {
  fullName: string;
  email: string;
  instagramHandle: string;
  brandName: string;
  preferredSubdomain: string;
  plan: PricingTierId;
  mainGoal: string;
  contactPreference: string;
  notes: string;
  contentPermission: boolean;
  trialTermsAccepted: boolean;
};

const defaultForm: FormState = {
  fullName: "",
  email: "",
  instagramHandle: "",
  brandName: "",
  preferredSubdomain: "",
  plan: "creator",
  mainGoal: "",
  contactPreference: "email",
  notes: "",
  contentPermission: false,
  trialTermsAccepted: false,
};

export function RequestWebsiteForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (isPricingTierId(plan)) {
      setForm((current) => ({ ...current, plan }));
    }
  }, [searchParams]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/request-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string; checkoutUrl?: string };

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="request-form__success">
        <h3>Request received</h3>
        <p>
          Thank you. We have your details and will be in touch shortly to start building your
          website.
        </p>
      </div>
    );
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <div className="request-form__grid">
        <label className="request-form__field">
          <span>Full name</span>
          <input
            type="text"
            name="fullName"
            required
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
          />
        </label>

        <label className="request-form__field">
          <span>Email address</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </label>

        <label className="request-form__field">
          <span>Instagram handle</span>
          <input
            type="text"
            name="instagramHandle"
            required
            placeholder="@yourhandle"
            value={form.instagramHandle}
            onChange={(e) => updateField("instagramHandle", e.target.value)}
          />
        </label>

        <label className="request-form__field">
          <span>Business or brand name</span>
          <input
            type="text"
            name="brandName"
            required
            value={form.brandName}
            onChange={(e) => updateField("brandName", e.target.value)}
          />
        </label>

        <label className="request-form__field">
          <span>Preferred subdomain</span>
          <input
            type="text"
            name="preferredSubdomain"
            required
            placeholder="yourname"
            value={form.preferredSubdomain}
            onChange={(e) => updateField("preferredSubdomain", e.target.value)}
          />
        </label>

        <label className="request-form__field">
          <span>Selected plan</span>
          <select
            name="plan"
            required
            value={form.plan}
            onChange={(e) => updateField("plan", e.target.value as PricingTierId)}
          >
            {PRICING_TIERS.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name} ({tier.price} one-off)
              </option>
            ))}
          </select>
        </label>

        <label className="request-form__field request-form__field--full">
          <span>Main website goal</span>
          <input
            type="text"
            name="mainGoal"
            required
            placeholder="e.g. Get more booking enquiries"
            value={form.mainGoal}
            onChange={(e) => updateField("mainGoal", e.target.value)}
          />
        </label>

        <label className="request-form__field">
          <span>Contact button preference</span>
          <select
            name="contactPreference"
            required
            value={form.contactPreference}
            onChange={(e) => updateField("contactPreference", e.target.value)}
          >
            {CONTACT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="request-form__field request-form__field--full">
          <span>Notes (optional)</span>
          <textarea
            name="notes"
            rows={4}
            placeholder="Anything else we should know?"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </label>
      </div>

      <div className="request-form__checkboxes">
        <label className="request-form__checkbox">
          <input
            type="checkbox"
            required
            checked={form.contentPermission}
            onChange={(e) => updateField("contentPermission", e.target.checked)}
          />
          <span>
            I confirm I own or have permission to use the Instagram content submitted.
          </span>
        </label>

        <label className="request-form__checkbox">
          <input
            type="checkbox"
            required
            checked={form.trialTermsAccepted}
            onChange={(e) => updateField("trialTermsAccepted", e.target.checked)}
          />
          <span>
            I understand my card is required to start the free trial and I will be charged the
            selected one-off fee if I do not cancel before the trial ends.
          </span>
        </label>
      </div>

      {error && (
        <p className="request-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="request-form__submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Request my website"}
      </button>
    </form>
  );
}
