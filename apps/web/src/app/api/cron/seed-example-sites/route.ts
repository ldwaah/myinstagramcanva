import { NextResponse } from "next/server";
import { seedExampleSites } from "@/lib/seed-example-sites";

export const maxDuration = 300;

/**
 * Seed showcase example sites (DB rows + bundled HTML).
 * POST /api/cron/seed-example-sites
 * Authorization: Bearer <CRON_SECRET>
 *
 * Idempotent — skips sites that already have a rich bundle unless ?force=true
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "true";

  try {
    const result = await seedExampleSites({ force, maxBundledImages: 12 });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "seed failed" },
      { status: 500 },
    );
  }
}
