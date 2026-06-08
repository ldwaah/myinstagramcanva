import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, Niche } from "@mic/db";
import { getSession } from "@/lib/auth";
import { runSiteGeneration } from "@/lib/generation";

const schema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
  niche: z.nativeEnum(Niche).optional().default(Niche.OTHER),
  tagline: z.string().optional(),
});

const RESERVED = new Set(["www", "api", "admin", "dashboard", "app", "mail", "support"]);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const username = body.username.toLowerCase();

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
        subdomain: `${username}.myinstagramcanva.com`,
        niche: body.niche,
        tagline: body.tagline,
        githubPath: `sites/${username}`,
      },
    });

    runSiteGeneration(site.id, session.id).catch(console.error);

    return NextResponse.json({ siteId: site.id, username: site.username });
  } catch (err) {
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
    include: { siteContent: true, generationJobs: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sites });
}
