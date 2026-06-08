import { NextResponse } from "next/server";
import { z } from "zod";
import { SiteTier } from "@mic/db";
import { getSession } from "@/lib/auth";
import { createTierCheckout } from "@/lib/stripe";
import { prisma } from "@mic/db";

const schema = z.object({
  siteId: z.string(),
  tier: z.nativeEnum(SiteTier),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const site = await prisma.site.findFirst({
      where: { id: body.siteId, userId: session.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const checkout = await createTierCheckout(body.tier, session.id, session.email, site.id);
    return NextResponse.json(checkout);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 400 }
    );
  }
}
