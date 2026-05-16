-- scenarios: read-only public; writes are restricted to the service role
-- (curated seed, AI-generator cron, founder admin tooling).

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  question text not null,
  context_tag text,
  side_a_label text not null default 'Justified',
  side_b_label text not null default 'Not justified',
  side_a_meaning text not null,
  side_b_meaning text not null,
  category text not null,
  freshness_tier text not null,
  source text not null,
  region_locked text[] not null default '{}',
  language text not null default 'en',
  is_active boolean not null default true,
  vote_balance_score numeric not null default 0.5,
  total_plays integer not null default 0,
  total_a_votes integer not null default 0,
  total_b_votes integer not null default 0,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  constraint freshness_valid check (freshness_tier in ('evergreen','topical','seasonal')),
  constraint source_valid check (source in ('curated','ai_generated','user_submitted')),
  constraint category_valid check (category in (
    'personal_relationships','work_career','society_politics','tech_ai','justice_law',
    'health_medicine','money_wealth','environment','identity_belief','love_romance',
    'crime','the_future'
  ))
);

create index if not exists idx_scenarios_active on public.scenarios(is_active, freshness_tier);
create index if not exists idx_scenarios_category on public.scenarios(category);
create index if not exists idx_scenarios_language on public.scenarios(language);

alter table public.scenarios enable row level security;

drop policy if exists "active scenarios are readable" on public.scenarios;
create policy "active scenarios are readable"
  on public.scenarios for select
  to authenticated, anon
  using (is_active = true);
-- No insert/update/delete policies → only the service role can write.
