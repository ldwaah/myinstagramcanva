import { createHash } from "crypto";
import { env } from "./env";

interface GitHubFile {
  path: string;
  content: string;
}

/** True when GITHUB_TOKEN and a repo (GITHUB_SITES_REPO or GITHUB_REPO) are set. */
export function isGitHubPublishConfigured(): boolean {
  return Boolean(env.githubToken && env.githubRepo);
}

/** Standard British English commit message for site publishes. */
export function publishCommitMessage(username: string, version: number): string {
  return `publish: @${username} site v${version}`;
}

/** Fingerprint for idempotent publish — skip GitHub when bundle JSON is unchanged. */
export function siteBundleFingerprint(files: Record<string, string>): string {
  const keys = Object.keys(files).sort();
  const hash = createHash("sha256");
  for (const key of keys) {
    hash.update(key);
    hash.update("\0");
    hash.update(files[key]);
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function bundleUnchanged(
  existingBundle: string | null | undefined,
  files: Record<string, string>
): boolean {
  if (!existingBundle) return false;
  try {
    const parsed = JSON.parse(existingBundle) as Record<string, string>;
    return siteBundleFingerprint(parsed) === siteBundleFingerprint(files);
  } catch {
    return existingBundle === JSON.stringify(files);
  }
}

export async function commitSiteFiles(
  username: string,
  files: GitHubFile[],
  message: string
): Promise<string | null> {
  if (!isGitHubPublishConfigured()) {
    return null;
  }

  const [owner, repo] = env.githubRepo.split("/");
  if (!owner || !repo) {
    console.warn("[github] Invalid GITHUB_SITES_REPO / GITHUB_REPO — expected owner/repo");
    return null;
  }

  const branch = env.githubBranch;
  const basePath = `sites/${username}`;

  try {
    const refRes = await githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`
    );
    if (!refRes.ok) {
      console.warn(`[github] Could not read ref heads/${branch}: ${refRes.status}`);
      return null;
    }
    const refData = (await refRes.json()) as { object: { sha: string } };
    const parentSha = refData.object.sha;

    const treeItems = [];
    for (const file of files) {
      const blobRes = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content: Buffer.from(file.content, "utf8").toString("base64"),
          encoding: "base64",
        }),
      });
      if (!blobRes.ok) {
        console.warn(`[github] Blob create failed for ${file.path}: ${blobRes.status}`);
        continue;
      }
      const blob = (await blobRes.json()) as { sha: string };
      treeItems.push({
        path: `${basePath}/${file.path}`,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      });
    }

    if (!treeItems.length) {
      console.warn(`[github] No blobs created for @${username}`);
      return null;
    }

    const treeRes = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: parentSha, tree: treeItems }),
    });
    if (!treeRes.ok) {
      console.warn(`[github] Tree create failed for @${username}: ${treeRes.status}`);
      return null;
    }
    const tree = (await treeRes.json()) as { sha: string };

    const commitRes = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [parentSha],
      }),
    });
    if (!commitRes.ok) {
      console.warn(`[github] Commit failed for @${username}: ${commitRes.status}`);
      return null;
    }
    const commit = (await commitRes.json()) as { sha: string };

    const refUpdate = await githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha }),
      }
    );
    if (!refUpdate.ok) {
      console.warn(`[github] Ref update failed for @${username}: ${refUpdate.status}`);
      return null;
    }

    return commit.sha;
  } catch (err) {
    console.warn(`[github] Publish failed for @${username}`, err);
    return null;
  }
}

async function githubFetch(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.githubToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}
