import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser, createSession } from "@/lib/auth";

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 400 }
    );
  }
}
