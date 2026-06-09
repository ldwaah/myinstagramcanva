# Site publish architecture

How My Instagram Canva turns an Instagram profile into a live website.

## Flow

```
Instagram scrape (AI-enriched)
        │
        ▼
  SiteContentData + themed CSS/JS
        │
        ▼
  renderSiteHtml() → index.html (+ offer/index.html when Pro/Studio)
        │
        ├──► Neon/SQLite bundle (SiteContent.bundle)  ← always (fallback)
        ├──► Local/R2 filesystem (optional)
        └──► GitHub commit sites/{username}/         ← when GITHUB_TOKEN set
                    │
                    ▼
             Netlify / sites-repo deploy → CDN (optional second path)
                    │
                    ▼
             Live URL: {APP_URL}/site/{username}
             (or {username}.{ROOT_DOMAIN} when wildcard DNS is enabled)
```

## HTML bundle structure

Each site is a static folder under `sites/{username}/`:

| Path | Purpose |
|------|---------|
| `index.html` | Main page (hero, posts, reels, about, contact sections) |
| `offer/index.html` | Lead funnel page (Pro / Studio tiers) |
| `css/style.css` | Themed stylesheet |
| `js/main.js` | Client scripts (forms, reels, nav) |
| `site.json` | Structured content (AI edits, re-generation) |
| `manifest.json` | Generation metadata |
| `assets/**` | Bundled IG images/videos (base64 in DB, plain files on GitHub) |

The instagram-v1 template uses a single-page `index.html` with anchor sections (`#about`, `#contact`, `#posts`). Additional pages are added only when tier features require them (e.g. funnel offer page).

## GitHub publish

Triggered automatically after generation in `apps/web/src/lib/generation.ts`, and after AI edits / manual bundle pushes.

- **Repo path:** `sites/{username}/` in `GITHUB_SITES_REPO` (or `GITHUB_REPO`)
- **Branch:** `GITHUB_SITES_BRANCH` (or `GITHUB_BRANCH`, default `main`)
- **Commit message:** `publish: @{username} site v{N}`
- **Idempotent:** Skips commit when bundle fingerprint matches the previous version
- **Fallback:** If GitHub is unconfigured or the API fails, the DB bundle is still saved and `/site/{username}` continues to work

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | For GitHub publish | Personal access token with `repo` scope |
| `GITHUB_SITES_REPO` | For GitHub publish | `owner/repo` (e.g. `ldwaah/myinstagramcanva-sites`) |
| `GITHUB_SITES_BRANCH` | No | Target branch (default `main`) |
| `GITHUB_REPO` | Alias | Used if `GITHUB_SITES_REPO` is unset |
| `GITHUB_BRANCH` | Alias | Used if `GITHUB_SITES_BRANCH` is unset |

## Serving

`/site/[username]/[[...path]]` reads from `SiteContent.bundle` in the database first, then local filesystem. This is independent of GitHub — the DB path is the primary runtime source for the Netlify app.

## Manual local push

For development when Instagram blocks datacenter IPs:

```bash
npx tsx scripts/push-site-bundle.mjs username
```

Fetches IG locally, builds the bundle, and POSTs to `/api/cron/push-site-bundle` (DB + GitHub).
