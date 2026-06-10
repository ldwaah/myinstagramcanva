-- Migrate SiteTier to Launch / Creator / Bespoke
CREATE TYPE "SiteTier_new" AS ENUM ('LAUNCH', 'CREATOR', 'BESPOKE');

ALTER TABLE "Site" ALTER COLUMN "tier" TYPE "SiteTier_new" USING (
  CASE "tier"::text
    WHEN 'STARTER' THEN 'LAUNCH'::"SiteTier_new"
    WHEN 'CREATOR' THEN 'CREATOR'::"SiteTier_new"
    WHEN 'PRO' THEN 'BESPOKE'::"SiteTier_new"
    WHEN 'STUDIO' THEN 'BESPOKE'::"SiteTier_new"
    ELSE NULL
  END
);

ALTER TABLE "Order" ALTER COLUMN "tier" TYPE "SiteTier_new" USING (
  CASE "tier"::text
    WHEN 'STARTER' THEN 'LAUNCH'::"SiteTier_new"
    WHEN 'CREATOR' THEN 'CREATOR'::"SiteTier_new"
    WHEN 'PRO' THEN 'BESPOKE'::"SiteTier_new"
    WHEN 'STUDIO' THEN 'BESPOKE'::"SiteTier_new"
    ELSE 'LAUNCH'::"SiteTier_new"
  END
);

ALTER TABLE "Referral" ALTER COLUMN "tier" TYPE "SiteTier_new" USING (
  CASE "tier"::text
    WHEN 'STARTER' THEN 'LAUNCH'::"SiteTier_new"
    WHEN 'CREATOR' THEN 'CREATOR'::"SiteTier_new"
    WHEN 'PRO' THEN 'BESPOKE'::"SiteTier_new"
    WHEN 'STUDIO' THEN 'BESPOKE'::"SiteTier_new"
    ELSE NULL
  END
);

DROP TYPE "SiteTier";
ALTER TYPE "SiteTier_new" RENAME TO "SiteTier";

-- Website request form submissions
CREATE TYPE "ServicePlan" AS ENUM ('LAUNCH', 'CREATOR', 'BESPOKE');

CREATE TABLE "WebsiteRequest" (
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
);

CREATE INDEX "WebsiteRequest_email_idx" ON "WebsiteRequest"("email");
CREATE INDEX "WebsiteRequest_status_idx" ON "WebsiteRequest"("status");
