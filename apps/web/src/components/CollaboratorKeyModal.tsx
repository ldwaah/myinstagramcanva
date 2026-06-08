"use client";

import { useState } from "react";
import { MicButton } from "./MicButton";

interface CollaboratorKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function CollaboratorKeyModal({ open, onClose, onSaved }: CollaboratorKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function save() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/ai/key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    setLoading(false);
    if (!res.ok) {
      setError((await res.json()).error || "Invalid key");
      return;
    }
    onSaved?.();
    onClose();
  }

  return (
    <div className="domain-modal" role="dialog" aria-modal="true">
      <button type="button" className="domain-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="domain-modal__panel mic-card mic-card--glass mic-card--glow">
        <h2>Connect your OpenAI key</h2>
        <p className="collab-key-modal__sub">
          AI Collaborator uses your key for unlimited edits. Paste it once — we store it encrypted.
        </p>
        <input
          className="mic-input"
          type="password"
          placeholder="sk-…"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoFocus
        />
        {error && <p className="auth-form__error">{error}</p>}
        <MicButton shimmer disabled={loading || !apiKey.trim()} onClick={save}>
          {loading ? "Saving…" : "Save & continue"}
        </MicButton>
      </div>
    </div>
  );
}
