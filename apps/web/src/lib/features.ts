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

const CREATOR_PLUS: (SiteTier | null | undefined)[] = ["CREATOR", "BESPOKE"];
const BESPOKE_ONLY: (SiteTier | null | undefined)[] = ["BESPOKE"];

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
      return CREATOR_PLUS.includes(tier as SiteTier);
    case "crm":
      return tier === "BESPOKE";
    case "calendar":
      return BESPOKE_ONLY.includes(tier as SiteTier);
    case "campaigns":
      return tier === "BESPOKE";
    case "affiliates":
      return hasPaidTier(tier);
    case "ai_collaborator":
      return hasCollaboratorSub;
    case "domains":
      return BESPOKE_ONLY.includes(tier as SiteTier);
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
    title: "Enquiry form",
    description: "Embedded enquiry form on your site.",
    upgradeLabel: "Upgrade to Creator",
    minTier: "CREATOR",
  },
  crm: {
    title: "Leads and CRM",
    description: "View and manage form submissions and contact lists.",
    upgradeLabel: "Upgrade to Bespoke",
    minTier: "BESPOKE",
  },
  calendar: {
    title: "Booking link",
    description: "Booking link or embed on your website.",
    upgradeLabel: "Upgrade to Bespoke",
    minTier: "BESPOKE",
  },
  campaigns: {
    title: "Email automation",
    description: "Basic email automation for opted-in leads.",
    upgradeLabel: "Upgrade to Bespoke",
    minTier: "BESPOKE",
  },
  affiliates: {
    title: "Affiliate earnings",
    description: "Earn commission when you refer customers.",
    upgradeLabel: "Upgrade any package",
  },
  ai_collaborator: {
    title: "AI Collaborator",
    description: "AI edits to your website copy and design.",
    upgradeLabel: "Add AI Collaborator",
  },
  domains: {
    title: "Custom domain",
    description: "Connect your own domain name.",
    upgradeLabel: "Upgrade to Bespoke",
    minTier: "BESPOKE",
  },
};
