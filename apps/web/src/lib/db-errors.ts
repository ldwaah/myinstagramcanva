import { ZodError } from "zod";

const FRIENDLY_UNAVAILABLE =
  "Sign-in is temporarily unavailable. The server database is not configured. Contact support if this persists.";

/** Map Prisma / infra errors to safe user-facing messages (no stack traces or env names). */
export function sanitizeAuthError(err: unknown, fallback: string): string {
  if (err instanceof ZodError) {
    return err.issues.map((e) => e.message).join(". ");
  }

  if (!(err instanceof Error)) {
    return fallback;
  }

  const msg = err.message;

  if (
    msg.includes("Environment variable not found: DATABASE_URL") ||
    msg.includes("DATABASE_URL") && msg.includes("not found")
  ) {
    return FRIENDLY_UNAVAILABLE;
  }

  if (
    msg.includes("Can't reach database server") ||
    msg.includes("Connection refused") ||
    msg.includes("P1001") ||
    msg.includes("P1000") ||
    msg.includes("P1017")
  ) {
    return "Cannot reach the database right now. Please try again in a moment.";
  }

  if (msg.includes("Invalid `prisma.") || msg.includes("PrismaClient")) {
    return fallback;
  }

  return msg;
}

export function parseJsonError(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string" && err.trim()) return err;
  }
  return fallback;
}
