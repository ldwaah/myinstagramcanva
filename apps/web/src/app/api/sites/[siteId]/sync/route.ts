import { NextResponse } from "next/server";
import { runInBackground } from "@/lib/background-task";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";
import { runSiteGeneration } from "@/lib/generation";

export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.id },
    include: { instagramProfile: true },
  });
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const running = await prisma.generationJob.findFirst({
    where: { siteId, status: "RUNNING" },
  });
  if (running) {
    return NextResponse.json({ error: "Sync already in progress" }, { status: 409 });
  }

  runInBackground(
    runSiteGeneration(siteId, session.id, { sync: true }).catch((err) => {
      console.error("[sync]", siteId, err);
    })
  );

  return NextResponse.json({
    ok: true,
    message: "Syncing latest posts and reels from Instagram",
    lastSyncedAt: site.instagramProfile?.lastSyncedAt,
  });
}
