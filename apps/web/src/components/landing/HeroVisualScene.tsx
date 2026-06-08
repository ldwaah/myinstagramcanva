/** Floating IG universe — phones, polaroids, stories, orbs */
export function HeroVisualScene() {
  return (
    <div className="hero-scene" aria-hidden>
      <div className="hero-scene__mesh" />

      <div className="hero-float hero-float--phone-a">
        <div className="hero-phone">
          <div className="hero-phone__notch" />
          <div className="hero-phone__screen">
            <div className="hero-phone__profile">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`hero-story-ring${i === 3 ? " hero-story-ring--you" : ""}`}>
                  <span />
                </div>
              ))}
            </div>
            <div className="hero-phone__header">
              <div className="hero-phone__avatar" />
              <div className="hero-phone__lines"><i /><i /><i /></div>
            </div>
            <div className="hero-phone__grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className={`hero-phone__cell hero-phone__cell--${(i % 3) + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hero-float hero-float--phone-b">
        <div className="hero-phone hero-phone--site">
          <div className="hero-phone__notch" />
          <div className="hero-phone__screen hero-phone__screen--gradient">
            <div className="hero-site-preview">
              <div className="hero-site-preview__bar" />
              <div className="hero-site-preview__hero" />
              <div className="hero-site-preview__grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-float hero-float--polaroid-a">
        <div className="hero-polaroid hero-polaroid--warm">
          <div className="hero-polaroid__img" />
          <span className="hero-polaroid__caption">@you</span>
        </div>
      </div>

      <div className="hero-float hero-float--polaroid-b">
        <div className="hero-polaroid hero-polaroid--cool">
          <div className="hero-polaroid__img" />
          <span className="hero-polaroid__caption">live</span>
        </div>
      </div>

      <div className="hero-float hero-float--card-a">
        <div className="hero-post-card">
          <div className="hero-post-card__img hero-post-card__img--sunset" />
        </div>
      </div>

      <div className="hero-float hero-float--card-b">
        <div className="hero-post-card hero-post-card--video">
          <div className="hero-post-card__img hero-post-card__img--reel" />
          <span className="hero-post-card__play" />
        </div>
      </div>

      <div className="hero-float hero-float--card-c">
        <div className="hero-post-card hero-post-card--square">
          <div className="hero-post-card__img hero-post-card__img--grid" />
        </div>
      </div>

      <div className="hero-float hero-float--stories">
        <div className="hero-stories-cluster">
          {["#f09433", "#dc2743", "#bc1888", "#833ab4", "#e6683c"].map((c, i) => (
            <div
              key={c}
              className="hero-story-float"
              style={{ "--ring-color": c, "--i": i } as React.CSSProperties}
            >
              <span />
            </div>
          ))}
        </div>
      </div>

      <div className="hero-orb hero-orb--1" />
      <div className="hero-orb hero-orb--2" />
      <div className="hero-orb hero-orb--3" />
      <div className="hero-orb hero-orb--4" />
    </div>
  );
}
