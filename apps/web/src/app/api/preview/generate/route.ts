import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma, Niche, JobStatus } from "@mic/db";
import { getSession } from "@/lib/auth";
import {
  sanitizeInstagramUsername,
  validateInstagramUsername,
} from "@/lib/instagram-username";
import { buildTenantSubdomain, getTenantPreviewUrl } from "@/lib/site-urls";
import { getOrCreatePreviewUser } from "@/lib/preview-user";
import { runInBackground } from "@/lib/background-task";
import { assertDatabaseReady, formatDbError } from "@/lib/db-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const PREVIEW_COOKIE = "mic_preview_token";
const RESERVED = new Set(["www", "api", "admin", "dashboard", "app", "mail", "support"]);

const schema = z.object({
  username: z.string().min(1),
});

function isSecureCookie() {
  return (
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.NETLIFY)
  );
}

export async function POST(req: Request) {
  try {
    await assertDatabaseReady();

    const { username: raw } = schema.parse(await req.json());
    const username = sanitizeInstagramUsername(raw);
    const validationError = validateInstagramUsername(username);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    if (RESERVED.has(username)) {
      return NextResponse.json({ error: "Username reserved" }, { status: 400 });
    }

    const session = await getSession();
    const cookieStore = await cookies();
    const previewToken = cookieStore.get(PREVIEW_COOKIE)?.value;

    let site = await prisma.site.findUnique({ where: { username } });

    if (site) {
      if (session && site.userId === session.id) {
        // owned by logged-in user
      } else if (site.isPreview && previewToken && site.previewToken === previewToken) {
        // same guest preview session
      } else if (!site.isPreview) {
        return NextResponse.json({ error: "Username taken" }, { status: 400 });
      } else if (site.isPreview && session) {
        site = await prisma.site.update({
          where: { id: site.id },
          data: { userId: session.id, isPreview: false, previewToken: null },
        });
      } else {
        const token = crypto.randomUUID();
        site = await prisma.site.update({
          where: { id: site.id },
          data: { previewToken: token },
        });
        cookieStore.set(PREVIEW_COOKIE, token, {
          httpOnly: true,
          secure: isSecureCookie(),
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }
    }

    if (!site) {
      const userId = session?.id ?? (await getOrCreatePreviewUser()).id;
      const token = session ? null : crypto.randomUUID();

      site = await prisma.site.create({
        data: {
          userId,
          username,
          subdomain: buildTenantSubdomain(username),
          niche: Niche.OTHER,
          githubPath: `sites/${username}`,
          isPreview: !session,
          previewToken: token,
        },
      });

      if (token) {
        cookieStore.set(PREVIEW_COOKIE, token, {
          httpOnly: true,
          secure: isSecureCookie(),
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }
    }

    const [latestJob, content] = await Promise.all([
      prisma.generationJob.findFirst({
        where: { siteId: site.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.siteContent.findUnique({ where: { siteId: site.id }, select: { id: true } }),
    ]);

    const staleRunning =
      latestJob?.status === JobStatus.RUNNING &&
      Date.now() - new Date(latestJob.updatedAt).getTime() > 3 * 60 * 1000;

    if (staleRunning && latestJob) {
      await prisma.generationJob.update({
        where: { id: latestJob.id },
        data: { status: JobStatus.FAILED, error: "Generation timed out — retrying" },
      });
    }

    const needsGeneration =
      !content &&
      latestJob?.status !== JobStatus.RUNNING &&
      (!latestJob || latestJob.status === JobStatus.FAILED || staleRunning);

    if (needsGeneration) {
      const ownerId = session?.id ?? site.userId;
      runInBackground(
        import("@/lib/generation").then(({ runSiteGeneration }) =>
          runSiteGeneration(site!.id, ownerId)
        )
      );
    }

    const refreshed = await prisma.site.findUnique({
      where: { id: site.id },
      include: {
        siteContent: { select: { id: true } },
        generationJobs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const job = refreshed?.generationJobs[0];
    const ready = Boolean(refreshed?.siteContent) && job?.status === JobStatus.COMPLETED;

    return NextResponse.json({
      siteId: site.id,
      username: site.username,
      status: refreshed?.status ?? site.status,
      isPreview: site.isPreview,
      ready,
      failed: job?.status === JobStatus.FAILED,
      error: job?.status === JobStatus.FAILED ? job.error : undefined,
      previewUrl: ready ? getTenantPreviewUrl(site.username) : undefined,
    });
  } catch (err) {
    console.error("[preview/generate]", err);
    const message = formatDbError(err, "Could not start site generation");
    const status = message.includes("not configured") ? 503 : 400;
    return NextResponse.json({ error: message, failed: true }, { status });
  }
}
