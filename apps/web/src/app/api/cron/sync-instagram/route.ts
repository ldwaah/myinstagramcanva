import { NextResponse } from "next/server";
import { prisma, SiteTier } from "@mic/db";
import { runSiteGeneration } from "@/lib/generation";

/**
 * Weekly auto-sync placeholder for paid tiers.
 * Wire in vercel.json cron: { "path": "/api/cron/sync-instagram", "schedule": "0 6 * * 1" }
 * Protect with CRON_SECRET header in production.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paidTiers: SiteTier[] = [SiteTier.LAUNCH, SiteTier.CREATOR, SiteTier.BESPOKE];
  const sites = await prisma.site.findMany({
    where: { tier: { in: paidTiers } },
    select: { id: true, userId: true, username: true },
    take: 20,
  });

  const results: { username: string; ok: boolean; error?: string }[] = [];

  for (const site of sites) {
    try {
      await runSiteGeneration(site.id, site.userId, { sync: true });
      results.push({ username: site.username, ok: true });
    } catch (err) {
      results.push({
        username: site.username,
        ok: false,
        error: err instanceof Error ? err.message : "failed",
      });
    }
  }

  return NextResponse.json({
    synced: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
