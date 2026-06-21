-- ============================================================
--  SPACE PORTFOLIO — Supabase schema
--  Run this once in the Supabase SQL Editor (Dashboard → SQL).
--  Creates tables, Row Level Security policies and storage buckets.
-- ============================================================

-- ── Helper: keep updated_at fresh ────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
--  TABLES
-- ============================================================

-- ── Projects ─────────────────────────────────────────────────
create table if not exists public.projects (
  id          bigint generated always as identity primary key,
  title       text        not null,
  short       text        default '',
  description text        default '',
  category    text        not null default 'Full Stack',
  tech        jsonb       not null default '[]'::jsonb,
  year        text        not null default '2024',
  status      text        not null default 'Live',
  color       text        not null default '#00f5ff',
  links       jsonb       not null default '{}'::jsonb,
  featured    boolean     not null default false,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_projects_featured on public.projects (featured);
create index if not exists idx_projects_sort on public.projects (sort_order desc, created_at desc);

-- ── Papers (research / publications) ─────────────────────────
create table if not exists public.papers (
  id          bigint generated always as identity primary key,
  title       text        not null,
  authors     text        not null default '',
  abstract    text        default '',
  venue       text        not null default '',
  year        text        not null default '2024',
  tags        jsonb       not null default '[]'::jsonb,
  link        text        not null default '',
  file_path   text        not null default '',   -- object path in the "papers" storage bucket
  file_name   text        not null default '',   -- original filename
  featured    boolean     not null default false,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_papers_featured on public.papers (featured);
create index if not exists idx_papers_sort on public.papers (sort_order desc, year desc);

-- ── CV entries (experience / education) ──────────────────────
create table if not exists public.cv_entries (
  id           bigint generated always as identity primary key,
  section      text        not null default 'experience',  -- 'experience' | 'education'
  role         text        not null,
  organization text        not null default '',
  location     text        not null default '',
  period       text        not null default '',
  description  text        default '',
  sort_order   int         not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_cv_section on public.cv_entries (section, sort_order);

-- ── Settings (key/value — e.g. the uploaded CV file) ─────────
create table if not exists public.settings (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz not null default now()
);

-- ── updated_at triggers ──────────────────────────────────────
drop trigger if exists trg_projects_updated  on public.projects;
drop trigger if exists trg_papers_updated     on public.papers;
drop trigger if exists trg_cv_updated         on public.cv_entries;
drop trigger if exists trg_settings_updated   on public.settings;
create trigger trg_projects_updated before update on public.projects   for each row execute function public.set_updated_at();
create trigger trg_papers_updated   before update on public.papers      for each row execute function public.set_updated_at();
create trigger trg_cv_updated       before update on public.cv_entries   for each row execute function public.set_updated_at();
create trigger trg_settings_updated before update on public.settings     for each row execute function public.set_updated_at();

-- ============================================================
--  ROW LEVEL SECURITY
--  Public can READ everything. Only authenticated (logged-in
--  admin) users can write.
-- ============================================================
alter table public.projects   enable row level security;
alter table public.papers     enable row level security;
alter table public.cv_entries enable row level security;
alter table public.settings   enable row level security;

-- Projects
drop policy if exists "projects public read"  on public.projects;
drop policy if exists "projects admin write"   on public.projects;
create policy "projects public read" on public.projects for select using (true);
create policy "projects admin write" on public.projects for all to authenticated using (true) with check (true);

-- Papers
drop policy if exists "papers public read"  on public.papers;
drop policy if exists "papers admin write"   on public.papers;
create policy "papers public read" on public.papers for select using (true);
create policy "papers admin write" on public.papers for all to authenticated using (true) with check (true);

-- CV entries
drop policy if exists "cv public read"  on public.cv_entries;
drop policy if exists "cv admin write"   on public.cv_entries;
create policy "cv public read" on public.cv_entries for select using (true);
create policy "cv admin write" on public.cv_entries for all to authenticated using (true) with check (true);

-- Settings
drop policy if exists "settings public read"  on public.settings;
drop policy if exists "settings admin write"   on public.settings;
create policy "settings public read" on public.settings for select using (true);
create policy "settings admin write" on public.settings for all to authenticated using (true) with check (true);

-- ============================================================
--  STORAGE BUCKETS  (public read, authenticated write)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('papers', 'papers', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('cv', 'cv', true)
on conflict (id) do update set public = true;

-- Public read for both buckets
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id in ('papers', 'cv'));

-- Authenticated users can upload / update / delete
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id in ('papers', 'cv'));

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id in ('papers', 'cv'));

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id in ('papers', 'cv'));

-- ============================================================
--  DONE.
--  Next: create your admin user in Dashboard → Authentication
--  → Users → "Add user" (email + password). That email/password
--  is what you'll use to log into /admin.
-- ============================================================
