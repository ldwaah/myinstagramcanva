import { prisma, SiteStatus } from "@mic/db";
import { TRIAL_DAYS } from "./trial-constants";

export { TRIAL_DAYS };

export function getTrialEndDate(from = new Date()) {
  const end = new Date(from);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
}

export async function expireTrials() {
  const now = new Date();
  await prisma.site.updateMany({
    where: {
      status: SiteStatus.TRIAL,
      trialEndsAt: { lt: now },
      tier: null,
    },
    data: { status: SiteStatus.EXPIRED },
  });
}

export function isSiteAccessible(status: SiteStatus, tier: string | null | undefined) {
  if (status === SiteStatus.LIVE) return true;
  if (status === SiteStatus.TRIAL) return true;
  if (tier) return true;
  return false;
}

export function getFreeEditsForTier(tier: string | null | undefined) {
  switch (tier) {
    case "TAILORED":
      return 10;
    case "PRO":
    case "STUDIO":
      return 20;
    default:
      return 3;
  }
}
