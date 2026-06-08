/**
 * Selects Prisma datasource provider from DATABASE_URL before generate/push.
 * - file:... → sqlite (local dev)
 * - postgres/postgresql/libsql → postgresql (Neon, Vercel Postgres, etc.)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "../prisma/schema.prisma");

const url = process.env.DATABASE_URL || "";
const isSqliteUrl = url.startsWith("file:");
const isPostgresUrl =
  url.startsWith("postgres://") ||
  url.startsWith("postgresql://") ||
  url.startsWith("prisma+postgres://");
const isDeployBuild =
  Boolean(process.env.NETLIFY) ||
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.CI) ||
  process.env.NODE_ENV === "production";

// Netlify/Vercel builds often lack DATABASE_URL at build time; still generate a Postgres client.
const usePostgres = isPostgresUrl || (isDeployBuild && !isSqliteUrl);

const provider = usePostgres ? "postgresql" : "sqlite";

let schema = readFileSync(schemaPath, "utf8");
const next = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${provider}"`
);

if (next === schema && !schema.includes(`provider = "${provider}"`)) {
  console.warn("[prepare-schema] Could not update datasource provider in schema.prisma");
} else {
  writeFileSync(schemaPath, next);
}

console.log(`[prepare-schema] DATABASE_URL → provider "${provider}"`);
