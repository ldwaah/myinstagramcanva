import { InstagramCanvaLogo } from "@/components/InstagramCanvaLogo";

/** Abstract branded hero — gradient frames, grid motifs, logo mark (no fake IG screenshots). */
export function HeroVisualScene() {
  return (
    <div className="hero-scene hero-scene--abstract" aria-hidden>
      <div className="hero-scene__mesh" />

      <div className="hero-brand-float hero-brand-float--frame-a">
        <div className="hero-brand-frame">
          <div className="hero-brand-frame__inner">
            <div className="hero-brand-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className={`hero-brand-grid__cell hero-brand-grid__cell--${(i % 3) + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hero-brand-float hero-brand-float--frame-b">
        <div className="hero-brand-frame hero-brand-frame--tall">
          <div className="hero-brand-frame__inner hero-brand-frame__inner--gradient">
            <div className="hero-brand-bars">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>

      <div className="hero-brand-float hero-brand-float--frame-c">
        <div className="hero-brand-frame hero-brand-frame--wide">
          <div className="hero-brand-frame__inner">
            <div className="hero-brand-accent" />
          </div>
        </div>
      </div>

      <div className="hero-brand-mark">
        <InstagramCanvaLogo size={72} className="hero-brand-mark__logo" />
      </div>

      <div className="hero-orb hero-orb--1" />
      <div className="hero-orb hero-orb--2" />
      <div className="hero-orb hero-orb--3" />
    </div>
  );
}
