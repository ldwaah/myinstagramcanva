import fs from "fs/promises";
import path from "path";
import { prisma, SiteStatus, SiteTier, JobStatus } from "@mic/db";
import { fetchInstagramProfile } from "@mic/instagram";
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

const TEMPLATE_ROOT = path.join(process.cwd(), "../../templates/instagram-v1");
const IS_SERVERLESS = Boolean(process.env.VERCEL);
const HAS_R2 = Boolean(env.r2.accessKeyId && env.r2.accountId);

function shouldUseRemoteUrls() {
  return IS_SERVERLESS && !HAS_R2;
}

export async function runSiteGeneration(siteId: string, userId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { instagramProfile: true },
  });
  if (!site || site.userId !== userId) throw new Error("Site not found");

  const job = await prisma.generationJob.create({
    data: { siteId, userId, status: JobStatus.RUNNING },
  });

  try {
    await prisma.site.update({
      where: { id: siteId },
      data: { status: SiteStatus.GENERATING },
    });

    let profile;
    try {
      profile = await fetchInstagramProfile(site.username);
    } catch {
      profile = {
        username: site.username,
        fullName: site.username,
        biography: site.tagline || "",
        profilePicUrl: "",
        followers: 0,
        posts: [],
        reels: [],
        raw: null,
      };
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

    const useRemoteUrls = shouldUseRemoteUrls();
    const postsWithUrls = [];

    for (let i = 0; i < profile.posts.length; i++) {
      const post = profile.posts[i];
      if (useRemoteUrls) {
        postsWithUrls.push(post);
        continue;
      }
      try {
        const buf = await downloadUrl(post.imageUrl);
        const key = `${site.username}/images/portfolio-${String(i + 1).padStart(2, "0")}.jpg`;
        const { uploadBuffer } = await import("./storage");
        const publicUrl = await uploadBuffer(key, buf, "image/jpeg");
        postsWithUrls.push({
          ...post,
          imageUrl: publicUrl.startsWith("http") ? publicUrl : `${env.appUrl}${publicUrl}`,
        });
        await prisma.mediaAsset.create({
          data: {
            siteId,
            type: "IMAGE",
            storageKey: key,
            publicUrl: publicUrl.startsWith("http") ? publicUrl : `${env.appUrl}${publicUrl}`,
            altText: post.alt,
            sortOrder: i,
            instagramId: post.shortcode,
          },
        });
      } catch {
        postsWithUrls.push(post);
      }
    }

    const reelsWithUrls = [];
    for (const reel of profile.reels) {
      if (useRemoteUrls) {
        reelsWithUrls.push(reel);
        continue;
      }
      try {
        const buf = await downloadUrl(reel.videoUrl);
        const key = `${site.username}/videos/${reel.shortcode}.mp4`;
        const { uploadBuffer } = await import("./storage");
        const publicUrl = await uploadBuffer(key, buf, "video/mp4");
        reelsWithUrls.push({
          ...reel,
          videoUrl: publicUrl.startsWith("http") ? publicUrl : `${env.appUrl}${publicUrl}`,
        });
      } catch {
        reelsWithUrls.push(reel);
      }
    }

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
      reels: reelsWithUrls.map((r) => ({
        videoUrl: r.videoUrl,
        posterUrl: r.posterUrl,
        caption: r.caption,
        shortcode: r.shortcode,
      })),
    });

    // Prefer profile pic for accent when available
    if (profile.profilePicUrl) {
      const { accentFromImageUrl } = await import("@mic/generator");
      input.accentColor = await accentFromImageUrl(profile.profilePicUrl, site.username);
    }

    let content: SiteContentData = generateSiteContent(input);
    if (env.openaiKey) {
      content = await generateSiteContentWithAI(input, env.openaiKey);
    }

    content.showContactForm = site.tier === SiteTier.TAILORED || site.tier === SiteTier.PRO || site.tier === SiteTier.STUDIO;
    content.showCalendar = site.tier === SiteTier.PRO || site.tier === SiteTier.STUDIO;
    content.showFunnel = site.tier === SiteTier.PRO || site.tier === SiteTier.STUDIO;

    const baseCss = await fs.readFile(path.join(TEMPLATE_ROOT, "css/style.css"), "utf8");
    const css = injectThemeIntoCss(baseCss, content.accentColor, {
      display: content.fontDisplay,
      body: content.fontBody,
    });
    const js = await fs.readFile(path.join(TEMPLATE_ROOT, "js/main.js"), "utf8");
    const html = renderSiteHtml(content, siteId, env.appUrl);
    const siteJson = JSON.stringify(content, null, 2);

    const files: Record<string, string> = {
      "index.html": html,
      "site.json": siteJson,
      "css/style.css": css,
      "js/main.js": js,
      "manifest.json": JSON.stringify({ username: site.username, template: "instagram-v1", generatedAt: new Date().toISOString() }),
    };

    if (content.showFunnel) {
      files["offer/index.html"] = renderFunnelHtml(content, siteId, env.appUrl);
    }

    if (!useRemoteUrls) {
      await publishSiteBundle(site.username, files);
    } else {
      // Still write locally when not on Vercel (dev)
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
      `Generate site for @${site.username}`
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

    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: SiteStatus.TRIAL,
        trialEndsAt: getTrialEndDate(),
        githubPath: `sites/${site.username}`,
        publishedAt: new Date(),
      },
    });

    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: JobStatus.COMPLETED },
    });

    return { siteId, username: site.username };
  } catch (err) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: JobStatus.FAILED, error: err instanceof Error ? err.message : "Unknown error" },
    });
    await prisma.site.update({
      where: { id: siteId },
      data: { status: SiteStatus.DRAFT },
    });
    throw err;
  }
}
