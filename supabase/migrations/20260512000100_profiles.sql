-- profiles: extends auth.users with public-facing identity + game stats.
-- RLS: all authenticated users can read; only the owner can update.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  alias text unique not null,
  avatar_id text not null,
  region text not null default 'IN',
  timezone text not null default 'Asia/Kolkata',
  interests text[] not null default '{}',
  show_on_leaderboard boolean not null default true,
  verdict_score integer not null default 100,
  tier text not null default 'citizen',
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_played_date date,
  badges_earned text[] not null default '{}',
  invite_code text unique not null,
  invited_by_user_id uuid references public.profiles(id),
  successful_invites integer not null default 0,
  notifications_drop boolean not null default true,
  notifications_reveal boolean not null default true,
  notifications_social boolean not null default false,
  sound_enabled boolean not null default true,
  is_banned boolean not null default false,
  ban_reason text,
  warning_count integer not null default 0,
  created_at timestamptz not null default now(),
  -- guardrails enforced by spec section 13 + 24
  constraint alias_format check (alias ~ '^[a-z0-9_]{3,15}$'),
  constraint tier_valid check (tier in ('citizen','juror','advocate','justice','oracle'))
);

create index if not exists idx_profiles_score on public.profiles(verdict_score desc);
create index if not exists idx_profiles_invite on public.profiles(invite_code);
create index if not exists idx_profiles_region on public.profiles(region);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by authenticated users" on public.profiles;
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles are insertable by the owner" on public.profiles;
create policy "profiles are insertable by the owner"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles are updatable by the owner" on public.profiles;
create policy "profiles are updatable by the owner"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Convenience function used in /auth/callback fallbacks. Generates a short,
-- URL-safe invite code. Collisions are vanishingly rare at 8 chars but the
-- column unique constraint backstops it.
create or replace function public.gen_invite_code()
returns text
language sql
as $$
  select substr(
    translate(
      encode(gen_random_bytes(6), 'base64'),
      '/+=', 'xyz'
    ),
    1, 8
  );
$$;
