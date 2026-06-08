"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
          /* non-JSON error body */
        }
        setError(parseJsonError(data, "Login failed. Please check your email and password."));
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error — could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mic-container" style={{ padding: "4rem 0", maxWidth: "420px" }}>
      <h1 style={{ fontFamily: "var(--font-syne)" }}>Log in</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        <div>
          <label className="mic-label">Email</label>
          <input className="mic-input" name="email" type="email" required />
        </div>
        <div>
          <label className="mic-label">Password</label>
          <input className="mic-input" name="password" type="password" required />
        </div>
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
        <button className="mic-btn mic-btn-primary" disabled={loading}>{loading ? "..." : "Log in"}</button>
      </form>
      <p style={{ marginTop: "1rem", color: "var(--muted)" }}>
        No account? <Link href="/signup" style={{ color: "var(--accent)" }}>Sign up</Link>
      </p>
    </main>
  );
}
