import { env } from "./env";

const RESERVED = new Set(["www", "api", "admin", "dashboard", "app", "mail", "support"]);

/** Host label stored on Site.subdomain, e.g. www.khiagovisuals.myinstagramcanva.thesale.app */
export function buildTenantSubdomain(username: string): string {
  return `www.${username}.${env.rootDomain}`;
}

/** Public URL shown in UI: https://www.{username}.{rootDomain} */
export function getTenantPublicUrl(username: string): string {
  const protocol = env.rootDomain.includes("localhost") ? "http" : "https";
  return `${protocol}://${buildTenantSubdomain(username)}`;
}

/**
 * Preview link that works before custom DNS is wired.
 * On Vercel app host, use /site/{username}; otherwise use the tenant subdomain URL.
 */
export function getTenantPreviewUrl(username: string): string {
  try {
    const appHost = new URL(env.appUrl).host;
    const onVercelFallback =
      appHost.includes("vercel.app") && !env.rootDomain.includes("vercel.app");

    if (onVercelFallback) {
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
