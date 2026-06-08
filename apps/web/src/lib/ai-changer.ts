import { prisma } from "@mic/db";
import { decrypt } from "./encryption";
import { env } from "./env";
import { commitSiteFiles } from "./github";
import { publishSiteBundle } from "./storage";
import { renderSiteHtml, renderFunnelHtml, type SiteContentData } from "@mic/generator";
import fs from "fs/promises";
import path from "path";

export async function canUserEdit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  usePlatformKey?: boolean;
  apiKey?: string;
}> {
  const sub = await prisma.aiSubscription.findUnique({ where: { userId } });
  const credits = await prisma.aiCredits.findUnique({ where: { userId } });

  if (sub?.status === "active") {
    if (sub.plan === "BYOK") {
      const keyRecord = await prisma.aiApiKey.findUnique({ where: { userId } });
      if (!keyRecord?.isValid) {
        return { allowed: false, reason: "Add a valid OpenAI API key in AI Changer settings" };
      }
      return { allowed: true, usePlatformKey: false, apiKey: decrypt(keyRecord.encryptedKey) };
    }

    if (sub.plan === "MANAGED") {
      const remaining = (credits?.editsRemaining ?? 0) + (credits?.freeEditsRemaining ?? 0);
      if (remaining <= 0) {
        return { allowed: false, reason: "No edits remaining. Top up credits or wait for next billing period." };
      }
      return { allowed: true, usePlatformKey: true, apiKey: env.openaiKey };
    }
  }

  const free = credits?.freeEditsRemaining ?? 0;
  if (free > 0) {
    return { allowed: true, usePlatformKey: true, apiKey: env.openaiKey };
  }

  return { allowed: false, reason: "Subscribe to AI Changer or use your free edits during onboarding." };
}

export async function applyAiEdit(
  userId: string,
  siteId: string,
  prompt: string
): Promise<{ commitSha: string | null; content: SiteContentData }> {
  const access = await canUserEdit(userId);
  if (!access.allowed || !access.apiKey) {
    throw new Error(access.reason || "AI edits not allowed");
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId },
    include: { siteContent: true },
  });
  if (!site?.siteContent) throw new Error("Site not found");

  const current: SiteContentData = JSON.parse(site.siteContent.content);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You edit website content JSON. Apply the user's requested changes. Return the full updated SiteContentData JSON object with the same structure.",
        },
        {
          role: "user",
          content: JSON.stringify({ currentContent: current, userRequest: prompt }),
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error("AI request failed");
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
    usage?: { prompt_tokens: number; completion_tokens: number };
  };

  const updated = JSON.parse(data.choices[0].message.content) as SiteContentData;
  const siteJson = JSON.stringify(updated, null, 2);

  const templateRoot = path.join(process.cwd(), "../../templates/instagram-v1");
  const css = await fs.readFile(path.join(templateRoot, "css/style.css"), "utf8");
  const js = await fs.readFile(path.join(templateRoot, "js/main.js"), "utf8");

  const html = renderSiteHtml(updated, siteId, env.appUrl);
  const files: Record<string, string> = {
    "index.html": html,
    "site.json": siteJson,
    "css/style.css": css,
    "js/main.js": js,
  };
  if (updated.showFunnel) {
    files["offer/index.html"] = renderFunnelHtml(updated, siteId, env.appUrl);
  }

  await publishSiteBundle(site.username, files);
  const commitSha = await commitSiteFiles(
    site.username,
    Object.entries(files).map(([p, c]) => ({ path: p, content: c })),
    `AI edit: ${prompt.slice(0, 80)}`
  );

  await prisma.siteContent.update({
    where: { siteId },
    data: { content: siteJson, version: { increment: 1 }, commitSha: commitSha || undefined },
  });

  if (access.usePlatformKey) {
    const credits = await prisma.aiCredits.findUnique({ where: { userId } });
    if (credits?.freeEditsRemaining && credits.freeEditsRemaining > 0) {
      await prisma.aiCredits.update({
        where: { userId },
        data: { freeEditsRemaining: { decrement: 1 } },
      });
    } else {
      await prisma.aiCredits.update({
        where: { userId },
        data: {
          editsRemaining: { decrement: 1 },
          editsUsedThisPeriod: { increment: 1 },
        },
      });
    }
  }

  await prisma.aiEditLog.create({
    data: {
      userId,
      siteId,
      prompt,
      model: "gpt-4o-mini",
      tokensIn: data.usage?.prompt_tokens,
      tokensOut: data.usage?.completion_tokens,
      commitSha: commitSha || undefined,
    },
  });

  return { commitSha, content: updated };
}

export async function validateOpenAiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
