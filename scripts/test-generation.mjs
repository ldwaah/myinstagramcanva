import { fetchInstagramProfile } from "../packages/instagram/src/fetch.ts";
import { buildThemedInput, generateSiteContent } from "../packages/generator/src/content.ts";
import { renderSiteHtml } from "../packages/generator/src/render.ts";
import { injectThemeIntoCss } from "../packages/generator/src/theme.ts";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const users = ["official4dads", "khiagovisuals"];

async function main() {
  const baseCss = readFileSync("templates/instagram-v1/css/style.css", "utf8");
  const js = readFileSync("templates/instagram-v1/js/main.js", "utf8");
  const outDir = "scripts/test-output";
  mkdirSync(outDir, { recursive: true });

  for (const username of users) {
    const profile = await fetchInstagramProfile(username);
    const input = await buildThemedInput({
      username,
      niche: username === "khiagovisuals" ? "PHOTOGRAPHER" : "OTHER",
      profile: {
        fullName: profile.fullName,
        biography: profile.biography,
        profilePicUrl: profile.profilePicUrl,
        followers: profile.followers,
        postCount: profile.postCount,
      },
      posts: profile.posts.map((p) => ({
        imageUrl: p.imageUrl,
        alt: p.alt,
        caption: p.caption,
        shortcode: p.shortcode,
      })),
      mediaItems: profile.mediaItems.map((m) => ({
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

    const content = generateSiteContent(input);
    const css = injectThemeIntoCss(baseCss, content.theme, {
      display: content.fontDisplay,
      body: content.fontBody,
    });
    const html = renderSiteHtml(content, `test-${username}`, "http://localhost:3000");
    const dir = path.join(outDir, username);
    mkdirSync(path.join(dir, "css"), { recursive: true });
    mkdirSync(path.join(dir, "js"), { recursive: true });
    writeFileSync(path.join(dir, "index.html"), html);
    writeFileSync(path.join(dir, "css/style.css"), css);
    writeFileSync(path.join(dir, "js/main.js"), js);
    writeFileSync(path.join(dir, "theme.json"), JSON.stringify({
      accent: content.theme.accent,
      accent2: content.theme.accent2,
      isDark: content.theme.isDark,
      layout: content.layoutVariant,
      fonts: `${content.fontDisplay} / ${content.fontBody}`,
      followers: content.followers,
      posts: content.myPosts.length,
    }, null, 2));
    console.log(username, content.theme.accent, content.theme.accent2, content.layoutVariant, content.fontDisplay);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
