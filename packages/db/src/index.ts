import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  console.error(
    "[@mic/db] DATABASE_URL is not set. Auth and data APIs will fail on Vercel until you add a PostgreSQL connection string."
  );
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma;

export * from "@prisma/client";
