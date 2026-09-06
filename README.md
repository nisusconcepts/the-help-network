# The Help Haven Network

A directory of mental health, recovery, shelter, domestic violence, LGBTQ+, military and first
responder, support groups, legal aid, financial assistance, human trafficking, food assistance, and
clothing/essentials resources — starting in North Texas, built to expand nationwide. Includes a
real map (Leaflet + free OpenStreetMap tiles), a public "Add a Resource" form for individuals and
organizations, and an admin review queue so nothing goes live unreviewed.

This replaces the earlier Claude Artifact prototype for the *public* site — that prototype's sandbox
can't load map tiles from any provider, which is the whole reason this is a real, separately-hosted
app. The Artifact prototype can still be useful as an internal scratchpad, but this is the real thing.

## Stack

- **Next.js** (App Router) — the site itself
- **Supabase** — Postgres database, auth, and row-level security (free tier is plenty to start)
- **Leaflet + OpenStreetMap** — the map (free, no API key needed)
- **Vercel** — hosting (free tier)

Total cost to get this live: **$0**.

## One-time setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account, then a new project.
2. In the project, open **SQL Editor > New query**, paste in the contents of `supabase/schema.sql`,
   and run it. This creates the `resources` and `submissions` tables and locks them down with Row
   Level Security (public can read resources and submit new ones; only a signed-in admin can publish
   or review).
3. Go to **Authentication > Users** and add yourself as a user (email + password) — this is the
   account you'll use to sign in at `/admin` to review submissions.
4. Go to **Settings > API** and copy three values: the **Project URL**, the **anon public** key, and
   the **service_role** key.

### 2. Configure this project

```bash
cp .env.local.example .env.local
```

Paste the three values from Supabase into `.env.local`.

### 3. Install dependencies and seed real starter data

```bash
npm install
npm run seed
```

`npm run seed` reads `data/dfw-resources.json` (20 real, verified DFW-area resources), geocodes each
address with OpenStreetMap's free geocoder, and loads them into Supabase. Safe to re-run any time —
it updates existing rows instead of duplicating them.

### 4. Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000` to browse the directory and see the map, and
`http://localhost:3000/admin/login` to sign in and review submissions (there won't be any yet unless
you submit one yourself at `/add` to test the flow).

### 5. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com), create a free account, and import the repo.
3. In the Vercel project's **Settings > Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `.env.local`). Do **not** add the service role key
   here — it's only ever needed for the local seed script.
4. Deploy. Vercel gives you a live URL immediately; a custom domain can be added later in the same
   settings page.

## Project structure

```
app/
  page.js                  Browse page: search, category filter, map, cards
  resource/[id]/page.js    One resource's detail page
  add/page.js              Public "Add a Resource" form (individuals + orgs)
  about/page.js            About + disclaimer
  admin/page.js            Review queue (approve/reject submissions)
  admin/login/page.js      Admin sign-in
  api/geocode/route.js     Server-side geocoding, used when approving a submission
components/                Shared UI (map, cards, category rail, header)
lib/                       Supabase client, category list, geocoding helper
data/dfw-resources.json    The 20 real seed listings
scripts/seed.mjs           One-time/repeatable data loader
supabase/schema.sql        Database schema + Row Level Security policies
```

## How moderation works

Nothing reaches the public directory without going through `submissions` and an admin approval —
same model as the original prototype. When you approve a submission on `/admin`, it's geocoded (if it
has an address) and copied into `resources`, then marked `approved` in `submissions`.

**Not yet built, worth doing before this is truly public:** rate limiting / spam protection on the
submission form (right now anyone can submit as many times as they want), and a distinct intake for
organization self-registration vs. an anonymous tip (the form captures which one it is via
`submitter_type`, but nothing branches on it yet).

## About the data model's extra fields

`resources.urgency_tier` and `resources.stage_of_need` exist in the schema but nothing reads them
yet — they're there so the planned personalized, day-by-day recovery-guide feature doesn't require a
schema migration when it's built. See the project plan doc for the reasoning (that feature needs real
case-management input before it ships — it's not a simple content feature).
