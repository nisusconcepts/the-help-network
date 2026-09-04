-- The Help Network — database schema
-- Run this once in your Supabase project's SQL editor (Project > SQL Editor > New query)
-- before running `npm run seed`.

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  category text not null,
  description text not null default '',
  phone text default '',
  address text default '',
  area text default '',              -- city/region shown on the card, e.g. "Fort Worth, TX"
  lat double precision,
  lng double precision,
  hours text default '',
  requirements text default '',
  website text default '',
  hours_247 boolean not null default false,
  free boolean not null default false,
  -- BPX1-flagged fields for the future guided-recovery-path feature (Phase 2+).
  -- Nothing reads these yet — they're here so that feature doesn't require a
  -- schema migration later.
  urgency_tier text,                 -- e.g. 'immediate', 'this_week', 'ongoing'
  stage_of_need text,                -- e.g. 'crisis', 'stabilizing', 'rebuilding'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null default '',
  phone text default '',
  address text default '',
  area text default '',
  hours text default '',
  requirements text default '',
  website text default '',
  note text default '',              -- anything else the submitter wants the reviewer to know
  submitter_type text not null default 'individual', -- 'individual' | 'organization'
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  reviewer_notes text default '',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Public visitors (the anon key used in the browser) may:
--   - read published resources
--   - create new submissions
-- Only an authenticated admin (a Supabase Auth user, checked via the
-- is_admin() helper below) may read/update submissions or write resources
-- directly. This is the whole moderation model: nothing reaches the public
-- directory without passing through the submissions table and an admin's
-- approval, which matches the review-queue workflow from the prototype.

alter table public.resources enable row level security;
alter table public.submissions enable row level security;

-- Swap this for a real admin-roles table if you ever add more than one
-- reviewer. For now, admin = signed-in Supabase Auth user (there's only
-- one: the account you create for yourself).
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null;
$$;

drop policy if exists "resources are publicly readable" on public.resources;
create policy "resources are publicly readable"
  on public.resources for select
  using (true);

drop policy if exists "only admins write resources" on public.resources;
create policy "only admins write resources"
  on public.resources for insert
  with check (public.is_admin());

drop policy if exists "only admins update resources" on public.resources;
create policy "only admins update resources"
  on public.resources for update
  using (public.is_admin());

drop policy if exists "only admins delete resources" on public.resources;
create policy "only admins delete resources"
  on public.resources for delete
  using (public.is_admin());

drop policy if exists "anyone can submit" on public.submissions;
create policy "anyone can submit"
  on public.submissions for insert
  with check (true);

drop policy if exists "only admins read submissions" on public.submissions;
create policy "only admins read submissions"
  on public.submissions for select
  using (public.is_admin());

drop policy if exists "only admins update submissions" on public.submissions;
create policy "only admins update submissions"
  on public.submissions for update
  using (public.is_admin());

-- Helpful indexes for the browse/search/filter queries.
create index if not exists resources_category_idx on public.resources (category);
create index if not exists submissions_status_idx on public.submissions (status);
