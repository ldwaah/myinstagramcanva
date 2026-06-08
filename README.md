# My Instagram Canva

Turn Instagram profiles into hosted creator websites with an Instagram-inspired design.

## Stack

- **apps/web** — Next.js (marketing, dashboard, API, tenant site serving)
- **packages/db** — Prisma + SQLite (use PostgreSQL in production)
- **packages/instagram** — Profile fetch client
- **packages/generator** — AI content + HTML renderer
- **templates/instagram-v1** — Instagram-gradient creator template
- **sites-repo** — Optional separate GitHub repo for tenant site files

## Quick start

```bash
cp .env.example apps/web/.env.local
npm install
npm run db:push
npm run dev -w web
```

Open http://localhost:3000

## Test contact forms locally

1. Sign up → create a site → **Dev: mock Tailored** on the dashboard (or buy Tailored via Stripe)
2. Wait for regeneration to finish, then open `/site/{username}`
3. Scroll to Contact and submit the form — it POSTs to `/api/leads` on the same origin
4. View leads in **Dashboard → Leads & CRM**

Starter (£27) does **not** include the embedded lead form.

## Pricing

| Tier | Price | Includes |
|------|-------|----------|
| **Starter** | £27 | AI-generated site, subdomain hosting |
| **Tailored** | £54 | Embedded lead capture form, lead dashboard, email alert on new lead, **we design it for you** (48h) |
| **Pro** | £101 | Tailored + booking calendar + marketing funnel page |
| **Studio** | £299 | Pro + CRM + mass email & SMS campaigns (opt-in leads only) |
| AI Changer BYOK | £10/mo | Unlimited AI edits with your OpenAI key |
| AI Changer Managed | £18/mo | 30 AI edits/month (platform key) |
| AI edit top-up | £5 | 10 extra edits |

## GitHub repos (recommended)

Create **two** repositories:

1. **`myinstagramcanva`** (this app) — push the full monorepo. Connect to Vercel for deployment.
2. **`myinstagramcanva-sites`** (optional) — tenant site files under `sites/{username}/`. Use the template in [`sites-repo/`](sites-repo/). Set `GITHUB_TOKEN` and `GITHUB_SITES_REPO=youruser/myinstagramcanva-sites` in Vercel env.

## Deploy to Netlify (primary)

1. Push this repo to GitHub and import at [app.netlify.com/start](https://app.netlify.com/start).
2. Netlify reads `netlify.toml` at the repo root (builds `apps/web` via npm workspaces).
3. **Create a PostgreSQL database** (SQLite does not work in production):
   - [Neon](https://neon.tech) (free tier) or Supabase / Netlify DB
   - Copy the `postgresql://...` connection string

4. Add environment variables in Netlify → Site configuration → Environment variables:

   | Variable | Example / notes |
   |----------|-----------------|
   | `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://myinstagramcanva.com` |
   | `NEXT_PUBLIC_APP_URL` | `https://myinstagramcanva.com` (main app) |
   | `NEXT_PUBLIC_ROOT_DOMAIN` | `myinstagramcanva.com` (tenant subdomains) |
   | `INSTAGRAM_PROXY_URL` | **Recommended on Netlify.** Instagram blocks datacenter IPs; set a proxy that accepts `?url=` (see `.env.example`). Without it, first-time previews may be sparse; existing bundles are preserved on failed sync. |

5. **Apply the database schema** (once, from your machine):
   ```bash
   DATABASE_URL="postgresql://..." npm run db:push
   ```

6. **Custom domain DNS** (at your registrar or Netlify DNS):
   - `myinstagramcanva.com` → Netlify (ALIAS/ANAME or A record per Netlify docs)
   - `www.myinstagramcanva.com` → CNAME → your Netlify site URL
   - `*.myinstagramcanva.com` → CNAME → your Netlify site URL (wildcard for tenant sites)
   - Add all three in Netlify → Domain management

7. Redeploy, then sign up at `/signup` to create your first account.

8. Optional — also set from `.env.example`:
   - `STRIPE_*` — payment keys and price IDs
   - `OPENAI_API_KEY` — for AI generation
   - `RESEND_API_KEY` — Tailored lead email alerts to site owners
   - `ENCRYPTION_KEY` — 32-byte hex for BYOK keys

## Deploy to Vercel (optional / fallback)

Same env vars as Netlify. Set **Root Directory** to `apps/web`. Keep `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_ROOT_DOMAIN` pointing at `myinstagramcanva.com` so canonical URLs stay correct even when building on Vercel.

## Tenant preview

Locally: `/site/{username}`.

Vercel fallback: `https://myinstagramcanva.com/site/{username}` (nested subdomains are not supported on `*.vercel.app`).

Production (with wildcard DNS): `https://{username}.myinstagramcanva.com`

Use **Dev: mock pay** on the dashboard when Stripe is not configured.
