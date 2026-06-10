import { NextRequest, NextResponse } from "next/server";
import { prisma, ServicePlan } from "@mic/db";
import { z } from "zod";
import { getPricingTierById, isPricingTierId } from "@/lib/pricing";
import { createTrialCheckout } from "@/lib/stripe";

const bodySchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(320),
  instagramHandle: z.string().min(1).max(100),
  brandName: z.string().min(1).max(200),
  preferredSubdomain: z.string().min(1).max(63),
  plan: z.string(),
  mainGoal: z.string().min(1).max(500),
  contactPreference: z.string().min(1).max(50),
  notes: z.string().max(2000).optional(),
  contentPermission: z.literal(true),
  trialTermsAccepted: z.literal(true),
});

function planToServicePlan(plan: string): ServicePlan {
  if (!isPricingTierId(plan)) throw new Error("Invalid plan");
  const tier = getPricingTierById(plan);
  return tier.tier as ServicePlan;
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check all required fields and try again." },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (!isPricingTierId(data.plan)) {
      return NextResponse.json({ error: "Please select a valid plan." }, { status: 400 });
    }

    const plan = planToServicePlan(data.plan);
    const pricingTier = getPricingTierById(data.plan);

    const request = await prisma.websiteRequest.create({
      data: {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        instagramHandle: data.instagramHandle.trim().replace(/^@/, ""),
        brandName: data.brandName.trim(),
        preferredSubdomain: data.preferredSubdomain.trim().toLowerCase(),
        plan,
        mainGoal: data.mainGoal.trim(),
        contactPreference: data.contactPreference,
        notes: data.notes?.trim() || null,
        contentPermission: data.contentPermission,
        trialTermsAccepted: data.trialTermsAccepted,
      },
    });

    const { url } = await createTrialCheckout(pricingTier.tier, data.email, request.id);

    return NextResponse.json({ ok: true, requestId: request.id, checkoutUrl: url });
  } catch (err) {
    console.error("[request-website]", err);
    return NextResponse.json(
      { error: "Unable to save your request. Please try again." },
      { status: 500 },
    );
  }
}
