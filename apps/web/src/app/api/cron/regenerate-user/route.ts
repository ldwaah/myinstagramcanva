import { NextResponse } from "next/server";
import { prisma } from "@mic/db";
import { runSiteGeneration } from "@/lib/generation";

/**
 * Regenerate a single site by username (post-deploy fixes, support).
 * Protect with CRON_SECRET: Authorization: Bearer <CRON_SECRET>
 *
 * POST /api/cron/regenerate-user?username=official4dads
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const username = url.searchParams.get("username")?.replace(/^@/, "").trim().toLowerCase();
  if (!username) {
    return NextResponse.json({ error: "username query param required" }, { status: 400 });
  }

  const site = await prisma.site.findUnique({
    where: { username },
    select: { id: true, userId: true, username: true },
  });
  if (!site) {
    return NextResponse.json({ error: `Site not found: @${username}` }, { status: 404 });
  }

  try {
    const result = await runSiteGeneration(site.id, site.userId, { sync: true });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        username,
        error: err instanceof Error ? err.message : "regeneration failed",
      },
      { status: 500 },
    );
  }
}
