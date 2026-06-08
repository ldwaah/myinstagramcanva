import { prisma } from "@mic/db";
import { hashPassword } from "./auth";

const PREVIEW_EMAIL = "preview@myinstagramcanva.internal";

export async function getOrCreatePreviewUser() {
  const existing = await prisma.user.findUnique({ where: { email: PREVIEW_EMAIL } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: PREVIEW_EMAIL,
      name: "Preview",
      passwordHash: await hashPassword(crypto.randomUUID()),
    },
  });
}
