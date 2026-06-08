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

  const site = await prisma.site.findUnique({ where: { username } });
  if (!site) {
    return new NextResponse("Site not found", { status: 404 });
  }

  if (!isSiteAccessible(site.status, site.tier)) {
    return new NextResponse(expiredHtml(username), {
      status: 402,
      headers: { "Content-Type": "text/html" },
    });
  }

  const localPath = path.join(getLocalSitePath(username), normalized);
  try {
    const content = await fs.readFile(localPath);
    const type = normalized.endsWith(".css")
      ? "text/css"
      : normalized.endsWith(".js")
        ? "application/javascript"
        : normalized.endsWith(".json")
          ? "application/json"
          : "text/html";
    return new NextResponse(content, { headers: { "Content-Type": type } });
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

function expiredHtml(username: string) {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#fafafa;color:#262626;display:grid;place-items:center;min-height:100vh;text-align:center;padding:2rem">
  <div><h1 style="background:linear-gradient(45deg,#f09433,#dc2743,#bc1888);-webkit-background-clip:text;-webkit-text-fill-color:transparent">@${username}</h1><p>Trial ended — purchase a package to keep this site live.</p>
  <a href="${env.appUrl}/dashboard" style="color:#e1306c;font-weight:600">Go to dashboard</a></div></body></html>`;
}

function pendingHtml(status: SiteStatus) {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#fafafa;color:#262626;display:grid;place-items:center;min-height:100vh;text-align:center">
  <div><h1>Site ${status === SiteStatus.GENERATING ? "generating" : "pending"}</h1><p>Check back in a minute.</p></div></body></html>`;
}
