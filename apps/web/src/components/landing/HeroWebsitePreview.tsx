/** Right-column hero: social profile mock transforming into a website preview. */
export function HeroWebsitePreview() {
  const gridTiles = [
    "hero-ig-mock__tile--a",
    "hero-ig-mock__tile--b",
    "hero-ig-mock__tile--c",
    "hero-ig-mock__tile--d",
    "hero-ig-mock__tile--e",
    "hero-ig-mock__tile--f",
  ];

  return (
    <div className="hero-ig-scene" aria-hidden>
      <div className="hero-ig-mock hero-ig-mock--profile">
        <div className="hero-ig-mock__status">
          <span className="hero-ig-mock__time">9:41</span>
          <span className="hero-ig-mock__status-icons" />
        </div>
        <div className="hero-ig-mock__topbar">
          <span className="hero-ig-mock__handle">maya.visuals</span>
          <span className="hero-ig-mock__menu" />
        </div>
        <div className="hero-ig-mock__header">
          <div className="hero-ig-mock__avatar-wrap">
            <div className="hero-ig-mock__avatar-ring">
              <div className="hero-ig-mock__avatar" />
            </div>
          </div>
          <div className="hero-ig-mock__stats">
            <div>
              <strong>284</strong>
              <span>posts</span>
            </div>
            <div>
              <strong>12.4k</strong>
              <span>followers</span>
            </div>
            <div>
              <strong>891</strong>
              <span>following</span>
            </div>
          </div>
        </div>
        <div className="hero-ig-mock__bio">
          <p className="hero-ig-mock__name">Maya Chen</p>
          <p className="hero-ig-mock__tagline">Portrait &amp; lifestyle photographer · London</p>
          <p className="hero-ig-mock__link">myinstagramcanva.com/maya</p>
        </div>
        <div className="hero-ig-mock__highlights">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-ig-mock__tabs">
          <span className="is-active" />
          <span />
          <span />
        </div>
        <div className="hero-ig-mock__grid">
          {gridTiles.map((cls) => (
            <div key={cls} className={`hero-ig-mock__tile ${cls}`} />
          ))}
        </div>
      </div>

      <div className="hero-ig-arrow" aria-hidden>
        <span className="hero-ig-arrow__line" />
        <span className="hero-ig-arrow__head" />
      </div>

      <div className="hero-ig-mock hero-ig-mock--site">
        <div className="hero-ig-mock__browser-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-ig-mock__site-hero" />
        <div className="hero-ig-mock__site-lines">
          <span className="hero-ig-mock__site-line hero-ig-mock__site-line--lg" />
          <span className="hero-ig-mock__site-line" />
          <span className="hero-ig-mock__site-line hero-ig-mock__site-line--sm" />
        </div>
        <div className="hero-ig-mock__site-grid">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-ig-mock__site-cta" />
      </div>
    </div>
  );
}
