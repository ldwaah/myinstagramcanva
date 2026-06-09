import { prisma, SiteStatus, SiteTier, JobStatus, MediaType, type Niche } from "@mic/db";
import {
  fetchInstagramProfile,
  isProfileUsable,
  profileFromRawPayload,
  type InstagramMediaItem,
  type InstagramProfile,
} from "@mic/instagram";
import {
  generateSiteContent,
  generateSiteContentWithAI,
  renderSiteHtml,
  renderFunnelHtml,
  buildThemedInput,
  injectThemeIntoCss,
  suggestLayoutForNiche,
  type SiteContentData,
} from "@mic/generator";
import { classifyNiche } from "./niche";
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

const QUIZ_WAIT_MS = 45_000;

function isSiteContentRich(row: { content?: string | null; bundle?: string | null }): boolean {
  if (row.bundle) {
    try {
      const files = JSON.parse(row.bundle) as Record<string, string>;
      if (Object.keys(files).some((key) => key.startsWith("assets/"))) return true;
    } catch {
      /* ignore corrupt bundle */
    }
  }
  if (row.content) {
    try {
      const data = JSON.parse(row.content) as Pick<
        SiteContentData,
        "heroImageUrl" | "profilePicUrl" | "portfolioItems" | "myPosts"
      >;
      if (data.heroImageUrl || data.profilePicUrl) return true;
      if (Array.isArray(data.portfolioItems) && data.portfolioItems.length > 0) return true;
      if (Array.isArray(data.myPosts) && data.myPosts.length > 0) return true;
    } catch {
      /* ignore corrupt content */
    }
  }
  return false;
}

async function resolveQuizContext(
  siteId: string,
  isPreview: boolean,
  existingQuiz: string | null | undefined,
  currentNiche: Niche
) {
  let quizRaw = existingQuiz;

  if (isPreview && !quizRaw) {
    const deadline = Date.now() + QUIZ_WAIT_MS;
    while (Date.now() < deadline) {
      const row = await prisma.site.findUnique({
        where: { id: siteId },
        select: { quizAnswers: true },
      });
      if (row?.quizAnswers) {
        quizRaw = row.quizAnswers;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  let quizAnswers: Record<string, string> = {};
  if (quizRaw) {
    try {
      quizAnswers = JSON.parse(quizRaw) as Record<string, string>;
    } catch {
      quizAnswers = {};
    }
  }

  const igProfile = await prisma.instagramProfile.findUnique({
    where: { siteId },
    select: { biography: true },
  });

  const classified = classifyNiche(quizAnswers, igProfile?.biography);
  const layoutHint = quizAnswers.layoutHint ?? classified.layoutHint;

  const fresh = await prisma.site.findUnique({
    where: { id: siteId },
    select: { niche: true },
  });

  const niche = classified.niche ?? fresh?.niche ?? currentNiche;

  if (quizAnswers.brandType || igProfile?.biography) {
    await prisma.site.update({
      where: { id: siteId },
      data: { niche },
    });
  }

  return {
    niche,
    quizAnswers,
    layoutHint,
  };
}

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

    let profile: InstagramProfile | ReturnType<typeof emptyProfile> | undefined;
    let igFetchSucceeded = false;
    let igFetchError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        profile = await fetchInstagramProfile(site.username);
        igFetchSucceeded = true;
        igFetchError = undefined;
        break;
      } catch (err) {
        igFetchError = err;
        console.warn(`[generation] IG fetch attempt ${attempt + 1} failed for @${site.username}`, err);
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        }
      }
    }
    if (!igFetchSucceeded) {
      if (site.instagramProfile?.rawPayload) {
        try {
          const cached = profileFromRawPayload(
            JSON.parse(site.instagramProfile.rawPayload),
            site.username,
          );
          if (cached && isProfileUsable(cached)) {
            profile = cached;
            console.warn(`[generation] Using cached IG profile for @${site.username}`);
          }
        } catch {
          /* ignore corrupt cache */
        }
      }
      if (!profile) {
        console.error(`[generation] IG fetch failed for @${site.username}, using empty profile`, igFetchError);
        profile = emptyProfile(site.username, site.tagline);
      }
    }

    const resolvedProfile =
      profile ?? emptyProfile(site.username, site.tagline);
    const profileUsable = isProfileUsable(resolvedProfile);

    const existingContent = await prisma.siteContent.findUnique({ where: { siteId } });
    if (existingContent && isSiteContentRich(existingContent) && !profileUsable) {
      console.warn(
        `[generation] Preserving existing siteContent for @${site.username} — IG unavailable on server`,
      );

      const statusUpdate =
        site.status === SiteStatus.LIVE || site.status === SiteStatus.TRIAL || site.tier
          ? {}
          : { status: SiteStatus.DRAFT };

      await prisma.site.update({
        where: { id: siteId },
        data: statusUpdate,
      });

      await prisma.generationJob.update({
        where: { id: job.id },
        data: { status: JobStatus.COMPLETED },
      });

      return {
        siteId,
        username: site.username,
        mediaCount: 0,
        preservedExisting: true,
        syncedAt: new Date().toISOString(),
        version: existingContent.version,
      };
    }

    if (igFetchSucceeded && profileUsable) {
      await prisma.instagramProfile.upsert({
        where: { siteId },
        create: {
          siteId,
          username: resolvedProfile.username,
          fullName: resolvedProfile.fullName,
          biography: resolvedProfile.biography,
          profilePicUrl: resolvedProfile.profilePicUrl,
          followers: resolvedProfile.followers,
          rawPayload: JSON.stringify(resolvedProfile.raw),
        },
        update: {
          fullName: resolvedProfile.fullName,
          biography: resolvedProfile.biography,
          profilePicUrl: resolvedProfile.profilePicUrl,
          followers: resolvedProfile.followers,
          rawPayload: JSON.stringify(resolvedProfile.raw),
          lastSyncedAt: new Date(),
        },
      });

      await prisma.mediaAsset.deleteMany({ where: { siteId } });
    }

    const bundleAssets: Record<string, string> = {};
    let profilePicUrl = resolvedProfile.profilePicUrl;

    if (resolvedProfile.profilePicUrl) {
      const bundled = await resolveAssetUrl(
        site.username,
        siteId,
        resolvedProfile.profilePicUrl,
        `assets/profile.jpg`,
        "image/jpeg",
        bundleAssets,
        { type: MediaType.IMAGE, alt: resolvedProfile.fullName, sortOrder: -1, instagramId: "profile" }
      );
      if (bundled) profilePicUrl = bundled;
    }

    const mediaItems = await processMediaItems(site.username, siteId, resolvedProfile.mediaItems, bundleAssets);
    const postsWithUrls = await processImagePosts(site.username, siteId, resolvedProfile.posts, bundleAssets);
    const reelsWithUrls = await processReels(site.username, siteId, resolvedProfile.reels, bundleAssets);

    const quizData = await resolveQuizContext(siteId, site.isPreview, site.quizAnswers, site.niche);

    const input = await buildThemedInput({
      username: site.username,
      niche: quizData.niche,
      quizAnswers: quizData.quizAnswers,
      layoutHint: quizData.layoutHint,
      tagline: site.tagline || undefined,
      accentColor: undefined,
      profile: {
        fullName: resolvedProfile.fullName,
        biography: resolvedProfile.biography,
        profilePicUrl,
        followers: resolvedProfile.followers,
        postCount: resolvedProfile.postCount || mediaItems.length,
        businessEmail: resolvedProfile.businessEmail,
        businessPhone: resolvedProfile.businessPhone,
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

    let content: SiteContentData = generateSiteContent(input);
    if (env.openaiKey) {
      content = await generateSiteContentWithAI(input, env.openaiKey);
    }

    content.showContactForm =
      site.tier === SiteTier.CREATOR || site.tier === SiteTier.PRO || site.tier === SiteTier.STUDIO;
    content.showCalendar = site.tier === SiteTier.PRO || site.tier === SiteTier.STUDIO;
    content.showFunnel = site.tier === SiteTier.PRO || site.tier === SiteTier.STUDIO;

    const baseCss = await readTemplateFile("css/style.css");
    const css = injectThemeIntoCss(baseCss, content.theme, {
      display: content.fontDisplay,
      body: content.fontBody,
    });
    const js = await readTemplateFile("js/main.js");
    const html = renderSiteHtml(content, siteId, env.appUrl, {
      useElementLibrary: false,
      layoutId: suggestLayoutForNiche(content.niche, quizData.layoutHint, quizData.quizAnswers),
      layoutHint: quizData.layoutHint,
      quizAnswers: quizData.quizAnswers,
      sparseLayout: true,
    });
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
        niche: quizData.niche,
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
  if (!bundled) return remoteUrl.startsWith("http") ? remoteUrl : null;
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
