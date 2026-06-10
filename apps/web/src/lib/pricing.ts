import type { SiteTier } from "@mic/db";

export const CORE_OFFER =
  "Send us your Instagram. We'll create your website. Use it free for 14 days. Pay once if you keep it.";

export const TRIAL_COPY =
  "Your card is required to start your free trial. You will not be charged today. If you do not cancel before the trial ends, you will be charged the one-off lifetime fee for your selected plan.";

export type PricingTierId = "launch" | "creator" | "bespoke";

export type PricingTier = {
  id: PricingTierId;
  tier: SiteTier;
  name: string;
  price: string;
  pricePence: number;
  headline: string;
  description: string;
  includes: string[];
  cta: string;
  badge?: string;
  featured?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "launch",
    tier: "LAUNCH",
    name: "Launch",
    price: "£50",
    pricePence: 5000,
    headline: "Premium Instagram website with social buttons.",
    description:
      "A clean, professional website created from your Instagram content, style and brand.",
    includes: [
      "Website created from your Instagram",
      "Premium mobile-friendly design",
      "Instagram-inspired layout",
      "Profile, gallery and content sections",
      "Social/contact buttons",
      "Live myinstagramcanva.com subdomain",
      "14-day free trial",
      "No monthly hosting fee",
    ],
    cta: "Start Launch trial",
  },
  {
    id: "creator",
    tier: "CREATOR",
    name: "Creator",
    price: "£100",
    pricePence: 10000,
    headline: "Website plus enquiry form.",
    description:
      "A premium Instagram-inspired website with a contact form connected to your email.",
    includes: [
      "Everything in Launch",
      "Enquiry/contact form",
      "Form responses sent to your email",
      "Stronger contact section",
      "Extra sections where useful",
      "Lead capture setup",
      "14-day free trial",
      "No monthly hosting fee",
    ],
    cta: "Start Creator trial",
    badge: "Best for enquiries",
    featured: true,
  },
  {
    id: "bespoke",
    tier: "BESPOKE",
    name: "Bespoke",
    price: "£300",
    pricePence: 30000,
    headline: "Fuller bespoke website setup.",
    description:
      "A more complete website built around your Instagram brand, content and business goals.",
    includes: [
      "Everything in Creator",
      "Fuller website structure",
      "Multiple sections/pages where appropriate",
      "Stronger design direction",
      "Custom domain support",
      "Booking link or embed if required",
      "SEO basics",
      "Optional GitHub/code access",
      "AI-edit handover guidance",
      "14-day free trial",
      "No monthly hosting fee",
    ],
    cta: "Start Bespoke trial",
    badge: "Most complete",
  },
];

export const TIER_DISPLAY_NAMES: Record<SiteTier, string> = {
  LAUNCH: "Launch",
  CREATOR: "Creator",
  BESPOKE: "Bespoke",
};

export const PLAN_NAMES_LIST = "Launch, Creator and Bespoke";

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Send us your Instagram",
    description: "Choose your plan and tell us where to find your content.",
  },
  {
    step: 2,
    title: "We create your website",
    description:
      "We use your Instagram content, style and brand to create a premium mobile-friendly website.",
  },
  {
    step: 3,
    title: "Use it free for 14 days",
    description:
      "Your website goes live on a myinstagramcanva.com subdomain so you can test it properly.",
  },
  {
    step: 4,
    title: "Keep it if you love it",
    description:
      "If you do not cancel before the trial ends, your selected one-off lifetime fee is charged and the site stays live.",
  },
] as const;

export const WHY_CHOOSE_US = [
  "Built from your existing Instagram content",
  "No need to start from scratch",
  "Premium design without agency prices",
  "No monthly hosting fees",
  "Preview before you commit",
  "Optional code/GitHub access for future edits",
] as const;

export const HOME_FAQ = [
  {
    question: "Is this an instant AI website generator?",
    answer:
      "No. We create the website for you using your Instagram as the brief. AI may help us build faster, but every site is shaped and reviewed by us.",
  },
  {
    question: "Do I pay monthly?",
    answer:
      "No. Our main plans are one-off lifetime fees. There are no monthly hosting fees for the standard website.",
  },
  {
    question: "Why do you need my card?",
    answer:
      "Your card starts the 14-day free live website trial. You are not charged today. If you do not cancel before the trial ends, you are charged the one-off fee for your selected plan.",
  },
  {
    question: "What happens if I cancel during the trial?",
    answer: "You are not charged and your website may be removed.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Custom domain support is included with Bespoke. For other plans, domain support may be offered separately.",
  },
  {
    question: "Can I edit the website later?",
    answer:
      "Basic changes can be requested from us. Code/GitHub access and AI-edit guidance may be available as an optional add-on or included with Bespoke.",
  },
  {
    question: "Are all websites the same quality?",
    answer:
      "Yes. Every website is designed to look premium. The difference between plans is the level of setup, features, forms and support.",
  },
  {
    question: "Do I need to give you my Instagram login?",
    answer:
      "No. We only need your Instagram handle and any extra content you want us to use.",
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

export function parseTierParam(value: string | null | undefined): SiteTier | null {
  if (!value) return null;
  if (isPricingTierId(value)) return getPricingTierById(value).tier;
  const upper = value.toUpperCase();
  if (PRICING_TIERS.some((p) => p.tier === upper)) return upper as SiteTier;
  return null;
}

export function requestHrefForTier(tierId: PricingTierId): string {
  return `/#request?plan=${tierId}`;
}
