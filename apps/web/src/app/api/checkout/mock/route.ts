import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, SiteStatus, SiteTier } from "@mic/db";
import { getSession } from "@/lib/auth";
import { getFreeEditsForTier } from "@/lib/trial";
import { runSiteGeneration } from "@/lib/generation";
import { createCommissionForOrder } from "@/lib/affiliate";
import { TIER_PRICES } from "@/lib/env";

const schema = z.object({
  siteId: z.string(),
  tier: z.nativeEnum(SiteTier),
});

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_MOCK_CHECKOUT) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const site = await prisma.site.findFirst({
      where: { id: body.siteId, userId: session.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const amount = TIER_PRICES[body.tier] ?? 0;
    const order = await prisma.order.create({
      data: {
        userId: session.id,
        siteId: site.id,
        tier: body.tier,
        amount,
        status: "paid",
      },
    });

    await createCommissionForOrder(session.id, order.id, amount, body.tier);

    await prisma.site.update({
      where: { id: site.id },
      data: {
        tier: body.tier,
        status: SiteStatus.LIVE,
        needsAdminTweak: body.tier === SiteTier.BESPOKE,
      },
    });

    await prisma.aiCredits.upsert({
      where: { userId: session.id },
      create: { userId: session.id, freeEditsRemaining: getFreeEditsForTier(body.tier) },
      update: { freeEditsRemaining: { increment: getFreeEditsForTier(body.tier) } },
    });

    runSiteGeneration(site.id, session.id).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 }
    );
  }
}
