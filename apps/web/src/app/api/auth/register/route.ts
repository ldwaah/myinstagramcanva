import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser, createSession } from "@/lib/auth";
import { sanitizeAuthError } from "@/lib/db-errors";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await registerUser(body.email, body.password, body.name);
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    });
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    const message = sanitizeAuthError(err, "Could not create account");
    const status = err instanceof z.ZodError ? 400 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
