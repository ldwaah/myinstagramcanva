import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";
import { createHostingSubscriptionCheckout } from "@/lib/stripe";
import { activateSiteHosting } from "@/lib/go-live";
import { env } from "@/lib/env";

const schema = z.object({
  siteId: z.string(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign up or log in first", needsAuth: true }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const site = await prisma.site.findFirst({
      where: { id: body.siteId, userId: session.id },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (!env.stripeSecret) {
      await activateSiteHosting(site.id, session.id);
      return NextResponse.json({ ok: true, mock: true, redirect: `${env.appUrl}/dashboard?goLive=success` });
    }

    const checkout = await createHostingSubscriptionCheckout(session.id, session.email, site.id);
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 400 }
    );
  }
}
