export interface InstagramMediaNode {
  shortcode: string;
  is_video?: boolean;
  product_type?: string;
  __typename?: string;
  display_url?: string;
  video_url?: string;
  accessibility_caption?: string;
  edge_media_to_caption?: { edges: { node: { text: string } }[] };
  edge_sidecar_to_children?: { edges: { node: InstagramMediaNode }[] };
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  profilePicUrl: string;
  followers: number;
  businessEmail?: string;
  businessPhone?: string;
  posts: InstagramPost[];
  reels: InstagramReel[];
  raw: unknown;
}

export interface InstagramPost {
  id: string;
  shortcode: string;
  imageUrl: string;
  caption: string;
  alt: string;
}

export interface InstagramReel {
  id: string;
  shortcode: string;
  videoUrl: string;
  caption: string;
  posterUrl?: string;
}
