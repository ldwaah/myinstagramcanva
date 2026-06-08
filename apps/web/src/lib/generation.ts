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
import { readTemplateFile } from "./template-assets";
import { bundleRemoteAsset } from "./bundle-media";

const HAS_R2 = Boolean(env.r2.accessKeyId && env.r2.accountId);

function siteAssetUrl(username: string, relPath: string) {
  return `/site/${username}/${relPath}`;
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

    const bundleAssets: Record<string, string> = {};
    let profilePicUrl = profile.profilePicUrl;

    if (profile.profilePicUrl) {
      const bundled = await resolveAssetUrl(
        site.username,
        siteId,
        profile.profilePicUrl,
        `assets/profile.jpg`,
        "image/jpeg",
        bundleAssets,
        { type: MediaType.IMAGE, alt: profile.fullName, sortOrder: -1, instagramId: "profile" }
      );
      if (bundled) profilePicUrl = bundled;
    }

    const mediaItems = await processMediaItems(site.username, siteId, profile.mediaItems, bundleAssets);
    const postsWithUrls = await processImagePosts(site.username, siteId, profile.posts, bundleAssets);
    const reelsWithUrls = await processReels(site.username, siteId, profile.reels, bundleAssets);

    const input = await buildThemedInput({
      username: site.username,
      niche: site.niche,
      tagline: site.tagline || undefined,
      accentColor: undefined,
      profile: {
        fullName: profile.fullName,
        biography: profile.biography,
        profilePicUrl,
        followers: profile.followers,
        postCount: profile.postCount,
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

    if (profilePicUrl) {
      const { accentFromImageUrl } = await import("@mic/generator");
      input.accentColor = await accentFromImageUrl(profilePicUrl, site.username);
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
      ...bundleAssets,
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

    try {
      await publishSiteBundle(site.username, files);
    } catch {
      /* filesystem optional on serverless */
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
      site.status === SiteStatus.LIVE || site.status === SiteStatus.TRIAL || site.tier
        ? {}
        : { status: SiteStatus.DRAFT };

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
    postCount: 0,
    mediaItems: [],
    posts: [],
    reels: [],
    raw: null,
  };
}

async function resolveAssetUrl(
  username: string,
  siteId: string,
  remoteUrl: string,
  relPath: string,
  contentType: string,
  bundleAssets: Record<string, string>,
  assetMeta?: {
    type: MediaType;
    alt: string;
    sortOrder: number;
    instagramId: string;
  }
): Promise<string | null> {
  if (HAS_R2) {
    try {
      const buf = await downloadUrl(remoteUrl);
      const key = `${username}/${relPath.replace(/^assets\//, "")}`;
      const { uploadBuffer } = await import("./storage");
      const publicUrl = await uploadBuffer(key, buf, contentType);
      const resolved = publicUrl.startsWith("http") ? publicUrl : `${env.appUrl}${publicUrl}`;
      if (assetMeta) {
        await prisma.mediaAsset.create({
          data: {
            siteId,
            type: assetMeta.type,
            storageKey: key,
            publicUrl: resolved,
            altText: assetMeta.alt,
            sortOrder: assetMeta.sortOrder,
            instagramId: assetMeta.instagramId,
          },
        });
      }
      return resolved;
    } catch {
      /* fall through to bundle */
    }
  }

  const bundled = await bundleRemoteAsset(remoteUrl, relPath, contentType);
  if (!bundled) return null;
  bundleAssets[bundled.relPath] = bundled.bundleValue;
  return siteAssetUrl(username, bundled.relPath);
}

async function processMediaItems(
  username: string,
  siteId: string,
  items: InstagramMediaItem[],
  bundleAssets: Record<string, string>
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

    let imageUrl = item.imageUrl;
    let videoUrl = item.videoUrl;
    let posterUrl = item.posterUrl;

    if (item.imageUrl) {
      const resolved = await resolveAssetUrl(
        username,
        siteId,
        item.imageUrl,
        `assets/posts/${item.shortcode}.jpg`,
        "image/jpeg",
        bundleAssets,
        { type: MediaType.IMAGE, alt: item.alt, sortOrder: i, instagramId: item.shortcode }
      );
      if (resolved) imageUrl = resolved;
    }

    if (item.videoUrl) {
      const resolved = await resolveAssetUrl(
        username,
        siteId,
        item.videoUrl,
        `assets/posts/${item.shortcode}.mp4`,
        "video/mp4",
        bundleAssets,
        { type: MediaType.VIDEO, alt: item.alt, sortOrder: i, instagramId: `${item.shortcode}_video` }
      );
      if (resolved) videoUrl = resolved;
    }

    if (item.posterUrl && item.posterUrl !== item.imageUrl) {
      const resolved = await resolveAssetUrl(
        username,
        siteId,
        item.posterUrl,
        `assets/posts/${item.shortcode}-poster.jpg`,
        "image/jpeg",
        bundleAssets
      );
      if (resolved) posterUrl = resolved;
    }

    processed.push({ ...base, imageUrl, videoUrl, posterUrl: posterUrl || imageUrl });
  }

  return processed;
}

async function processImagePosts(
  username: string,
  siteId: string,
  posts: InstagramProfile["posts"],
  bundleAssets: Record<string, string>
) {
  const result = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const relPath = `assets/portfolio/portfolio-${String(i + 1).padStart(2, "0")}.jpg`;
    const resolved = await resolveAssetUrl(
      username,
      siteId,
      post.imageUrl,
      relPath,
      "image/jpeg",
      bundleAssets,
      { type: MediaType.IMAGE, alt: post.alt, sortOrder: i, instagramId: post.shortcode }
    );
    result.push({
      ...post,
      imageUrl: resolved || post.imageUrl,
    });
  }
  return result;
}

async function processReels(
  username: string,
  siteId: string,
  reels: InstagramProfile["reels"],
  bundleAssets: Record<string, string>
) {
  const result = [];
  for (const reel of reels) {
    const videoUrl = await resolveAssetUrl(
      username,
      siteId,
      reel.videoUrl,
      `assets/reels/${reel.shortcode}.mp4`,
      "video/mp4",
      bundleAssets,
      { type: MediaType.VIDEO, alt: reel.caption, sortOrder: 0, instagramId: reel.shortcode }
    );
    const posterUrl = reel.posterUrl
      ? await resolveAssetUrl(
          username,
          siteId,
          reel.posterUrl,
          `assets/reels/${reel.shortcode}-poster.jpg`,
          "image/jpeg",
          bundleAssets
        )
      : null;
    result.push({
      ...reel,
      videoUrl: videoUrl || reel.videoUrl,
      posterUrl: posterUrl || reel.posterUrl,
    });
  }
  return result;
}
