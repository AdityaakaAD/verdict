-- user_scenario_history: prevents repeat-serving the same scenario.
-- Owner-only read; service role writes on round completion.

create table if not exists public.user_scenario_history (
  user_id uuid references public.profiles(id) on delete cascade,
  scenario_id uuid references public.scenarios(id) on delete cascade,
  played_at timestamptz not null default now(),
  primary key(user_id, scenario_id)
);

alter table public.user_scenario_history enable row level security;

drop policy if exists "history is readable by owner" on public.user_scenario_history;
create policy "history is readable by owner"
  on public.user_scenario_history for select
  to authenticated
  using (auth.uid() = user_id);
