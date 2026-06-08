import type {
  InstagramMediaItem,
  InstagramMediaNode,
  InstagramPost,
  InstagramProfile,
  InstagramReel,
} from "./types";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-IG-App-ID": "936619743392459",
};

const GRAPHQL_DOC_ID = "7950224923793128298";
const MAX_MEDIA_ITEMS = 30;
const MAX_PAGES = 5;
const MAX_REELS = 8;

interface TimelineBundle {
  edges: { node: InstagramMediaNode }[];
  page_info: { has_next_page: boolean; end_cursor: string };
}

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
  };

  const user = data.data.user;
  const timeline = user.edge_owner_to_timeline_media;
  const allEdges = [...(timeline?.edges ?? [])];
  let cursor = timeline?.page_info?.end_cursor;
  let hasNext = timeline?.page_info?.has_next_page ?? false;
  let pages = 0;

  while (hasNext && allEdges.length < MAX_MEDIA_ITEMS && pages < MAX_PAGES) {
    pages += 1;
    try {
      const page = await fetchTimelinePage(user.id, cursor);
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
    businessEmail: user.business_email,
    businessPhone: user.business_phone_number,
    userId: user.id,
    mediaItems,
    posts: pickVariedPosts(posts, 12),
    reels: reels.slice(0, MAX_REELS),
    raw: data,
  };
}

async function fetchTimelinePage(userId: string, cursor?: string) {
  const variables = JSON.stringify({
    id: userId,
    first: 24,
    after: cursor ?? null,
  });
  const gqlUrl = `https://www.instagram.com/graphql/query/?doc_id=${GRAPHQL_DOC_ID}&variables=${encodeURIComponent(variables)}`;
  const res = await fetch(gqlUrl, { headers: HEADERS });
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
