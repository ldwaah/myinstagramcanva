import { NextResponse } from "next/server";
import { z } from "zod";
import { recordReferralClick } from "@/lib/affiliate";

const schema = z.object({
  code: z.string().min(2).max(30),
});

export async function POST(req: Request) {
  try {
    const { code } = schema.parse(await req.json());
    const affiliate = await recordReferralClick(code);
    if (!affiliate) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
