import { NextResponse } from "next/server";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ loggedIn: false });
  }

  const siteCount = await prisma.site.count({ where: { userId: session.id } });

  return NextResponse.json({
    loggedIn: true,
    hasSites: siteCount > 0,
    email: session.email,
  });
}
