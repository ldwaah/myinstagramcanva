/**
 * Regenerate a site bundle locally or against production DB.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/regenerate-site.mjs official4dads khiagovisuals
 *   OPENAI_API_KEY=... (optional, for structured copy)
 */
import { prisma } from "../packages/db/src/index.ts";
import { runSiteGeneration } from "../apps/web/src/lib/generation.ts";

const usernames = process.argv.slice(2);
if (!usernames.length) {
  console.error("Usage: npx tsx scripts/regenerate-site.mjs <username> [username2...]");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

for (const raw of usernames) {
  const username = raw.replace(/^@/, "").trim().toLowerCase();
  const site = await prisma.site.findUnique({
    where: { username },
    select: { id: true, userId: true, username: true },
  });
  if (!site) {
    console.error(`Site not found: @${username}`);
    continue;
  }
  console.log(`Regenerating @${username}...`);
  try {
    const result = await runSiteGeneration(site.id, site.userId, { sync: true });
    console.log("OK", result);
  } catch (err) {
    console.error("FAILED", username, err);
    process.exitCode = 1;
  }
}

await prisma.$disconnect();
