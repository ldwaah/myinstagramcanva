/**
 * @deprecated Use `npx tsx scripts/seed-example-sites.ts` (direct DB persist).
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tsScript = path.join(root, "scripts/seed-example-sites.ts");

const result = spawnSync("npx", ["tsx", tsScript, ...process.argv.slice(2)], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, TSX_TSCONFIG_PATH: "apps/web/tsconfig.json" },
});

process.exit(result.status ?? 1);
