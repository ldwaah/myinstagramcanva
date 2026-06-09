-- Rename legacy Tailored tier to Creator across all tables
UPDATE "Site" SET "tier" = 'CREATOR' WHERE "tier" = 'TAILORED';
UPDATE "Order" SET "tier" = 'CREATOR' WHERE "tier" = 'TAILORED';
UPDATE "Referral" SET "tier" = 'CREATOR' WHERE "tier" = 'TAILORED';
