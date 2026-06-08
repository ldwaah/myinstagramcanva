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
      <button
        type="button"
        className="domain-modal__backdrop"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="domain-modal__panel domain-modal__panel--wide mic-card mic-card--glass mic-card--glow">
        <h2>Connect your OpenAI API key</h2>
        <p className="collab-key-modal__sub">
          Your Bring Your Own Key plan uses your OpenAI account for edits. Paste your key
          once; we store it encrypted and never show it again.
        </p>

        <ol className="collab-key-modal__steps">
          <li>
            Go to{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
            >
              platform.openai.com/api-keys
            </a>{" "}
            and sign in (or create an OpenAI account).
          </li>
          <li>Click <strong>Create new secret key</strong>, name it (for example &quot;My Instagram Canva&quot;), and copy the key.</li>
          <li>Paste the key below. It starts with <code>sk-</code>.</li>
        </ol>

        <label className="collab-key-modal__label" htmlFor="collab-api-key">
          Secret API key
        </label>
        <input
          id="collab-api-key"
          className="mic-input"
          type="password"
          placeholder="sk-…"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoFocus
        />
        {error && <p className="auth-form__error">{error}</p>}

        <div className="collab-key-modal__actions">
          <MicButton shimmer disabled={loading || !apiKey.trim()} onClick={save}>
            {loading ? "Saving…" : "Save and open editor"}
          </MicButton>
          <button type="button" className="mic-btn mic-btn-ghost" onClick={onClose}>
            I will do this later
          </button>
        </div>
      </div>
    </div>
  );
}
