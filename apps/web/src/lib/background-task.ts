/**
 * Serverless background tasks.
 * Vercel: extends invocation via waitUntil.
 * Netlify: no durable background — callers must await work or kick from status polls.
 */
export function runInBackground(task: Promise<unknown>): void {
  const isVercel = Boolean(process.env.VERCEL);
  if (isVercel) {
    import("@vercel/functions")
      .then(({ waitUntil }) => waitUntil(task))
      .catch(() => void task.catch((err) => console.error("[background]", err)));
    return;
  }

  void task.catch((err) => console.error("[background]", err));
}
