import type { Metadata } from "next";
import { env } from "./env";

export const SITE_NAME = "My Instagram Canva";
export const SITE_TAGLINE = "Turn your Instagram into a website in minutes";
export const SITE_DESCRIPTION =
  "AI-powered websites built from your Instagram — your colours, posts, and profile style. Mobile-ready, hosted for you.";

const DEFAULT_OG = "/og-default.png";
const PRICING_OG = "/og-pricing.png";
const AFFILIATES_OG = "/og-affiliates.png";
const REFERRAL_OG = "/og-referral.png";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

export const ogImagePaths = {
  default: DEFAULT_OG,
  pricing: PRICING_OG,
  affiliates: AFFILIATES_OG,
  referral: REFERRAL_OG,
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
  const images = ogImages(DEFAULT_OG, `${SITE_NAME} — ${SITE_TAGLINE}`);
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
      "My Instagram Canva",
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
    themeColor: "#E1306C",
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

export function buildPricingMetadata(): Metadata {
  const title = "Pricing";
  const description =
    "Simple, transparent pricing. Every plan starts with a free trial — AI-built sites from your Instagram, from £27.";
  const url = `${env.appUrl}/pricing`;
  const images = ogImages(PRICING_OG, "My Instagram Canva pricing");
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

export function buildAffiliatesMetadata(): Metadata {
  const title = "Affiliate Program";
  const description =
    "Earn on every referral. Share your link, get 30-day attribution, and earn commission on every sale.";
  const url = `${env.appUrl}/affiliates`;
  const images = ogImages(AFFILIATES_OG, "My Instagram Canva affiliate program");
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

export function buildReferralMetadata(code: string): Metadata {
  const title = "Start your free trial";
  const description = `You've been invited to try ${SITE_NAME}. Turn your Instagram into a professional website in minutes.`;
  const url = `${env.appUrl}/signup?ref=${encodeURIComponent(code)}`;
  const images = ogImages(REFERRAL_OG, `Join ${SITE_NAME} via referral`);
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
    other: {
      "referral:code": code,
    },
  };
}

export function buildSignupMetadata(ref?: string | null): Metadata {
  if (ref) return buildReferralMetadata(ref);
  const title = "Create your account";
  const description = `Sign up for ${SITE_NAME}. Free trial — no credit card required.`;
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
