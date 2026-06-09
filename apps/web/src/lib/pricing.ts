import type { SiteTier } from "@mic/db";

export const TRIAL_COPY = "14-day free trial. No card required.";

export const PROTECTION_NOTE =
  "Third-party tools, high-volume form responses, SMS, advanced automation, specialist integrations or additional accounts may require an upgraded plan or separate third-party subscription.";

export const CREATOR_FORM_NOTE =
  "Includes up to 100 form responses per month. Higher response volumes may require an upgraded plan or separate form account.";

export type PricingTierId = "starter" | "creator" | "pro" | "studio";

export type PricingTier = {
  id: PricingTierId;
  tier: SiteTier;
  name: string;
  price: string;
  pricePence: number;
  headline: string;
  description: string;
  includes: string[];
  notIncluded?: string[];
  protectionNote?: string;
  cta: string;
  featured?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    tier: "STARTER",
    name: "Starter",
    price: "£27",
    pricePence: 2700,
    headline: "AI website from your Instagram.",
    description:
      "For creators who want a quick, clean website generated from their Instagram.",
    includes: [
      "AI-generated website from Instagram",
      "Mobile responsive design",
      "Instagram-style gallery",
      "Bio/about section",
      "Social links and buttons",
      "Hosted website page",
      "Basic template edits",
    ],
    notIncluded: [
      "Contact form",
      "Booking form",
      "Lead capture",
      "CRM",
      "Automation",
      "Done-for-you setup",
    ],
    cta: "Start with AI",
  },
  {
    id: "creator",
    tier: "CREATOR",
    name: "Creator",
    price: "£59",
    pricePence: 5900,
    headline: "AI website plus a professional enquiry form.",
    description:
      "For creators and small businesses that want enquiries coming through their website.",
    includes: [
      "Everything in Starter",
      "Custom Typeform enquiry form",
      "Form embedded on your website",
      "Email notifications for enquiries",
      "Extra website sections",
      "Colour and font customisation",
      "Remove basic branding",
    ],
    protectionNote: CREATOR_FORM_NOTE,
    cta: "Add enquiry form",
    featured: true,
  },
  {
    id: "pro",
    tier: "PRO",
    name: "Pro",
    price: "£149",
    pricePence: 14900,
    headline: "We create and polish your website for you.",
    description:
      "For businesses that want a more professional website without building it themselves.",
    includes: [
      "Everything in Creator",
      "Done-for-you website setup",
      "Human design polish",
      "Custom domain support",
      "Booking link or booking embed",
      "SEO basics",
      "Monthly edit allowance",
      "Priority support",
    ],
    cta: "Get it built for me",
  },
  {
    id: "studio",
    tier: "STUDIO",
    name: "Studio",
    price: "£499",
    pricePence: 49900,
    headline: "Full website, lead capture and automation setup.",
    description:
      "For businesses that want their site, leads and automation handled properly.",
    includes: [
      "Everything in Pro",
      "Full done-for-you setup",
      "Landing or funnel page",
      "Lead capture journey",
      "CRM and contact list setup",
      "Basic email automation setup",
      "Monthly updates",
      "Strategy and design support",
      "Priority support",
    ],
    cta: "Build my full setup",
  },
];

export const TIER_DISPLAY_NAMES: Record<SiteTier, string> = {
  STARTER: "Starter",
  CREATOR: "Creator",
  PRO: "Pro",
  STUDIO: "Studio",
};

export const PLAN_NAMES_LIST = "Starter, Creator, Pro and Studio";

export const HOME_FAQ = [
  {
    question: "Do I need to connect my Instagram?",
    answer:
      "No. We build from your public Instagram profile using your handle. You do not need to connect an account to preview your site.",
  },
  {
    question: "Can I edit the website?",
    answer:
      "Yes. Every plan includes edits in the dashboard. Starter covers basic template changes; higher plans add more sections, styling and done-for-you polish.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Custom domain support is included on Pro and Studio. Starter and Creator sites are hosted on your My Instagram Canva subdomain until you upgrade.",
  },
  {
    question: "What happens after the free trial?",
    answer:
      "Your trial lasts 14 days with no card required. Choose a plan before it ends to keep your site live and unlock the features for that tier.",
  },
  {
    question: "Are forms included?",
    answer:
      "Starter does not include a contact or enquiry form. Creator adds a custom Typeform enquiry form embedded on your site, with email notifications.",
  },
  {
    question: "Are automations included?",
    answer:
      "Basic email automation setup is part of Studio. Pro focuses on done-for-you website polish and booking. Creator covers enquiries only.",
  },
] as const;

export function getTierBySiteTier(tier: SiteTier): PricingTier | undefined {
  return PRICING_TIERS.find((p) => p.tier === tier);
}

export function getPricingTierById(id: PricingTierId): PricingTier {
  const tier = PRICING_TIERS.find((p) => p.id === id);
  if (!tier) throw new Error(`Unknown pricing tier: ${id}`);
  return tier;
}

export function isPricingTierId(value: string | null | undefined): value is PricingTierId {
  return Boolean(value && PRICING_TIERS.some((p) => p.id === value));
}

/** Accepts slug (`creator`) or enum (`CREATOR`) from query params. */
export function parseTierParam(value: string | null | undefined): SiteTier | null {
  if (!value) return null;
  if (isPricingTierId(value)) return getPricingTierById(value).tier;
  const upper = value.toUpperCase();
  if (PRICING_TIERS.some((p) => p.tier === upper)) return upper as SiteTier;
  return null;
}

export function signupHrefForTier(tierId: PricingTierId): string {
  return `/signup?tier=${tierId}`;
}
