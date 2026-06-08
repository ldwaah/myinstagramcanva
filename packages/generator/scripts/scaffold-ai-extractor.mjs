#!/usr/bin/env node
/**
 * Scaffolds ai-extractor elements, palettes, layouts, and design-system files.
 * Run: node packages/generator/scripts/scaffold-ai-extractor.mjs
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "ai-extractor");

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

function writeElement(category, id, data) {
  const dir = join(ROOT, "elements", category, id);
  ensureDir(dir);
  const meta = {
    id,
    category,
    tags: data.tags,
    niche: data.niche,
    style: data.style,
    tokens: data.tokens,
    description: data.description,
  };
  writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
  writeFileSync(join(dir, "snippet.html"), data.html.trim() + "\n");
  writeFileSync(join(dir, "styles.css"), data.css.trim() + "\n");
  writeFileSync(join(dir, "element.md"), data.elementMd.trim() + "\n");
}

function patchExistingMeta() {
  const elementsRoot = join(ROOT, "elements");
  const nicheMap = {
    "hero-minimal": ["creator", "coach", "business"],
    "hero-split": ["business", "fashion", "fitness"],
    "hero-full-bleed": ["photographer", "visual", "travel"],
    "hero-profile": ["creator", "instagram", "lifestyle"],
    "hero-cinematic": ["photographer", "sports", "visual"],
    "gallery-grid": ["photographer", "food", "fashion"],
    "gallery-masonry": ["photographer", "interior", "visual"],
    "gallery-carousel": ["fashion", "visual", "sports"],
    "nav-minimal": ["creator", "business", "minimal"],
    "nav-centered": ["photographer", "editorial", "fashion"],
    "footer-minimal": ["creator", "business", "minimal"],
    "footer-social": ["creator", "lifestyle", "fashion"],
    "footer-sponsor": ["business", "creator", "sports"],
    "about-bio": ["creator", "coach", "business"],
    "about-stats": ["fitness", "business", "creator"],
    "about-split": ["photographer", "coach", "fashion"],
    "contact-form-strip": ["business", "coach", "studio"],
    "contact-cta-band": ["business", "fitness", "creator"],
    "type-scale": ["business", "editorial", "minimal"],
  };
  for (const category of readdirSync(elementsRoot)) {
    const catPath = join(elementsRoot, category);
    if (!statSync(catPath).isDirectory()) continue;
    for (const id of readdirSync(catPath)) {
      const dir = join(catPath, id);
      if (!statSync(dir).isDirectory()) continue;
      const metaPath = join(dir, "meta.json");
      if (!existsSync(metaPath)) continue;
      const meta = JSON.parse(readFileSync(metaPath, "utf8"));
      if (!meta.niche) meta.niche = nicheMap[id] ?? ["creator"];
      writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
      const mdPath = join(dir, "element.md");
      if (!existsSync(mdPath) && meta.description) {
        writeFileSync(
          mdPath,
          `Use **${id}** for ${meta.description.toLowerCase()}. Tags: ${meta.tags.join(", ")}. Style: ${meta.style}.\n`,
        );
      }
    }
  }
}

// ─── NEW ELEMENTS ───────────────────────────────────────────────────────────

const NEW = [
  // HEROES (+5 → 10)
  {
    category: "heroes", id: "hero-editorial-tag",
    tags: ["editorial", "photographer", "fashion"], niche: ["photographer", "fashion", "editorial"],
    style: "squarespace-editorial", tokens: "low",
    description: "Numbered eyebrow, oversized serif headline, single accent CTA",
    elementMd: "Use when the creator needs editorial gravitas — photographers, stylists, or luxury brands. The numbered tag creates magazine-style rhythm without heavy imagery.",
    html: `<section class="el-hero-editorial" aria-label="Introduction">
  <div class="el-hero-editorial__inner">
    <span class="el-hero-editorial__tag">01 · {{HERO_EYEBROW}}</span>
    <h1 class="el-hero-editorial__title">{{HERO_TITLE}}</h1>
    <p class="el-hero-editorial__sub">{{HERO_SUBTITLE}}</p>
    <a class="el-btn el-btn--primary" href="#work">Explore work</a>
  </div>
</section>`,
    css: `.el-hero-editorial{padding:clamp(96px,14vw,140px) 24px;background:var(--el-bg,#faf9f7)}
.el-hero-editorial__inner{max-width:800px;margin:0 auto}
.el-hero-editorial__tag{display:block;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--el-accent,#2d5a4a);margin-bottom:32px}
.el-hero-editorial__title{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(2.5rem,7vw,4.5rem);font-weight:400;line-height:1.08;color:var(--el-text,#1a1a1a);margin-bottom:28px}
.el-hero-editorial__sub{font-size:clamp(1rem,2vw,1.2rem);line-height:1.65;color:var(--el-muted,#6b6560);max-width:520px;margin-bottom:40px}`,
  },
  {
    category: "heroes", id: "hero-gradient-mesh",
    tags: ["saas", "tech", "creator"], niche: ["business", "tech", "coach"],
    style: "webflow-modern", tokens: "low",
    description: "Soft mesh gradient backdrop with centred headline and dual CTAs",
    elementMd: "Ideal for coaches, consultants, and SaaS-style personal brands that want a modern feel without stock photography. Uses CSS gradient mesh — no external images.",
    html: `<section class="el-hero-mesh" aria-label="Introduction">
  <div class="el-hero-mesh__bg" aria-hidden="true"></div>
  <div class="el-hero-mesh__inner">
    <p class="el-hero-mesh__eyebrow">{{HERO_EYEBROW}}</p>
    <h1 class="el-hero-mesh__title">{{HERO_TITLE}}</h1>
    <p class="el-hero-mesh__sub">{{HERO_SUBTITLE}}</p>
    <div class="el-hero-mesh__actions">
      <a class="el-btn el-btn--primary" href="#contact">Get started</a>
      <a class="el-btn el-btn--ghost" href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">@{{HANDLE}}</a>
    </div>
  </div>
</section>`,
    css: `.el-hero-mesh{position:relative;padding:clamp(100px,16vw,160px) 24px;text-align:center;overflow:hidden;background:var(--el-bg,#0f1117)}
.el-hero-mesh__bg{position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 20% 40%,color-mix(in srgb,var(--el-accent,#4a7c6f) 25%,transparent),transparent),radial-gradient(ellipse 50% 60% at 80% 60%,color-mix(in srgb,var(--el-accent-dim,#8fb5a8) 20%,transparent),transparent);pointer-events:none}
.el-hero-mesh__inner{position:relative;max-width:720px;margin:0 auto}
.el-hero-mesh__eyebrow{font-size:.75rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--el-muted,#9ca3af);margin-bottom:20px}
.el-hero-mesh__title{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(2.25rem,6vw,3.75rem);line-height:1.12;color:var(--el-text,#f5f5f4);margin-bottom:24px}
.el-hero-mesh__sub{font-size:clamp(1rem,2vw,1.125rem);line-height:1.65;color:var(--el-muted,#9ca3af);max-width:540px;margin:0 auto 36px}
.el-hero-mesh__actions{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}`,
  },
  {
    category: "heroes", id: "hero-asymmetric",
    tags: ["fashion", "business", "editorial"], niche: ["fashion", "business", "beauty"],
    style: "framer-asymmetric", tokens: "medium",
    description: "Left-aligned headline with decorative accent block and stat row",
    elementMd: "Best for fashion, beauty, and business creators who want asymmetry and visual weight on the left. Includes an inline stats row for social proof.",
    html: `<section class="el-hero-asym" aria-label="Introduction">
  <div class="el-hero-asym__grid">
    <div class="el-hero-asym__content">
      <p class="el-hero-asym__eyebrow">{{HERO_EYEBROW}}</p>
      <h1 class="el-hero-asym__title">{{HERO_TITLE}}</h1>
      <p class="el-hero-asym__sub">{{HERO_SUBTITLE}}</p>
      <div class="el-hero-asym__stats">{{STATS_ROW}}</div>
      <a class="el-btn el-btn--primary" href="#work">View portfolio</a>
    </div>
    <div class="el-hero-asym__visual" aria-hidden="true">
      <div class="el-hero-asym__block"></div>
    </div>
  </div>
</section>`,
    css: `.el-hero-asym{padding:clamp(80px,12vw,120px) 24px;background:var(--el-bg,#faf9f7)}
.el-hero-asym__grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;max-width:1120px;margin:0 auto;align-items:center}
@media(max-width:768px){.el-hero-asym__grid{grid-template-columns:1fr}.el-hero-asym__visual{display:none}}
.el-hero-asym__eyebrow{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--el-muted,#6b6560);margin-bottom:16px}
.el-hero-asym__title{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(2.25rem,5vw,3.5rem);line-height:1.12;color:var(--el-text,#1a1a1a);margin-bottom:20px}
.el-hero-asym__sub{font-size:1.0625rem;line-height:1.65;color:var(--el-muted,#6b6560);margin-bottom:32px;max-width:480px}
.el-hero-asym__stats{display:flex;flex-wrap:wrap;gap:24px;font-size:.875rem;color:var(--el-muted,#6b6560);margin-bottom:32px}
.el-hero-asym__stats strong{display:block;font-size:1.25rem;color:var(--el-text,#1a1a1a);font-weight:600}
.el-hero-asym__block{width:100%;aspect-ratio:4/5;border-radius:4px;background:linear-gradient(145deg,var(--el-surface,#f3f2ef),color-mix(in srgb,var(--el-accent,#2d5a4a) 15%,var(--el-surface,#f3f2ef)))}`,
  },
  {
    category: "heroes", id: "hero-overlap-portrait",
    tags: ["coach", "creator", "fitness"], niche: ["fitness", "coach", "lifestyle"],
    style: "kadence-split", tokens: "medium",
    description: "Portrait placeholder overlapping a soft surface panel with bio CTA",
    elementMd: "Use for personal brands where the creator's face matters — coaches, trainers, lifestyle creators. Portrait uses avatar URL; panel provides contrast.",
    html: `<section class="el-hero-overlap" aria-label="Introduction">
  <div class="el-hero-overlap__inner">
    <div class="el-hero-overlap__panel">
      <p class="el-hero-overlap__eyebrow">{{HERO_EYEBROW}}</p>
      <h1 class="el-hero-overlap__title">{{HERO_TITLE}}</h1>
      <p class="el-hero-overlap__sub">{{HERO_SUBTITLE}}</p>
      <div class="el-hero-overlap__actions">
        <a class="el-btn el-btn--primary" href="#contact">Work with me</a>
        <a class="el-btn el-btn--ghost" href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
    </div>
    <div class="el-hero-overlap__portrait">
      <img src="{{AVATAR_URL}}" alt="{{BRAND_NAME}}" width="400" height="500" fetchpriority="high" />
    </div>
  </div>
</section>`,
    css: `.el-hero-overlap{padding:clamp(64px,10vw,96px) 24px;background:var(--el-bg,#faf9f7);overflow:hidden}
.el-hero-overlap__inner{display:grid;grid-template-columns:1fr auto;gap:0;max-width:1000px;margin:0 auto;align-items:center}
@media(max-width:768px){.el-hero-overlap__inner{grid-template-columns:1fr}.el-hero-overlap__portrait{order:-1;margin-bottom:-40px}}
.el-hero-overlap__panel{background:var(--el-surface,#f3f2ef);padding:clamp(40px,6vw,64px);border-radius:4px;position:relative;z-index:1;margin-right:-80px}
@media(max-width:768px){.el-hero-overlap__panel{margin-right:0}}
.el-hero-overlap__eyebrow{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--el-accent,#2d5a4a);margin-bottom:16px}
.el-hero-overlap__title{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(2rem,5vw,3rem);line-height:1.15;color:var(--el-text,#1a1a1a);margin-bottom:16px}
.el-hero-overlap__sub{font-size:1rem;line-height:1.65;color:var(--el-muted,#6b6560);margin-bottom:28px}
.el-hero-overlap__actions{display:flex;flex-wrap:wrap;gap:12px}
.el-hero-overlap__portrait{width:min(320px,40vw);aspect-ratio:4/5;border-radius:4px;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,.12)}
.el-hero-overlap__portrait img{width:100%;height:100%;object-fit:cover}`,
  },
  {
    category: "heroes", id: "hero-announcement",
    tags: ["business", "creator", "launch"], niche: ["business", "coach", "ecommerce"],
    style: "saas-landing", tokens: "low",
    description: "Top announcement bar plus centred hero with pill CTAs",
    elementMd: "Use for launches, limited offers, or creators promoting a new collection. The announcement bar draws attention without overwhelming the headline.",
    html: `<section class="el-hero-announce" aria-label="Introduction">
  <div class="el-hero-announce__bar">
    <span>{{MARQUEE_TEXT}}</span>
    <a href="#contact">Learn more →</a>
  </div>
  <div class="el-hero-announce__inner">
    <h1 class="el-hero-announce__title">{{HERO_TITLE}}</h1>
    <p class="el-hero-announce__sub">{{HERO_SUBTITLE}}</p>
    <div class="el-hero-announce__actions">
      <a class="el-btn el-btn--pill" href="#contact">Book now</a>
      <a class="el-btn el-btn--ghost" href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">@{{HANDLE}}</a>
    </div>
  </div>
</section>`,
    css: `.el-hero-announce{background:var(--el-bg,#faf9f7)}
.el-hero-announce__bar{display:flex;align-items:center;justify-content:center;gap:16px;padding:12px 24px;background:var(--el-accent,#2d5a4a);color:#fff;font-size:.8125rem}
.el-hero-announce__bar a{color:#fff;text-decoration:underline;text-underline-offset:3px}
.el-hero-announce__inner{padding:clamp(80px,12vw,120px) 24px;text-align:center;max-width:720px;margin:0 auto}
.el-hero-announce__title{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(2.25rem,6vw,3.5rem);line-height:1.12;color:var(--el-text,#1a1a1a);margin-bottom:20px}
.el-hero-announce__sub{font-size:1.0625rem;line-height:1.65;color:var(--el-muted,#6b6560);margin-bottom:32px}
.el-hero-announce__actions{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}`,
  },

  // GALLERIES (+4 → 7)
  {
    category: "galleries", id: "gallery-featured-row",
    tags: ["photographer", "visual", "portfolio"], niche: ["photographer", "fashion", "food"],
    style: "squarespace-portfolio", tokens: "medium",
    description: "One large featured image plus horizontal row of smaller cells",
    elementMd: "Use when one piece of work should dominate — editorial portfolios, food photography, or campaign highlights. Featured cell uses hero image URL.",
    html: `<section class="el-gallery-featured" aria-label="Featured work">
  <div class="el-gallery-featured__head el-section-head">
    <span class="el-section-tag">02 · Portfolio</span>
    <h2>Selected <em>work</em></h2>
    <p>{{TAGLINE}}</p>
  </div>
  <div class="el-gallery-featured__layout">
    <div class="el-gallery-featured__hero">
      <img src="{{HERO_IMAGE_URL}}" alt="{{BRAND_NAME}}" loading="lazy" width="800" height="1000" />
    </div>
    <div class="el-gallery-featured__row">{{ITEMS}}</div>
  </div>
</section>`,
    css: `.el-gallery-featured{padding:clamp(64px,10vw,96px) 24px;max-width:1120px;margin:0 auto}
.el-gallery-featured__layout{display:grid;grid-template-columns:1.2fr 1fr;gap:24px}
@media(max-width:768px){.el-gallery-featured__layout{grid-template-columns:1fr}}
.el-gallery-featured__hero{aspect-ratio:4/5;overflow:hidden;border-radius:2px}
.el-gallery-featured__hero img{width:100%;height:100%;object-fit:cover}
.el-gallery-featured__row{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-content:start}
.el-gallery-featured__row .el-gallery-cell{aspect-ratio:1;overflow:hidden;border-radius:2px;background:var(--el-surface,#f3f2ef)}`,
  },
  {
    category: "galleries", id: "gallery-reel-strip",
    tags: ["instagram", "reels", "video"], niche: ["creator", "fitness", "food"],
    style: "instagram-native", tokens: "medium",
    description: "Horizontal reel strip with 9:16 cards and play affordance",
    elementMd: "Best for creators with strong Reels content — fitness, food, fashion. Horizontal scroll mimics native IG browsing without copying IG UI.",
    html: `<section class="el-gallery-reels" aria-label="Reels">
  <div class="el-gallery-reels__head el-section-head">
    <span class="el-section-tag">Reels</span>
    <h2>Latest <em>reels</em></h2>
  </div>
  <div class="el-gallery-reels__track" role="list">{{ITEMS}}</div>
</section>`,
    css: `.el-gallery-reels{padding:clamp(64px,10vw,96px) 0 clamp(64px,10vw,96px) 24px;overflow:hidden}
.el-gallery-reels__head{padding-right:24px;max-width:1120px}
.el-gallery-reels__track{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;-webkit-overflow-scrolling:touch}
.el-gallery-reels__track::-webkit-scrollbar{height:4px}
.el-gallery-reels__card{flex:0 0 min(240px,70vw);aspect-ratio:9/16;border-radius:4px;overflow:hidden;position:relative;scroll-snap-align:start;background:var(--el-surface,#1a1a1a)}
.el-gallery-reels__card img,.el-gallery-reels__card video{width:100%;height:100%;object-fit:cover}`,
  },
  {
    category: "galleries", id: "gallery-bento",
    tags: ["visual", "creative", "portfolio"], niche: ["designer", "photographer", "food"],
    style: "webflow-bento", tokens: "medium",
    description: "Bento-style asymmetric grid with varied cell sizes",
    elementMd: "Use for visually rich portfolios where variety in cell size creates interest — designers, food bloggers, creative directors.",
    html: `<section class="el-gallery-bento" aria-label="Work grid">
  <div class="el-gallery-bento__head el-section-head">
    <span class="el-section-tag">03 · Gallery</span>
    <h2>Recent <em>projects</em></h2>
  </div>
  <div class="el-gallery-bento__grid" role="list">{{ITEMS}}</div>
</section>`,
    css: `.el-gallery-bento{padding:clamp(64px,10vw,96px) 24px;max-width:1120px;margin:0 auto}
.el-gallery-bento__grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(160px,auto);gap:16px}
.el-gallery-bento__grid .el-bento-cell:nth-child(1){grid-column:span 2;grid-row:span 2}
.el-gallery-bento__grid .el-bento-cell:nth-child(4){grid-column:span 2}
@media(max-width:768px){.el-gallery-bento__grid{grid-template-columns:repeat(2,1fr)}.el-gallery-bento__grid .el-bento-cell:nth-child(1){grid-column:span 2;grid-row:span 1}}
.el-bento-cell{overflow:hidden;border-radius:2px;background:var(--el-surface,#f3f2ef);min-height:160px}
.el-bento-cell img{width:100%;height:100%;object-fit:cover}`,
  },
  {
    category: "galleries", id: "gallery-staggered",
    tags: ["fashion", "photographer", "editorial"], niche: ["fashion", "photographer", "beauty"],
    style: "editorial-offset", tokens: "medium",
    description: "Two-column staggered grid with alternating vertical offset",
    elementMd: "Creates editorial rhythm through vertical offset — ideal for fashion lookbooks and portrait series. Subtle hover lift on cells.",
    html: `<section class="el-gallery-stagger" aria-label="Portfolio">
  <div class="el-gallery-stagger__head el-section-head">
    <span class="el-section-tag">Portfolio</span>
    <h2>Visual <em>stories</em></h2>
  </div>
  <div class="el-gallery-stagger__cols">
    <div class="el-gallery-stagger__col">{{ITEMS}}</div>
  </div>
</section>`,
    css: `.el-gallery-stagger{padding:clamp(64px,10vw,96px) 24px;max-width:960px;margin:0 auto}
.el-gallery-stagger__cols{display:grid;grid-template-columns:1fr 1fr;gap:24px}
@media(max-width:640px){.el-gallery-stagger__cols{grid-template-columns:1fr}}
.el-gallery-stagger__col{display:flex;flex-direction:column;gap:24px}
.el-gallery-stagger__col:nth-child(2){margin-top:48px}
.el-gallery-stagger__cell{aspect-ratio:3/4;overflow:hidden;border-radius:2px;transition:transform .4s ease}
.el-gallery-stagger__cell:hover{transform:translateY(-4px)}
.el-gallery-stagger__cell img{width:100%;height:100%;object-fit:cover}`,
  },

  // NAVIGATION (+3 → 5)
  {
    category: "navigation", id: "nav-sticky-blur",
    tags: ["business", "saas", "modern"], niche: ["business", "coach", "tech"],
    style: "webflow-sticky", tokens: "low",
    description: "Sticky header with backdrop blur and pill CTA",
    elementMd: "Modern sticky nav for business and coach sites. Blur backdrop reads premium on scroll. Include when the page has multiple anchor sections.",
    html: `<header class="el-nav-blur" role="banner">
  <div class="el-nav-blur__inner">
    <a class="el-nav-blur__logo" href="#top">{{BRAND_NAME}}</a>
    <nav class="el-nav-blur__links" aria-label="Primary">
      <a href="#work">Work</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
    <a class="el-nav-blur__cta" href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">Follow</a>
  </div>
</header>`,
    css: `.el-nav-blur{position:sticky;top:0;z-index:100;padding:0 24px;background:color-mix(in srgb,var(--el-bg,#faf9f7) 85%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-nav-blur__inner{display:flex;align-items:center;justify-content:space-between;max-width:1120px;margin:0 auto;height:64px;gap:24px}
.el-nav-blur__logo{font-family:var(--el-font-display,Georgia,serif);font-size:1.125rem;font-weight:600;color:var(--el-text,#1a1a1a);text-decoration:none}
.el-nav-blur__links{display:flex;gap:32px}
.el-nav-blur__links a{font-size:.875rem;color:var(--el-muted,#6b6560);text-decoration:none;transition:color .2s}
.el-nav-blur__links a:hover{color:var(--el-text,#1a1a1a)}
.el-nav-blur__cta{padding:8px 20px;border-radius:999px;background:var(--el-accent,#2d5a4a);color:#fff;font-size:.8125rem;font-weight:500;text-decoration:none}
@media(max-width:640px){.el-nav-blur__links{display:none}}`,
  },
  {
    category: "navigation", id: "nav-overlay-mobile",
    tags: ["creator", "portfolio", "mobile"], niche: ["creator", "photographer", "fashion"],
    style: "squarespace-mobile", tokens: "medium",
    description: "Minimal bar with full-screen mobile overlay menu",
    elementMd: "Use when mobile experience matters — portfolio sites with deep navigation. Desktop shows inline links; mobile uses full-screen overlay.",
    html: `<header class="el-nav-overlay" role="banner">
  <div class="el-nav-overlay__bar">
    <a class="el-nav-overlay__logo" href="#top">{{BRAND_NAME}}</a>
    <button class="el-nav-overlay__toggle" type="button" aria-expanded="false" aria-controls="el-nav-menu" aria-label="Menu"><span></span><span></span></button>
  </div>
  <nav id="el-nav-menu" class="el-nav-overlay__menu" aria-label="Primary" hidden>
    <a href="#work">Work</a>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
    <a href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">@{{HANDLE}}</a>
  </nav>
</header>`,
    css: `.el-nav-overlay{position:relative;z-index:100}
.el-nav-overlay__bar{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;max-width:1120px;margin:0 auto}
.el-nav-overlay__logo{font-family:var(--el-font-display,Georgia,serif);font-size:1.125rem;color:var(--el-text,#1a1a1a);text-decoration:none}
.el-nav-overlay__toggle{display:flex;flex-direction:column;gap:6px;padding:8px;background:none;border:none;cursor:pointer}
.el-nav-overlay__toggle span{display:block;width:24px;height:2px;background:var(--el-text,#1a1a1a)}
.el-nav-overlay__menu{position:fixed;inset:0;background:var(--el-bg,#faf9f7);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;z-index:99}
.el-nav-overlay__menu a{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(1.5rem,5vw,2.5rem);color:var(--el-text,#1a1a1a);text-decoration:none}`,
  },
  {
    category: "navigation", id: "nav-split-logo",
    tags: ["editorial", "fashion", "luxury"], niche: ["fashion", "beauty", "editorial"],
    style: "editorial-split", tokens: "low",
    description: "Centred logo with split left/right navigation links",
    elementMd: "Editorial navigation pattern seen in fashion and luxury Squarespace templates. Logo centred; links split symmetrically.",
    html: `<header class="el-nav-split" role="banner">
  <div class="el-nav-split__inner">
    <nav class="el-nav-split__left" aria-label="Primary left">
      <a href="#work">Work</a>
      <a href="#about">About</a>
    </nav>
    <a class="el-nav-split__logo" href="#top">{{BRAND_NAME}}</a>
    <nav class="el-nav-split__right" aria-label="Primary right">
      <a href="#contact">Contact</a>
      <a href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">IG</a>
    </nav>
  </div>
</header>`,
    css: `.el-nav-split{padding:24px;border-bottom:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-nav-split__inner{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;max-width:1120px;margin:0 auto;gap:24px}
.el-nav-split__logo{font-family:var(--el-font-display,Georgia,serif);font-size:1.25rem;letter-spacing:.04em;color:var(--el-text,#1a1a1a);text-decoration:none;text-align:center}
.el-nav-split__left,.el-nav-split__right{display:flex;gap:32px}
.el-nav-split__right{justify-content:flex-end}
.el-nav-split__left a,.el-nav-split__right a{font-size:.8125rem;letter-spacing:.08em;text-transform:uppercase;color:var(--el-muted,#6b6560);text-decoration:none}
@media(max-width:768px){.el-nav-split__inner{grid-template-columns:1fr;text-align:center}.el-nav-split__left,.el-nav-split__right{justify-content:center}}`,
  },

  // FOOTERS (+2 → 5)
  {
    category: "footers", id: "footer-columns",
    tags: ["business", "studio", "multi-page"], niche: ["business", "studio", "agency"],
    style: "wordpress-columns", tokens: "low",
    description: "Three-column footer with brand, links, and contact",
    elementMd: "Use for business and studio sites needing structured footer navigation. Columns: brand/tagline, quick links, contact details.",
    html: `<footer class="el-footer-cols" role="contentinfo">
  <div class="el-footer-cols__grid">
    <div class="el-footer-cols__brand">
      <span class="el-footer-cols__name">{{BRAND_NAME}}</span>
      <p>{{TAGLINE}}</p>
    </div>
    <nav class="el-footer-cols__links" aria-label="Footer">
      <a href="#work">Work</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
    <div class="el-footer-cols__contact">
      <a href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">@{{HANDLE}}</a>
      {{PHONE_LINK}}
    </div>
  </div>
  <p class="el-footer-cols__copy">© {{YEAR}} {{BRAND_NAME}}</p>
</footer>`,
    css: `.el-footer-cols{padding:clamp(64px,10vw,80px) 24px 32px;background:var(--el-surface,#f3f2ef);border-top:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-footer-cols__grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:48px;max-width:1120px;margin:0 auto 48px}
@media(max-width:768px){.el-footer-cols__grid{grid-template-columns:1fr;gap:32px}}
.el-footer-cols__name{font-family:var(--el-font-display,Georgia,serif);font-size:1.25rem;color:var(--el-text,#1a1a1a);display:block;margin-bottom:8px}
.el-footer-cols__brand p{font-size:.875rem;color:var(--el-muted,#6b6560);line-height:1.6}
.el-footer-cols__links,.el-footer-cols__contact{display:flex;flex-direction:column;gap:12px}
.el-footer-cols__links a,.el-footer-cols__contact a{font-size:.875rem;color:var(--el-muted,#6b6560);text-decoration:none}
.el-footer-cols__copy{text-align:center;font-size:.75rem;color:var(--el-muted,#6b6560);max-width:1120px;margin:0 auto}`,
  },
  {
    category: "footers", id: "footer-newsletter",
    tags: ["creator", "business", "email"], niche: ["business", "coach", "ecommerce"],
    style: "saas-footer", tokens: "medium",
    description: "Footer with inline newsletter signup and social links",
    elementMd: "Use when list-building matters — coaches, consultants, ecommerce creators. Newsletter field is structural; wire to backend separately.",
    html: `<footer class="el-footer-news" role="contentinfo">
  <div class="el-footer-news__inner">
    <div class="el-footer-news__cta">
      <h3>Stay in the loop</h3>
      <p>Updates from {{BRAND_NAME}} — no spam.</p>
    </div>
    <form class="el-footer-news__form" action="#contact" method="get">
      <input type="email" name="email" placeholder="Your email" aria-label="Email address" required />
      <button type="submit" class="el-btn el-btn--primary">Subscribe</button>
    </form>
  </div>
  <div class="el-footer-news__bottom">
    <a href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">@{{HANDLE}}</a>
    <span>© {{YEAR}} {{BRAND_NAME}}</span>
  </div>
</footer>`,
    css: `.el-footer-news{padding:clamp(64px,10vw,80px) 24px 32px;background:var(--el-bg,#faf9f7);border-top:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-footer-news__inner{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:32px;max-width:1120px;margin:0 auto 40px}
.el-footer-news__cta h3{font-family:var(--el-font-display,Georgia,serif);font-size:1.5rem;color:var(--el-text,#1a1a1a);margin-bottom:8px}
.el-footer-news__cta p{font-size:.875rem;color:var(--el-muted,#6b6560)}
.el-footer-news__form{display:flex;gap:8px;flex:1;min-width:280px;max-width:420px}
.el-footer-news__form input{flex:1;padding:12px 16px;border:1px solid var(--el-border,rgba(26,26,26,.12));border-radius:4px;font-size:.875rem;background:var(--el-surface,#fff)}
.el-footer-news__bottom{display:flex;justify-content:space-between;max-width:1120px;margin:0 auto;font-size:.75rem;color:var(--el-muted,#6b6560)}
.el-footer-news__bottom a{color:var(--el-muted,#6b6560)}`,
  },

  // ABOUT (+3 → 6)
  {
    category: "about", id: "about-timeline",
    tags: ["business", "coach", "story"], niche: ["business", "coach", "fitness"],
    style: "kadence-timeline", tokens: "medium",
    description: "Vertical timeline with milestone entries",
    elementMd: "Use for creators with a clear journey — coaches, entrepreneurs, athletes. Timeline entries come from about bullets token.",
    html: `<section class="el-about-timeline" id="about" aria-label="About">
  <div class="el-about-timeline__head el-section-head">
    <span class="el-section-tag">04 · Story</span>
    <h2>{{ABOUT_TITLE}}</h2>
    <p>{{ABOUT_BODY}}</p>
  </div>
  <ol class="el-about-timeline__list">{{ABOUT_BULLETS}}</ol>
</section>`,
    css: `.el-about-timeline{padding:clamp(64px,10vw,96px) 24px;max-width:720px;margin:0 auto}
.el-about-timeline__list{list-style:none;padding:0;margin:48px 0 0;border-left:2px solid var(--el-border,rgba(26,26,26,.12));padding-left:32px}
.el-about-timeline__list li{position:relative;padding-bottom:32px;font-size:1rem;line-height:1.65;color:var(--el-muted,#6b6560)}
.el-about-timeline__list li::before{content:"";position:absolute;left:-39px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--el-accent,#2d5a4a);border:2px solid var(--el-bg,#faf9f7)}`,
  },
  {
    category: "about", id: "about-pullquote",
    tags: ["editorial", "creator", "quote"], niche: ["photographer", "writer", "coach"],
    style: "editorial-quote", tokens: "low",
    description: "Large pull quote with attribution and accent rule",
    elementMd: "Break up long about sections with a pull quote — photographers, writers, thought leaders. Quote text from tagline or hero subtitle.",
    html: `<section class="el-about-quote" aria-label="Philosophy">
  <blockquote class="el-about-quote__block">
    <p>"{{TAGLINE}}"</p>
    <cite>— {{BRAND_NAME}}</cite>
  </blockquote>
</section>`,
    css: `.el-about-quote{padding:clamp(80px,12vw,120px) 24px;background:var(--el-surface,#f3f2ef)}
.el-about-quote__block{max-width:800px;margin:0 auto;text-align:center;border:none;padding:0}
.el-about-quote__block p{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(1.5rem,4vw,2.25rem);font-style:italic;line-height:1.4;color:var(--el-text,#1a1a1a);margin-bottom:24px}
.el-about-quote__block p::before{content:"";display:block;width:48px;height:2px;background:var(--el-accent,#2d5a4a);margin:0 auto 32px}
.el-about-quote__block cite{font-size:.875rem;font-style:normal;letter-spacing:.08em;text-transform:uppercase;color:var(--el-muted,#6b6560)}`,
  },
  {
    category: "about", id: "about-services-numbered",
    tags: ["business", "coach", "services"], niche: ["business", "coach", "fitness"],
    style: "generatepress-cards", tokens: "medium",
    description: "Numbered service cards in a three-column grid",
    elementMd: "Use when the creator offers distinct services or packages — coaches, trainers, consultants. Numbers add structure without icons.",
    html: `<section class="el-about-services" aria-label="Services">
  <div class="el-about-services__head el-section-head">
    <span class="el-section-tag">Services</span>
    <h2>How I <em>help</em></h2>
  </div>
  <div class="el-about-services__grid">{{ITEMS}}</div>
</section>`,
    css: `.el-about-services{padding:clamp(64px,10vw,96px) 24px;max-width:1120px;margin:0 auto}
.el-about-services__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
@media(max-width:768px){.el-about-services__grid{grid-template-columns:1fr}}
.el-about-services__card{padding:32px;background:var(--el-surface,#f3f2ef);border-radius:4px;border:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-about-services__card .num{font-size:.75rem;letter-spacing:.12em;color:var(--el-accent,#2d5a4a);margin-bottom:16px;display:block}
.el-about-services__card h3{font-family:var(--el-font-display,Georgia,serif);font-size:1.25rem;margin-bottom:12px;color:var(--el-text,#1a1a1a)}
.el-about-services__card p{font-size:.9375rem;line-height:1.6;color:var(--el-muted,#6b6560)}`,
  },

  // CONTACT (+3 → 5)
  {
    category: "contact", id: "contact-split-panel",
    tags: ["business", "studio", "form"], niche: ["business", "studio", "coach"],
    style: "webflow-split", tokens: "medium",
    description: "Split layout: copy left, form right on surface panel",
    elementMd: "Premium contact pattern for studios and businesses. Left column explains value; right column hosts the lead form.",
    html: `<section class="el-contact-split" id="contact" aria-label="Contact">
  <div class="el-contact-split__grid">
    <div class="el-contact-split__copy">
      <span class="el-section-tag">Contact</span>
      <h2>{{CONTACT_TITLE}}</h2>
      <p>{{CONTACT_SUBTITLE}}</p>
      <a class="el-contact-split__ig" href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">@{{HANDLE}}</a>
    </div>
    <form class="el-contact-split__form lead-form" data-site-id="{{SITE_ID}}">
      <input type="hidden" name="siteId" value="{{SITE_ID}}" />
      <input type="text" name="name" placeholder="Your name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Your message" rows="4"></textarea>
      <button type="submit" class="el-btn el-btn--primary">Send message</button>
    </form>
  </div>
</section>`,
    css: `.el-contact-split{padding:clamp(64px,10vw,96px) 24px;background:var(--el-bg,#faf9f7)}
.el-contact-split__grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;max-width:1000px;margin:0 auto;align-items:start}
@media(max-width:768px){.el-contact-split__grid{grid-template-columns:1fr}}
.el-contact-split__copy h2{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(1.75rem,4vw,2.5rem);margin-bottom:16px;color:var(--el-text,#1a1a1a)}
.el-contact-split__copy p{color:var(--el-muted,#6b6560);line-height:1.65;margin-bottom:24px}
.el-contact-split__ig{font-size:.875rem;color:var(--el-accent,#2d5a4a)}
.el-contact-split__form{display:flex;flex-direction:column;gap:16px;padding:32px;background:var(--el-surface,#f3f2ef);border-radius:4px}
.el-contact-split__form input,.el-contact-split__form textarea{padding:12px 16px;border:1px solid var(--el-border,rgba(26,26,26,.12));border-radius:4px;font-size:.9375rem;background:var(--el-bg,#fff)}`,
  },
  {
    category: "contact", id: "contact-newsletter",
    tags: ["creator", "email", "minimal"], niche: ["creator", "coach", "writer"],
    style: "squarespace-cta", tokens: "low",
    description: "Centred newsletter CTA with single email field",
    elementMd: "Lightweight list-building block for creators who prefer email over heavy contact forms. Place before footer.",
    html: `<section class="el-contact-newsletter" aria-label="Newsletter">
  <div class="el-contact-newsletter__inner">
    <h2>Join the list</h2>
    <p>{{CONTACT_SUBTITLE}}</p>
    <form class="el-contact-newsletter__form" action="#contact" method="get">
      <input type="email" name="email" placeholder="you@email.com" aria-label="Email" required />
      <button type="submit" class="el-btn el-btn--pill">Subscribe</button>
    </form>
  </div>
</section>`,
    css: `.el-contact-newsletter{padding:clamp(64px,10vw,96px) 24px;text-align:center;background:var(--el-surface,#f3f2ef)}
.el-contact-newsletter__inner{max-width:520px;margin:0 auto}
.el-contact-newsletter__inner h2{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(1.75rem,4vw,2.25rem);margin-bottom:12px;color:var(--el-text,#1a1a1a)}
.el-contact-newsletter__inner p{color:var(--el-muted,#6b6560);margin-bottom:28px;line-height:1.6}
.el-contact-newsletter__form{display:flex;gap:8px;max-width:400px;margin:0 auto}
.el-contact-newsletter__form input{flex:1;padding:12px 16px;border:1px solid var(--el-border,rgba(26,26,26,.12));border-radius:999px;font-size:.875rem}
@media(max-width:480px){.el-contact-newsletter__form{flex-direction:column}}`,
  },
  {
    category: "contact", id: "contact-link-grid",
    tags: ["creator", "minimal", "links"], niche: ["creator", "lifestyle", "music"],
    style: "linktree-premium", tokens: "low",
    description: "Grid of large contact link cards with labels",
    elementMd: "Low-friction contact for creators who want link-in-bio style without looking cheap. Large tappable cards for IG, phone, email.",
    html: `<section class="el-contact-links" id="contact" aria-label="Contact">
  <div class="el-contact-links__head el-section-head">
    <h2>{{CONTACT_TITLE}}</h2>
    <p>{{CONTACT_SUBTITLE}}</p>
  </div>
  <div class="el-contact-links__grid">
    <a class="el-contact-links__card" href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">
      <span class="el-contact-links__label">Instagram</span>
      <span class="el-contact-links__value">@{{HANDLE}}</span>
    </a>
    {{PHONE_LINK}}
  </div>
</section>`,
    css: `.el-contact-links{padding:clamp(64px,10vw,96px) 24px;max-width:720px;margin:0 auto}
.el-contact-links__grid{display:grid;gap:16px}
.el-contact-links__card{display:flex;flex-direction:column;padding:24px 32px;background:var(--el-surface,#f3f2ef);border:1px solid var(--el-border,rgba(26,26,26,.08));border-radius:4px;text-decoration:none;transition:border-color .2s,transform .2s}
.el-contact-links__card:hover{border-color:var(--el-accent,#2d5a4a);transform:translateY(-2px)}
.el-contact-links__label{font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--el-muted,#6b6560);margin-bottom:8px}
.el-contact-links__value{font-size:1.125rem;color:var(--el-text,#1a1a1a);font-weight:500}`,
  },

  // BUTTONS (8 new)
  {
    category: "buttons", id: "btn-primary-solid",
    tags: ["cta", "primary", "button"], niche: ["business", "creator", "fitness"],
    style: "squarespace-button", tokens: "low",
    description: "Primary solid button with hover lift",
    elementMd: "Standalone primary CTA snippet. Compose into hero or contact sections when custom button markup is needed.",
    html: `<div class="el-btn-showcase"><a class="el-btn el-btn--primary" href="#contact">Get in touch</a></div>`,
    css: `.el-btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 28px;font-size:.875rem;font-weight:500;letter-spacing:.02em;text-decoration:none;border-radius:4px;transition:transform .2s,box-shadow .2s,background .2s;cursor:pointer;border:none}
.el-btn--primary{background:var(--el-accent,#2d5a4a);color:#fff}
.el-btn--primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px color-mix(in srgb,var(--el-accent,#2d5a4a) 35%,transparent)}`,
  },
  {
    category: "buttons", id: "btn-secondary-outline",
    tags: ["cta", "secondary", "button"], niche: ["business", "fashion", "editorial"],
    style: "editorial-outline", tokens: "low",
    description: "Outlined secondary button with border transition",
    elementMd: "Secondary action button — pairs with primary in hero sections. Use for 'Learn more' or social links.",
    html: `<div class="el-btn-showcase"><a class="el-btn el-btn--secondary" href="#about">Learn more</a></div>`,
    css: `.el-btn--secondary{background:transparent;color:var(--el-text,#1a1a1a);border:1.5px solid var(--el-border,rgba(26,26,26,.2))}
.el-btn--secondary:hover{border-color:var(--el-accent,#2d5a4a);color:var(--el-accent,#2d5a4a)}`,
  },
  {
    category: "buttons", id: "btn-ghost-minimal",
    tags: ["cta", "ghost", "minimal"], niche: ["creator", "minimal", "editorial"],
    style: "minimal-ghost", tokens: "low",
    description: "Ghost button with underline on hover",
    elementMd: "Tertiary action for minimal layouts. No border or fill — underline appears on hover.",
    html: `<div class="el-btn-showcase"><a class="el-btn el-btn--ghost" href="{{IG_URL}}">@{{HANDLE}}</a></div>`,
    css: `.el-btn--ghost{background:transparent;color:var(--el-muted,#6b6560);padding:14px 20px}
.el-btn--ghost:hover{color:var(--el-text,#1a1a1a);text-decoration:underline;text-underline-offset:4px}`,
  },
  {
    category: "buttons", id: "btn-pill-accent",
    tags: ["cta", "pill", "rounded"], niche: ["fitness", "lifestyle", "food"],
    style: "pill-button", tokens: "low",
    description: "Full pill-shaped accent button",
    elementMd: "Rounded pill CTA — friendly and approachable. Good for fitness, food, and lifestyle niches.",
    html: `<div class="el-btn-showcase"><a class="el-btn el-btn--pill" href="#contact">Book a session</a></div>`,
    css: `.el-btn--pill{border-radius:999px;background:var(--el-accent,#2d5a4a);color:#fff;padding:14px 32px}
.el-btn--pill:hover{transform:translateY(-2px);box-shadow:0 6px 20px color-mix(in srgb,var(--el-accent,#2d5a4a) 30%,transparent)}`,
  },
  {
    category: "buttons", id: "btn-gradient-accent",
    tags: ["cta", "gradient", "modern"], niche: ["tech", "business", "creator"],
    style: "gradient-cta", tokens: "low",
    description: "Subtle gradient fill button using accent colours",
    elementMd: "Modern gradient CTA using accent tokens — not generic purple. Use sparingly as primary action.",
    html: `<div class="el-btn-showcase"><a class="el-btn el-btn--gradient" href="#contact">Start now</a></div>`,
    css: `.el-btn--gradient{background:linear-gradient(135deg,var(--el-accent,#2d5a4a),var(--el-accent-dim,#8fb5a8));color:#fff;border-radius:4px}
.el-btn--gradient:hover{filter:brightness(1.08);transform:translateY(-2px)}`,
  },
  {
    category: "buttons", id: "btn-text-link",
    tags: ["cta", "text", "link"], niche: ["editorial", "fashion", "writer"],
    style: "editorial-link", tokens: "low",
    description: "Text link with arrow icon and hover shift",
    elementMd: "Editorial text link with arrow — for 'View all work' or 'Read more' patterns in fashion and editorial sites.",
    html: `<div class="el-btn-showcase"><a class="el-btn el-btn--text" href="#work">View all work <span aria-hidden="true">→</span></a></div>`,
    css: `.el-btn--text{background:none;color:var(--el-accent,#2d5a4a);padding:0;font-size:.9375rem;gap:8px}
.el-btn--text span{transition:transform .2s}
.el-btn--text:hover span{transform:translateX(4px)}`,
  },
  {
    category: "buttons", id: "btn-icon-arrow",
    tags: ["cta", "icon", "arrow"], niche: ["business", "saas", "coach"],
    style: "saas-icon-btn", tokens: "low",
    description: "Primary button with trailing arrow icon",
    elementMd: "SaaS-style CTA with arrow affordance. Signals forward action — booking, signup, download.",
    html: `<div class="el-btn-showcase"><a class="el-btn el-btn--icon" href="#contact">Get started <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>`,
    css: `.el-btn--icon{background:var(--el-accent,#2d5a4a);color:#fff;gap:8px}
.el-btn--icon svg{transition:transform .2s}
.el-btn--icon:hover svg{transform:translateX(3px)}`,
  },
  {
    category: "buttons", id: "btn-group-dual",
    tags: ["cta", "group", "dual"], niche: ["creator", "business", "fitness"],
    style: "dual-cta", tokens: "low",
    description: "Primary + ghost button group with consistent spacing",
    elementMd: "Pre-composed dual CTA group for hero sections. Primary leads to contact; ghost to Instagram.",
    html: `<div class="el-btn-group">
  <a class="el-btn el-btn--primary" href="#contact">Get in touch</a>
  <a class="el-btn el-btn--ghost" href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">@{{HANDLE}}</a>
</div>`,
    css: `.el-btn-group{display:flex;flex-wrap:wrap;gap:16px;align-items:center}`,
  },

  // CARDS (5 new)
  {
    category: "cards", id: "card-post-grid",
    tags: ["instagram", "post", "grid"], niche: ["creator", "food", "fashion"],
    style: "instagram-card", tokens: "medium",
    description: "Single post card with image, caption excerpt, and IG link",
    elementMd: "Reusable post card for grid compositions. Generator repeats via ITEMS token with post data.",
    html: `<article class="el-card-post">
  <a class="el-card-post__media" href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">
    <img src="{{HERO_IMAGE_URL}}" alt="" loading="lazy" width="400" height="400" />
  </a>
  <div class="el-card-post__body">
    <p>{{TAGLINE}}</p>
    <a href="{{IG_URL}}" target="_blank" rel="noopener noreferrer">View on IG →</a>
  </div>
</article>`,
    css: `.el-card-post{border-radius:4px;overflow:hidden;background:var(--el-surface,#f3f2ef);border:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-card-post__media{display:block;aspect-ratio:1;overflow:hidden}
.el-card-post__media img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.el-card-post__media:hover img{transform:scale(1.03)}
.el-card-post__body{padding:20px}
.el-card-post__body p{font-size:.9375rem;color:var(--el-muted,#6b6560);line-height:1.5;margin-bottom:12px}
.el-card-post__body a{font-size:.8125rem;color:var(--el-accent,#2d5a4a);text-decoration:none}`,
  },
  {
    category: "cards", id: "card-feature-icon",
    tags: ["feature", "icon", "saas"], niche: ["business", "coach", "tech"],
    style: "saas-feature", tokens: "low",
    description: "Feature card with SVG icon placeholder and title + description",
    elementMd: "Feature highlight card for business/coach sites explaining value props. Icon is generic SVG shape.",
    html: `<article class="el-card-feature">
  <div class="el-card-feature__icon" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" stroke-width="1.5"/><path d="M12 16l4 4 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>
  <h3>{{ABOUT_TITLE}}</h3>
  <p>{{ABOUT_BODY}}</p>
</article>`,
    css: `.el-card-feature{padding:32px;background:var(--el-surface,#f3f2ef);border-radius:4px;border:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-card-feature__icon{color:var(--el-accent,#2d5a4a);margin-bottom:20px}
.el-card-feature h3{font-family:var(--el-font-display,Georgia,serif);font-size:1.25rem;margin-bottom:12px;color:var(--el-text,#1a1a1a)}
.el-card-feature p{font-size:.9375rem;line-height:1.6;color:var(--el-muted,#6b6560)}`,
  },
  {
    category: "cards", id: "card-stat-highlight",
    tags: ["stat", "metric", "proof"], niche: ["fitness", "business", "creator"],
    style: "stat-card", tokens: "low",
    description: "Large stat number with label in bordered card",
    elementMd: "Individual stat card for dashboards or proof sections. Use in groups of three for balance.",
    html: `<article class="el-card-stat">
  <span class="el-card-stat__num">{{STATS_ITEMS}}</span>
  <span class="el-card-stat__label">Followers</span>
</article>`,
    css: `.el-card-stat{padding:32px;text-align:center;background:var(--el-surface,#f3f2ef);border-radius:4px;border:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-card-stat__num{display:block;font-family:var(--el-font-display,Georgia,serif);font-size:clamp(2rem,5vw,3rem);color:var(--el-text,#1a1a1a);margin-bottom:8px}
.el-card-stat__label{font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--el-muted,#6b6560)}`,
  },
  {
    category: "cards", id: "card-pricing-tier",
    tags: ["pricing", "tier", "business"], niche: ["business", "coach", "fitness"],
    style: "pricing-card", tokens: "medium",
    description: "Pricing tier card with price, features list, and CTA",
    elementMd: "Single pricing tier for coaches and service businesses. Highlight middle tier in layouts with three cards.",
    html: `<article class="el-card-pricing">
  <span class="el-card-pricing__tier">Standard</span>
  <p class="el-card-pricing__price"><span>£</span>99</p>
  <ul class="el-card-pricing__features">{{ABOUT_BULLETS}}</ul>
  <a class="el-btn el-btn--primary" href="#contact">Book now</a>
</article>`,
    css: `.el-card-pricing{padding:40px 32px;background:var(--el-bg,#faf9f7);border:1px solid var(--el-border,rgba(26,26,26,.12));border-radius:4px;text-align:center}
.el-card-pricing__tier{font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--el-accent,#2d5a4a);display:block;margin-bottom:16px}
.el-card-pricing__price{font-family:var(--el-font-display,Georgia,serif);font-size:3rem;color:var(--el-text,#1a1a1a);margin-bottom:24px}
.el-card-pricing__price span{font-size:1.5rem;vertical-align:super}
.el-card-pricing__features{list-style:none;padding:0;margin:0 0 32px;text-align:left}
.el-card-pricing__features li{padding:8px 0;font-size:.9375rem;color:var(--el-muted,#6b6560);border-bottom:1px solid var(--el-border,rgba(26,26,26,.06))}`,
  },
  {
    category: "cards", id: "card-testimonial-quote",
    tags: ["testimonial", "quote", "social-proof"], niche: ["business", "coach", "fitness"],
    style: "testimonial-card", tokens: "low",
    description: "Testimonial card with quote, avatar placeholder, and name",
    elementMd: "Social proof card for coaches and businesses. Avatar uses gradient placeholder — replace with real client photo.",
    html: `<article class="el-card-testimonial">
  <blockquote><p>"{{TAGLINE}}"</p></blockquote>
  <div class="el-card-testimonial__author">
    <div class="el-card-testimonial__avatar" aria-hidden="true"></div>
    <div>
      <strong>Client name</strong>
      <span>Verified client</span>
    </div>
  </div>
</article>`,
    css: `.el-card-testimonial{padding:32px;background:var(--el-surface,#f3f2ef);border-radius:4px;border:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-card-testimonial blockquote{margin:0 0 24px}
.el-card-testimonial blockquote p{font-size:1rem;line-height:1.65;color:var(--el-text,#1a1a1a);font-style:italic}
.el-card-testimonial__author{display:flex;align-items:center;gap:16px}
.el-card-testimonial__avatar{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--el-accent-dim,#8fb5a8),var(--el-accent,#2d5a4a))}
.el-card-testimonial__author strong{display:block;font-size:.875rem;color:var(--el-text,#1a1a1a)}
.el-card-testimonial__author span{font-size:.75rem;color:var(--el-muted,#6b6560)}`,
  },

  // SECTIONS (6 new)
  {
    category: "sections", id: "section-divider-rule",
    tags: ["divider", "separator", "editorial"], niche: ["editorial", "fashion", "photographer"],
    style: "editorial-divider", tokens: "low",
    description: "Centred ornamental divider with optional label",
    elementMd: "Visual breathing room between major sections. Use in editorial and fashion layouts to separate hero from portfolio.",
    html: `<div class="el-divider" role="separator" aria-label="Section break">
  <span class="el-divider__line"></span>
  <span class="el-divider__label">{{HERO_EYEBROW}}</span>
  <span class="el-divider__line"></span>
</div>`,
    css: `.el-divider{display:flex;align-items:center;gap:24px;padding:48px 24px;max-width:1120px;margin:0 auto}
.el-divider__line{flex:1;height:1px;background:var(--el-border,rgba(26,26,26,.12))}
.el-divider__label{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--el-muted,#6b6560);white-space:nowrap`,
  },
  {
    category: "sections", id: "section-marquee-ticker",
    tags: ["marquee", "ticker", "motion"], niche: ["sports", "fashion", "creator"],
    style: "marquee-strip", tokens: "low",
    description: "Infinite horizontal ticker with duplicated text",
    elementMd: "Horizontal marquee for energy and movement — sports, fashion drops, event promotion. CSS-only animation.",
    html: `<div class="el-marquee" aria-hidden="true">
  <div class="el-marquee__track">
    <span>{{MARQUEE_TEXT}}</span>
    <span>{{MARQUEE_TEXT}}</span>
    <span>{{MARQUEE_TEXT}}</span>
    <span>{{MARQUEE_TEXT}}</span>
  </div>
</div>`,
    css: `.el-marquee{overflow:hidden;padding:16px 0;background:var(--el-surface,#f3f2ef);border-block:1px solid var(--el-border,rgba(26,26,26,.08))}
.el-marquee__track{display:flex;gap:48px;animation:el-marquee-scroll 25s linear infinite;width:max-content}
.el-marquee__track span{font-size:.8125rem;letter-spacing:.12em;text-transform:uppercase;color:var(--el-muted,#6b6560);white-space:nowrap}
@keyframes el-marquee-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`,
  },
  {
    category: "sections", id: "section-logo-strip",
    tags: ["logos", "brands", "trust"], niche: ["business", "studio", "agency"],
    style: "logo-cloud", tokens: "low",
    description: "Row of placeholder brand logos as SVG shapes",
    elementMd: "Trust strip for studios and agencies. Placeholder SVG rectangles — replace with real client logos when available.",
    html: `<section class="el-logo-strip" aria-label="Featured in">
  <p class="el-logo-strip__label">As featured in</p>
  <div class="el-logo-strip__row" aria-hidden="true">
    <svg width="80" height="24" viewBox="0 0 80 24"><rect x="0" y="4" width="60" height="16" rx="2" fill="currentColor" opacity=".2"/></svg>
    <svg width="80" height="24" viewBox="0 0 80 24"><rect x="10" y="2" width="50" height="20" rx="2" fill="currentColor" opacity=".2"/></svg>
    <svg width="80" height="24" viewBox="0 0 80 24"><rect x="5" y="6" width="70" height="12" rx="2" fill="currentColor" opacity=".2"/></svg>
    <svg width="80" height="24" viewBox="0 0 80 24"><rect x="0" y="0" width="40" height="24" rx="2" fill="currentColor" opacity=".2"/></svg>
  </div>
</section>`,
    css: `.el-logo-strip{padding:48px 24px;text-align:center}
.el-logo-strip__label{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--el-muted,#6b6560);margin-bottom:24px}
.el-logo-strip__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:48px;color:var(--el-text,#1a1a1a)}`,
  },
  {
    category: "sections", id: "section-testimonial-row",
    tags: ["testimonial", "social-proof", "reviews"], niche: ["business", "coach", "fitness"],
    style: "testimonial-section", tokens: "medium",
    description: "Three-column testimonial row with quote cards",
    elementMd: "Social proof section for coaches and service businesses. Three quotes in equal columns — replace with real testimonials.",
    html: `<section class="el-testimonials" aria-label="Testimonials">
  <div class="el-testimonials__head el-section-head">
    <span class="el-section-tag">Reviews</span>
    <h2>What clients <em>say</em></h2>
  </div>
  <div class="el-testimonials__grid">{{ITEMS}}</div>
</section>`,
    css: `.el-testimonials{padding:clamp(64px,10vw,96px) 24px;max-width:1120px;margin:0 auto}
.el-testimonials__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
@media(max-width:768px){.el-testimonials__grid{grid-template-columns:1fr}}`,
  },
  {
    category: "sections", id: "section-faq-accordion",
    tags: ["faq", "accordion", "business"], niche: ["business", "coach", "ecommerce"],
    style: "faq-section", tokens: "medium",
    description: "FAQ section with details/summary accordion pattern",
    elementMd: "FAQ block for coaches and businesses answering common questions. Uses native details/summary — no JS required.",
    html: `<section class="el-faq" aria-label="FAQ">
  <div class="el-faq__head el-section-head">
    <h2>Common questions</h2>
  </div>
  <div class="el-faq__list">
    <details class="el-faq__item"><summary>How do I book?</summary><p>{{CONTACT_SUBTITLE}}</p></details>
    <details class="el-faq__item"><summary>What areas do you cover?</summary><p>{{ABOUT_BODY}}</p></details>
    <details class="el-faq__item"><summary>How can I reach you?</summary><p>DM <a href="{{IG_URL}}">@{{HANDLE}}</a> or use the contact form.</p></details>
  </div>
</section>`,
    css: `.el-faq{padding:clamp(64px,10vw,96px) 24px;max-width:720px;margin:0 auto}
.el-faq__list{display:flex;flex-direction:column;gap:8px;margin-top:40px}
.el-faq__item{border:1px solid var(--el-border,rgba(26,26,26,.1));border-radius:4px;padding:0;background:var(--el-surface,#f3f2ef)}
.el-faq__item summary{padding:20px 24px;font-weight:500;color:var(--el-text,#1a1a1a);cursor:pointer;list-style:none}
.el-faq__item summary::-webkit-details-marker{display:none}
.el-faq__item p{padding:0 24px 20px;font-size:.9375rem;line-height:1.6;color:var(--el-muted,#6b6560)}
.el-faq__item[open] summary{color:var(--el-accent,#2d5a4a)}`,
  },
  {
    category: "sections", id: "section-pricing-table",
    tags: ["pricing", "packages", "business"], niche: ["business", "coach", "fitness"],
    style: "pricing-section", tokens: "medium",
    description: "Three-tier pricing table section with highlighted middle tier",
    elementMd: "Full pricing section for coaches and service providers. Middle tier visually emphasised. Prices are placeholders.",
    html: `<section class="el-pricing" aria-label="Pricing">
  <div class="el-pricing__head el-section-head">
    <span class="el-section-tag">Packages</span>
    <h2>Choose your <em>plan</em></h2>
    <p>{{CONTACT_SUBTITLE}}</p>
  </div>
  <div class="el-pricing__grid">{{ITEMS}}</div>
</section>`,
    css: `.el-pricing{padding:clamp(64px,10vw,96px) 24px;max-width:1120px;margin:0 auto}
.el-pricing__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:start}
@media(max-width:768px){.el-pricing__grid{grid-template-columns:1fr}}
.el-pricing__grid .el-card-pricing:nth-child(2){border-color:var(--el-accent,#2d5a4a);box-shadow:0 8px 32px color-mix(in srgb,var(--el-accent,#2d5a4a) 15%,transparent);transform:scale(1.02)}`,
  },

  // MEDIA (2 new)
  {
    category: "media", id: "media-video-hero",
    tags: ["video", "hero", "cinematic"], niche: ["creator", "fitness", "travel"],
    style: "video-hero", tokens: "high",
    description: "Full-bleed video background hero with overlay text",
    elementMd: "Cinematic video hero for creators with strong video content. Uses video URL token; poster fallback from hero image.",
    html: `<section class="el-media-video-hero" aria-label="Video introduction">
  <video class="el-media-video-hero__bg" autoplay muted loop playsinline poster="{{HERO_IMAGE_URL}}">
    <source src="{{HERO_IMAGE_URL}}" type="video/mp4" />
  </video>
  <div class="el-media-video-hero__overlay"></div>
  <div class="el-media-video-hero__content">
    <h1>{{HERO_TITLE}}</h1>
    <p>{{HERO_SUBTITLE}}</p>
    <a class="el-btn el-btn--primary" href="#work">Explore</a>
  </div>
</section>`,
    css: `.el-media-video-hero{position:relative;min-height:80vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.el-media-video-hero__bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.el-media-video-hero__overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,rgba(0,0,0,.3) 50%,rgba(0,0,0,.4) 100%)}
.el-media-video-hero__content{position:relative;z-index:1;text-align:center;padding:24px;max-width:720px}
.el-media-video-hero__content h1{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(2.5rem,7vw,4rem);color:#fff;line-height:1.1;margin-bottom:20px}
.el-media-video-hero__content p{font-size:1.125rem;color:rgba(255,255,255,.8);margin-bottom:32px;line-height:1.6}`,
  },
  {
    category: "media", id: "media-parallax-image",
    tags: ["parallax", "image", "visual"], niche: ["photographer", "travel", "visual"],
    style: "parallax-section", tokens: "medium",
    description: "Fixed-background image section with centred caption",
    elementMd: "Visual break section with CSS background-attachment fixed parallax. Use sparingly — one per page maximum.",
    html: `<section class="el-media-parallax" aria-label="Featured image">
  <div class="el-media-parallax__bg" style="background-image:url('{{HERO_IMAGE_URL}}')"></div>
  <div class="el-media-parallax__caption">
    <p>{{TAGLINE}}</p>
    <cite>— {{BRAND_NAME}}</cite>
  </div>
</section>`,
    css: `.el-media-parallax{position:relative;min-height:60vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.el-media-parallax__bg{position:absolute;inset:0;background-size:cover;background-position:center;background-attachment:fixed}
.el-media-parallax__bg::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.4)}
.el-media-parallax__caption{position:relative;z-index:1;text-align:center;padding:24px;max-width:600px}
.el-media-parallax__caption p{font-family:var(--el-font-display,Georgia,serif);font-size:clamp(1.5rem,4vw,2.25rem);font-style:italic;color:#fff;line-height:1.35;margin-bottom:16px}
.el-media-parallax__caption cite{font-size:.8125rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7)}`,
  },
];

// Write new elements
for (const el of NEW) {
  writeElement(el.category, el.id, el);
}

patchExistingMeta();

console.log(`Scaffolded ${NEW.length} new elements. Patched existing meta.`);
