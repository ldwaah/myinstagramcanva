import Stripe from "stripe";
import { SiteTier } from "@mic/db";
import { env, TIER_PRICES } from "./env";
import { TRIAL_DAYS } from "./trial-constants";

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
    LAUNCH: env.stripePrices.launch,
    CREATOR: env.stripePrices.creator,
    BESPOKE: env.stripePrices.bespoke,
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
    : [{
        price_data: {
          currency: "gbp",
          unit_amount: TIER_PRICES[tier],
          product_data: { name: `${tier} Website Package` },
        },
        quantity: 1,
      }];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    payment_method_collection: "always",
    success_url: `${env.appUrl}/dashboard?success=1&siteId=${siteId}`,
    cancel_url: `${env.appUrl}/dashboard?canceled=1`,
    metadata: { userId, siteId, tier, type: "site_tier" },
  });

  return { url: session.url };
}

export async function createTrialCheckout(
  tier: SiteTier,
  email: string,
  requestId: string
) {
  const stripe = getStripe();
  if (!stripe) {
    return { url: `${env.appUrl}/?request=submitted&plan=${tier.toLowerCase()}` };
  }

  const priceId = tierToPriceId(tier);
  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [{
        price_data: {
          currency: "gbp",
          unit_amount: TIER_PRICES[tier],
          product_data: { name: `${tier} Website (one-off after trial)` },
        },
        quantity: 1,
      }];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    payment_intent_data: {
      setup_future_usage: "off_session",
    },
    payment_method_collection: "always",
    success_url: `${env.appUrl}/?request=success&plan=${tier.toLowerCase()}`,
    cancel_url: `${env.appUrl}/#request`,
    metadata: { requestId, tier, type: "website_trial" },
    custom_text: {
      submit: {
        message: `You will not be charged today. Your card secures your ${TRIAL_DAYS}-day trial. The one-off fee is charged only if you keep the site after the trial.`,
      },
    },
  });

  return { url: session.url };
}

export async function createHostingSubscriptionCheckout(
  userId: string,
  email: string,
  siteId: string
) {
  const stripe = getStripe();
  if (!stripe) {
    return { url: `${env.appUrl}/dashboard?goLive=success&siteId=${siteId}` };
  }

  return { url: `${env.appUrl}/dashboard?goLive=success&siteId=${siteId}` };
}

export async function createAiSubscriptionCheckout(
  plan: "BYOK" | "MANAGED",
  userId: string,
  email: string
) {
  const stripe = getStripe();
  if (!stripe) {
    return { url: `${env.appUrl}/dashboard?collaborator=success&checkout=mock&plan=${plan}` };
  }

  const priceId = plan === "BYOK" ? env.stripePrices.aiByok : env.stripePrices.aiManaged;
  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [{
        price_data: {
          currency: "gbp",
          unit_amount: plan === "BYOK" ? 1000 : 1800,
          recurring: { interval: "month" as const },
          product_data: { name: `AI Collaborator ${plan}` },
        },
        quantity: 1,
      }];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: lineItems,
    success_url: `${env.appUrl}/dashboard?collaborator=success&plan=${plan}`,
    cancel_url: `${env.appUrl}/dashboard?collaborator=canceled`,
    metadata: { userId, plan, type: "ai_subscription" },
  });

  return { url: session.url };
}

export async function createAiTopupCheckout(userId: string, email: string) {
  const stripe = getStripe();
  if (!stripe) {
    return { url: `${env.appUrl}/dashboard/collaborator?topup=mock` };
  }

  const priceId = env.stripePrices.aiTopup;
  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [{ price_data: { currency: "gbp", unit_amount: 500, product_data: { name: "10 AI Edit Credits" } }, quantity: 1 }];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    success_url: `${env.appUrl}/dashboard/collaborator?topup=success`,
    cancel_url: `${env.appUrl}/dashboard/collaborator?topup=canceled`,
    metadata: { userId, type: "ai_topup" },
  });

  return { url: session.url };
}
