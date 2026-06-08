import type { GenerateInput, Niche, SiteContentData } from "./types";

const NICHE_LABELS: Record<Niche, { services: string; portfolio: string; action: string }> = {
  PHOTOGRAPHER: { services: "What I shoot", portfolio: "Selected frames", action: "Book a shoot" },
  MUSICIAN: { services: "What I perform", portfolio: "Highlights", action: "Book a session" },
  ACTOR: { services: "What I offer", portfolio: "Showreel stills", action: "Get in touch" },
  COACH: { services: "How I help", portfolio: "Client moments", action: "Book a call" },
  TRAINER: { services: "Training programs", portfolio: "Transformations", action: "Start training" },
  OTHER: { services: "What I offer", portfolio: "Featured work", action: "Contact me" },
};

export function generateSiteContent(input: GenerateInput): SiteContentData {
  const labels = NICHE_LABELS[input.niche];
  const brandName = input.profile?.fullName || input.username;
  const ownerName = input.profile?.fullName?.split(" ")[0] || input.username;
  const bio = input.profile?.biography || "";
  const tagline = input.tagline || extractTagline(bio) || `Creative work by @${input.username}`;
  const heroLines = buildHeroLines(tagline, input.niche);

  return {
    brandName,
    ownerName,
    tagline,
    heroEyebrow: buildEyebrow(input.niche, bio),
    heroTitle: heroLines,
    heroSubtitle: buildHeroSubtitle(brandName, bio, input.niche),
    stats: buildStats(input.niche),
    portfolioTitle: labels.portfolio,
    portfolioSubtitle: `Shots from @${input.username}.`,
    portfolioItems: input.posts.map((p, i) => ({
      label: p.caption.split(/[.!?\n]/)[0]?.slice(0, 20) || `Work ${i + 1}`,
      alt: p.alt,
      imageUrl: p.imageUrl,
    })),
    reelsTitle: "From Instagram",
    reelsSubtitle: `Clips pulled from @${input.username}.`,
    reels: input.reels.map((r) => ({
      shortcode: r.shortcode,
      videoUrl: r.videoUrl,
      posterUrl: r.posterUrl || input.posts[0]?.imageUrl || "",
      caption: r.caption.slice(0, 120),
    })),
    aboutTitle: buildAboutTitle(input.niche),
    aboutBody: bio || buildDefaultAbout(brandName, input.niche),
    aboutBullets: buildBullets(input.niche, bio),
    aboutBadge: ["Creative", "Pro"],
    servicesTitle: labels.services,
    services: buildServices(input.niche),
    contactTitle: labels.action,
    contactSubtitle: `Follow on Instagram or send a message — we'll get back to you.`,
    instagramHandle: input.username,
    phone: input.profile?.businessPhone,
    email: input.profile?.businessEmail,
    accentColor: "#E1306C",
    niche: input.niche,
    marqueeText: `${brandName.toUpperCase()} · @${input.username.toUpperCase()} · `,
    metaDescription: `${brandName} · ${tagline.slice(0, 120)}`,
    showContactForm: false,
    showCalendar: false,
    showFunnel: false,
  };
}

export async function generateSiteContentWithAI(
  input: GenerateInput,
  apiKey: string
): Promise<SiteContentData> {
  const base = generateSiteContent(input);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a copywriter for creator websites. Return JSON matching the requested fields. Keep tone premium, concise, and niche-appropriate.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Enhance website copy",
              niche: input.niche,
              username: input.username,
              biography: input.profile?.biography,
              tagline: input.tagline,
              fields: {
                heroEyebrow: base.heroEyebrow,
                heroTitle: base.heroTitle,
                heroSubtitle: base.heroSubtitle,
                aboutBody: base.aboutBody,
                aboutBullets: base.aboutBullets,
                services: base.services,
                contactSubtitle: base.contactSubtitle,
                metaDescription: base.metaDescription,
              },
            }),
          },
        ],
      }),
    });

    if (!res.ok) return base;
    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const enhanced = JSON.parse(data.choices[0].message.content) as Partial<SiteContentData>;
    return { ...base, ...enhanced };
  } catch {
    return base;
  }
}

function extractTagline(bio: string): string {
  const line = bio.split("\n")[0]?.trim();
  return line?.slice(0, 80) || "";
}

function buildEyebrow(niche: Niche, bio: string): string {
  const first = bio.split("\n")[1]?.trim();
  if (first && first.length < 60) return first;
  const map: Record<Niche, string> = {
    PHOTOGRAPHER: "Portfolio · On location · Every brief",
    MUSICIAN: "Live · Studio · Original sound",
    ACTOR: "Stage · Screen · Character",
    COACH: "Mindset · Growth · Clarity",
    TRAINER: "Strength · Form · Results",
    OTHER: "Creative · Professional · Ready",
  };
  return map[niche];
}

function buildHeroLines(tagline: string, niche: Niche): string[] {
  const words = tagline.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    const third = Math.ceil(words.length / 3);
    return [
      words.slice(0, third).join(" "),
      words.slice(third, third * 2).join(" "),
      words.slice(third * 2).join(" ") || "Delivered.",
    ];
  }
  const defaults: Record<Niche, string[]> = {
    PHOTOGRAPHER: ["Decisive", "moments.", "Delivered."],
    MUSICIAN: ["Your sound.", "Your stage.", "Amplified."],
    ACTOR: ["Every role.", "Every frame.", "Authentic."],
    COACH: ["Clarity.", "Confidence.", "Forward."],
    TRAINER: ["Stronger.", "Fitter.", "You."],
    OTHER: ["Your brand.", "Your story.", "Online."],
  };
  return defaults[niche];
}

function buildHeroSubtitle(name: string, bio: string, niche: Niche): string {
  if (bio.length > 40) return bio.slice(0, 200);
  const map: Record<Niche, string> = {
    PHOTOGRAPHER: `${name}. Performance-driven photography for brands that need the frame before the moment passes.`,
    MUSICIAN: `${name}. Original performances and studio-ready content built for your audience.`,
    ACTOR: `${name}. Compelling performances across stage and screen.`,
    COACH: `${name}. Practical coaching for people ready to move forward with confidence.`,
    TRAINER: `${name}. Training programs designed around your goals and your schedule.`,
    OTHER: `${name}. A professional presence built from your Instagram story.`,
  };
  return map[niche];
}

function buildStats(niche: Niche): { value: number; label: string }[] {
  const map: Record<Niche, { value: number; label: string }[]> = {
    PHOTOGRAPHER: [
      { value: 90, label: "min of focus" },
      { value: 1, label: "decisive frame" },
      { value: 100, label: "% matchday ready" },
    ],
    MUSICIAN: [
      { value: 50, label: "live sets" },
      { value: 12, label: "original tracks" },
      { value: 100, label: "% stage ready" },
    ],
    ACTOR: [
      { value: 24, label: "productions" },
      { value: 3, label: "mediums" },
      { value: 100, label: "% committed" },
    ],
    COACH: [
      { value: 500, label: "sessions delivered" },
      { value: 1, label: "clear path" },
      { value: 100, label: "% client focused" },
    ],
    TRAINER: [
      { value: 1000, label: "sessions coached" },
      { value: 12, label: "week programs" },
      { value: 100, label: "% tailored" },
    ],
    OTHER: [
      { value: 100, label: "posts curated" },
      { value: 1, label: "brand story" },
      { value: 100, label: "% you" },
    ],
  };
  return map[niche];
}

function buildAboutTitle(niche: Niche): string {
  const map: Record<Niche, string> = {
    PHOTOGRAPHER: "Visual instinct.<br /><em>Creative precision.</em>",
    MUSICIAN: "Sound and soul.<br /><em>Stage ready.</em>",
    ACTOR: "Craft and presence.<br /><em>Every role.</em>",
    COACH: "Real talk.<br /><em>Real progress.</em>",
    TRAINER: "Form and focus.<br /><em>Your results.</em>",
    OTHER: "Your story.<br /><em>Your way.</em>",
  };
  return map[niche];
}

function buildDefaultAbout(name: string, niche: Niche): string {
  return `${name} brings a professional, authentic presence to every project — with content shaped for the platforms where your audience already lives.`;
}

function buildBullets(niche: Niche, bio: string): string[] {
  if (bio.includes("•") || bio.includes("-")) {
    return bio
      .split(/\n/)
      .map((l) => l.replace(/^[-•]\s*/, "").trim())
      .filter((l) => l.length > 5)
      .slice(0, 4);
  }
  const map: Record<Niche, string[]> = {
    PHOTOGRAPHER: ["On-location shoots", "Portrait & brand content", "Fast digital delivery", "Social-ready imagery"],
    MUSICIAN: ["Live performances", "Studio recordings", "EPK & promo content", "Collaborations"],
    ACTOR: ["Theatre & screen", "Self-tape support", "Headshots & press", "Showreel content"],
    COACH: ["1:1 coaching", "Group sessions", "Online programs", "Accountability support"],
    TRAINER: ["1:1 training", "Online coaching", "Nutrition guidance", "Progress tracking"],
    OTHER: ["Brand content", "Social campaigns", "Professional presence", "Fast turnaround"],
  };
  return map[niche];
}

function buildServices(niche: Niche): { title: string; description: string }[] {
  const map: Record<Niche, { title: string; description: string }[]> = {
    PHOTOGRAPHER: [
      { title: "On location", description: "Authentic imagery captured in the environment that defines your work." },
      { title: "Brand content", description: "Portraits, BTS, and sequences built for feeds and sponsors." },
      { title: "Campaigns", description: "Visual consistency across every touchpoint of your brand." },
    ],
    MUSICIAN: [
      { title: "Live", description: "Performance coverage and atmosphere that translates off-stage." },
      { title: "Studio", description: "Recording sessions and promo content for releases." },
      { title: "Promo", description: "EPK assets and social-first launch content." },
    ],
    ACTOR: [
      { title: "Performance", description: "Theatre, screen, and character-driven storytelling." },
      { title: "Self-tape", description: "Audition-ready tapes with professional presentation." },
      { title: "Press", description: "Headshots and materials that open doors." },
    ],
    COACH: [
      { title: "1:1 Sessions", description: "Focused coaching tailored to your goals and pace." },
      { title: "Programs", description: "Structured paths for lasting change." },
      { title: "Workshops", description: "Group experiences that build momentum." },
    ],
    TRAINER: [
      { title: "Personal training", description: "Custom programs built around your body and schedule." },
      { title: "Online coaching", description: "Remote support with clear accountability." },
      { title: "Nutrition", description: "Practical guidance that fits real life." },
    ],
    OTHER: [
      { title: "Content", description: "Professional assets drawn from your existing body of work." },
      { title: "Brand", description: "A cohesive story across your digital presence." },
      { title: "Growth", description: "Tools to turn followers into clients." },
    ],
  };
  return map[niche];
}
