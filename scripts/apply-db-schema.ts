/**
 * Apply idempotent PostgreSQL schema patches (WebsiteRequest + ServicePlan).
 * Used from Netlify CI when RUN_APPLY_SCHEMA=true.
 *
 *   TSX_TSCONFIG_PATH=apps/web/tsconfig.json npx tsx scripts/apply-db-schema.ts
 */
import { applyDbSchema } from "../apps/web/src/lib/apply-db-schema";

async function main() {
  const result = await applyDbSchema();
  console.log("[apply-db-schema]", JSON.stringify(result));
  if (!result.ok) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[apply-db-schema] failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
