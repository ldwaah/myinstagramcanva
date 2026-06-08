export type Niche =
  | "PHOTOGRAPHER"
  | "MUSICIAN"
  | "INFLUENCER"
  | "ACTOR"
  | "COACH"
  | "TRAINER"
  | "OTHER";

export interface SiteThemeVars {
  accent: string;
  accent2: string;
  accentDim: string;
  gradient: string;
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  isDark: boolean;
}

export interface SiteContentData {
  brandName: string;
  ownerName: string;
  profilePicUrl: string;
  heroImageUrl: string;
  layoutVariant: "profile" | "cinematic";
  followers: number;
  tagline: string;
  heroEyebrow: string;
  heroTitle: string[];
  heroSubtitle: string;
  stats: { value: number; label: string }[];
  portfolioTitle: string;
  portfolioSubtitle: string;
  portfolioItems: { label: string; alt: string; imageUrl: string }[];
  myPostsTitle: string;
  myPostsSubtitle: string;
  myPosts: {
    shortcode: string;
    type: "image" | "video" | "carousel";
    imageUrl?: string;
    videoUrl?: string;
    posterUrl?: string;
    alt: string;
    caption: string;
    carouselCount?: number;
  }[];
  reelsTitle: string;
  reelsSubtitle: string;
  reels: { shortcode: string; videoUrl: string; posterUrl: string; caption: string }[];
  aboutTitle: string;
  aboutBody: string;
  aboutBullets: string[];
  aboutBadge: string[];
  servicesTitle: string;
  services: { title: string; description: string }[];
  contactTitle: string;
  contactSubtitle: string;
  instagramHandle: string;
  phone?: string;
  email?: string;
  accentColor: string;
  theme: SiteThemeVars;
  fontDisplay: string;
  fontBody: string;
  fontGoogleUrl: string;
  niche: Niche;
  marqueeText: string;
  metaDescription: string;
  showContactForm: boolean;
  showCalendar: boolean;
  showFunnel: boolean;
}

export interface GenerateInput {
  username: string;
  niche: Niche;
  quizAnswers?: Record<string, string>;
  layoutHint?: string;
  tagline?: string;
  accentColor?: string;
  profile?: {
    fullName: string;
    biography: string;
    profilePicUrl?: string;
    followers?: number;
    postCount?: number;
    businessEmail?: string;
    businessPhone?: string;
  };
  posts: { imageUrl: string; alt: string; caption: string; shortcode: string }[];
  mediaItems?: {
    shortcode: string;
    type: "image" | "video" | "carousel";
    imageUrl?: string;
    videoUrl?: string;
    posterUrl?: string;
    alt: string;
    caption: string;
    carouselCount?: number;
  }[];
  reels: { videoUrl: string; posterUrl?: string; caption: string; shortcode: string }[];
  theme?: SiteThemeVars;
}
