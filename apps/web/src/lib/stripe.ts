import Stripe from "stripe";
import { SiteTier } from "@mic/db";
import { env, TIER_PRICES } from "./env";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!env.stripeSecret) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecret);
  }
  return stripeClient;
}

export function tierToPriceId(tier: SiteTier): string | null {
  const map: Record<SiteTier, string> = {
    STARTER: env.stripePrices.starter,
    TAILORED: env.stripePrices.tailored,
    PRO: env.stripePrices.pro,
    STUDIO: env.stripePrices.studio,
  };
  return map[tier] || null;
}

export async function createTierCheckout(
  tier: SiteTier,
  userId: string,
  email: string,
  siteId: string
) {
  const stripe = getStripe();
  if (!stripe) {
    return { url: `${env.appUrl}/dashboard?checkout=mock&tier=${tier}&siteId=${siteId}` };
  }

  const priceId = tierToPriceId(tier);
  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [{ price_data: { currency: "gbp", unit_amount: TIER_PRICES[tier], product_data: { name: `${tier} Site Package` } }, quantity: 1 }];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    success_url: `${env.appUrl}/dashboard?success=1&siteId=${siteId}`,
    cancel_url: `${env.appUrl}/dashboard?canceled=1`,
    metadata: { userId, siteId, tier, type: "site_tier" },
  });

  return { url: session.url };
}

export async function createAiSubscriptionCheckout(
  plan: "BYOK" | "MANAGED",
  userId: string,
  email: string
) {
  const stripe = getStripe();
  if (!stripe) {
    return { url: `${env.appUrl}/dashboard/ai-changer?checkout=mock&plan=${plan}` };
  }

  const priceId = plan === "BYOK" ? env.stripePrices.aiByok : env.stripePrices.aiManaged;
  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [{
        price_data: {
          currency: "gbp",
          unit_amount: plan === "BYOK" ? 1000 : 1800,
          recurring: { interval: "month" as const },
          product_data: { name: `AI Changer ${plan}` },
        },
        quantity: 1,
      }];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: lineItems,
    success_url: `${env.appUrl}/dashboard/ai-changer?success=1`,
    cancel_url: `${env.appUrl}/dashboard/ai-changer?canceled=1`,
    metadata: { userId, plan, type: "ai_subscription" },
  });

  return { url: session.url };
}

export async function createAiTopupCheckout(userId: string, email: string) {
  const stripe = getStripe();
  if (!stripe) {
    return { url: `${env.appUrl}/dashboard/ai-changer?topup=mock` };
  }

  const priceId = env.stripePrices.aiTopup;
  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [{ price_data: { currency: "gbp", unit_amount: 500, product_data: { name: "10 AI Edit Credits" } }, quantity: 1 }];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    success_url: `${env.appUrl}/dashboard/ai-changer?topup=success`,
    cancel_url: `${env.appUrl}/dashboard/ai-changer?topup=canceled`,
    metadata: { userId, type: "ai_topup" },
  });

  return { url: session.url };
}
