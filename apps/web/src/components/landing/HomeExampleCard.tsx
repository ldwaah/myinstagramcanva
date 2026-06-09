"use client";

import Link from "next/link";
import type { HomeExample } from "@/lib/example-sites";
import { getExampleSiteUrl } from "@/lib/example-sites";

type HomeExampleCardProps = {
  example: HomeExample;
};

export function HomeExampleCard({ example }: HomeExampleCardProps) {
  const siteUrl = getExampleSiteUrl(example.slug);
  const localPreview = `/examples/${example.slug}-preview.jpg`;

  return (
    <article className="home-example-card">
      <div className={`home-example-card__preview home-example-card__preview--${example.accent}`}>
        <div className="home-example-card__browser" aria-hidden>
          <div className="home-example-card__browser-chrome">
            <span />
            <span />
            <span />
          </div>
          <div className="home-example-card__browser-body">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={localPreview}
              alt=""
              className="home-example-card__preview-img"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.dataset.fallbackApplied) return;
                img.dataset.fallbackApplied = "1";
                img.src = example.previewImage;
              }}
            />
          </div>
        </div>
      </div>
      <h3 className="home-example-card__title">{example.title}</h3>
      <p className="home-example-card__use">{example.useCase}</p>
      <Link
        href={siteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="home-example-card__cta"
      >
        View example
      </Link>
    </article>
  );
}
