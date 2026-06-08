import type { SiteContentData } from "./types";

export function renderSiteHtml(content: SiteContentData, siteId: string, _apiBase: string): string {
  const ig = `https://www.instagram.com/${content.instagramHandle}/`;
  const avatar = content.portfolioItems[0]?.imageUrl || "";

  const highlights = content.portfolioItems.slice(0, 5).map((item, i) => `
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
    <span><strong>${s.value}</strong> ${escapeHtml(s.label)}</span>`).join("");

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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(content.metaDescription)}" />
  <meta name="theme-color" content="${escapeHtml(content.accentColor)}" />
  <meta property="og:title" content="${escapeHtml(content.brandName)}" />
  <meta property="og:description" content="${escapeHtml(content.metaDescription)}" />
  <title>${escapeHtml(content.brandName)} (@${escapeHtml(content.instagramHandle)})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${content.fontGoogleUrl}&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
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
  <div id="mobile-menu" class="mobile-menu">
    <a href="#posts">Posts</a>
    ${content.reels.length ? '<a href="#reels">Reels</a>' : ""}
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
    <a href="${ig}" target="_blank" rel="noopener noreferrer">Instagram</a>
  </div>

  <main id="top">
    <section class="profile-hero" aria-label="Profile">
      <div class="avatar-ring">
        <img src="${avatar}" alt="${escapeHtml(content.brandName)}" fetchpriority="high" />
      </div>
      <div class="profile-meta">
        <h1>${escapeHtml(content.brandName)}</h1>
        <p class="profile-handle">@${escapeHtml(content.instagramHandle)}</p>
        <div class="profile-stats">${stats}</div>
        <p class="profile-bio">${escapeHtml(content.heroSubtitle)}</p>
        <div class="profile-actions">
          <a class="btn btn-primary" href="#contact">Get in touch</a>
          <a class="btn btn-secondary" href="${ig}" target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
          ${phoneBtn}
        </div>
      </div>
    </section>

    ${highlights ? `<div class="highlights" aria-label="Highlights">${highlights}</div>` : ""}

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
      <ul style="margin-top:1rem;padding-left:1.25rem;color:var(--muted)">${bullets}</ul>
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

export function renderFunnelHtml(content: SiteContentData, siteId: string, _apiBase: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(content.brandName)} | Offer</title>
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body>
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
  <script src="../js/main.js"></script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
