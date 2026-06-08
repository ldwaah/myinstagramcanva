import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";
import { getTenantPreviewUrl } from "@/lib/site-urls";
import { TRIAL_DAYS } from "@/lib/trial-constants";

const PREVIEW_COOKIE = "mic_preview_token";

export async function GET(req: Request) {
  const siteId = new URL(req.url).searchParams.get("siteId");
  if (!siteId) {
    return NextResponse.json({ error: "siteId required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const previewToken = cookieStore.get(PREVIEW_COOKIE)?.value;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      generationJobs: { orderBy: { createdAt: "desc" }, take: 1 },
      siteContent: { select: { id: true } },
    },
  });

  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getSession();
  const ownsSite = session && site.userId === session.id;

  if (!ownsSite && site.isPreview && site.previewToken !== previewToken) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const job = site.generationJobs[0];
  const ready = Boolean(site.siteContent) && job?.status === "COMPLETED";
  const generating = site.status === "GENERATING" || job?.status === "RUNNING";

  return NextResponse.json({
    siteId: site.id,
    username: site.username,
    status: site.status,
    generating,
    ready,
    previewUrl: getTenantPreviewUrl(site.username),
    trialDays: TRIAL_DAYS,
  });
}
