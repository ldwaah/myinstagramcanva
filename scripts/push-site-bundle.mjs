/**
 * Generate site bundle locally (residential IP) and push to production DB.
 *
 * Usage:
 *   npx tsx scripts/push-site-bundle.mjs official4dads khiagovisuals
 */
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fetchInstagramProfile } from "../packages/instagram/src/fetch.ts";
import {
  buildThemedInput,
  generateSiteContent,
  generateSiteContentWithAI,
} from "../packages/generator/src/content.ts";
import { renderSiteHtml } from "../packages/generator/src/render.ts";
import { injectThemeIntoCss } from "../packages/generator/src/theme.ts";

const APP_URL = process.env.PUSH_APP_URL || "https://myinstagramcanva.com";
const SKIP_BUNDLE = process.env.PUSH_SKIP_BUNDLE === "1";
const MAX_BUNDLED_IMAGES = Number(process.env.MAX_BUNDLED_IMAGES ?? 24);
const usernames = process.argv.slice(2);

if (!usernames.length) {
  console.error("Usage: npx tsx scripts/push-site-bundle.mjs <username> [username2...]");
  process.exit(1);
}

const baseCss = readFileSync("templates/instagram-v1/css/style.css", "utf8");
const js = readFileSync("templates/instagram-v1/js/main.js", "utf8");

async function downloadAsBase64(url, contentType) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Referer: "https://www.instagram.com/",
    },
  });
  if (!res.ok) throw new Error(`download failed ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return `__MIC_B64__:${contentType}|${buf.toString("base64")}`;
}

async function bundleUrl(url, relPath, contentType) {
  if (!url?.startsWith("http")) return null;
  try {
    const bundleValue = await downloadAsBase64(url, contentType);
    return { relPath, bundleValue, publicUrl: url };
  } catch (err) {
    console.warn("  bundle skip", relPath, err.message);
    return { relPath, bundleValue: null, publicUrl: url };
  }
}

async function buildBundle(username) {
  console.log(`\nFetching @${username}...`);
  const profile = await fetchInstagramProfile(username);
  console.log(`  ${profile.fullName} · ${profile.followers} followers · ${profile.mediaItems.length} media`);

  const bundleAssets = {};
  let profilePicUrl = profile.profilePicUrl;
  if (profile.profilePicUrl && !SKIP_BUNDLE) {
    const b = await bundleUrl(profile.profilePicUrl, "assets/profile.jpg", "image/jpeg");
    if (b?.bundleValue) {
      bundleAssets[b.relPath] = b.bundleValue;
      profilePicUrl = `/site/${username}/${b.relPath}`;
    }
  }

  const mediaItems = [];
  let bundledCount = profile.profilePicUrl ? 1 : 0;
  for (const item of profile.mediaItems) {
    const next = { ...item };
    if (item.imageUrl && !SKIP_BUNDLE && bundledCount < MAX_BUNDLED_IMAGES) {
      const b = await bundleUrl(item.imageUrl, `assets/posts/${item.shortcode}.jpg`, "image/jpeg");
      if (b?.bundleValue) {
        bundleAssets[b.relPath] = b.bundleValue;
        next.imageUrl = `/site/${username}/${b.relPath}`;
        next.posterUrl = next.imageUrl;
        bundledCount += 1;
      }
    }
    mediaItems.push(next);
  }

  const posts = [];
  for (let i = 0; i < profile.posts.length; i++) {
    const post = profile.posts[i];
    const relPath = `assets/portfolio/portfolio-${String(i + 1).padStart(2, "0")}.jpg`;
    let imageUrl = post.imageUrl;
    if (!SKIP_BUNDLE && bundledCount < MAX_BUNDLED_IMAGES) {
      const b = await bundleUrl(post.imageUrl, relPath, "image/jpeg");
      if (b?.bundleValue) {
        bundleAssets[relPath] = b.bundleValue;
        imageUrl = `/site/${username}/${relPath}`;
        bundledCount += 1;
      }
    }
    posts.push({ ...post, imageUrl });
  }

  const input = await buildThemedInput({
    username,
    niche: username === "khiagovisuals" ? "PHOTOGRAPHER" : "OTHER",
    profile: {
      fullName: profile.fullName,
      biography: profile.biography,
      profilePicUrl,
      followers: profile.followers,
      postCount: profile.postCount,
    },
    posts: posts.map((p) => ({
      imageUrl: p.imageUrl,
      alt: p.alt,
      caption: p.caption,
      shortcode: p.shortcode,
    })),
    mediaItems: mediaItems.map((m) => ({
      shortcode: m.shortcode,
      type: m.type,
      imageUrl: m.imageUrl,
      videoUrl: m.videoUrl,
      posterUrl: m.posterUrl,
      alt: m.alt,
      caption: m.caption,
      carouselCount: m.carouselItems?.length,
    })),
    reels: profile.reels.map((r) => ({
      videoUrl: r.videoUrl,
      posterUrl: r.posterUrl,
      caption: r.caption,
      shortcode: r.shortcode,
    })),
  });

  let content = generateSiteContent(input);
  if (process.env.OPENAI_API_KEY) {
    content = await generateSiteContentWithAI(input, process.env.OPENAI_API_KEY);
  }

  const css = injectThemeIntoCss(baseCss, content.theme, {
    display: content.fontDisplay,
    body: content.fontBody,
  });
  const html = renderSiteHtml(content, `push-${username}`, APP_URL, { useElementLibrary: false });
  const siteJson = JSON.stringify(content, null, 2);

  const files = {
    "index.html": html,
    "site.json": siteJson,
    "css/style.css": css,
    "js/main.js": js,
    ...bundleAssets,
    "manifest.json": JSON.stringify({
      username,
      template: "instagram-v1",
      generatedAt: new Date().toISOString(),
      mediaCount: mediaItems.length,
      source: "push-site-bundle",
    }),
  };

  const outDir = path.join("scripts/test-output", username);
  mkdirSync(path.join(outDir, "css"), { recursive: true });
  writeFileSync(path.join(outDir, "index.html"), html);
  writeFileSync(path.join(outDir, "site.json"), siteJson);

  return { files, content };
}

for (const raw of usernames) {
  const username = raw.replace(/^@/, "").trim().toLowerCase();
  try {
    const { files, content } = await buildBundle(username);
    console.log(`  Generated: ${content.myPosts.length} posts, accent ${content.theme?.accent}`);

    const res = await fetch(`${APP_URL}/api/cron/push-site-bundle?username=${encodeURIComponent(username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files, content: files["site.json"] }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("  Push failed:", data);
      process.exitCode = 1;
    } else {
      console.log("  Pushed:", data);
      console.log(`  Live: ${APP_URL}/site/${username}`);
    }
  } catch (err) {
    console.error("FAILED", username, err);
    process.exitCode = 1;
  }
}
