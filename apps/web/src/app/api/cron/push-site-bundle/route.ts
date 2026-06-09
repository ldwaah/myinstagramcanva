import { NextResponse } from "next/server";
import { prisma } from "@mic/db";
import { publishSiteBundle } from "@/lib/storage";
import { bundleUnchanged, commitSiteFiles, publishCommitMessage } from "@/lib/github";

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

  const site = await prisma.site.findUnique({
    where: { username },
    include: { siteContent: true },
  });
  if (!site) {
    return NextResponse.json({ error: `Site not found: @${username}` }, { status: 404 });
  }

  const siteJson = body.files["site.json"] ?? body.content ?? site.siteContent?.content ?? "{}";

  try {
    await publishSiteBundle(username, body.files);
  } catch {
    /* optional on serverless */
  }

  const nextVersion = (site.siteContent?.version ?? 0) + 1;
  let commitSha = site.siteContent?.commitSha ?? null;

  if (!bundleUnchanged(site.siteContent?.bundle, body.files)) {
    commitSha = await commitSiteFiles(
      username,
      Object.entries(body.files).map(([path, content]) => ({ path, content })),
      publishCommitMessage(username, nextVersion)
    );
    if (!commitSha) {
      console.warn(`[push-site-bundle] GitHub publish unavailable for @${username} — saving to database`);
    }
  }

  await prisma.siteContent.upsert({
    where: { siteId: site.id },
    create: {
      siteId: site.id,
      content: siteJson,
      bundle: JSON.stringify(body.files),
      commitSha: commitSha || undefined,
    },
    update: {
      content: siteJson,
      bundle: JSON.stringify(body.files),
      version: { increment: 1 },
      commitSha: commitSha || undefined,
    },
  });

  await prisma.site.update({
    where: { id: site.id },
    data: { publishedAt: new Date(), githubPath: `sites/${username}` },
  });

  return NextResponse.json({
    ok: true,
    username,
    version: nextVersion,
    mediaInBundle: Object.keys(body.files).filter((k) => k.startsWith("assets/")).length,
  });
}
