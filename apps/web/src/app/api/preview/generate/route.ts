import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma, Niche } from "@mic/db";
import { getSession } from "@/lib/auth";
import { runSiteGeneration } from "@/lib/generation";
import {
  sanitizeInstagramUsername,
  validateInstagramUsername,
} from "@/lib/instagram-username";
import { buildTenantSubdomain } from "@/lib/site-urls";
import { getOrCreatePreviewUser } from "@/lib/preview-user";

const PREVIEW_COOKIE = "mic_preview_token";
const RESERVED = new Set(["www", "api", "admin", "dashboard", "app", "mail", "support"]);

const schema = z.object({
  username: z.string().min(1),
});

export async function POST(req: Request) {
  try {
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
      } else {
        return NextResponse.json({ error: "Username taken" }, { status: 400 });
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
          secure: process.env.NODE_ENV === "production",
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

    const needsGeneration =
      !latestJob ||
      latestJob.status === "FAILED" ||
      (!content && latestJob.status !== "RUNNING");

    if (needsGeneration && latestJob?.status !== "RUNNING") {
      const ownerId = session?.id ?? site.userId;
      waitUntil(
        runSiteGeneration(site.id, ownerId).catch((err) => {
          console.error("[preview/generate]", site!.id, err);
        })
      );
    }

    return NextResponse.json({
      siteId: site.id,
      username: site.username,
      status: site.status,
      isPreview: site.isPreview,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 }
    );
  }
}
