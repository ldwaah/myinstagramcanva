import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser, createSession } from "@/lib/auth";
import { sanitizeAuthError } from "@/lib/db-errors";
import { attachReferralToUser, readReferralCodeFromCookie } from "@/lib/affiliate";
import { assertDatabaseReady } from "@/lib/db-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  acceptedTerms: z.boolean().refine((v) => v === true, "You must accept the Terms & Conditions"),
});

export async function POST(req: Request) {
  try {
    await assertDatabaseReady();
    const body = schema.parse(await req.json());
    const user = await registerUser(body.email, body.password, body.name);
    const refCode = await readReferralCodeFromCookie();
    await attachReferralToUser(user.id, refCode);
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    });
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    console.error("[auth/register]", err instanceof Error ? err.message : err);
    const message = sanitizeAuthError(err, "Could not create account");
    const status = err instanceof z.ZodError ? 400 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
