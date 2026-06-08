"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: string;
  source: string;
  createdAt: string;
}

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [siteId, setSiteId] = useState("");
  const [sites, setSites] = useState<{ id: string; username: string; tier: string | null }[]>([]);

  useEffect(() => {
    fetch("/api/leads").then((r) => r.json()).then((d) => setLeads(d.leads || []));
    fetch("/api/sites").then((r) => r.json()).then((d) => {
      setSites(d.sites || []);
      if (d.sites?.[0]) setSiteId(d.sites[0].id);
    });
  }, []);

  async function updateLead(id: string, status: string) {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(data.leads || []);
  }

  async function sendCampaign(type: "EMAIL" | "SMS") {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, name: campaignName, type, subject: campaignName, body: campaignBody }),
    });
    const data = await res.json();
    if (data.campaign?.id) {
      await fetch("/api/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.campaign.id, action: "send" }),
      });
      alert("Campaign sent (or queued if integrations configured)");
    } else {
      alert(data.error || "Failed");
    }
  }

  function exportCsv() {
    const header = "name,email,phone,status,source,createdAt\n";
    const rows = leads.map((l) =>
      [l.name, l.email, l.phone || "", l.status, l.source, l.createdAt].map((v) => `"${v}"`).join(",")
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  }

  return (
    <main className="mic-container" style={{ padding: "2rem 0 4rem" }}>
      <Link href="/dashboard" style={{ color: "var(--muted)" }}>← Dashboard</Link>
      <h1 style={{ fontFamily: "var(--font-syne)", marginTop: "1rem" }}>CRM & Campaigns</h1>

      <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        <button className="mic-btn mic-btn-ghost" onClick={exportCsv}>Export CSV</button>
      </div>

      <div className="mic-card" style={{ marginBottom: "1rem" }}>
        <h3>New campaign (Studio tier)</h3>
        <select className="mic-input" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          {sites.map((s) => <option key={s.id} value={s.id}>@{s.username} ({s.tier || "no tier"})</option>)}
        </select>
        <input className="mic-input" style={{ marginTop: "0.5rem" }} placeholder="Campaign name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
        <textarea className="mic-input" style={{ marginTop: "0.5rem" }} rows={3} placeholder="Message body" value={campaignBody} onChange={(e) => setCampaignBody(e.target.value)} />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button className="mic-btn mic-btn-primary" onClick={() => sendCampaign("EMAIL")}>Send email</button>
          <button className="mic-btn mic-btn-ghost" onClick={() => sendCampaign("SMS")}>Send SMS</button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
            <th>Name</th><th>Email</th><th>Status</th><th>Source</th><th></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={{ padding: "0.75rem 0" }}>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.status}</td>
              <td>{lead.source}</td>
              <td>
                <select value={lead.status} onChange={(e) => updateLead(lead.id, e.target.value)}>
                  {["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
