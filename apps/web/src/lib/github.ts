import { env } from "./env";

interface GitHubFile {
  path: string;
  content: string;
}

export async function commitSiteFiles(
  username: string,
  files: GitHubFile[],
  message: string
): Promise<string | null> {
  if (!env.githubToken || !env.githubRepo) {
    return null;
  }

  const [owner, repo] = env.githubRepo.split("/");
  const branch = env.githubBranch;
  const basePath = `sites/${username}`;

  const refRes = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`
  );
  if (!refRes.ok) return null;
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
    if (!blobRes.ok) continue;
    const blob = (await blobRes.json()) as { sha: string };
    treeItems.push({
      path: `${basePath}/${file.path}`,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  if (!treeItems.length) return null;

  const treeRes = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: parentSha, tree: treeItems }),
  });
  if (!treeRes.ok) return null;
  const tree = (await treeRes.json()) as { sha: string };

  const commitRes = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [parentSha],
    }),
  });
  if (!commitRes.ok) return null;
  const commit = (await commitRes.json()) as { sha: string };

  await githubFetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });

  return commit.sha;
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
