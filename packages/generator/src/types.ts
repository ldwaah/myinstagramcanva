export type Niche =
  | "PHOTOGRAPHER"
  | "MUSICIAN"
  | "ACTOR"
  | "COACH"
  | "TRAINER"
  | "OTHER";

export interface SiteContentData {
  brandName: string;
  ownerName: string;
  tagline: string;
  heroEyebrow: string;
  heroTitle: string[];
  heroSubtitle: string;
  stats: { value: number; label: string }[];
  portfolioTitle: string;
  portfolioSubtitle: string;
  portfolioItems: { label: string; alt: string; imageUrl: string }[];
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
  tagline?: string;
  accentColor?: string;
  profile?: {
    fullName: string;
    biography: string;
    businessEmail?: string;
    businessPhone?: string;
  };
  posts: { imageUrl: string; alt: string; caption: string; shortcode: string }[];
  reels: { videoUrl: string; posterUrl?: string; caption: string; shortcode: string }[];
}
