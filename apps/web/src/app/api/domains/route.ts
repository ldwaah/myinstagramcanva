import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  siteId: z.string(),
  domain: z.string().min(4),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const domain = body.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

    const site = await prisma.site.findFirst({
      where: { id: body.siteId, userId: session.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
    if (!site.tier) {
      return NextResponse.json({ error: "Purchase a site tier first" }, { status: 403 });
    }

    const taken = await prisma.site.findFirst({
      where: { customDomain: domain, id: { not: site.id } },
    });
    if (taken) return NextResponse.json({ error: "Domain already in use" }, { status: 400 });

    await prisma.site.update({
      where: { id: site.id },
      data: { customDomain: domain },
    });

    return NextResponse.json({
      ok: true,
      domain,
      instructions: {
        cname: "sites.myinstagramcanva.com",
        txt: `mic-verify=${site.id}`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 }
    );
  }
}
