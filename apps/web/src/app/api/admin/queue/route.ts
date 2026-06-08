import { NextResponse } from "next/server";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sites = await prisma.site.findMany({
    where: { needsAdminTweak: true },
    include: { user: { select: { email: true, name: true } }, siteContent: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ sites });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { siteId, done } = await req.json();
  await prisma.site.update({
    where: { id: siteId },
    data: { needsAdminTweak: !done },
  });

  return NextResponse.json({ ok: true });
}
