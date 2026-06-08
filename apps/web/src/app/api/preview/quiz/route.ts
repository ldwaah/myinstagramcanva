import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma, Niche } from "@mic/db";
import { nicheFromQuizAnswers, layoutHintFromQuiz } from "@mic/generator";
import { getSession } from "@/lib/auth";

const PREVIEW_COOKIE = "mic_preview_token";

const schema = z.object({
  siteId: z.string().min(1),
  answers: z.record(z.string()).default({}),
});

export async function POST(req: Request) {
  try {
    const { siteId, answers } = schema.parse(await req.json());
    const session = await getSession();
    const cookieStore = await cookies();
    const previewToken = cookieStore.get(PREVIEW_COOKIE)?.value;

    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const allowed =
      (session && site.userId === session.id) ||
      (site.isPreview && previewToken && site.previewToken === previewToken);

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const niche = nicheFromQuizAnswers(answers) as Niche;
    const layoutHint = layoutHintFromQuiz(answers);

    await prisma.site.update({
      where: { id: siteId },
      data: {
        niche,
        quizAnswers: JSON.stringify({ ...answers, layoutHint }),
      },
    });

    return NextResponse.json({ ok: true, niche, layoutHint });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 }
    );
  }
}
