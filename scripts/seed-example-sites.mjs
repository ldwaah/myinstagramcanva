/**
 * Generate showcase example sites with realistic fake profile data, seed the DB,
 * and push bundles to production.
 *
 * Usage:
 *   npx tsx scripts/seed-example-sites.mjs
 *   PUSH_APP_URL=https://myinstagramcanva.com npx tsx scripts/seed-example-sites.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { PrismaClient, SiteStatus, SiteTier, Niche } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  buildThemedInput,
  generateSiteContent,
  generateSiteContentWithAI,
} from "../packages/generator/src/content.ts";
import { renderSiteHtml } from "../packages/generator/src/render.ts";
import { injectThemeIntoCss } from "../packages/generator/src/theme.ts";

const APP_URL = process.env.PUSH_APP_URL || "https://myinstagramcanva.com";
const CRON_SECRET = process.env.CRON_SECRET;
const MAX_BUNDLED_IMAGES = Number(process.env.MAX_BUNDLED_IMAGES ?? 24);
const ROOT = process.cwd();

const EXAMPLE_USER_EMAIL = "examples@myinstagramcanva.internal";

const EXAMPLES = [
  {
    username: "example-photographer",
    niche: Niche.PHOTOGRAPHER,
    quizAnswers: {
      brandType: "photographer",
      visualStyle: "editorial",
      primaryGoal: "booking",
    },
    profile: {
      fullName: "Maya Chen Photography",
      biography:
        "Portrait and lifestyle photographer based in London. Natural light, honest moments, and editorial frames for brands and creatives.",
      followers: 12400,
      postCount: 284,
    },
    imageSeeds: [
      "mic-ex-photo-1",
      "mic-ex-photo-2",
      "mic-ex-photo-3",
      "mic-ex-photo-4",
      "mic-ex-photo-5",
      "mic-ex-photo-6",
      "mic-ex-photo-7",
      "mic-ex-photo-8",
      "mic-ex-photo-9",
      "mic-ex-photo-10",
      "mic-ex-photo-11",
      "mic-ex-photo-12",
    ],
  },
  {
    username: "example-lifecoach",
    niche: Niche.COACH,
    quizAnswers: {
      brandType: "coach",
      visualStyle: "warm",
      primaryGoal: "contact",
    },
    profile: {
      fullName: "Jordan Ellis Coaching",
      biography:
        "Certified life coach helping ambitious professionals find clarity, confidence and balance. Weekly sessions, group programmes and speaking.",
      followers: 8600,
      postCount: 412,
    },
    imageSeeds: [
      "mic-ex-coach-1",
      "mic-ex-coach-2",
      "mic-ex-coach-3",
      "mic-ex-coach-4",
      "mic-ex-coach-5",
      "mic-ex-coach-6",
      "mic-ex-coach-7",
      "mic-ex-coach-8",
      "mic-ex-coach-9",
      "mic-ex-coach-10",
      "mic-ex-coach-11",
      "mic-ex-coach-12",
    ],
  },
  {
    username: "example-athlete",
    niche: Niche.TRAINER,
    quizAnswers: {
      brandType: "trainer",
      visualStyle: "bold",
      primaryGoal: "booking",
    },
    profile: {
      fullName: "Alex Rivera",
      biography:
        "Pro footballer · Performance training · Matchday content and sponsor partnerships. DM for coaching and brand collabs.",
      followers: 48200,
      postCount: 318,
    },
    imageSeeds: [
      "mic-ex-athlete-1",
      "mic-ex-athlete-2",
      "mic-ex-athlete-3",
      "mic-ex-athlete-4",
      "mic-ex-athlete-5",
      "mic-ex-athlete-6",
      "mic-ex-athlete-7",
      "mic-ex-athlete-8",
      "mic-ex-athlete-9",
      "mic-ex-athlete-10",
      "mic-ex-athlete-11",
      "mic-ex-athlete-12",
    ],
  },
  {
    username: "example-creator",
    niche: Niche.INFLUENCER,
    quizAnswers: {
      brandType: "creator",
      visualStyle: "minimal",
      primaryGoal: "contact",
    },
    profile: {
      fullName: "Studio North Co.",
      biography:
        "Brand studio for creators and small businesses. Strategy, content and launch campaigns that turn Instagram into revenue.",
      followers: 22100,
      postCount: 567,
    },
    imageSeeds: [
      "mic-ex-creator-1",
      "mic-ex-creator-2",
      "mic-ex-creator-3",
      "mic-ex-creator-4",
      "mic-ex-creator-5",
      "mic-ex-creator-6",
      "mic-ex-creator-7",
      "mic-ex-creator-8",
      "mic-ex-creator-9",
      "mic-ex-creator-10",
      "mic-ex-creator-11",
      "mic-ex-creator-12",
    ],
  },
];

const baseCss = readFileSync(path.join(ROOT, "templates/instagram-v1/css/style.css"), "utf8");
const js = readFileSync(path.join(ROOT, "templates/instagram-v1/js/main.js"), "utf8");
const prisma = new PrismaClient();

function picsumUrl(seed, w = 900, h = 900) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

async function downloadAsBase64(url, contentType) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
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

function buildPosts(username, seeds) {
  return seeds.map((seed, i) => ({
    imageUrl: picsumUrl(seed),
    alt: `Portfolio frame ${i + 1}`,
    caption: `Featured work from @${username.replace("example-", "")} · frame ${i + 1}`,
    shortcode: `ex${String(i + 1).padStart(4, "0")}`,
  }));
}

function buildMediaItems(posts) {
  return posts.map((p) => ({
    shortcode: p.shortcode,
    type: "image",
    imageUrl: p.imageUrl,
    posterUrl: p.imageUrl,
    alt: p.alt,
    caption: p.caption,
  }));
}

async function ensureExampleUser() {
  const existing = await prisma.user.findUnique({ where: { email: EXAMPLE_USER_EMAIL } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: EXAMPLE_USER_EMAIL,
      name: "Showcase Examples",
      passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
    },
  });
}

async function ensureExampleSite(userId, spec) {
  const subdomain = `${spec.username}.myinstagramcanva.com`;
  const existing = await prisma.site.findUnique({ where: { username: spec.username } });

  if (existing) {
    return prisma.site.update({
      where: { id: existing.id },
      data: {
        status: SiteStatus.LIVE,
        tier: SiteTier.PRO,
        niche: spec.niche,
        isPreview: false,
        previewToken: null,
        publishedAt: new Date(),
        quizAnswers: JSON.stringify(spec.quizAnswers),
      },
    });
  }

  return prisma.site.create({
    data: {
      userId,
      username: spec.username,
      subdomain,
      status: SiteStatus.LIVE,
      tier: SiteTier.PRO,
      niche: spec.niche,
      githubPath: `sites/${spec.username}`,
      isPreview: false,
      publishedAt: new Date(),
      quizAnswers: JSON.stringify(spec.quizAnswers),
    },
  });
}

async function buildBundle(spec) {
  const { username } = spec;
  console.log(`\nGenerating ${username}...`);

  const posts = buildPosts(username, spec.imageSeeds);
  const mediaItems = buildMediaItems(posts);
  const bundleAssets = {};
  let bundledCount = 0;

  let profilePicUrl = picsumUrl(`${spec.imageSeeds[0]}-avatar`, 400, 400);
  const profileBundle = await bundleUrl(profilePicUrl, "assets/profile.jpg", "image/jpeg");
  if (profileBundle?.bundleValue) {
    bundleAssets[profileBundle.relPath] = profileBundle.bundleValue;
    profilePicUrl = `/site/${username}/${profileBundle.relPath}`;
    bundledCount += 1;
  }

  const bundledPosts = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    let imageUrl = post.imageUrl;
    if (bundledCount < MAX_BUNDLED_IMAGES) {
      const relPath = `assets/posts/${post.shortcode}.jpg`;
      const b = await bundleUrl(post.imageUrl, relPath, "image/jpeg");
      if (b?.bundleValue) {
        bundleAssets[b.relPath] = b.bundleValue;
        imageUrl = `/site/${username}/${relPath}`;
        bundledCount += 1;
      }
    }
    bundledPosts.push({ ...post, imageUrl });
  }

  const portfolioPosts = [];
  for (let i = 0; i < bundledPosts.length; i++) {
    const post = bundledPosts[i];
    const relPath = `assets/portfolio/portfolio-${String(i + 1).padStart(2, "0")}.jpg`;
    let imageUrl = post.imageUrl;
    if (typeof imageUrl === "string" && imageUrl.startsWith("http") && bundledCount < MAX_BUNDLED_IMAGES) {
      const b = await bundleUrl(imageUrl, relPath, "image/jpeg");
      if (b?.bundleValue) {
        bundleAssets[b.relPath] = b.bundleValue;
        imageUrl = `/site/${username}/${relPath}`;
        bundledCount += 1;
      }
    }
    portfolioPosts.push({ ...post, imageUrl });
  }

  const bundledMedia = mediaItems.map((m, i) => ({
    ...m,
    imageUrl: bundledPosts[i]?.imageUrl ?? m.imageUrl,
    posterUrl: bundledPosts[i]?.imageUrl ?? m.imageUrl,
  }));

  const input = await buildThemedInput({
    username,
    niche: spec.niche,
    quizAnswers: spec.quizAnswers,
    profile: {
      ...spec.profile,
      profilePicUrl,
    },
    posts: portfolioPosts.map((p) => ({
      imageUrl: p.imageUrl,
      alt: p.alt,
      caption: p.caption,
      shortcode: p.shortcode,
    })),
    mediaItems: bundledMedia,
    reels: [],
  });

  let content = generateSiteContent(input);
  if (process.env.OPENAI_API_KEY) {
    content = await generateSiteContentWithAI(input, process.env.OPENAI_API_KEY);
  }

  const css = injectThemeIntoCss(baseCss, content.theme, {
    display: content.fontDisplay,
    body: content.fontBody,
  });

  const html = renderSiteHtml(content, `example-${username}`, APP_URL, {
    useElementLibrary: true,
    quizAnswers: spec.quizAnswers,
  });

  const siteJson = JSON.stringify(content, null, 2);
  const files = {
    "index.html": html,
    "site.json": siteJson,
    "css/style.css": css,
    "js/main.js": js,
    ...bundleAssets,
    "manifest.json": JSON.stringify({
      username,
      template: "element-library",
      generatedAt: new Date().toISOString(),
      mediaCount: bundledMedia.length,
      source: "seed-example-sites",
    }),
  };

  const outDir = path.join(ROOT, "scripts/test-output", username);
  mkdirSync(path.join(outDir, "css"), { recursive: true });
  writeFileSync(path.join(outDir, "index.html"), html);
  writeFileSync(path.join(outDir, "site.json"), siteJson);

  const previewDir = path.join(ROOT, "apps/web/public/examples");
  mkdirSync(previewDir, { recursive: true });
  const previewPath = path.join(previewDir, `${username}-preview.jpg`);
  if (profileBundle?.bundleValue) {
    const raw = profileBundle.bundleValue.split("|")[1];
    writeFileSync(previewPath, Buffer.from(raw, "base64"));
  } else {
    try {
      const res = await fetch(picsumUrl(`${spec.imageSeeds[0]}-preview`, 800, 600));
      if (res.ok) {
        writeFileSync(previewPath, Buffer.from(await res.arrayBuffer()));
      }
    } catch {
      console.warn("  preview image skip", username);
    }
  }

  return { files, content };
}

async function pushBundle(username, files) {
  const headers = { "Content-Type": "application/json" };
  if (CRON_SECRET) headers.Authorization = `Bearer ${CRON_SECRET}`;

  const res = await fetch(
    `${APP_URL}/api/cron/push-site-bundle?username=${encodeURIComponent(username)}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ files, content: files["site.json"] }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data;
}

async function main() {
  const user = await ensureExampleUser();
  console.log("Example owner:", user.email);

  for (const spec of EXAMPLES) {
    await ensureExampleSite(user.id, spec);
    const { files, content } = await buildBundle(spec);
    console.log(`  Generated: ${content.myPosts.length} posts, layout ${content.layoutVariant}`);

    try {
      const pushed = await pushBundle(spec.username, files);
      console.log("  Pushed:", pushed);
      console.log(`  Live: ${APP_URL}/site/${spec.username}`);
    } catch (err) {
      console.error("  Push failed (DB seeded locally):", err.message);
      console.log(`  Preview files in scripts/test-output/${spec.username}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
