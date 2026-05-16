-- room_participants: per-user record for a single room. Statement, vote,
-- conversion data, and resulting score delta live here.

create table if not exists public.room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  is_bot boolean not null default false,
  bot_persona text,
  statement text,
  vote text,
  initial_vote text,
  changed_vote_during_conversion boolean not null default false,
  was_minority boolean,
  conversions_made integer not null default 0,
  statement_upvotes integer not null default 0,
  score_delta integer not null default 0,
  joined_at timestamptz not null default now(),
  unique(room_id, user_id),
  constraint vote_valid check (vote is null or vote in ('a','b')),
  constraint initial_vote_valid check (initial_vote is null or initial_vote in ('a','b')),
  constraint user_or_bot check (
    (is_bot = true and user_id is null)
    or (is_bot = false and user_id is not null)
  )
);

create index if not exists idx_participants_room on public.room_participants(room_id);
create index if not exists idx_participants_user on public.room_participants(user_id);

alter table public.room_participants enable row level security;

drop policy if exists "participants readable if user is in the room or it's completed" on public.room_participants;
create policy "participants readable if user is in the room or it's completed"
  on public.room_participants for select
  to authenticated
  using (
    exists (
      select 1 from public.rooms r
      where r.id = room_participants.room_id
        and (r.state = 'completed' or exists (
          select 1 from public.room_participants self
          where self.room_id = r.id and self.user_id = auth.uid()
        ))
    )
  );
-- Writes are service-role only (socket server).
