import { downloadUrl } from "./storage";

export const BUNDLE_B64_PREFIX = "__MIC_B64__:";

export function isBundleBinary(value: string): boolean {
  return value.startsWith(BUNDLE_B64_PREFIX);
}

export function decodeBundleBinary(value: string): { buffer: Buffer; contentType: string } {
  const payload = value.slice(BUNDLE_B64_PREFIX.length);
  const sep = payload.indexOf("|");
  if (sep === -1) {
    return { contentType: "application/octet-stream", buffer: Buffer.from(payload, "base64") };
  }
  const contentType = payload.slice(0, sep);
  const base64 = payload.slice(sep + 1);
  return {
    contentType: contentType || "application/octet-stream",
    buffer: Buffer.from(base64, "base64"),
  };
}

export async function bundleRemoteAsset(
  url: string | undefined,
  relPath: string,
  contentType: string
): Promise<{ relPath: string; bundleValue: string; publicUrl: string } | null> {
  if (!url || !url.startsWith("http")) return null;

  try {
    const buf = await downloadUrl(url);
    const bundleValue = `${BUNDLE_B64_PREFIX}${contentType}|${buf.toString("base64")}`;
    return { relPath, bundleValue, publicUrl: relPath };
  } catch {
    return null;
  }
}
