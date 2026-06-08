import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, JobStatus } from "@mic/db";
import { getSession } from "@/lib/auth";
import { getTenantPreviewUrl } from "@/lib/site-urls";
import { TRIAL_DAYS } from "@/lib/trial-constants";
import { runSiteGeneration } from "@/lib/generation";
import { assertDatabaseReady, formatDbError } from "@/lib/db-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const PREVIEW_COOKIE = "mic_preview_token";
const STALE_JOB_MS = 3 * 60 * 1000;

export async function GET(req: Request) {
  try {
    await assertDatabaseReady();

    const siteId = new URL(req.url).searchParams.get("siteId");
    if (!siteId) {
      return NextResponse.json({ error: "siteId required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const previewToken = cookieStore.get(PREVIEW_COOKIE)?.value;

    let site = await prisma.site.findUnique({
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

    let job = site.generationJobs[0];
    const staleRunning =
      job?.status === JobStatus.RUNNING &&
      Date.now() - new Date(job.updatedAt).getTime() > STALE_JOB_MS;

    if (staleRunning && job) {
      await prisma.generationJob.update({
        where: { id: job.id },
        data: { status: JobStatus.FAILED, error: "Generation timed out" },
      });
      job = { ...job, status: JobStatus.FAILED, error: "Generation timed out" };
    }

    const needsKick =
      !site.siteContent &&
      job?.status !== JobStatus.RUNNING &&
      (!job || job.status === JobStatus.FAILED);

    if (needsKick) {
      const ownerId = session?.id ?? site.userId;
      try {
        await runSiteGeneration(siteId, ownerId);
      } catch (err) {
        console.error("[preview/status] generation", siteId, err);
      }

      site = await prisma.site.findUnique({
        where: { id: siteId },
        include: {
          generationJobs: { orderBy: { createdAt: "desc" }, take: 1 },
          siteContent: { select: { id: true } },
        },
      });
      if (!site) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      job = site.generationJobs[0];
    }

    const ready = Boolean(site.siteContent) && job?.status === JobStatus.COMPLETED;
    const generating = site.status === "GENERATING" || job?.status === JobStatus.RUNNING;
    const failed = job?.status === JobStatus.FAILED;

    return NextResponse.json({
      siteId: site.id,
      username: site.username,
      status: site.status,
      generating,
      ready,
      failed,
      error: failed ? job?.error || "Generation failed" : undefined,
      previewUrl: getTenantPreviewUrl(site.username),
      trialDays: TRIAL_DAYS,
    });
  } catch (err) {
    console.error("[preview/status]", err);
    return NextResponse.json(
      { error: formatDbError(err, "Could not check build status"), failed: true },
      { status: 503 }
    );
  }
}
