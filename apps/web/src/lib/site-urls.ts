import { env } from "./env";

const RESERVED = new Set(["www", "api", "admin", "dashboard", "app", "mail", "support"]);

/** Vercel *.vercel.app does not support nested tenant hosts like user.project.vercel.app */
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

/** Host label stored on Site.subdomain, e.g. official4dads.myinstagramcanva.com */
export function buildTenantSubdomain(username: string): string {
  return `${username}.${env.rootDomain}`;
}

/** Public URL shown in UI: https://{username}.{rootDomain} */
export function getTenantPublicUrl(username: string): string {
  const protocol = env.rootDomain.includes("localhost") ? "http" : "https";
  return `${protocol}://${buildTenantSubdomain(username)}`;
}

/** Canonical live tenant URL shown to users. */
export function getTenantLiveUrl(username: string): string {
  return getTenantResolvableUrl(username);
}

/** True when *.rootDomain wildcard DNS is configured (set in Netlify env). */
export function tenantSubdomainsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_TENANT_SUBDOMAINS_ENABLED === "true";
}

function shouldUsePathFallback(): boolean {
  if (tenantSubdomainsEnabled()) return false;
  try {
    const appHost = new URL(env.appUrl).host;
    return isMainAppHost(appHost);
  } catch {
    return env.rootDomain.includes("localhost");
  }
}

/** URL that always resolves in the browser for the current deployment. */
export function getTenantResolvableUrl(username: string): string {
  if (shouldUsePathFallback()) {
    return `${env.appUrl}/site/${username}`;
  }
  return getTenantPublicUrl(username);
}

/**
 * Preview link shown in the dashboard and generation flow.
 * Path fallback: {appUrl}/site/{username} (works without wildcard DNS)
 * Subdomain: https://{username}.{rootDomain} (requires *.rootDomain on Netlify)
 */
export function getTenantPreviewUrl(username: string): string {
  return getTenantResolvableUrl(username);
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
  // Legacy: www.{username}.{root} still resolves to {username}
  if (prefix.startsWith("www.")) {
    prefix = prefix.slice(4);
  }

  if (!prefix || prefix.includes(".") || RESERVED.has(prefix)) {
    return null;
  }

  return prefix;
}
