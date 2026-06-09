/** Showcase tenant slugs — kept separate to avoid circular imports with site-urls. */
export const EXAMPLE_SITE_SLUGS = [
  "example-photographer",
  "example-lifecoach",
  "example-athlete",
  "example-creator",
] as const;

export type ExampleSiteSlug = (typeof EXAMPLE_SITE_SLUGS)[number];

export function isExampleSiteSlug(value: string): value is ExampleSiteSlug {
  return (EXAMPLE_SITE_SLUGS as readonly string[]).includes(value);
}
