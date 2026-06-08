import type { InstagramMediaNode, InstagramPost, InstagramProfile, InstagramReel } from "./types";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-IG-App-ID": "936619743392459",
};

export async function fetchInstagramProfile(username: string): Promise<InstagramProfile> {
  const clean = username.replace(/^@/, "").trim().toLowerCase();
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(clean)}`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`Instagram profile not found or unavailable (@${clean})`);
  }

  const data = (await res.json()) as {
    data: {
      user: {
        username: string;
        full_name: string;
        biography: string;
        profile_pic_url_hd?: string;
        profile_pic_url?: string;
        edge_followed_by?: { count: number };
        business_email?: string;
        business_phone_number?: string;
        edge_owner_to_timeline_media?: { edges: { node: InstagramMediaNode }[] };
      };
    };
  };

  const user = data.data.user;
  const posts: InstagramPost[] = [];
  const reels: InstagramReel[] = [];
  const seen = new Set<string>();

  for (const edge of user.edge_owner_to_timeline_media?.edges ?? []) {
    collectFromNode(edge.node, posts, reels, seen);
  }

  return {
    username: user.username,
    fullName: user.full_name || user.username,
    biography: user.biography || "",
    profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || "",
    followers: user.edge_followed_by?.count ?? 0,
    businessEmail: user.business_email,
    businessPhone: user.business_phone_number,
    posts: pickVariedPosts(posts, 10),
    reels: reels.slice(0, 6),
    raw: data,
  };
}

function collectFromNode(
  node: InstagramMediaNode,
  posts: InstagramPost[],
  reels: InstagramReel[],
  seen: Set<string>
) {
  const code = node.shortcode;
  if (seen.has(code)) return;
  seen.add(code);

  const isVideo = node.is_video || node.product_type === "clips";

  if (isVideo && node.video_url) {
    reels.push({
      id: code,
      shortcode: code,
      videoUrl: node.video_url,
      caption: getCaption(node),
      posterUrl: node.display_url,
    });
    return;
  }

  if (node.__typename === "GraphSidecar") {
    for (const child of node.edge_sidecar_to_children?.edges ?? []) {
      const c = child.node;
      if (c.is_video) continue;
      if (c.display_url) {
        posts.push({
          id: `${code}_${posts.length}`,
          shortcode: code,
          imageUrl: c.display_url,
          caption: getCaption(c),
          alt: (c.accessibility_caption || getCaption(c)).slice(0, 120),
        });
      }
    }
    return;
  }

  if (node.display_url && !isVideo) {
    posts.push({
      id: code,
      shortcode: code,
      imageUrl: node.display_url,
      caption: getCaption(node),
      alt: (node.accessibility_caption || getCaption(node)).slice(0, 120),
    });
  }
}

function getCaption(node: InstagramMediaNode): string {
  const edges = node.edge_media_to_caption?.edges ?? [];
  return edges[0]?.node?.text ?? "";
}

function pickVariedPosts(posts: InstagramPost[], limit: number): InstagramPost[] {
  const seenPosts = new Set<string>();
  const picked: InstagramPost[] = [];

  for (const post of posts) {
    const postId = post.id.split("_")[0];
    if (seenPosts.has(postId)) continue;
    seenPosts.add(postId);
    picked.push(post);
    if (picked.length >= limit) break;
  }

  if (picked.length < limit) {
    for (const post of posts) {
      if (!picked.includes(post)) picked.push(post);
      if (picked.length >= limit) break;
    }
  }

  return picked;
}
