-- rooms: visible to authenticated users when they are a participant, or
-- when the room is in a completed state (for archive browsing).

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid references public.scenarios(id) not null,
  type text not null,
  state text not null default 'lobby',
  current_phase_ends_at timestamptz,
  player_count integer not null default 0,
  max_players integer not null default 10,
  invite_code text unique,
  region text not null default 'IN',
  result_majority_side text,
  result_minority_won boolean,
  total_conversions integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint type_valid check (type in ('featured','quick_match','private','practice')),
  constraint state_valid check (state in (
    'lobby','scenario','statement','voting','reveal','debate','conversion','result','completed'
  )),
  constraint result_side_valid check (result_majority_side is null or result_majority_side in ('a','b','hung','unanimous'))
);

create index if not exists idx_rooms_state on public.rooms(state);
create index if not exists idx_rooms_scenario on public.rooms(scenario_id);
create index if not exists idx_rooms_completed on public.rooms(completed_at) where completed_at is not null;

alter table public.rooms enable row level security;

drop policy if exists "rooms readable by participants or when completed" on public.rooms;
create policy "rooms readable by participants or when completed"
  on public.rooms for select
  to authenticated
  using (
    state = 'completed'
    or exists (
      select 1 from public.room_participants rp
      where rp.room_id = rooms.id and rp.user_id = auth.uid()
    )
  );
-- Writes are service-role only (socket server).
