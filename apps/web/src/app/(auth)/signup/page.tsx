"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { MicButton } from "@/components/MicButton";
import { TRIAL_DAYS } from "@/lib/trial-constants";
import { parseJsonError } from "@/lib/db-errors";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          acceptedTerms: acceptedTerms,
        }),
      });
      if (!res.ok) {
        let data: unknown = null;
        try {
          data = await res.json();
        } catch {
          /* non-JSON */
        }
        setError(parseJsonError(data, "Could not create your account."));
        return;
      }
      if (siteId) {
        await fetch("/api/preview/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId }),
        });
        router.push(`/dashboard?siteId=${siteId}&goLive=pending`);
      } else {
        router.push("/onboarding?welcome=1");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle={`${TRIAL_DAYS}-day free trial. No credit card.`}
    >
      <form onSubmit={onSubmit} className="auth-form">
        <div>
          <label className="mic-label">Name</label>
          <input className="mic-input" name="name" />
        </div>
        <div>
          <label className="mic-label">Email</label>
          <input className="mic-input" name="email" type="email" required />
        </div>
        <div>
          <label className="mic-label">Password</label>
          <input className="mic-input" name="password" type="password" minLength={8} required />
        </div>
        <label className="auth-form__terms">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            required
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank">
              Terms &amp; Conditions
            </Link>
          </span>
        </label>
        {error && <p className="auth-form__error">{error}</p>}
        <MicButton type="submit" shimmer disabled={loading || !acceptedTerms} className="auth-form__submit">
          {loading ? "Creating…" : "Create account"}
        </MicButton>
      </form>
      <p className="auth-form__footer">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
