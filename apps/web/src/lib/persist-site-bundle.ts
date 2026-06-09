import { prisma } from "@mic/db";
import { publishSiteBundle } from "@/lib/storage";
import { bundleUnchanged, commitSiteFiles, publishCommitMessage } from "@/lib/github";

/**
 * Save a generated site bundle to the database (and optional storage / GitHub).
 * Used by push-site-bundle cron, example-site seeding, and local scripts.
 */
export async function persistSiteBundle(
  username: string,
  files: Record<string, string>,
): Promise<{ ok: true; username: string; version: number; mediaInBundle: number }> {
  const site = await prisma.site.findUnique({
    where: { username },
    include: { siteContent: true },
  });
  if (!site) {
    throw new Error(`Site not found: @${username}`);
  }

  const siteJson = files["site.json"] ?? site.siteContent?.content ?? "{}";

  try {
    await publishSiteBundle(username, files);
  } catch {
    /* optional on serverless */
  }

  const nextVersion = (site.siteContent?.version ?? 0) + 1;
  let commitSha = site.siteContent?.commitSha ?? null;

  if (!bundleUnchanged(site.siteContent?.bundle, files)) {
    commitSha = await commitSiteFiles(
      username,
      Object.entries(files).map(([path, content]) => ({ path, content })),
      publishCommitMessage(username, nextVersion),
    );
    if (!commitSha) {
      console.warn(`[persist-site-bundle] GitHub publish unavailable for @${username} — saving to database`);
    }
  }

  await prisma.siteContent.upsert({
    where: { siteId: site.id },
    create: {
      siteId: site.id,
      content: siteJson,
      bundle: JSON.stringify(files),
      commitSha: commitSha || undefined,
    },
    update: {
      content: siteJson,
      bundle: JSON.stringify(files),
      version: { increment: 1 },
      commitSha: commitSha || undefined,
    },
  });

  await prisma.site.update({
    where: { id: site.id },
    data: { publishedAt: new Date(), githubPath: `sites/${username}` },
  });

  return {
    ok: true,
    username,
    version: nextVersion,
    mediaInBundle: Object.keys(files).filter((k) => k.startsWith("assets/")).length,
  };
}
