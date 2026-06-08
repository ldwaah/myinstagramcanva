import { prisma } from "@mic/db";
import { sanitizeDbError } from "@/lib/db-errors";

export async function assertDatabaseReady(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Server database is not configured. Set DATABASE_URL in Netlify environment variables."
    );
  }
  await prisma.$queryRaw`SELECT 1`;
}

export function formatDbError(err: unknown, fallback: string): string {
  return sanitizeDbError(err, fallback);
}
