import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  siteId: z.string(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  startTime: z.string(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    let data;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = schema.parse(await req.json());
    } else {
      const form = await req.formData();
      data = schema.parse({
        siteId: form.get("siteId"),
        guestName: form.get("guestName"),
        guestEmail: form.get("guestEmail"),
        guestPhone: form.get("guestPhone") || undefined,
        startTime: form.get("startTime"),
        notes: form.get("notes") || undefined,
      });
    }

    const site = await prisma.site.findUnique({ where: { id: data.siteId } });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const start = new Date(data.startTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        siteId: data.siteId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        startTime: start,
        endTime: end,
        notes: data.notes,
      },
    });

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const siteId = new URL(req.url).searchParams.get("siteId");
  const sites = await prisma.site.findMany({ where: { userId: session.id }, select: { id: true } });
  const siteIds = siteId ? [siteId] : sites.map((s) => s.id);

  const bookings = await prisma.booking.findMany({
    where: { siteId: { in: siteIds } },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({ bookings });
}
