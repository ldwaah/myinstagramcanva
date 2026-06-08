import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const commissions = await prisma.commission.findMany({
    where: { status: "PENDING" },
    include: {
      affiliate: { include: { user: { select: { email: true, name: true } } } },
      order: { select: { tier: true, amount: true, userId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ commissions });
}

const patchSchema = z.object({
  commissionId: z.string(),
  paid: z.boolean(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { commissionId, paid } = patchSchema.parse(await req.json());

    const commission = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: paid ? "PAID" : "PENDING",
        paidAt: paid ? new Date() : null,
      },
    });

    return NextResponse.json({ commission });
  } catch {
    return NextResponse.json({ error: "Failed to update commission" }, { status: 400 });
  }
}
