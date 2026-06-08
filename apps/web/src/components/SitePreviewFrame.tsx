interface SitePreviewFrameProps {
  username: string;
  previewUrl: string;
  status: string;
  generating?: boolean;
}

export function SitePreviewFrame({ username, previewUrl, status, generating }: SitePreviewFrameProps) {
  const canEmbed = status === "TRIAL" || status === "LIVE";

  return (
    <div className="site-preview">
      <div className="site-preview__chrome">
        <span /><span /><span />
        <div className="site-preview__url">@{username}</div>
      </div>
      <div className="site-preview__body">
        {canEmbed && !generating ? (
          <iframe
            src={previewUrl}
            title={`Preview of @${username}`}
            className="site-preview__iframe"
            loading="lazy"
          />
        ) : (
          <div className="site-preview__placeholder">
            <div className="site-preview__spinner" aria-hidden />
            <p>{generating ? "Generating your site…" : "Preview available when generation completes"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
