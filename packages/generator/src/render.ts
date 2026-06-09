import type { SiteContentData } from "./types";
import { themeCssVariables } from "./theme";
import {
  composeFromLayout,
  suggestLayoutForNiche,
  type ElementTokenMap,
} from "./element-library";

/**
 * Element-library generation path (optional).
 *
 * When `useElementLibrary` is true, the generator composes HTML from
 * ai-extractor snippets instead of the inline template below.
 *
 * Full composition flow:
 * 1. suggestLayoutForNiche(content.niche) → layoutId (or LLM via element-selection.md)
 * 2. resolveLayout(layoutId) → ordered element snippets + palette preset
 * 3. getDesignSystem() → tokens.css + animations.css injected first
 * 4. buildElementTokens(content) → {{PLACEHOLDER}} map from IG data
 * 5. composeFromLayout() → scoped CSS + hydrated HTML
 * 6. themeCssVariables() → user IG accent overrides on top
 *
 * LLM step (future): pick layout + write copy tokens only — no HTML/CSS generation.
 */
export interface RenderSiteOptions {
  useElementLibrary?: boolean;
  layoutId?: string;
  layoutHint?: string;
  quizAnswers?: Record<string, string>;
  /** Squarespace-style sparse sections (default true) */
  sparseLayout?: boolean;
}

/** Build placeholder tokens from IG-derived content for library hydration */
export function buildElementTokens(
  content: SiteContentData,
  siteId: string,
  quizAnswers?: Record<string, string>,
  apiBase = "https://myinstagramcanva.com",
): ElementTokenMap {
  const { assetBase } = sitePaths(content, apiBase);
  const ig = `https://www.instagram.com/${content.instagramHandle}/`;
  const heroLines = content.heroTitle
    .map((line, i) => {
      const cls = i === 1 ? ' class="accent"' : i === 2 ? ' class="outline"' : "";
      return `<span class="line"${cls}>${escapeHtml(line)}</span>`;
    })
    .join("\n          ");

  const statsItems = content.stats
    .map(
      (s) =>
        `<div class="el-about-stats__item"><span class="el-about-stats__num">${s.value}</span><span class="el-about-stats__label">${escapeHtml(s.label)}</span></div>`,
    )
    .join("\n  ");

  const statsRow = content.stats
    .map((s) => `<span><strong>${formatStatValue(s.value, s.label)}</strong> ${escapeHtml(s.label)}</span>`)
    .join("\n      ");

  const aboutBullets = content.aboutBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n            ");

  const phoneLink = content.phone
    ? `<a class="el-contact-band__link" href="tel:${content.phone.replace(/\s/g, "")}"><span class="el-contact-band__label">Phone</span><span class="el-contact-band__value">${escapeHtml(content.phone)}</span></a>`
    : "";

  const servicesItems = content.services
    .map(
      (s, i) =>
        `<article class="el-services-list__card"><span class="num">${String(i + 1).padStart(2, "0")}</span><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.description)}</p></article>`,
    )
    .join("\n  ");

  const productsItems = content.portfolioItems
    .slice(0, 3)
    .map(
      (item, i) =>
        `<article class="el-product-grid__card"><img src="${item.imageUrl}" alt="${escapeHtml(item.alt)}" loading="lazy" /><div class="el-product-grid__card-body"><h3>${escapeHtml(item.label || `Featured ${i + 1}`)}</h3><p>Shop the look · @${escapeHtml(content.instagramHandle)}</p></div></article>`,
    )
    .join("\n  ");

  const testimonialItems = [
    { quote: "Clear, practical, and easy to work with.", name: "Client" },
    { quote: "Exactly what I needed to move forward.", name: "Coaching client" },
    { quote: "Professional, warm, and well organised.", name: "Workshop attendee" },
  ]
    .map(
      (t) =>
        `<blockquote class="el-testimonials__card"><p>"${escapeHtml(t.quote)}"</p><cite>${escapeHtml(t.name)}</cite></blockquote>`,
    )
    .join("\n  ");

  const galleryItems = buildGalleryItems(content, apiBase, assetBase);

  const external = quizAnswers?.externalLink ?? "none";
  const primaryGoal = quizAnswers?.primaryGoal ?? "contact";
  const promoting = quizAnswers?.promoting ?? "nothing";

  const streamUrl = external === "spotify" ? ig : ig;
  const shopUrl = external === "shop" ? ig : ig;
  const bookingUrl = external === "booking" || primaryGoal === "book" ? "#contact" : ig;

  const albumTitle =
    promoting === "album"
      ? `${content.brandName}. Latest release`
      : `${content.brandName}`;
  const albumSubtitle =
    promoting === "album"
      ? "Stream the new project. Links below."
      : content.heroSubtitle;

  const shopCta =
    primaryGoal === "buy" || quizAnswers?.offering === "products"
      ? "Shop now"
      : "View featured picks";

  const bookingCta = primaryGoal === "book" ? "Book a session" : "Get in touch";
  const bookingTitle =
    content.niche === "COACH" || content.niche === "TRAINER"
      ? "Ready to start?"
      : content.contactTitle;
  const bookingSubtitle =
    content.niche === "COACH"
      ? "Book a discovery call and let's talk about your goals."
      : content.contactSubtitle;

  return {
    BRAND_NAME: content.brandName,
    HANDLE: content.instagramHandle,
    HERO_EYEBROW: content.heroEyebrow,
    HERO_TITLE: content.heroTitle.join(" "),
    HERO_TITLE_LINES: heroLines,
    HERO_SUBTITLE: content.heroSubtitle,
    HERO_IMAGE_URL: content.heroImageUrl || content.portfolioItems[0]?.imageUrl || content.profilePicUrl,
    AVATAR_URL: content.profilePicUrl || content.portfolioItems[0]?.imageUrl || "",
    IG_URL: ig,
    PHONE: content.phone ?? "",
    PHONE_LINK: phoneLink,
    YEAR: String(new Date().getFullYear()),
    MARQUEE_TEXT: content.marqueeText,
    SPONSOR_NAME: "Evolve One",
    SPONSOR_URL: "https://evolveone.ai",
    ABOUT_TITLE: content.aboutTitle || `About ${content.brandName}`,
    ABOUT_BODY: content.aboutBody,
    ABOUT_BULLETS: aboutBullets,
    ABOUT_BADGE: content.aboutBadge.join(" · ") || content.heroEyebrow,
    TAGLINE: content.tagline,
    CONTACT_TITLE: content.contactTitle,
    CONTACT_SUBTITLE: content.contactSubtitle,
    SITE_ID: siteId,
    STATS_ROW: statsRow,
    STATS_ITEMS: statsItems,
    GALLERY_ITEMS: galleryItems,
    TESTIMONIAL_ITEMS: testimonialItems,
    ITEMS: galleryItems || testimonialItems,
    SERVICES_TITLE: content.servicesTitle,
    SERVICES_SUBTITLE: `How ${content.ownerName} works with clients.`,
    SERVICES_ITEMS: servicesItems,
    PRODUCTS_TITLE: "Featured picks",
    PRODUCTS_SUBTITLE: `Curated from @${content.instagramHandle}. Tap to shop.`,
    PRODUCTS_ITEMS: productsItems,
    SHOP_URL: shopUrl,
    SHOP_CTA: shopCta,
    ALBUM_TITLE: albumTitle,
    ALBUM_SUBTITLE: albumSubtitle,
    STREAM_URL: streamUrl,
    BOOKING_TITLE: bookingTitle,
    BOOKING_SUBTITLE: bookingSubtitle,
    BOOKING_URL: bookingUrl,
    BOOKING_CTA: bookingCta,
  };
}

function deriveRootDomain(apiBase: string): string {
  try {
    return new URL(apiBase).hostname;
  } catch {
    return "myinstagramcanva.com";
  }
}

function tenantCanonicalUrl(username: string, rootDomain: string): string {
  const protocol = rootDomain.includes("localhost") ? "http" : "https";
  return `${protocol}://${username}.${rootDomain}`;
}

function tenantSubdomainsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_TENANT_SUBDOMAINS_ENABLED === "true";
}

function sitePaths(content: SiteContentData, apiBase: string) {
  const appBase = apiBase.replace(/\/$/, "");
  const assetBase = `/site/${content.instagramHandle}/`;
  const root = deriveRootDomain(appBase);
  const usePathCanonical =
    root.includes("localhost") ||
    root.includes("vercel.app") ||
    !tenantSubdomainsEnabled();
  const canonicalUrl = usePathCanonical
    ? `${appBase}${assetBase}`.replace(/\/$/, "")
    : tenantCanonicalUrl(content.instagramHandle, root);
  return { appBase, assetBase, canonicalUrl };
}

function resolveSocialImage(
  content: SiteContentData,
  apiBase: string,
  assetBase: string,
): string {
  const appBase = apiBase.replace(/\/$/, "");
  const dynamicOg = `${appBase}/api/og/site/${content.instagramHandle}`;
  const candidates = [
    dynamicOg,
    content.profilePicUrl,
    content.heroImageUrl,
    content.portfolioItems[0]?.imageUrl,
    content.myPosts[0]?.imageUrl,
  ];
  for (const url of candidates) {
    const absolute = toAbsoluteAssetUrl(url, apiBase, assetBase);
    if (absolute) return absolute;
  }
  return `${appBase}/og-default.png`;
}

function toAbsoluteAssetUrl(
  url: string | undefined,
  apiBase: string,
  assetBase: string,
): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = apiBase.replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `${assetBase}${url}`;
  return `${base}${path}`;
}

function buildSocialMetaTags(opts: {
  title: string;
  description: string;
  imageUrl: string;
  canonicalUrl: string;
  siteName?: string;
  themeColor?: string;
}): string {
  const siteName = opts.siteName || "My Instagram Canva";
  const themeColor = opts.themeColor || "#E1306C";
  const image = escapeHtml(opts.imageUrl);
  const title = escapeHtml(opts.title);
  const description = escapeHtml(opts.description);
  const url = escapeHtml(opts.canonicalUrl);

  return `
  <meta name="description" content="${description}" />
  <meta name="theme-color" content="${escapeHtml(themeColor)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeHtml(siteName)}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />`;
}

/** Compose site HTML from ai-extractor layout + hydrated tokens */
export function renderSiteHtmlFromLibrary(
  content: SiteContentData,
  siteId: string,
  options: RenderSiteOptions = {},
  apiBase = "https://myinstagramcanva.com",
): string | undefined {
  const layoutId =
    options.layoutId ??
    suggestLayoutForNiche(content.niche, options.layoutHint ?? options.quizAnswers?.layoutHint, options.quizAnswers);
  const tokens = buildElementTokens(content, siteId, options.quizAnswers, apiBase);
  const composed = composeFromLayout(layoutId, tokens, {
    sparse: options.sparseLayout !== false,
  });
  if (!composed) return undefined;

  const theme = content.theme;
  const themeClass = theme?.isDark ? "theme-dark" : "theme-light";
  const inlineTheme = theme
    ? `<style id="mic-theme">${themeCssVariables(theme, { display: content.fontDisplay, body: content.fontBody })}</style>`
    : "";
  const { assetBase, canonicalUrl } = sitePaths(content, apiBase);
  const ogTitle = `${content.brandName} (@${content.instagramHandle})`;
  const socialMeta = buildSocialMetaTags({
    title: ogTitle,
    description: content.metaDescription,
    imageUrl: resolveSocialImage(content, apiBase, assetBase),
    canonicalUrl,
    themeColor: content.accentColor,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${socialMeta}
  <title>${escapeHtml(ogTitle)}</title>
  <base href="${assetBase}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${content.fontGoogleUrl}&display=swap" rel="stylesheet" />
  ${inlineTheme}
  <style id="mic-element-library">${composed.css}</style>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="${themeClass} el-library" data-layout="${composed.layout.id}">
  <main id="top">
${composed.html}
  </main>
  <script src="js/main.js"></script>
</body>
</html>`;
}

function hasVisualContent(content: SiteContentData): boolean {
  return Boolean(
    content.profilePicUrl ||
      content.heroImageUrl ||
      content.myPosts.some((p) => p.imageUrl || p.posterUrl) ||
      content.portfolioItems.some((p) => p.imageUrl),
  );
}

export function renderSiteHtml(
  content: SiteContentData,
  siteId: string,
  apiBase: string,
  options: RenderSiteOptions = {},
): string {
  const wantsLibrary = options.useElementLibrary === true;
  const useLibrary =
    wantsLibrary ||
    (options.useElementLibrary !== false && hasVisualContent(content));

  if (useLibrary) {
    const fromLibrary = renderSiteHtmlFromLibrary(content, siteId, options, apiBase);
    if (fromLibrary) return fromLibrary;
  }

  if (wantsLibrary) {
    console.warn("[render] element library composition failed, using inline template");
  }

  const ig = `https://www.instagram.com/${content.instagramHandle}/`;
  const { assetBase, canonicalUrl } = sitePaths(content, apiBase);
  const avatar = content.profilePicUrl || content.portfolioItems[0]?.imageUrl || "";
  const avatarAbsolute = toAbsoluteAssetUrl(avatar, apiBase, assetBase);
  const ogTitle = `${content.brandName} (@${content.instagramHandle})`;
  const socialMeta = buildSocialMetaTags({
    title: ogTitle,
    description: content.metaDescription,
    imageUrl: resolveSocialImage(content, apiBase, assetBase),
    canonicalUrl,
    themeColor: content.accentColor,
  });
  const theme = content.theme;
  const themeClass = theme?.isDark ? "theme-dark" : "theme-light";
  const inlineTheme = theme
    ? `<style id="mic-theme">${themeCssVariables(theme, { display: content.fontDisplay, body: content.fontBody })}</style>`
    : "";

  const highlights = content.portfolioItems.slice(0, 5).map((item) => `
    <div class="highlight">
      <div class="highlight-ring"><img src="${item.imageUrl}" alt="" loading="lazy" /></div>
      <span>${escapeHtml(item.label.slice(0, 12))}</span>
    </div>`).join("");

  const grid = content.portfolioItems.map((item) => `
    <a class="post-cell" href="${ig}" target="_blank" rel="noopener noreferrer">
      <img src="${item.imageUrl}" alt="${escapeHtml(item.alt)}" loading="lazy" />
    </a>`).join("");

  const myPostsGrid = content.myPosts.map((item) => {
    const postUrl = item.type === "video"
      ? `https://www.instagram.com/reel/${item.shortcode}/`
      : `https://www.instagram.com/p/${item.shortcode}/`;
    const typeClass = item.type === "video" ? " post-cell--video" : item.type === "carousel" ? " post-cell--carousel" : "";
    const carouselBadge = item.type === "carousel" && item.carouselCount && item.carouselCount > 1
      ? `<span class="post-cell__badge" aria-hidden>${item.carouselCount}</span>`
      : "";
    const media = item.type === "video" && item.videoUrl
      ? `<video src="${item.videoUrl}" poster="${item.posterUrl || item.imageUrl || ""}" muted playsinline preload="metadata"></video><span class="post-cell__play" aria-hidden></span>`
      : `<img src="${item.imageUrl || item.posterUrl || ""}" alt="${escapeHtml(item.alt)}" loading="lazy" />`;
    return `
    <a class="post-cell${typeClass}" href="${postUrl}" target="_blank" rel="noopener noreferrer" data-type="${item.type}">
      ${media}${carouselBadge}
    </a>`;
  }).join("");

  const reels = content.reels.map((reel) => `
    <article class="reel-card">
      <video src="${reel.videoUrl}" playsinline muted loop preload="metadata" poster="${reel.posterUrl}"></video>
      <button type="button" class="reel-play" aria-label="Play reel">Play</button>
      <div class="reel-overlay">
        <p>${escapeHtml(reel.caption)}</p>
        <a href="https://www.instagram.com/reel/${reel.shortcode}/" target="_blank" rel="noopener noreferrer">View on IG</a>
      </div>
    </article>`).join("");

  const stats = content.stats.map((s) => `
    <div class="stat" data-reveal>
      <span class="stat-num" data-count="${s.value}">0</span>
      <span class="stat-label">${escapeHtml(s.label)}</span>
    </div>`).join("");

  const profileStats = content.stats.map((s) => `
    <span><strong>${formatStatValue(s.value, s.label)}</strong> ${escapeHtml(s.label)}</span>`).join("");

  const services = content.services.map((s) => `
    <article class="service-item">
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.description)}</p>
    </article>`).join("");

  const bullets = content.aboutBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");

  const contactForm = content.showContactForm
    ? `
    <form class="contact-form lead-form" data-site-id="${siteId}">
      <input type="hidden" name="siteId" value="${siteId}" />
      <input type="text" name="name" placeholder="Your name" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="tel" name="phone" placeholder="Phone (optional)" />
      <textarea name="message" placeholder="How can we help?" rows="4"></textarea>
      <label><input type="checkbox" name="smsOptIn" value="true" /> SMS updates OK</label>
      <button type="submit" class="btn btn-primary" data-label="Send message">Send message</button>
      <p class="form-status" role="status"></p>
    </form>`
    : "";

  const calendar = content.showCalendar
    ? `<div id="booking-calendar" data-site-id="${siteId}"></div>`
    : "";

  const phoneBtn = content.phone
    ? `<a class="btn btn-secondary" href="tel:${content.phone.replace(/\s/g, "")}">${escapeHtml(content.phone)}</a>`
    : "";

  const heroSection =
    content.layoutVariant === "cinematic" && content.heroImageUrl
      ? `
    <section class="hero cinematic-hero" aria-label="Introduction">
      <div class="hero-bg">
        <img class="hero-photo" src="${content.heroImageUrl}" alt="${escapeHtml(content.brandName)}" fetchpriority="high" />
        <div class="hero-vignette"></div>
      </div>
      <div class="hero-content">
        <p class="hero-eyebrow"><span class="pulse-dot"></span>${escapeHtml(content.heroEyebrow)}</p>
        <h1 class="hero-title">
          ${content.heroTitle.map((line, i) => `<span class="line${i === 1 ? " accent" : i === 2 ? " outline" : ""}">${escapeHtml(line)}</span>`).join("")}
        </h1>
        <p class="hero-sub">${escapeHtml(content.heroSubtitle)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#posts">View posts</a>
          <a class="btn btn-ghost" href="${ig}" target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
          ${phoneBtn}
        </div>
      </div>
      <div class="hero-ticker" aria-hidden="true">
        <div class="ticker-track">
          <span>${escapeHtml(content.marqueeText)}</span>
          <span>${escapeHtml(content.marqueeText)}</span>
        </div>
      </div>
    </section>
    <section class="stats-strip" aria-label="Highlights">${stats}</section>`
      : `
    <section class="profile-hero" aria-label="Profile">
      <div class="avatar-ring">
        <img src="${avatarAbsolute || avatar}" alt="${escapeHtml(content.brandName)}" fetchpriority="high" />
      </div>
      <div class="profile-meta">
        <h1>${escapeHtml(content.brandName)}</h1>
        <p class="profile-handle">@${escapeHtml(content.instagramHandle)}</p>
        <div class="profile-stats">${profileStats}</div>
        <p class="profile-bio">${escapeHtml(content.heroSubtitle)}</p>
        <div class="profile-actions">
          <a class="btn btn-primary" href="#contact">${escapeHtml(content.contactTitle)}</a>
          ${phoneBtn}
        </div>
        <p class="profile-ig-link"><a href="${ig}" target="_blank" rel="noopener noreferrer">@${escapeHtml(content.instagramHandle)} on Instagram</a></p>
      </div>
    </section>
    ${content.marqueeText ? `
    <div class="marquee-strip" aria-hidden="true">
      <div class="ticker-track">
        <span>${escapeHtml(content.marqueeText)}</span>
        <span>${escapeHtml(content.marqueeText)}</span>
      </div>
    </div>` : ""}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${socialMeta}
  <title>${escapeHtml(ogTitle)}</title>
  <base href="${assetBase}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${content.fontGoogleUrl}&display=swap" rel="stylesheet" />
  ${inlineTheme}
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="${themeClass}">
  <header class="site-header">
    <a class="logo" href="#top">${escapeHtml(content.brandName)}</a>
    <nav class="nav" aria-label="Primary">
      <a href="#posts">Posts</a>
      ${content.reels.length ? '<a href="#reels">Reels</a>' : ""}
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
      ${content.showFunnel ? '<a href="offer/index.html">Offer</a>' : ""}
    </nav>
    <a class="nav-cta" href="${ig}" target="_blank" rel="noopener noreferrer">@${escapeHtml(content.instagramHandle)}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu"><span></span><span></span></button>
  </header>
  <div id="mobile-menu" class="mobile-menu" hidden>
    <a href="#posts">Posts</a>
    ${content.reels.length ? '<a href="#reels">Reels</a>' : ""}
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
    <a href="${ig}" target="_blank" rel="noopener noreferrer">Instagram</a>
  </div>

  <main id="top">
    ${heroSection}

    ${highlights && content.layoutVariant !== "cinematic" ? `<div class="highlights" aria-label="Highlights">${highlights}</div>` : ""}

    <section id="posts" class="section my-posts">
      <div class="section-head">
        <p class="my-posts__brand">My Instagram Canva</p>
        <h2>${escapeHtml(content.myPostsTitle)}</h2>
        <p>${escapeHtml(content.myPostsSubtitle)}</p>
      </div>
      <div class="post-grid my-posts__grid" role="list">${myPostsGrid || grid}</div>
    </section>

    ${content.portfolioItems.length > 0 && myPostsGrid ? `
    <section class="section section--compact">
      <div class="section-head">
        <h2>${escapeHtml(content.portfolioTitle)}</h2>
        <p>${escapeHtml(content.portfolioSubtitle)}</p>
      </div>
      <div class="post-grid" role="list">${grid}</div>
    </section>` : ""}

    ${content.reels.length ? `
    <section id="reels" class="section">
      <div class="section-head">
        <h2>${escapeHtml(content.reelsTitle)}</h2>
        <p>${escapeHtml(content.reelsSubtitle)}</p>
      </div>
      <div class="reel-row">${reels}</div>
    </section>` : ""}

    <section id="about" class="section">
      <div class="section-head">
        <h2>About</h2>
        <p>${escapeHtml(content.tagline)}</p>
      </div>
      <p>${escapeHtml(content.aboutBody)}</p>
      <ul class="about-bullets">${bullets}</ul>
    </section>

    <section class="section">
      <div class="section-head"><h2>${escapeHtml(content.servicesTitle)}</h2></div>
      <div class="service-list">${services}</div>
    </section>

    <section id="contact" class="section">
      <div class="section-head">
        <h2>${escapeHtml(content.contactTitle)}</h2>
        <p>${escapeHtml(content.contactSubtitle)}</p>
      </div>
      <div class="contact-links">
        <a class="contact-link" href="${ig}" target="_blank" rel="noopener noreferrer">@${escapeHtml(content.instagramHandle)}</a>
      </div>
      ${contactForm}
      ${calendar}
    </section>
  </main>

  <footer class="site-footer">
    <p>© <span id="year"></span> ${escapeHtml(content.brandName)} · <a href="https://myinstagramcanva.com" target="_blank" rel="noopener">My Instagram Canva</a></p>
    <p class="site-footer__sponsor">Sponsored by <a href="https://evolveone.ai" target="_blank" rel="noopener noreferrer">Evolve One</a></p>
  </footer>
  <script src="js/main.js"></script>
</body>
</html>`;
}

export function renderFunnelHtml(content: SiteContentData, siteId: string, apiBase: string): string {
  const { assetBase, canonicalUrl } = sitePaths(content, apiBase);
  const theme = content.theme;
  const inlineTheme = theme
    ? `<style id="mic-theme">${themeCssVariables(theme, { display: content.fontDisplay, body: content.fontBody })}</style>`
    : "";
  const funnelUrl = `${canonicalUrl}offer/`;
  const ogTitle = `${content.brandName} | Offer`;
  const socialMeta = buildSocialMetaTags({
    title: ogTitle,
    description: content.metaDescription,
    imageUrl: resolveSocialImage(content, apiBase, assetBase),
    canonicalUrl: funnelUrl,
    themeColor: content.accentColor,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${socialMeta}
  <title>${escapeHtml(ogTitle)}</title>
  <base href="${assetBase}" />
  ${inlineTheme}
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="${theme?.isDark ? "theme-dark" : "theme-light"}">
  <main class="funnel-page">
    <div class="funnel-card">
      <h1>Work with ${escapeHtml(content.brandName)}</h1>
      <p style="margin-bottom:1rem;color:var(--muted)">${escapeHtml(content.heroSubtitle)}</p>
      <ul style="margin-bottom:1.5rem;padding-left:1.25rem;color:var(--muted)">
        ${content.aboutBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
      </ul>
      <form class="contact-form lead-form">
        <input type="hidden" name="siteId" value="${siteId}" />
        <input type="hidden" name="source" value="funnel" />
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <textarea name="message" placeholder="What are you looking for?" rows="4"></textarea>
        <label><input type="checkbox" name="emailOptIn" value="true" checked /> Email me updates</label>
        <button type="submit" class="btn btn-primary" data-label="Request info">Request info</button>
        <p class="form-status" role="status"></p>
      </form>
    </div>
  </main>
  <script src="js/main.js"></script>
</body>
</html>`;
}

function buildGalleryItems(
  content: SiteContentData,
  apiBase: string,
  assetBase: string,
): string {
  const ig = `https://www.instagram.com/${content.instagramHandle}/`;
  const posts = content.myPosts.length
    ? content.myPosts
    : content.portfolioItems.map((p, i) => ({
        shortcode: `post-${i}`,
        type: "image" as const,
        imageUrl: p.imageUrl,
        posterUrl: undefined,
        alt: p.alt,
      }));

  return posts
    .filter((p) => p.imageUrl || p.posterUrl)
    .map((item) => {
      const imgUrl = toAbsoluteAssetUrl(item.imageUrl || item.posterUrl || "", apiBase, assetBase);
      const postUrl =
        item.type === "video" && item.shortcode && !item.shortcode.startsWith("post-")
          ? `https://www.instagram.com/reel/${item.shortcode}/`
          : item.shortcode && !item.shortcode.startsWith("post-")
            ? `https://www.instagram.com/p/${item.shortcode}/`
            : ig;
      return `<a class="el-gallery-grid__cell" href="${postUrl}" target="_blank" rel="noopener noreferrer" role="listitem">
    <img src="${imgUrl}" alt="${escapeHtml(item.alt || "")}" loading="lazy" width="400" height="400" />
  </a>`;
    })
    .join("\n  ");
}

function formatStatValue(value: number, label: string): string {
  if (label.includes("M followers")) return `${value}M`;
  if (label.includes("K followers")) return `${value}K`;
  return String(value);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
