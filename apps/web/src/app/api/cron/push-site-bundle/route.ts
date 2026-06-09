import { NextResponse } from "next/server";
import { prisma } from "@mic/db";
import { persistSiteBundle } from "@/lib/persist-site-bundle";

/**
 * Push a pre-generated site bundle (from local IG fetch / scripts/push-site-bundle.mjs).
 * POST /api/cron/push-site-bundle?username=official4dads
 * Body: { files: Record<string, string>, content?: string }
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

  const body = (await req.json()) as { files?: Record<string, string>; content?: string };
  if (!body.files?.["index.html"]) {
    return NextResponse.json({ error: "files.index.html required" }, { status: 400 });
  }

  const site = await prisma.site.findUnique({ where: { username } });
  if (!site) {
    return NextResponse.json({ error: `Site not found: @${username}` }, { status: 404 });
  }

  try {
    const data = await persistSiteBundle(username, body.files);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "persist failed" },
      { status: 500 },
    );
  }
}
