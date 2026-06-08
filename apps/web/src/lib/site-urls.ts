import { env } from "./env";

const RESERVED = new Set(["www", "api", "admin", "dashboard", "app", "mail", "support"]);

/** Vercel *.vercel.app does not support nested tenant hosts like www.user.project.vercel.app */
export function isVercelAppHost(host: string): boolean {
  return host.toLowerCase().includes(".vercel.app");
}

/** Main app hosts use path-based preview (/site/{username}) until wildcard tenant DNS is live */
export function isMainAppHost(host: string): boolean {
  const normalized = host.split(":")[0]?.toLowerCase() ?? "";
  const root = env.rootDomain.split(":")[0]?.toLowerCase() ?? "";
  return (
    isVercelAppHost(normalized) ||
    normalized === root ||
    normalized === `www.${root}`
  );
}

/** Host label stored on Site.subdomain, e.g. www.khiagovisuals.myinstagramcanva.com */
export function buildTenantSubdomain(username: string): string {
  return `www.${username}.${env.rootDomain}`;
}

/** Public URL shown in UI: https://www.{username}.{rootDomain} */
export function getTenantPublicUrl(username: string): string {
  const protocol = env.rootDomain.includes("localhost") ? "http" : "https";
  return `${protocol}://${buildTenantSubdomain(username)}`;
}

/**
 * Preview link that works before wildcard DNS is wired.
 * On the main app host, use /site/{username}; otherwise use the tenant subdomain URL.
 */
export function getTenantPreviewUrl(username: string): string {
  try {
    const appHost = new URL(env.appUrl).host;
    if (isMainAppHost(appHost)) {
      return `${env.appUrl}/site/${username}`;
    }
  } catch {
    /* fall through */
  }

  return getTenantPublicUrl(username);
}

export function parseTenantUsernameFromHost(host: string, rootDomain: string): string | null {
  const normalizedHost = host.split(":")[0]?.toLowerCase() ?? "";
  const normalizedRoot = rootDomain.split(":")[0]?.toLowerCase() ?? "";

  if (
    normalizedHost === normalizedRoot ||
    normalizedHost === `www.${normalizedRoot}` ||
    normalizedHost.startsWith("localhost")
  ) {
    return null;
  }

  const suffix = `.${normalizedRoot}`;
  if (!normalizedHost.endsWith(suffix)) {
    return null;
  }

  let prefix = normalizedHost.slice(0, -suffix.length);
  if (prefix.startsWith("www.")) {
    prefix = prefix.slice(4);
  }

  if (!prefix || prefix.includes(".") || RESERVED.has(prefix)) {
    return null;
  }

  return prefix;
}
