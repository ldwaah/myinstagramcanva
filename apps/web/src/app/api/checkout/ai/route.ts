import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createAiSubscriptionCheckout, createAiTopupCheckout } from "@/lib/stripe";

const schema = z.object({
  plan: z.enum(["BYOK", "MANAGED"]).optional(),
  topup: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());

    if (body.topup) {
      const checkout = await createAiTopupCheckout(session.id, session.email);
      return NextResponse.json(checkout);
    }

    if (!body.plan) {
      return NextResponse.json({ error: "Plan required" }, { status: 400 });
    }

    const checkout = await createAiSubscriptionCheckout(body.plan, session.id, session.email);
    return NextResponse.json(checkout);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 400 }
    );
  }
}
