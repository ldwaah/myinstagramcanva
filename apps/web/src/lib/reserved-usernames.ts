import { EXAMPLE_SITE_SLUGS } from "./example-site-slugs";

const BASE_RESERVED = [
  "www",
  "api",
  "admin",
  "dashboard",
  "app",
  "mail",
  "support",
] as const;

/** Usernames that cannot be claimed during signup or preview generation. */
export const RESERVED_USERNAMES = new Set<string>([
  ...BASE_RESERVED,
  ...EXAMPLE_SITE_SLUGS,
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}
