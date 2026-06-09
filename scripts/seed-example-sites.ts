/**
 * Generate showcase example sites, seed the DB, and persist bundles.
 *
 * Usage:
 *   TSX_TSCONFIG_PATH=apps/web/tsconfig.json npx tsx scripts/seed-example-sites.ts
 *   RUN_SEED_EXAMPLE_SITES=true on Netlify build (see scripts/netlify-ci-build.sh)
 */
import path from "path";
import { fileURLToPath } from "url";
import { seedExampleSites } from "../apps/web/src/lib/seed-example-sites";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const result = await seedExampleSites({
    root,
    force: process.argv.includes("--force"),
  });

  console.log("Seeded:", result.seeded.join(", ") || "(none)");
  console.log("Skipped:", result.skipped.join(", ") || "(none)");
  if (result.errors.length) {
    for (const e of result.errors) {
      console.error(`  ${e.username}: ${e.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
