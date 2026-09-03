-- Run this once in the Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).

-- ─────────────────────────────────────────────────────────────
-- profiles: one row per auth user, holds the app-facing profile + role
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null default 'Игрок',
  avatar text not null default 'User',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer so it can read profiles regardless of the caller's own RLS,
-- without which an admin-check policy on profiles would recurse into itself
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- admin can update ANY profile row (used by the admin panel to grant/revoke
-- the admin role for other users); protect_role() below still governs which
-- caller is actually allowed to change the role column itself
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- prevents a user from ever setting their own role to 'admin' via a client update,
-- even though the update policy above otherwise allows them to edit their own row.
-- auth.uid() is NULL when the change comes from outside PostgREST (SQL Editor,
-- migrations, service_role key) — those are trusted, so only block the case
-- where a logged-in client request is doing the change and isn't already an admin.
create or replace function public.protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger trg_protect_role
  before update on public.profiles
  for each row execute function public.protect_role();

-- auto-create the profile row right after Supabase Auth creates the user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'Игрок'));
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- progress: one row per user, holds the whole app progress blob as jsonb
-- ─────────────────────────────────────────────────────────────
create table public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "progress_owner_all" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "progress_admin_read" on public.progress
  for select using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- content_overrides: single shared row with admin-edited theory/quiz content
-- ─────────────────────────────────────────────────────────────
create table public.content_overrides (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.content_overrides enable row level security;

create policy "content_overrides_read_all" on public.content_overrides
  for select using (true);

create policy "content_overrides_write_admin" on public.content_overrides
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.content_overrides (id, data) values (1, '{}'::jsonb);

-- ─────────────────────────────────────────────────────────────
-- After running this once, promote an account to admin with:
--   update public.profiles set role = 'admin' where email = 'someone@example.com';
-- ─────────────────────────────────────────────────────────────
