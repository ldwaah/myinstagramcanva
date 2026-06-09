-- Rename legacy Tailored tier to Creator (no-op if TAILORED was never in the enum)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    INNER JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'SiteTier' AND e.enumlabel = 'TAILORED'
  ) THEN
    UPDATE "Site" SET "tier" = 'CREATOR' WHERE "tier"::text = 'TAILORED';
    UPDATE "Order" SET "tier" = 'CREATOR' WHERE "tier"::text = 'TAILORED';
    UPDATE "Referral" SET "tier" = 'CREATOR' WHERE "tier"::text = 'TAILORED';
  END IF;
END $$;
