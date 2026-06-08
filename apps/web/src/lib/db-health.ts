import { prisma } from "@mic/db";
import { sanitizeDbError } from "@/lib/db-errors";

function isServerlessRuntime() {
  return (
    process.env.NODE_ENV === "production" &&
    (Boolean(process.env.NETLIFY) || Boolean(process.env.VERCEL))
  );
}

export async function assertDatabaseReady(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim() || "";
  if (!url || url.startsWith("file:")) {
    const hint = isServerlessRuntime()
      ? "Set a PostgreSQL DATABASE_URL in Netlify environment variables (Neon, Supabase, or Netlify Database)."
      : "Set DATABASE_URL to a PostgreSQL connection string for production.";
    throw new Error(`Server database is not configured. ${hint}`);
  }
  await prisma.$queryRaw`SELECT 1`;
}

export function formatDbError(err: unknown, fallback: string): string {
  return sanitizeDbError(err, fallback);
}
