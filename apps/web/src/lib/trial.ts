import { prisma, SiteStatus } from "@mic/db";
import { getStripe } from "./stripe";
import { TRIAL_DAYS } from "./trial-constants";

export { TRIAL_DAYS };

export function getTrialEndDate(from = new Date()) {
  const end = new Date(from);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
}

const ACTIVE_SUB_STATUSES = new Set(["active", "trialing"]);

export async function expireTrials() {
  const now = new Date();
  const stripe = getStripe();

  await prisma.site.updateMany({
    where: {
      status: { in: [SiteStatus.TRIAL, SiteStatus.LIVE] },
      trialEndsAt: { lt: now },
      tier: null,
      stripeHostingSubId: null,
    },
    data: { status: SiteStatus.EXPIRED },
  });

  if (!stripe) return;

  const candidates = await prisma.site.findMany({
    where: {
      status: { in: [SiteStatus.TRIAL, SiteStatus.LIVE] },
      trialEndsAt: { lt: now },
      tier: null,
      stripeHostingSubId: { not: null },
    },
    select: { id: true, stripeHostingSubId: true },
  });

  for (const site of candidates) {
    if (!site.stripeHostingSubId) continue;
    try {
      const sub = await stripe.subscriptions.retrieve(site.stripeHostingSubId);
      if (!ACTIVE_SUB_STATUSES.has(sub.status)) {
        await prisma.site.update({
          where: { id: site.id },
          data: { status: SiteStatus.EXPIRED },
        });
      } else if (sub.status === "active") {
        await prisma.site.update({
          where: { id: site.id },
          data: { status: SiteStatus.LIVE },
        });
      }
    } catch {
      await prisma.site.update({
        where: { id: site.id },
        data: { status: SiteStatus.EXPIRED },
      });
    }
  }
}

export function isSiteAccessible(status: SiteStatus, tier: string | null | undefined) {
  if (status === SiteStatus.LIVE) return true;
  if (status === SiteStatus.TRIAL) return true;
  if (status === SiteStatus.DRAFT) return true;
  if (status === SiteStatus.GENERATING) return true;
  if (tier) return true;
  return false;
}

export function isSiteLive(status: SiteStatus) {
  return status === SiteStatus.LIVE || status === SiteStatus.TRIAL;
}

export function getFreeEditsForTier(tier: string | null | undefined) {
  switch (tier) {
    case "CREATOR":
      return 10;
    case "BESPOKE":
      return 20;
    default:
      return 3;
  }
}
