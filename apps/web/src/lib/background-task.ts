import { waitUntil as vercelWaitUntil } from "@vercel/functions";

/** Run async work after the HTTP response (Vercel) or fire-and-forget (Netlify/local). */
export function runInBackground(task: Promise<unknown>): void {
  try {
    vercelWaitUntil(task);
  } catch {
    void task.catch((err) => console.error("[background]", err));
  }
}
