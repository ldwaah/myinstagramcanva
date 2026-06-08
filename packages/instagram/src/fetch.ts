import type {
  InstagramMediaItem,
  InstagramMediaNode,
  InstagramPost,
  InstagramProfile,
  InstagramReel,
} from "./types";

function igHeaders(username: string): Record<string, string> {
  return {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "X-IG-App-ID": "936619743392459",
    "X-ASBD-ID": "129477",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: `https://www.instagram.com/${username}/`,
    Origin: "https://www.instagram.com",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
  };
}

async function igFetch(url: string, username: string, init?: RequestInit): Promise<Response> {
  const proxy = process.env.INSTAGRAM_PROXY_URL?.trim();
  const target = proxy
    ? `${proxy}${proxy.includes("?") ? "&" : "?"}url=${encodeURIComponent(url)}`
    : url;
  return fetch(target, {
    ...init,
    headers: { ...igHeaders(username), ...(init?.headers || {}) },
  });
}

const GRAPHQL_DOC_ID = "7950224923793128298";
const MAX_MEDIA_ITEMS = 30;
const MAX_PAGES = 5;
const MAX_REELS = 8;

interface TimelineBundle {
  count?: number;
  edges: { node: InstagramMediaNode }[];
  page_info: { has_next_page: boolean; end_cursor: string };
}

export async function fetchInstagramProfile(username: string): Promise<InstagramProfile> {
  const clean = username.replace(/^@/, "").trim().toLowerCase();
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(clean)}`;

  let lastError: Error | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await igFetch(url, clean);
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`Instagram rate limited or unavailable (${res.status})`);
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      if (!res.ok) {
        throw new Error(`Instagram profile not found or unavailable (@${clean}, ${res.status})`);
      }
      return await parseProfileResponse(await res.json(), clean);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }
  throw lastError ?? new Error(`Instagram profile not found or unavailable (@${clean})`);
}

async function parseProfileResponse(
  data: {
    data: {
      user: {
        id: string;
        username: string;
        full_name: string;
        biography: string;
        profile_pic_url_hd?: string;
        profile_pic_url?: string;
        edge_followed_by?: { count: number };
        business_email?: string;
        business_phone_number?: string;
        edge_owner_to_timeline_media?: TimelineBundle;
      };
    };
  },
  clean: string,
): Promise<InstagramProfile> {
  const user = data.data.user;
  const timeline = user.edge_owner_to_timeline_media;
  const allEdges = [...(timeline?.edges ?? [])];
  let cursor = timeline?.page_info?.end_cursor;
  let hasNext = timeline?.page_info?.has_next_page ?? false;
  let pages = 0;

  while (hasNext && allEdges.length < MAX_MEDIA_ITEMS && pages < MAX_PAGES) {
    pages += 1;
    try {
      const page = await fetchTimelinePage(user.id, clean, cursor);
      const pageTimeline = page.data?.user?.edge_owner_to_timeline_media;
      if (!pageTimeline?.edges?.length) break;
      allEdges.push(...pageTimeline.edges);
      hasNext = pageTimeline.page_info?.has_next_page ?? false;
      cursor = pageTimeline.page_info?.end_cursor;
    } catch {
      break;
    }
  }

  const mediaItems: InstagramMediaItem[] = [];
  const posts: InstagramPost[] = [];
  const reels: InstagramReel[] = [];
  const seen = new Set<string>();

  for (const edge of allEdges) {
    if (mediaItems.length >= MAX_MEDIA_ITEMS) break;
    const item = mediaItemFromNode(edge.node);
    if (!item || seen.has(item.shortcode)) continue;
    seen.add(item.shortcode);
    mediaItems.push(item);

    if (item.type === "video" && item.videoUrl) {
      reels.push({
        id: item.shortcode,
        shortcode: item.shortcode,
        videoUrl: item.videoUrl,
        caption: item.caption,
        posterUrl: item.posterUrl || item.imageUrl,
      });
    }

    collectImagePosts(item, posts);
  }

  return {
    username: user.username,
    fullName: user.full_name || user.username,
    biography: user.biography || "",
    profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || "",
    followers: user.edge_followed_by?.count ?? 0,
    postCount: timeline?.count ?? allEdges.length,
    businessEmail: user.business_email,
    businessPhone: user.business_phone_number,
    userId: user.id,
    mediaItems,
    posts: pickVariedPosts(posts, 12),
    reels: reels.slice(0, MAX_REELS),
    raw: data,
  };
}

/** Rehydrate a profile from a cached web_profile_info payload (no pagination). */
export function profileFromRawPayload(raw: unknown, username: string): InstagramProfile | null {
  try {
    const data = raw as Parameters<typeof parseProfileResponse>[0];
    if (!data?.data?.user) return null;
    const user = data.data.user;
    const timeline = user.edge_owner_to_timeline_media;
    const allEdges = [...(timeline?.edges ?? [])];
    const mediaItems: InstagramMediaItem[] = [];
    const posts: InstagramPost[] = [];
    const reels: InstagramReel[] = [];
    const seen = new Set<string>();

    for (const edge of allEdges) {
      if (mediaItems.length >= MAX_MEDIA_ITEMS) break;
      const item = mediaItemFromNode(edge.node);
      if (!item || seen.has(item.shortcode)) continue;
      seen.add(item.shortcode);
      mediaItems.push(item);
      if (item.type === "video" && item.videoUrl) {
        reels.push({
          id: item.shortcode,
          shortcode: item.shortcode,
          videoUrl: item.videoUrl,
          caption: item.caption,
          posterUrl: item.posterUrl || item.imageUrl,
        });
      }
      collectImagePosts(item, posts);
    }

    return {
      username: user.username || username.replace(/^@/, "").trim().toLowerCase(),
      fullName: user.full_name || user.username,
      biography: user.biography || "",
      profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || "",
      followers: user.edge_followed_by?.count ?? 0,
      postCount: timeline?.count ?? allEdges.length,
      businessEmail: user.business_email,
      businessPhone: user.business_phone_number,
      userId: user.id,
      mediaItems,
      posts: pickVariedPosts(posts, 12),
      reels: reels.slice(0, MAX_REELS),
      raw: data,
    };
  } catch {
    return null;
  }
}

async function fetchTimelinePage(userId: string, username: string, cursor?: string) {
  const variables = JSON.stringify({
    id: userId,
    first: 24,
    after: cursor ?? null,
  });
  const gqlUrl = `https://www.instagram.com/graphql/query/?doc_id=${GRAPHQL_DOC_ID}&variables=${encodeURIComponent(variables)}`;
  const res = await igFetch(gqlUrl, username);
  if (!res.ok) throw new Error(`Instagram pagination failed (${res.status})`);
  return res.json() as Promise<{
    data?: { user?: { edge_owner_to_timeline_media?: TimelineBundle } };
  }>;
}

function mediaItemFromNode(node: InstagramMediaNode): InstagramMediaItem | null {
  const shortcode = node.shortcode;
  const caption = getCaption(node);
  const isVideo = node.is_video || node.product_type === "clips";

  if (node.__typename === "GraphSidecar") {
    const carouselItems = [];
    for (const child of node.edge_sidecar_to_children?.edges ?? []) {
      const c = child.node;
      const childVideo = c.is_video || c.product_type === "clips";
      if (childVideo && c.video_url) {
        carouselItems.push({
          type: "video" as const,
          videoUrl: c.video_url,
          posterUrl: c.display_url,
          imageUrl: c.display_url,
        });
      } else if (c.display_url) {
        carouselItems.push({ type: "image" as const, imageUrl: c.display_url });
      }
    }
    const first = carouselItems[0];
    return {
      id: shortcode,
      shortcode,
      type: "carousel",
      imageUrl: first?.imageUrl || first?.posterUrl,
      videoUrl: first?.type === "video" ? first.videoUrl : undefined,
      posterUrl: first?.posterUrl || first?.imageUrl,
      caption,
      alt: (node.accessibility_caption || caption).slice(0, 120),
      carouselItems,
    };
  }

  if (isVideo && node.video_url) {
    return {
      id: shortcode,
      shortcode,
      type: "video",
      videoUrl: node.video_url,
      posterUrl: node.display_url,
      imageUrl: node.display_url,
      caption,
      alt: (node.accessibility_caption || caption).slice(0, 120),
    };
  }

  if (node.display_url) {
    return {
      id: shortcode,
      shortcode,
      type: "image",
      imageUrl: node.display_url,
      caption,
      alt: (node.accessibility_caption || caption).slice(0, 120),
    };
  }

  return null;
}

function collectImagePosts(item: InstagramMediaItem, posts: InstagramPost[]) {
  if (item.type === "image" && item.imageUrl) {
    posts.push({
      id: item.id,
      shortcode: item.shortcode,
      imageUrl: item.imageUrl,
      caption: item.caption,
      alt: item.alt,
    });
    return;
  }

  if (item.type === "carousel" && item.carouselItems) {
    for (let i = 0; i < item.carouselItems.length; i++) {
      const c = item.carouselItems[i];
      if (c.type === "image" && c.imageUrl) {
        posts.push({
          id: `${item.shortcode}_${i}`,
          shortcode: item.shortcode,
          imageUrl: c.imageUrl,
          caption: item.caption,
          alt: item.alt,
        });
      }
    }
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
