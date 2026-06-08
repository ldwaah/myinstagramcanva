import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser, createSession } from "@/lib/auth";

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 401 }
    );
  }
}
