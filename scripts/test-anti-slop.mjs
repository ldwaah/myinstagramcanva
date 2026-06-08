/**
 * Anti-slop verification for official4dads sample generation.
 * Run: npx tsx scripts/test-anti-slop.mjs
 */
import { fetchInstagramProfile } from "../packages/instagram/src/fetch.ts";
import {
  buildThemedInput,
  generateSiteContent,
  generateSiteContentWithAI,
} from "../packages/generator/src/content.ts";
import { renderSiteHtml } from "../packages/generator/src/render.ts";
import { countLayoutCtas } from "../packages/generator/src/layout-cta-limit.ts";
import { containsEmDash } from "../packages/generator/src/sanitize-copy.ts";
import { suggestLayoutForNiche } from "../packages/generator/src/element-library.ts";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const USERNAME = "official4dads";

function collectCopyFields(content) {
  return [
    content.heroEyebrow,
    ...content.heroTitle,
    content.heroSubtitle,
    content.aboutBody,
    content.contactTitle,
    content.contactSubtitle,
    content.metaDescription,
    content.marqueeText,
    content.tagline,
    ...content.services.flatMap((s) => [s.title, s.description]),
    ...content.aboutBullets,
  ].filter(Boolean);
}

async function main() {
  const profile = await fetchInstagramProfile(USERNAME);
  const input = await buildThemedInput({
    username: USERNAME,
    niche: "OTHER",
    quizAnswers: { brandType: "creator", visualStyle: "minimal", primaryGoal: "contact" },
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

  let content = generateSiteContent(input);

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    content = await generateSiteContentWithAI(input, apiKey);
    console.log("Using OpenAI structured copy");
  } else {
    console.log("No OPENAI_API_KEY — testing seed copy + sanitisation path only");
  }

  const layoutId = suggestLayoutForNiche(content.niche, "creator", input.quizAnswers);
  const html = renderSiteHtml(content, `test-${USERNAME}`, "http://localhost:3000", {
    useElementLibrary: true,
    layoutId,
    quizAnswers: input.quizAnswers,
    sparseLayout: true,
  });

  const copyFields = collectCopyFields(content);
  const dashHits = copyFields.filter((f) => containsEmDash(f));
  const ctaCount = countLayoutCtas(html);

  const outDir = path.join("scripts/test-output", USERNAME);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "index-library.html"), html);
  writeFileSync(
    path.join(outDir, "copy-sample.json"),
    JSON.stringify(
      {
        heroTitle: content.heroTitle,
        heroSubtitle: content.heroSubtitle,
        aboutBody: content.aboutBody,
        contactTitle: content.contactTitle,
        ctaCount,
        layoutId,
      },
      null,
      2,
    ),
  );

  console.log("\n--- Anti-slop report ---");
  console.log("Layout:", layoutId);
  console.log("CTA buttons (el-btn):", ctaCount, ctaCount <= 2 ? "OK" : "FAIL");
  console.log("Em dash in copy:", dashHits.length ? `FAIL (${dashHits.length})` : "OK");
  if (dashHits.length) dashHits.forEach((h) => console.log(" ", h.slice(0, 80)));

  console.log("\nSample copy:");
  console.log("  heroTitle:", content.heroTitle.join(" / "));
  console.log("  heroSubtitle:", content.heroSubtitle.slice(0, 120));
  console.log("  aboutBody:", content.aboutBody.slice(0, 160));

  if (dashHits.length || ctaCount > 2) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
