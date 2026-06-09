import { NextResponse } from "next/server";
import { prisma, SiteStatus, SiteTier } from "@mic/db";
import { getStripe } from "@/lib/stripe";
import { getFreeEditsForTier } from "@/lib/trial";
import { runSiteGeneration } from "@/lib/generation";
import { env } from "@/lib/env";
import { createCommissionForOrder } from "@/lib/affiliate";
import { activateSiteHosting } from "@/lib/go-live";

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!stripe || !sig || !env.stripeWebhookSecret) {
    return handleMockWebhook(req);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata?: Record<string, string>;
      amount_total?: number;
      id: string;
      payment_intent?: string;
      subscription?: string;
    };
    const meta = session.metadata || {};

    if (meta.type === "hosting" && meta.userId && meta.siteId) {
      const subId = typeof session.subscription === "string" ? session.subscription : undefined;
      await activateSiteHosting(meta.siteId, meta.userId, subId);
    }

    if (meta.type === "site_tier" && meta.userId && meta.siteId && meta.tier) {
      const tier = meta.tier as SiteTier;
      const order = await prisma.order.create({
        data: {
          userId: meta.userId,
          siteId: meta.siteId,
          stripeSessionId: session.id,
          stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          tier,
          amount: session.amount_total || 0,
          status: "paid",
        },
      });

      await createCommissionForOrder(
        meta.userId,
        order.id,
        order.amount,
        tier,
        session.id
      );

      const needsAdmin = tier === SiteTier.PRO || tier === SiteTier.STUDIO;
      await prisma.site.update({
        where: { id: meta.siteId },
        data: {
          tier,
          status: SiteStatus.LIVE,
          needsAdminTweak: needsAdmin,
        },
      });

      await prisma.aiCredits.upsert({
        where: { userId: meta.userId },
        create: { userId: meta.userId, freeEditsRemaining: getFreeEditsForTier(tier) },
        update: { freeEditsRemaining: { increment: getFreeEditsForTier(tier) } },
      });

      runSiteGeneration(meta.siteId, meta.userId).catch(console.error);
    }

    if (meta.type === "ai_topup" && meta.userId) {
      await prisma.aiCredits.upsert({
        where: { userId: meta.userId },
        create: { userId: meta.userId, editsRemaining: 10 },
        update: { editsRemaining: { increment: 10 } },
      });
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const sub = event.data.object as unknown as {
      id: string;
      metadata?: Record<string, string>;
      status: string;
      current_period_end?: number;
    };
    const meta = sub.metadata || {};

    if (meta.type === "hosting" && meta.userId && meta.siteId) {
      await prisma.site.update({
        where: { id: meta.siteId },
        data: {
          stripeHostingSubId: sub.id,
          status: sub.status === "active" || sub.status === "trialing" ? SiteStatus.TRIAL : SiteStatus.EXPIRED,
        },
      });
    }

    if (meta.userId && meta.plan) {
      await prisma.aiSubscription.upsert({
        where: { userId: meta.userId },
        create: {
          userId: meta.userId,
          plan: meta.plan as "BYOK" | "MANAGED",
          stripeSubId: sub.id,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
        },
        update: {
          plan: meta.plan as "BYOK" | "MANAGED",
          stripeSubId: sub.id,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
        },
      });

      if (meta.plan === "MANAGED") {
        const resetAt = sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined;
        await prisma.aiCredits.upsert({
          where: { userId: meta.userId },
          create: { userId: meta.userId, editsRemaining: 30, periodResetAt: resetAt },
          update: { editsRemaining: 30, editsUsedThisPeriod: 0, periodResetAt: resetAt },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

async function handleMockWebhook(req: Request) {
  try {
    const json = await req.json();
    if (json.type === "mock_tier" && json.userId && json.siteId && json.tier) {
      await prisma.site.update({
        where: { id: json.siteId },
        data: { tier: json.tier, status: SiteStatus.LIVE },
      });
    }
    return NextResponse.json({ received: true, mock: true });
  } catch {
    return NextResponse.json({ received: true, mock: true });
  }
}
