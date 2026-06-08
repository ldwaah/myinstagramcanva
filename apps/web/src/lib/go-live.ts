import { prisma, SiteStatus } from "@mic/db";
import { runSiteGeneration } from "./generation";
import { getTrialEndDate } from "./trial";

export async function activateSiteHosting(
  siteId: string,
  userId: string,
  stripeSubId?: string
) {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) throw new Error("Site not found");

  if (site.userId !== userId && !site.isPreview) {
    throw new Error("Site not owned by user");
  }

  if (site.isPreview) {
    await prisma.site.update({
      where: { id: siteId },
      data: { userId, isPreview: false, previewToken: null },
    });
  }

  await prisma.site.update({
    where: { id: siteId },
    data: {
      status: SiteStatus.TRIAL,
      trialEndsAt: getTrialEndDate(),
      isPreview: false,
      previewToken: null,
      stripeHostingSubId: stripeSubId || undefined,
      publishedAt: new Date(),
    },
  });

  await runSiteGeneration(siteId, userId).catch(console.error);

  return { siteId, username: site.username };
}

export async function claimPreviewSite(previewToken: string, userId: string) {
  const site = await prisma.site.findFirst({
    where: { previewToken, isPreview: true },
  });
  if (!site) return null;

  const existing = await prisma.site.findFirst({ where: { userId } });
  if (existing && existing.id !== site.id) {
    return existing;
  }

  await prisma.site.update({
    where: { id: site.id },
    data: { userId, isPreview: false, previewToken: null },
  });

  return site;
}
