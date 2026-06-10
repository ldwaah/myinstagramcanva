import type { Metadata } from "next";
import { env } from "./env";

export const SITE_NAME = "MyInstagramCanva";
export const SITE_TAGLINE = "Turn your Instagram into a professional website";
export const SITE_DESCRIPTION =
  "Submit your Instagram handle and we will create a premium website inspired by your content, style and brand. 14-day free trial. Pay once if you keep it.";

const DEFAULT_OG = "/og-default.png";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

export const ogImagePaths = {
  default: DEFAULT_OG,
} as const;

function absoluteUrl(path: string): string {
  const base = env.appUrl.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function ogImages(path: string, alt: string) {
  const url = absoluteUrl(path);
  return [
    {
      url,
      width: OG_IMAGE_SIZE.width,
      height: OG_IMAGE_SIZE.height,
      alt,
    },
  ];
}

const twitterDefaults = {
  card: "summary_large_image" as const,
  site: "@myinstagramcanva",
};

export function buildRootMetadata(overrides: Metadata = {}): Metadata {
  const images = ogImages(DEFAULT_OG, `${SITE_NAME}. ${SITE_TAGLINE}`);
  return {
    metadataBase: new URL(env.appUrl),
    title: {
      default: SITE_NAME,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [
      "Instagram website",
      "creator website",
      "Instagram to website",
      "portfolio site",
      "MyInstagramCanva",
    ],
    authors: [{ name: SITE_NAME, url: env.appUrl }],
    creator: SITE_NAME,
    openGraph: {
      type: "website",
      locale: "en_GB",
      url: env.appUrl,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images,
    },
    twitter: {
      ...twitterDefaults,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [images[0].url],
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    ...overrides,
  };
}

export function buildViewport() {
  return {
    themeColor: "#7C3AED",
  };
}

export function buildHomeMetadata(): Metadata {
  return buildRootMetadata({
    title: SITE_NAME,
    alternates: { canonical: env.appUrl },
    openGraph: {
      type: "website",
      locale: "en_GB",
      url: env.appUrl,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_TAGLINE,
      images: ogImages(DEFAULT_OG, SITE_TAGLINE),
    },
    twitter: {
      ...twitterDefaults,
      title: SITE_NAME,
      description: SITE_TAGLINE,
      images: [absoluteUrl(DEFAULT_OG)],
    },
  });
}

export function buildSignupMetadata(): Metadata {
  const title = "Request your website";
  const description = `Submit your Instagram handle to ${SITE_NAME}. 14-day free trial. Card required, no charge today.`;
  const url = `${env.appUrl}/signup`;
  const images = ogImages(DEFAULT_OG, SITE_TAGLINE);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description,
      images,
    },
    twitter: {
      ...twitterDefaults,
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [images[0].url],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: env.appUrl,
    logo: absoluteUrl("/og-default.png"),
    description: SITE_DESCRIPTION,
    sameAs: ["https://www.instagram.com/myinstagramcanva"],
  };
}
