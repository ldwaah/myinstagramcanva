import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser, createSession } from "@/lib/auth";
import { sanitizeAuthError } from "@/lib/db-errors";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await loginUser(body.email, body.password);
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = sanitizeAuthError(err, "Invalid email or password");
    const status = err instanceof z.ZodError ? 400 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
