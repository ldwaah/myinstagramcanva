import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";
import { encrypt, maskKey } from "@/lib/encryption";
import { validateOpenAiKey } from "@/lib/ai-changer";

const schema = z.object({
  apiKey: z.string().min(20),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const valid = await validateOpenAiKey(body.apiKey);
    if (!valid) {
      return NextResponse.json({ error: "Invalid OpenAI API key" }, { status: 400 });
    }

    await prisma.aiApiKey.upsert({
      where: { userId: session.id },
      create: {
        userId: session.id,
        encryptedKey: encrypt(body.apiKey),
        keyLastFour: body.apiKey.slice(-4),
        isValid: true,
      },
      update: {
        encryptedKey: encrypt(body.apiKey),
        keyLastFour: body.apiKey.slice(-4),
        isValid: true,
      },
    });

    return NextResponse.json({ ok: true, masked: maskKey(body.apiKey) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = await prisma.aiApiKey.findUnique({ where: { userId: session.id } });
  const sub = await prisma.aiSubscription.findUnique({ where: { userId: session.id } });
  const credits = await prisma.aiCredits.findUnique({ where: { userId: session.id } });

  return NextResponse.json({
    hasKey: Boolean(key?.isValid),
    maskedKey: key?.keyLastFour ? `sk-...${key.keyLastFour}` : null,
    subscription: sub,
    credits,
  });
}
