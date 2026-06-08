import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { applyAiEdit } from "@/lib/ai-changer";

const schema = z.object({
  siteId: z.string(),
  prompt: z.string().min(3).max(2000),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const result = await applyAiEdit(session.id, body.siteId, body.prompt);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI edit failed" },
      { status: 400 }
    );
  }
}
