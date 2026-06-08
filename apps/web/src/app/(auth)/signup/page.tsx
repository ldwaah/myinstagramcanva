"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Signup failed");
      return;
    }
    router.push("/onboarding");
  }

  return (
    <main className="mic-container" style={{ padding: "4rem 0", maxWidth: "420px" }}>
      <h1 style={{ fontFamily: "var(--font-syne)" }}>Start your 14-day trial</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
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
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
        <button className="mic-btn mic-btn-primary" disabled={loading}>{loading ? "..." : "Create account"}</button>
      </form>
      <p style={{ marginTop: "1rem", color: "var(--muted)" }}>
        Already have an account? <Link href="/login" style={{ color: "var(--accent)" }}>Log in</Link>
      </p>
    </main>
  );
}
