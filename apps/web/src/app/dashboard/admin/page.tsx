"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminSite {
  id: string;
  username: string;
  needsAdminTweak: boolean;
  user: { email: string; name: string | null };
}

export default function AdminPage() {
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/queue");
    if (!res.ok) {
      setError("Admin access required");
      return;
    }
    const data = await res.json();
    setSites(data.sites || []);
  }

  useEffect(() => { load(); }, []);

  async function markDone(siteId: string) {
    await fetch("/api/admin/queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, done: true }),
    });
    load();
  }

  return (
    <main className="mic-container" style={{ padding: "2rem 0 4rem" }}>
      <Link href="/dashboard" style={{ color: "var(--muted)" }}>← Dashboard</Link>
      <h1 style={{ fontFamily: "var(--font-syne)", marginTop: "1rem" }}>Admin tweak queue</h1>
      {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {sites.map((site) => (
          <article key={site.id} className="mic-card">
            <p><strong>@{site.username}</strong> · {site.user.email}</p>
            <a href={`/site/${site.username}`} target="_blank" rel="noopener noreferrer">Preview</a>
            <button className="mic-btn mic-btn-primary" style={{ marginLeft: "0.75rem" }} onClick={() => markDone(site.id)}>
              Mark tweaks done
            </button>
          </article>
        ))}
        {!sites.length && !error && <p style={{ color: "var(--muted)" }}>No sites awaiting tweaks.</p>}
      </div>
    </main>
  );
}
