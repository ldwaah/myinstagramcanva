import { EXAMPLE_SITE_SLUGS, type ExampleSiteSlug, isExampleSiteSlug } from "./example-site-slugs";
import { getTenantPreviewUrl } from "./site-urls";

export { EXAMPLE_SITE_SLUGS, type ExampleSiteSlug, isExampleSiteSlug };

/**
 * Showcase tenant slugs for homepage "Built for real creators" cards.
 * Reserved in preview/signup so users cannot claim these usernames.
 * Regenerate bundles: npx tsx scripts/seed-example-sites.mjs
 */
export type HomeExample = {
  slug: ExampleSiteSlug;
  title: string;
  useCase: string;
  accent: "photo" | "coach" | "athlete" | "creator";
  /** Remote fallback preview when local /public/examples/ asset is missing */
  previewImage: string;
};

export const HOME_EXAMPLES: HomeExample[] = [
  {
    slug: "example-photographer",
    title: "Photographer",
    useCase: "Portfolio, booking enquiries and your best frames in one polished site.",
    accent: "photo",
    previewImage: "https://picsum.photos/seed/mic-ex-photo-1-preview/800/600",
  },
  {
    slug: "example-lifecoach",
    title: "Life Coach",
    useCase: "Your story, testimonials and a clear path for clients to book a call.",
    accent: "coach",
    previewImage: "https://picsum.photos/seed/mic-ex-coach-1-preview/800/600",
  },
  {
    slug: "example-athlete",
    title: "Athlete",
    useCase: "Training highlights, sponsors and socials with a site that feels like your feed.",
    accent: "athlete",
    previewImage: "https://picsum.photos/seed/mic-ex-athlete-1-preview/800/600",
  },
  {
    slug: "example-creator",
    title: "Creator / Business",
    useCase: "Turn your brand Instagram into a proper home for links, offers and leads.",
    accent: "creator",
    previewImage: "https://picsum.photos/seed/mic-ex-creator-1-preview/800/600",
  },
];

export function getExampleSiteUrl(slug: ExampleSiteSlug): string {
  return getTenantPreviewUrl(slug);
}
