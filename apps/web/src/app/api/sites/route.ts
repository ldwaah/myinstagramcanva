import { NextResponse } from "next/server";
import { runInBackground } from "@/lib/background-task";
import { z } from "zod";
import { prisma, Niche } from "@mic/db";
import { getSession } from "@/lib/auth";
import { runSiteGeneration } from "@/lib/generation";
import {
  sanitizeInstagramUsername,
  validateInstagramUsername,
} from "@/lib/instagram-username";
import { buildTenantSubdomain } from "@/lib/site-urls";

export const maxDuration = 60;

const schema = z.object({
  username: z.string().min(1),
  niche: z.nativeEnum(Niche).optional().default(Niche.OTHER),
  tagline: z.string().optional(),
});

const RESERVED = new Set(["www", "api", "admin", "dashboard", "app", "mail", "support"]);

function formatZodError(err: z.ZodError): string {
  return err.issues.map((e) => e.message).join(" ");
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const raw = schema.parse(await req.json());
    const username = sanitizeInstagramUsername(raw.username);
    const validationError = validateInstagramUsername(username);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (RESERVED.has(username)) {
      return NextResponse.json({ error: "Username reserved" }, { status: 400 });
    }

    const existing = await prisma.site.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username taken" }, { status: 400 });
    }

    const site = await prisma.site.create({
      data: {
        userId: session.id,
        username,
        subdomain: buildTenantSubdomain(username),
        niche: raw.niche,
        tagline: raw.tagline,
        githubPath: `sites/${username}`,
      },
    });

    runInBackground(
      runSiteGeneration(site.id, session.id).catch((err) => {
        console.error("[generation]", site.id, err);
      })
    );

    return NextResponse.json({ siteId: site.id, username: site.username });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: formatZodError(err) }, { status: 400 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create site" },
      { status: 400 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sites = await prisma.site.findMany({
    where: { userId: session.id },
    include: {
      siteContent: true,
      instagramProfile: { select: { lastSyncedAt: true } },
      generationJobs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sites });
}
