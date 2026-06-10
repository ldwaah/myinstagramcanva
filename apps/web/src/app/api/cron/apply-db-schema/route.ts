import { NextResponse } from "next/server";
import { applyDbSchema } from "@/lib/apply-db-schema";

export const maxDuration = 60;

/**
 * Idempotently apply missing PostgreSQL schema (WebsiteRequest + ServicePlan).
 * POST /api/cron/apply-db-schema
 * Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await applyDbSchema();
    if (!result.ok) {
      return NextResponse.json({ ok: false, ...result }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "schema apply failed" },
      { status: 500 },
    );
  }
}
