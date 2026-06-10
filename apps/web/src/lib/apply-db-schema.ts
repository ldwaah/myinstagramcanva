import { prisma } from "@mic/db";

function isPostgresUrl(url: string): boolean {
  return (
    url.startsWith("postgres://") ||
    url.startsWith("postgresql://") ||
    url.startsWith("prisma+postgres://")
  );
}

const WEBSITE_REQUEST_STATEMENTS = [
  `DO $$ BEGIN
    CREATE TYPE "ServicePlan" AS ENUM ('LAUNCH', 'CREATOR', 'BESPOKE');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$`,
  `CREATE TABLE IF NOT EXISTS "WebsiteRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instagramHandle" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "preferredSubdomain" TEXT NOT NULL,
    "plan" "ServicePlan" NOT NULL,
    "mainGoal" TEXT NOT NULL,
    "contactPreference" TEXT NOT NULL,
    "notes" TEXT,
    "contentPermission" BOOLEAN NOT NULL,
    "trialTermsAccepted" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebsiteRequest_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "WebsiteRequest_email_idx" ON "WebsiteRequest"("email")`,
  `CREATE INDEX IF NOT EXISTS "WebsiteRequest_status_idx" ON "WebsiteRequest"("status")`,
] as const;

export type ApplyDbSchemaResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  statementsRun?: number;
};

/**
 * Idempotently ensure WebsiteRequest + ServicePlan exist on PostgreSQL (Neon).
 * Skips SQLite — local dev should use prisma db push / migrate.
 */
export async function applyDbSchema(): Promise<ApplyDbSchemaResult> {
  const url = process.env.DATABASE_URL || "";
  if (!url) {
    return { ok: false, reason: "DATABASE_URL not set" };
  }
  if (!isPostgresUrl(url)) {
    return { ok: true, skipped: true, reason: "not-postgres" };
  }

  for (const sql of WEBSITE_REQUEST_STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }

  return { ok: true, statementsRun: WEBSITE_REQUEST_STATEMENTS.length };
}
