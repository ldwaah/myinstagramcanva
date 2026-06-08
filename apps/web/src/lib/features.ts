import type { SiteTier } from "@mic/db";

export type FeatureKey =
  | "website"
  | "contact_form"
  | "crm"
  | "calendar"
  | "campaigns"
  | "affiliates"
  | "ai_collaborator"
  | "domains";

const TAILORED_PLUS: (SiteTier | null | undefined)[] = ["TAILORED", "PRO", "STUDIO"];
const PRO_PLUS: (SiteTier | null | undefined)[] = ["PRO", "STUDIO"];

export function hasPaidTier(tier: SiteTier | string | null | undefined): boolean {
  return Boolean(tier);
}

export function canUseFeature(
  feature: FeatureKey,
  tier: SiteTier | string | null | undefined,
  hasCollaboratorSub = false
): boolean {
  switch (feature) {
    case "website":
      return true;
    case "contact_form":
    case "crm":
      return TAILORED_PLUS.includes(tier as SiteTier);
    case "calendar":
    case "campaigns":
      return PRO_PLUS.includes(tier as SiteTier);
    case "affiliates":
      return hasPaidTier(tier);
    case "ai_collaborator":
      return hasCollaboratorSub;
    case "domains":
      return hasPaidTier(tier);
    default:
      return false;
  }
}

export const FEATURE_META: Record<
  FeatureKey,
  { title: string; description: string; upgradeLabel: string; minTier?: string }
> = {
  website: { title: "Your website", description: "Live site with My Posts gallery.", upgradeLabel: "" },
  contact_form: {
    title: "Contact form",
    description: "Embedded lead capture on your site.",
    upgradeLabel: "Upgrade to Tailored",
    minTier: "TAILORED",
  },
  crm: {
    title: "Leads & CRM",
    description: "View and manage form submissions.",
    upgradeLabel: "Upgrade to Tailored",
    minTier: "TAILORED",
  },
  calendar: {
    title: "Booking calendar",
    description: "Let clients book sessions online.",
    upgradeLabel: "Upgrade to Pro",
    minTier: "PRO",
  },
  campaigns: {
    title: "Email & SMS campaigns",
    description: "Reach opted-in leads at scale.",
    upgradeLabel: "Upgrade to Studio",
    minTier: "STUDIO",
  },
  affiliates: {
    title: "Affiliate earnings",
    description: "Earn commission when you refer customers.",
    upgradeLabel: "Upgrade any package",
  },
  ai_collaborator: {
    title: "AI Collaborator",
    description: "Unlimited AI edits to your website copy and design.",
    upgradeLabel: "Add AI Collaborator",
  },
  domains: {
    title: "Custom domain",
    description: "Connect your own domain name.",
    upgradeLabel: "Upgrade any package",
  },
};
