/** Right-column hero mockup: Instagram-inspired site preview card. */
export function HeroWebsitePreview() {
  return (
    <div className="hero-preview-card" aria-hidden>
      <div className="hero-preview-card__chrome">
        <span className="hero-preview-card__dot" />
        <span className="hero-preview-card__dot" />
        <span className="hero-preview-card__dot" />
      </div>
      <div className="hero-preview-card__body">
        <div className="hero-preview-card__profile">
          <div className="hero-preview-card__avatar" />
          <div className="hero-preview-card__profile-lines">
            <span className="hero-preview-card__line hero-preview-card__line--title" />
            <span className="hero-preview-card__line hero-preview-card__line--sub" />
          </div>
        </div>
        <div className="hero-preview-card__stats">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-preview-card__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="hero-preview-card__tile" />
          ))}
        </div>
        <div className="hero-preview-card__cta" />
      </div>
    </div>
  );
}
