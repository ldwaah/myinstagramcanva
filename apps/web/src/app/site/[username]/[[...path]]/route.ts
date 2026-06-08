import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma, SiteStatus } from "@mic/db";
import { isSiteAccessible } from "@/lib/trial";
import { getLocalSitePath } from "@/lib/storage";
import { env } from "@/lib/env";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string; path?: string[] }> }
) {
  const { username, path: pathSegments } = await params;
  const relPath = pathSegments?.length ? pathSegments.join("/") : "index.html";
  const filePath = relPath.endsWith("/") ? `${relPath}index.html` : relPath;
  const normalized = filePath === "" ? "index.html" : filePath;

  const site = await prisma.site.findUnique({
    where: { username },
    include: { siteContent: true },
  });
  if (!site) {
    return new NextResponse("Site not found", { status: 404 });
  }

  if (!isSiteAccessible(site.status, site.tier)) {
    return new NextResponse(expiredHtml(username), {
      status: 402,
      headers: { "Content-Type": "text/html" },
    });
  }

  const contentType = mimeFor(normalized);
  const bundle = parseBundle(site.siteContent?.bundle);

  if (bundle?.[normalized]) {
    return new NextResponse(bundle[normalized], { headers: { "Content-Type": contentType } });
  }

  const localPath = path.join(getLocalSitePath(username), normalized);
  try {
    const content = await fs.readFile(localPath);
    return new NextResponse(content, { headers: { "Content-Type": contentType } });
  } catch {
    if (normalized !== "index.html") {
      return new NextResponse("Not found", { status: 404 });
    }
    return new NextResponse(pendingHtml(site.status), {
      status: 202,
      headers: { "Content-Type": "text/html" },
    });
  }
}

function parseBundle(raw: string | null | undefined): Record<string, string> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

function mimeFor(file: string) {
  if (file.endsWith(".css")) return "text/css";
  if (file.endsWith(".js")) return "application/javascript";
  if (file.endsWith(".json")) return "application/json";
  return "text/html";
}

function expiredHtml(username: string) {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#fafafa;color:#262626;display:grid;place-items:center;min-height:100vh;text-align:center;padding:2rem">
  <div><h1 style="background:linear-gradient(45deg,#f09433,#dc2743,#bc1888);-webkit-background-clip:text;-webkit-text-fill-color:transparent">@${username}</h1><p>Trial ended. Purchase a package to keep this site live.</p>
  <a href="${env.appUrl}/dashboard" style="color:#e1306c;font-weight:600">Go to dashboard</a></div></body></html>`;
}

function pendingHtml(status: SiteStatus) {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#fafafa;color:#262626;display:grid;place-items:center;min-height:100vh;text-align:center">
  <div><h1>Site ${status === SiteStatus.GENERATING ? "generating" : "pending"}</h1><p>Check back in a minute.</p></div></body></html>`;
}
