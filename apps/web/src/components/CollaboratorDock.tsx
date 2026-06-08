"use client";

interface CollaboratorDockProps {
  hasSubscription: boolean;
  needsApiKey?: boolean;
  onOpenIntro: () => void;
  onOpenEditor?: () => void;
}

export function CollaboratorDock({
  hasSubscription,
  needsApiKey,
  onOpenIntro,
  onOpenEditor,
}: CollaboratorDockProps) {
  if (hasSubscription) {
    return (
      <div className="collab-dock">
        <button
          type="button"
          className="collab-dock__inner collab-dock__inner--active"
          onClick={onOpenEditor}
        >
          <span className="collab-dock__badge">AI Collaborator</span>
          <span className="collab-dock__title">
            {needsApiKey ? "Connect your OpenAI key" : "Edit your website with AI"}
          </span>
          <span className="collab-dock__cta">{needsApiKey ? "Set up →" : "Open →"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="collab-dock">
      <button type="button" className="collab-dock__inner" onClick={onOpenIntro}>
        <span className="collab-dock__badge">AI Collaborator</span>
        <span className="collab-dock__title">Edit your website with AI</span>
        <span className="collab-dock__sub">See how it works →</span>
      </button>
    </div>
  );
}
