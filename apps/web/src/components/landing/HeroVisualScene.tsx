import { InstagramCanvaLogo } from "@/components/InstagramCanvaLogo";

/** Branded hero — Chachi Petit IG previews, gradient mesh, logo watermark. */
export function HeroVisualScene() {
  return (
    <div className="hero-scene hero-scene--branded" aria-hidden>
      <div className="hero-scene__mesh" />

      <div className="hero-brand-float hero-brand-float--preview-a">
        <div className="hero-brand-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chachi-petit-1.png"
            alt=""
            className="hero-brand-preview__img"
            width={390}
            height={844}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div className="hero-brand-float hero-brand-float--preview-b">
        <div className="hero-brand-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chachi-petit-2.png"
            alt=""
            className="hero-brand-preview__img"
            width={390}
            height={844}
            loading="lazy"
            decoding="async"
          />
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
