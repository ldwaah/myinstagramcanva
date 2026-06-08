"use client";

interface CollaboratorDockProps {
  hasSubscription: boolean;
  onSubscribe: () => void;
  onOpenEditor?: () => void;
}

export function CollaboratorDock({
  hasSubscription,
  onSubscribe,
  onOpenEditor,
}: CollaboratorDockProps) {
  if (hasSubscription) {
    return (
      <div className="collab-dock">
        <button type="button" className="collab-dock__inner collab-dock__inner--active" onClick={onOpenEditor}>
          <span className="collab-dock__badge">AI Collaborator</span>
          <span className="collab-dock__title">Edit your website with AI</span>
          <span className="collab-dock__cta">Open →</span>
        </button>
      </div>
    );
  }

  return (
    <div className="collab-dock">
      <button type="button" className="collab-dock__inner" onClick={onSubscribe}>
        <span className="collab-dock__badge">New</span>
        <span className="collab-dock__title">AI Collaborator · £10/month</span>
        <span className="collab-dock__sub">Edit your website with AI.</span>
      </button>
    </div>
  );
}
