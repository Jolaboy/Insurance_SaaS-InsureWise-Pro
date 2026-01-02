# InsureWise Pro

A production-style insurance client portal built with React + Supabase.

## What you can do (features)

- Auth: Sign up / sign in / sign out (Supabase Auth)
- Protected dashboard routes (React Router)
- Instant quotes: Auto, Home, or Bundle (Auto + Home)
- Quote history: Save and list quotes per user
- Accept quote → create policy (ties policies to quotes)
- Policies: List policies, open policy detail
- PDF: Download a simple Insurance ID Card (client-side PDF)
- Multi-currency: Defaults to GBP with USD/EUR options
- Optional: Show a Stripe Payment Link button (env-driven)

## Tech stack

- Frontend: React (Vite)
- Styling: Tailwind CSS v4 (via Vite plugin)
- Routing: React Router (nested routes + protected routes)
- Backend: Supabase (Auth + Postgres)
- Security: Postgres Row Level Security (RLS) policies per table
- PDF: @react-pdf/renderer

## Skills demonstrated

- SPA architecture with protected layouts and nested routing
- Auth state management with React Context
- Secure multi-tenant data access using RLS + `auth.uid()`
- API helpers for CRUD flows (quotes/policies)
- Deterministic “instant pricing” MVP logic + currency formatting
- Production ergonomics: env-based configuration, lint/build scripts

## Quick start

1. Create a local env file:
   - Copy `.env.example` → `.env`
   - Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Optional:
   - `VITE_STRIPE_PAYMENT_LINK` (shown on Policy Detail)
   - `VITE_SUPPORT_EMAIL` (used by the footer Gmail compose link)

2. Install and run:
   - `npm install`
   - `npm run dev`

3. Open <http://localhost:5173>

## Routes

- `/login`
- `/dashboard` (Overview)
- `/dashboard/quotes`
- `/dashboard/policies`
- `/dashboard/policies/:policyId`
- `/dashboard/settings`

## Supabase setup (database + RLS)

This app expects two tables:

- `public.quotes`
- `public.policies`

### 1) Run the provided SQL scripts

In the Supabase SQL editor, run these in order:

1. `supabase/sql/002_quotes.sql` (creates `quotes`, RLS policies, and `public.set_updated_at()`)
2. Create the base `policies` table (see below)
3. `supabase/sql/003_policies_upgrade.sql` (adds quote/premium/currency fields + `updated_at` trigger)

### 2) Base `policies` table (required)

Run this once (then run the upgrade script):

```sql
create extension if not exists pgcrypto;

create table if not exists public.policies (
   id uuid primary key default gen_random_uuid(),
   user_id uuid not null references auth.users(id) on delete cascade,
   plan_type text,
   status text not null default 'active'
);

alter table public.policies enable row level security;

drop policy if exists "Users can read own policies" on public.policies;
create policy "Users can read own policies"
on public.policies
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own policies" on public.policies;
create policy "Users can create own policies"
on public.policies
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own policies" on public.policies;
create policy "Users can update own policies"
on public.policies
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## Scripts

- `npm run dev` — start the dev server
- `npm run lint` — lint the project
- `npm run build` — production build
- `npm run preview` — preview the build locally

## GitHub-ready checklist

- `.env` is ignored (use `.env.example` for templates)
- CI included: `.github/workflows/ci.yml` runs `lint` + `build`
- SPA deploy rewrites included (choose your platform):
  - Netlify: `public/_redirects`
  - Vercel: `vercel.json`

### Publish to GitHub

If this folder is not yet a git repo:

- `git init`
- `git add .`
- `git commit -m "Initial commit"`

Then create a new GitHub repo and push:

- `git remote add origin <YOUR_REPO_URL>`
- `git branch -M main`
- `git push -u origin main`

## Deploy (live)

You can deploy this app on either Netlify or Vercel. Both work well for a Vite + React SPA.

### 1) Configure Supabase for your production URL

In Supabase Dashboard → Authentication → URL Configuration:

- Add your production site URL to **Site URL**
- Add redirect URLs as needed, e.g.:
  - `http://localhost:5173` (dev)
  - `https://<your-domain>` (prod)

### 2) Deploy on Netlify

1. New site from Git
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Optional:
   - `VITE_STRIPE_PAYMENT_LINK`
   - `VITE_SUPPORT_EMAIL`

### 3) Deploy on Vercel (alternative)

1. Import the GitHub repo in Vercel
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Set Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Optional:
     - `VITE_STRIPE_PAYMENT_LINK`
     - `VITE_SUPPORT_EMAIL`

Notes:

- This is a client-side SPA; the included rewrites ensure refresh/deep-links work.
- Supabase keys are safe to expose in the frontend only when using RLS (which this app does).
