import { cookies } from "next/headers";
import { prisma, SiteTier } from "@mic/db";
import { env } from "./env";
import { getAffiliateCommissionRate } from "./affiliate-utils";

export { formatPence } from "./affiliate-utils";
export const REF_COOKIE = "mic_ref";
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function buildReferralUrl(code: string): string {
  return `${env.appUrl}/signup?ref=${encodeURIComponent(code)}`;
}

export async function readReferralCodeFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const code = cookieStore.get(REF_COOKIE)?.value?.trim().toLowerCase();
  return code || null;
}

export async function generateUniqueAffiliateCode(email: string, userId: string): Promise<string> {
  const base =
    email
      .split("@")[0]
      ?.replace(/[^a-z0-9]/gi, "")
      .slice(0, 14)
      .toLowerCase() || "partner";

  for (let attempt = 0; attempt < 8; attempt++) {
    const suffix = attempt === 0 ? "" : String(Math.floor(100 + Math.random() * 900));
    const candidate = `${base}${suffix}`.slice(0, 20);
    const existing = await prisma.affiliate.findUnique({ where: { code: candidate } });
    if (!existing) return candidate;
  }

  return `mic${userId.slice(-8).toLowerCase()}`;
}

export async function getOrCreateAffiliate(userId: string, email: string) {
  const existing = await prisma.affiliate.findUnique({ where: { userId } });
  if (existing) return existing;

  const code = await generateUniqueAffiliateCode(email, userId);
  return prisma.affiliate.create({
    data: { userId, code },
  });
}

export async function recordReferralClick(code: string) {
  const affiliate = await prisma.affiliate.findUnique({
    where: { code: code.toLowerCase() },
  });
  if (!affiliate) return null;

  await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: { clicks: { increment: 1 } },
  });

  return affiliate;
}

export async function attachReferralToUser(userId: string, code: string | null) {
  if (!code) return null;

  const affiliate = await prisma.affiliate.findUnique({
    where: { code: code.toLowerCase() },
  });
  if (!affiliate || affiliate.userId === userId) return null;

  const existing = await prisma.referral.findUnique({ where: { referredUserId: userId } });
  if (existing) return existing;

  return prisma.referral.create({
    data: {
      affiliateId: affiliate.id,
      referredUserId: userId,
    },
  });
}

export async function createCommissionForOrder(
  userId: string,
  orderId: string,
  orderAmount: number,
  tier: SiteTier,
  stripeSessionId?: string
) {
  const referral = await prisma.referral.findUnique({
    where: { referredUserId: userId },
    include: { affiliate: true },
  });
  if (!referral) return null;

  const existing = await prisma.commission.findUnique({ where: { orderId } });
  if (existing) return existing;

  const rate = getAffiliateCommissionRate();
  const amount = Math.round(orderAmount * rate);

  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      convertedAt: new Date(),
      tier,
      stripeSessionId: stripeSessionId || referral.stripeSessionId,
    },
  });

  if (amount <= 0) return null;

  return prisma.commission.create({
    data: {
      affiliateId: referral.affiliateId,
      orderId,
      amount,
      rate,
      status: "PENDING",
    },
  });
}

export async function getAffiliateStats(affiliateId: string) {
  const [affiliate, signups, conversions, pendingAgg, paidAgg] = await Promise.all([
    prisma.affiliate.findUnique({ where: { id: affiliateId } }),
    prisma.referral.count({ where: { affiliateId, referredUserId: { not: null } } }),
    prisma.referral.count({ where: { affiliateId, convertedAt: { not: null } } }),
    prisma.commission.aggregate({
      where: { affiliateId, status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.commission.aggregate({
      where: { affiliateId, status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  return {
    clicks: affiliate?.clicks ?? 0,
    signups,
    conversions,
    pendingCommission: pendingAgg._sum.amount ?? 0,
    paidCommission: paidAgg._sum.amount ?? 0,
  };
}
