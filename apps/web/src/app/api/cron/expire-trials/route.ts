import { NextResponse } from "next/server";
import { expireTrials } from "@/lib/trial";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET || "dev-cron"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await expireTrials();
  return NextResponse.json({ ok: true });
}
