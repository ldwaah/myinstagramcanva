import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { claimPreviewSite } from "@/lib/go-live";

const schema = z.object({
  siteId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    if (body.siteId) {
      const { prisma } = await import("@mic/db");
      const site = await prisma.site.findUnique({ where: { id: body.siteId } });
      if (site?.isPreview) {
        await prisma.site.update({
          where: { id: body.siteId },
          data: { userId: session.id, isPreview: false, previewToken: null },
        });
        return NextResponse.json({ ok: true, siteId: body.siteId });
      }
    }

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("mic_preview_token")?.value;
    if (token) {
      const claimed = await claimPreviewSite(token, session.id);
      if (claimed) {
        return NextResponse.json({ ok: true, siteId: claimed.id });
      }
    }

    return NextResponse.json({ ok: false });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 }
    );
  }
}
