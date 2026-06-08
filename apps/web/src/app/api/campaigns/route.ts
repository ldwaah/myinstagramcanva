import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, CampaignType } from "@mic/db";
import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";

const schema = z.object({
  siteId: z.string(),
  name: z.string(),
  type: z.nativeEnum(CampaignType),
  subject: z.string().optional(),
  body: z.string(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const site = await prisma.site.findFirst({
      where: { id: body.siteId, userId: session.id },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
    if (site.tier !== "STUDIO") {
      return NextResponse.json({ error: "Studio tier required" }, { status: 403 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        siteId: body.siteId,
        name: body.name,
        type: body.type,
        subject: body.subject,
        body: body.body,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ campaign });
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
  const sites = await prisma.site.findMany({ where: { userId: session.id } });
  const siteIds = siteId ? [siteId] : sites.map((s) => s.id);

  const campaigns = await prisma.campaign.findMany({
    where: { siteId: { in: siteIds } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, action } = await req.json();
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { site: true },
  });
  if (!campaign || campaign.site.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "send") {
    const leads = await prisma.lead.findMany({
      where: {
        siteId: campaign.siteId,
        emailOptIn: campaign.type === "EMAIL" ? true : undefined,
        smsOptIn: campaign.type === "SMS" ? true : undefined,
      },
    });

    let sent = 0;
    for (const lead of leads) {
      if (campaign.type === "EMAIL" && env.resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: env.resendFrom,
            to: lead.email,
            subject: campaign.subject || campaign.name,
            text: campaign.body,
          }),
        }).catch(() => null);
        sent++;
      }

      if (campaign.type === "SMS" && env.twilio.accountSid && lead.phone) {
        const auth = Buffer.from(`${env.twilio.accountSid}:${env.twilio.authToken}`).toString("base64");
        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${env.twilio.accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: lead.phone,
              From: env.twilio.phone,
              Body: campaign.body,
            }),
          }
        ).catch(() => null);
        sent++;
      }
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: "SENT", sentCount: sent, sentAt: new Date() },
    });
    return NextResponse.json({ campaign: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
