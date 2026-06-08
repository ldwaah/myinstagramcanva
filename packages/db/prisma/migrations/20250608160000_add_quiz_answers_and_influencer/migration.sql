-- AlterTable: add quizAnswers to Site
ALTER TABLE "Site" ADD COLUMN "quizAnswers" TEXT;

-- Redefine Niche enum to include INFLUENCER (SQLite: recreate enum via column)
-- Prisma SQLite stores enums as TEXT; new value INFLUENCER is valid without migration constraint.
