"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DomainsPage() {
  const [sites, setSites] = useState<{ id: string; username: string; customDomain: string | null }[]>([]);
  const [siteId, setSiteId] = useState("");
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<{ domain?: string; instructions?: { cname: string; txt: string } } | null>(null);

  useEffect(() => {
    fetch("/api/sites").then((r) => r.json()).then((d) => {
      setSites(d.sites || []);
      if (d.sites?.[0]) setSiteId(d.sites[0].id);
    });
  }, []);

  async function connect() {
    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, domain }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    setResult(data);
  }

  return (
    <main className="mic-container" style={{ padding: "2rem 0 4rem", maxWidth: "560px" }}>
      <Link href="/dashboard" style={{ color: "var(--muted)" }}>← Dashboard</Link>
      <h1 style={{ fontFamily: "var(--font-syne)", marginTop: "1rem" }}>Custom domain</h1>
      <p style={{ color: "var(--muted)" }}>Point your domain to My Instagram Canva after purchasing a site tier.</p>

      <div className="mic-card" style={{ marginTop: "1.5rem", display: "grid", gap: "0.75rem" }}>
        <select className="mic-input" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          {sites.map((s) => <option key={s.id} value={s.id}>@{s.username} {s.customDomain ? `(${s.customDomain})` : ""}</option>)}
        </select>
        <input className="mic-input" placeholder="www.yourdomain.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
        <button className="mic-btn mic-btn-primary" onClick={connect}>Connect domain</button>
      </div>

      {result?.instructions && (
        <div className="mic-card" style={{ marginTop: "1rem" }}>
          <p><strong>DNS setup for {result.domain}</strong></p>
          <p>CNAME → {result.instructions.cname}</p>
          <p>TXT → {result.instructions.txt}</p>
        </div>
      )}
    </main>
  );
}
