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

## Deploy to Vercel

1. Create a new GitHub repo and push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial My Instagram Canva platform"
   git remote add origin git@github.com:YOURUSER/myinstagramcanva.git
   git push -u origin main
   ```
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Set **Root Directory** to `apps/web`
4. **Create a PostgreSQL database** (SQLite files do not work on Vercel serverless):
   - [Neon](https://neon.tech) (free tier) or Vercel Postgres / Supabase
   - Copy the `postgresql://...` connection string

5. Add environment variables in Vercel → Project → Settings → Environment Variables (required for login):

   | Variable | Example / notes |
   |----------|-----------------|
   | `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `NEXT_PUBLIC_APP_URL` | `https://myinstagramcanva.vercel.app` (main app) |
   | `NEXT_PUBLIC_ROOT_DOMAIN` | `myinstagramcanva.thesale.app` (tenant sites) |

6. **Apply the database schema** (once, from your machine):
   ```bash
   DATABASE_URL="postgresql://..." npm run db:push
   ```

7. Redeploy, then sign up at `/signup` to create your first account.

8. Optional — also set from `.env.example`:
   - `STRIPE_*` — payment keys and price IDs
   - `OPENAI_API_KEY` — for AI generation
   - `RESEND_API_KEY` — Tailored lead email alerts to site owners
   - `ENCRYPTION_KEY` — 32-byte hex for BYOK keys
9. **Tenant DNS on thesale.app** — add a wildcard CNAME so tenant sites resolve:
   - Record: `*.myinstagramcanva` → CNAME → `cname.vercel-dns.com` (or your Vercel project domain)
   - Also add `myinstagramcanva.thesale.app` as a domain on the Vercel project
   - Tenant URL format: `www.{username}.myinstagramcanva.thesale.app`
10. Deploy

## Tenant preview

Locally: `/site/{username}`.

Production (before DNS): `https://myinstagramcanva.vercel.app/site/{username}`.

With DNS wired: `https://www.{username}.myinstagramcanva.thesale.app`

Use **Dev: mock pay** on the dashboard when Stripe is not configured.
