-- featured_scenarios: the once-a-day, 9 PM local-time Featured drop per
-- region. Unique (drop_at, region) guarantees one Featured per region per day.

create table if not exists public.featured_scenarios (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid references public.scenarios(id) not null,
  drop_at timestamptz not null,
  region text not null default 'IN',
  total_participants integer not null default 0,
  global_a_count integer not null default 0,
  global_b_count integer not null default 0,
  unique(drop_at, region)
);

create index if not exists idx_featured_drop on public.featured_scenarios(drop_at, region);

alter table public.featured_scenarios enable row level security;

drop policy if exists "featured scenarios readable by authenticated" on public.featured_scenarios;
create policy "featured scenarios readable by authenticated"
  on public.featured_scenarios for select
  to authenticated, anon
  using (true);
