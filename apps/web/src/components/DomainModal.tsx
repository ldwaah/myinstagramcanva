"use client";

interface DomainModalProps {
  open: boolean;
  onClose: () => void;
  username?: string;
}

export function DomainModal({ open, onClose, username }: DomainModalProps) {
  if (!open) return null;

  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "myinstagramcanva.thesale.app";
  const host = username ? `www.${username}.${rootDomain}` : `www.you.${rootDomain}`;

  return (
    <div className="domain-modal" role="dialog" aria-modal="true" aria-labelledby="domain-modal-title">
      <button type="button" className="domain-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="domain-modal__panel mic-card mic-card--glass mic-card--glow">
        <h2 id="domain-modal-title">Add your own domain</h2>
        <p>
          Point a CNAME from your domain to our hosting. Your site will stay live at{" "}
          <strong>{host}</strong> until DNS propagates.
        </p>
        <ol className="domain-modal__steps">
          <li>Add <code>www.yourdomain.com</code> in your registrar</li>
          <li>Create a CNAME → <code>{rootDomain}</code></li>
          <li>We&apos;ll verify and attach it (coming soon)</li>
        </ol>
        <button type="button" className="mic-btn mic-btn-ghost" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
