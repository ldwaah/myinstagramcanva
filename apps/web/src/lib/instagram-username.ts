const IG_USERNAME_RE = /^[a-z0-9_]+$/;
const IG_USERNAME_MAX = 30;
const IG_USERNAME_MIN = 3;

/** Extract a clean Instagram handle from pasted input (@user, profile URL, or plain text). */
export function sanitizeInstagramUsername(input: string): string {
  let value = input.trim();

  const urlMatch = value.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i
  );
  if (urlMatch?.[1]) {
    value = urlMatch[1];
  }

  value = value.replace(/^@+/, "");
  value = value.split(/[/?#]/)[0] ?? value;
  value = value.replace(/[^a-zA-Z0-9_]/g, "");
  return value.toLowerCase();
}

export function validateInstagramUsername(username: string): string | null {
  if (username.length < IG_USERNAME_MIN) {
    return "Instagram username must be at least 3 characters";
  }
  if (username.length > IG_USERNAME_MAX) {
    return "Instagram usernames are 30 characters max. Paste just the handle (e.g. khiagovisuals), not a long URL.";
  }
  if (!IG_USERNAME_RE.test(username)) {
    return "Use only letters, numbers, and underscores";
  }
  return null;
}

export { IG_USERNAME_MAX, IG_USERNAME_MIN };
