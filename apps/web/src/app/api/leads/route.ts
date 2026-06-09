import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@mic/db";
import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";

const emptyToUndefined = (v: unknown) => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
};

const schema = z.object({
  siteId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  message: z.preprocess(emptyToUndefined, z.string().optional()),
  source: z.preprocess((v) => (v ? String(v) : "contact_form"), z.string()),
  smsOptIn: z.boolean().optional(),
  emailOptIn: z.boolean().optional(),
});

function thankYouHtml(brandName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Message sent</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #fafafa; color: #262626; text-align: center; padding: 2rem; }
    h1 { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    a { color: #e1306c; font-weight: 600; }
  </style>
</head>
<body>
  <div>
    <h1>Thanks!</h1>
    <p>Your message to ${brandName} was sent successfully.</p>
    <p><a href="javascript:history.back()">← Go back</a></p>
  </div>
</body>
</html>`;
}

async function notifyOwner(siteId: string, siteUsername: string, data: z.infer<typeof schema>) {
  if (!env.resendKey) return;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!site?.user.email) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.resendFrom,
      to: site.user.email,
      subject: `New lead on @${siteUsername}`,
      text: `New ${data.source} submission:\n\nName: ${data.name}\nEmail: ${data.email}${data.phone ? `\nPhone: ${data.phone}` : ""}${data.message ? `\n\n${data.message}` : ""}\n\nView all leads in your My Instagram Canva dashboard.`,
    }),
  }).catch(() => null);
}

export async function POST(req: Request) {
  const accept = req.headers.get("accept") || "";
  const wantsJson = accept.includes("application/json");

  try {
    let raw: Record<string, unknown>;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      raw = (await req.json()) as Record<string, unknown>;
    } else {
      const form = await req.formData();
      raw = {
        siteId: form.get("siteId"),
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
        source: form.get("source") || "contact_form",
        smsOptIn: form.get("smsOptIn") === "true",
        emailOptIn: form.get("emailOptIn") !== "false",
      };
    }

    const data = schema.parse(raw);

    const site = await prisma.site.findUnique({
      where: { id: data.siteId },
      include: { user: true },
    });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const tier = site.tier;
    if (!tier || tier === "STARTER") {
      return NextResponse.json(
        { error: "Lead capture requires Creator plan or higher" },
        { status: 403 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        siteId: data.siteId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source,
        smsOptIn: data.smsOptIn ?? false,
        emailOptIn: data.emailOptIn ?? true,
      },
    });

    await notifyOwner(data.siteId, site.username, data);

    if (wantsJson || contentType.includes("application/json")) {
      return NextResponse.json({ ok: true, leadId: lead.id });
    }

    return new NextResponse(thankYouHtml(site.username), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    if (wantsJson) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return new NextResponse(`<html><body><p>Error: ${message}</p></body></html>`, {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const siteId = new URL(req.url).searchParams.get("siteId");
  const sites = await prisma.site.findMany({ where: { userId: session.id }, select: { id: true } });
  const siteIds = siteId ? [siteId] : sites.map((s) => s.id);

  const leads = await prisma.lead.findMany({
    where: { siteId: { in: siteIds } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ leads });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const lead = await prisma.lead.findUnique({
    where: { id: body.id },
    include: { site: true },
  });
  if (!lead || lead.site.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.lead.update({
    where: { id: body.id },
    data: {
      status: body.status,
      tags: body.tags,
      notes: body.notes,
    },
  });

  return NextResponse.json({ lead: updated });
}
