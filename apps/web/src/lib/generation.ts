import { prisma, SiteStatus, SiteTier, JobStatus, MediaType } from "@mic/db";
import { fetchInstagramProfile, type InstagramMediaItem, type InstagramProfile } from "@mic/instagram";
import {
  generateSiteContent,
  generateSiteContentWithAI,
  renderSiteHtml,
  renderFunnelHtml,
  buildThemedInput,
  injectThemeIntoCss,
  type SiteContentData,
} from "@mic/generator";
import { env } from "./env";
import { publishSiteBundle, downloadUrl } from "./storage";
import { commitSiteFiles } from "./github";
import { getTrialEndDate } from "./trial";
import { readTemplateFile } from "./template-assets";

const IS_SERVERLESS = Boolean(process.env.VERCEL);
const HAS_R2 = Boolean(env.r2.accessKeyId && env.r2.accountId);

function shouldUseRemoteUrls() {
  return IS_SERVERLESS && !HAS_R2;
}

type ProcessedMediaItem = {
  shortcode: string;
  type: "image" | "video" | "carousel";
  imageUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
  alt: string;
  caption: string;
  carouselCount?: number;
};

export async function runSiteGeneration(siteId: string, userId: string, options?: { sync?: boolean }) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { instagramProfile: true },
  });
  if (!site || site.userId !== userId) throw new Error("Site not found");

  const job = await prisma.generationJob.create({
    data: { siteId, userId, status: JobStatus.RUNNING },
  });

  try {
    if (!options?.sync) {
      await prisma.site.update({
        where: { id: siteId },
        data: { status: SiteStatus.GENERATING },
      });
    }

    let profile: InstagramProfile | ReturnType<typeof emptyProfile>;
    try {
      profile = await fetchInstagramProfile(site.username);
    } catch {
      profile = emptyProfile(site.username, site.tagline);
    }

    await prisma.instagramProfile.upsert({
      where: { siteId },
      create: {
        siteId,
        username: profile.username,
        fullName: profile.fullName,
        biography: profile.biography,
        profilePicUrl: profile.profilePicUrl,
        followers: profile.followers,
        rawPayload: JSON.stringify(profile.raw),
      },
      update: {
        fullName: profile.fullName,
        biography: profile.biography,
        profilePicUrl: profile.profilePicUrl,
        followers: profile.followers,
        rawPayload: JSON.stringify(profile.raw),
        lastSyncedAt: new Date(),
      },
    });

    await prisma.mediaAsset.deleteMany({ where: { siteId } });

    const useRemoteUrls = shouldUseRemoteUrls();
    const mediaItems = await processMediaItems(site.username, siteId, profile.mediaItems, useRemoteUrls);
    const postsWithUrls = await processImagePosts(site.username, siteId, profile.posts, useRemoteUrls);
    const reelsWithUrls = await processReels(site.username, profile.reels, useRemoteUrls);

    const input = await buildThemedInput({
      username: site.username,
      niche: site.niche,
      tagline: site.tagline || undefined,
      accentColor: undefined,
      profile: {
        fullName: profile.fullName,
        biography: profile.biography,
        businessEmail: profile.businessEmail,
        businessPhone: profile.businessPhone,
      },
      posts: postsWithUrls.map((p) => ({
        imageUrl: p.imageUrl,
        alt: p.alt,
        caption: p.caption,
        shortcode: p.shortcode,
      })),
      mediaItems,
      reels: reelsWithUrls.map((r) => ({
        videoUrl: r.videoUrl,
        posterUrl: r.posterUrl,
        caption: r.caption,
        shortcode: r.shortcode,
      })),
    });

    if (profile.profilePicUrl) {
      const { accentFromImageUrl } = await import("@mic/generator");
      input.accentColor = await accentFromImageUrl(profile.profilePicUrl, site.username);
    }

    let content: SiteContentData = generateSiteContent(input);
    if (env.openaiKey) {
      content = await generateSiteContentWithAI(input, env.openaiKey);
    }

    content.showContactForm =
      site.tier === SiteTier.TAILORED || site.tier === SiteTier.PRO || site.tier === SiteTier.STUDIO;
    content.showCalendar = site.tier === SiteTier.PRO || site.tier === SiteTier.STUDIO;
    content.showFunnel = site.tier === SiteTier.PRO || site.tier === SiteTier.STUDIO;

    const baseCss = await readTemplateFile("css/style.css");
    const css = injectThemeIntoCss(baseCss, content.accentColor, {
      display: content.fontDisplay,
      body: content.fontBody,
    });
    const js = await readTemplateFile("js/main.js");
    const html = renderSiteHtml(content, siteId, env.appUrl);
    const siteJson = JSON.stringify(content, null, 2);

    const files: Record<string, string> = {
      "index.html": html,
      "site.json": siteJson,
      "css/style.css": css,
      "js/main.js": js,
      "manifest.json": JSON.stringify({
        username: site.username,
        template: "instagram-v1",
        generatedAt: new Date().toISOString(),
        mediaCount: mediaItems.length,
      }),
    };

    if (content.showFunnel) {
      files["offer/index.html"] = renderFunnelHtml(content, siteId, env.appUrl);
    }

    if (!useRemoteUrls) {
      await publishSiteBundle(site.username, files);
    } else {
      const { publishSiteBundle: publish } = await import("./storage");
      try {
        await publish(site.username, files);
      } catch {
        /* filesystem optional on serverless */
      }
    }

    const commitSha = await commitSiteFiles(
      site.username,
      Object.entries(files).map(([p, c]) => ({ path: p, content: c })),
      `${options?.sync ? "Sync" : "Generate"} site for @${site.username}`
    );

    const existingContent = await prisma.siteContent.findUnique({ where: { siteId } });

    await prisma.siteContent.upsert({
      where: { siteId },
      create: {
        siteId,
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

    const statusUpdate =
      site.status === SiteStatus.LIVE || site.tier
        ? {}
        : {
            status: SiteStatus.TRIAL,
            trialEndsAt: site.trialEndsAt ?? getTrialEndDate(),
          };

    await prisma.site.update({
      where: { id: siteId },
      data: {
        ...statusUpdate,
        githubPath: `sites/${site.username}`,
        publishedAt: new Date(),
      },
    });

    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: JobStatus.COMPLETED },
    });

    return {
      siteId,
      username: site.username,
      mediaCount: mediaItems.length,
      syncedAt: new Date().toISOString(),
      version: (existingContent?.version ?? 0) + 1,
    };
  } catch (err) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: JobStatus.FAILED, error: err instanceof Error ? err.message : "Unknown error" },
    });
    if (!options?.sync) {
      await prisma.site.update({
        where: { id: siteId },
        data: { status: SiteStatus.DRAFT },
      });
    }
    throw err;
  }
}

function emptyProfile(username: string, tagline: string | null): InstagramProfile {
  return {
    username,
    fullName: username,
    biography: tagline || "",
    profilePicUrl: "",
    followers: 0,
    mediaItems: [],
    posts: [],
    reels: [],
    raw: null,
  };
}

async function processMediaItems(
  username: string,
  siteId: string,
  items: InstagramMediaItem[],
  useRemoteUrls: boolean
): Promise<ProcessedMediaItem[]> {
  const processed: ProcessedMediaItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const base: ProcessedMediaItem = {
      shortcode: item.shortcode,
      type: item.type,
      alt: item.alt,
      caption: item.caption,
      carouselCount: item.carouselItems?.length,
    };

    if (useRemoteUrls) {
      processed.push({
        ...base,
        imageUrl: item.imageUrl,
        videoUrl: item.videoUrl,
        posterUrl: item.posterUrl,
      });
      continue;
    }

    let imageUrl = item.imageUrl;
    let videoUrl = item.videoUrl;
    let posterUrl = item.posterUrl;

    if (item.imageUrl) {
      try {
        const buf = await downloadUrl(item.imageUrl);
        const key = `${username}/posts/${item.shortcode}.jpg`;
        const { uploadBuffer } = await import("./storage");
        const publicUrl = await uploadBuffer(key, buf, "image/jpeg");
        imageUrl = publicUrl.startsWith("http") ? publicUrl : `${env.appUrl}${publicUrl}`;
        await prisma.mediaAsset.create({
          data: {
            siteId,
            type: MediaType.IMAGE,
            storageKey: key,
            publicUrl: imageUrl,
            altText: item.alt,
            sortOrder: i,
            instagramId: item.shortcode,
          },
        });
      } catch {
        imageUrl = item.imageUrl;
      }
    }

    if (item.videoUrl) {
      try {
        const buf = await downloadUrl(item.videoUrl);
        const key = `${username}/posts/${item.shortcode}.mp4`;
        const { uploadBuffer } = await import("./storage");
        const publicUrl = await uploadBuffer(key, buf, "video/mp4");
        videoUrl = publicUrl.startsWith("http") ? publicUrl : `${env.appUrl}${publicUrl}`;
        await prisma.mediaAsset.create({
          data: {
            siteId,
            type: MediaType.VIDEO,
            storageKey: key,
            publicUrl: videoUrl,
            altText: item.alt,
            sortOrder: i,
            instagramId: `${item.shortcode}_video`,
          },
        });
      } catch {
        videoUrl = item.videoUrl;
      }
    }

    processed.push({ ...base, imageUrl, videoUrl, posterUrl: posterUrl || imageUrl });
  }

  return processed;
}

async function processImagePosts(
  username: string,
  siteId: string,
  posts: InstagramProfile["posts"],
  useRemoteUrls: boolean
) {
  const result = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    if (useRemoteUrls) {
      result.push(post);
      continue;
    }
    try {
      const buf = await downloadUrl(post.imageUrl);
      const key = `${username}/images/portfolio-${String(i + 1).padStart(2, "0")}.jpg`;
      const { uploadBuffer } = await import("./storage");
      const publicUrl = await uploadBuffer(key, buf, "image/jpeg");
      result.push({
        ...post,
        imageUrl: publicUrl.startsWith("http") ? publicUrl : `${env.appUrl}${publicUrl}`,
      });
    } catch {
      result.push(post);
    }
  }
  return result;
}

async function processReels(
  username: string,
  reels: InstagramProfile["reels"],
  useRemoteUrls: boolean
) {
  const result = [];
  for (const reel of reels) {
    if (useRemoteUrls) {
      result.push(reel);
      continue;
    }
    try {
      const buf = await downloadUrl(reel.videoUrl);
      const key = `${username}/videos/${reel.shortcode}.mp4`;
      const { uploadBuffer } = await import("./storage");
      const publicUrl = await uploadBuffer(key, buf, "video/mp4");
      result.push({
        ...reel,
        videoUrl: publicUrl.startsWith("http") ? publicUrl : `${env.appUrl}${publicUrl}`,
      });
    } catch {
      result.push(reel);
    }
  }
  return result;
}
