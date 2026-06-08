"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { MicButton } from "@/components/MicButton";
import { parseJsonError } from "@/lib/db-errors";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
        }),
      });
      if (!res.ok) {
        let data: unknown = null;
        try {
          data = await res.json();
        } catch {
          /* non-JSON */
        }
        setError(parseJsonError(data, "Invalid email or password."));
        return;
      }
      const sessionRes = await fetch("/api/auth/session");
      const session = (await sessionRes.json()) as { hasSites?: boolean };
      router.push(session.hasSites ? "/dashboard" : "/onboarding");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your sites.">
      <form onSubmit={onSubmit} className="auth-form">
        <div>
          <label className="mic-label">Email</label>
          <input className="mic-input" name="email" type="email" required />
        </div>
        <div>
          <label className="mic-label">Password</label>
          <input className="mic-input" name="password" type="password" required />
        </div>
        {error && <p className="auth-form__error">{error}</p>}
        <MicButton type="submit" shimmer disabled={loading} className="auth-form__submit">
          {loading ? "Logging in…" : "Log in"}
        </MicButton>
      </form>
      <p className="auth-form__footer">
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
