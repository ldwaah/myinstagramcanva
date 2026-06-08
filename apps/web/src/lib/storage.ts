import fs from "fs/promises";
import path from "path";
import { env } from "./env";

const LOCAL_SITES_ROOT = path.join(process.cwd(), "../../sites-data");

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType = "application/octet-stream"
): Promise<string> {
  if (env.r2.accessKeyId && env.r2.accountId) {
    return uploadToR2(key, buffer, contentType);
  }
  return uploadLocal(key, buffer);
}

async function uploadLocal(key: string, buffer: Buffer): Promise<string> {
  const filePath = path.join(LOCAL_SITES_ROOT, key);
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, buffer);
  return `/sites-media/${key}`;
}

async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const endpoint = `https://${env.r2.accountId}.r2.cloudflarestorage.com`;
  const url = `${endpoint}/${env.r2.bucket}/${key}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      Authorization: `AWS4-HMAC-SHA256 Credential=${env.r2.accessKeyId}`,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    return uploadLocal(key, buffer);
  }

  return env.r2.publicUrl ? `${env.r2.publicUrl}/${key}` : `/sites-media/${key}`;
}

export async function downloadUrl(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: "https://www.instagram.com/",
    },
  });
  if (!res.ok) throw new Error(`Failed to download ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function publishSiteBundle(
  username: string,
  files: Record<string, string | Buffer>
): Promise<string> {
  const baseKey = `sites/${username}`;
  const urls: Record<string, string> = {};

  for (const [relPath, content] of Object.entries(files)) {
    const key = `${baseKey}/${relPath}`;
    const buffer = typeof content === "string" ? Buffer.from(content, "utf8") : content;
    const contentType = relPath.endsWith(".html")
      ? "text/html"
      : relPath.endsWith(".css")
        ? "text/css"
        : relPath.endsWith(".js")
          ? "application/javascript"
          : relPath.endsWith(".json")
            ? "application/json"
            : "application/octet-stream";
    urls[relPath] = await uploadBuffer(key, buffer, contentType);
  }

  const localDir = path.join(LOCAL_SITES_ROOT, "sites", username);
  await ensureDir(localDir);
  for (const [relPath, content] of Object.entries(files)) {
    const filePath = path.join(localDir, relPath);
    await ensureDir(path.dirname(filePath));
    if (typeof content === "string") {
      await fs.writeFile(filePath, content, "utf8");
    } else {
      await fs.writeFile(filePath, content);
    }
  }

  return localDir;
}

export function getLocalSitePath(username: string) {
  return path.join(LOCAL_SITES_ROOT, "sites", username);
}

export async function readLocalSiteFile(username: string, filePath: string) {
  const full = path.join(getLocalSitePath(username), filePath);
  return fs.readFile(full, "utf8");
}
