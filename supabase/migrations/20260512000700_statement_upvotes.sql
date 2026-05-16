-- statement_upvotes: one upvote per (user, statement). Primary key handles dedupe.

create table if not exists public.statement_upvotes (
  upvoter_id uuid references public.profiles(id) on delete cascade,
  participant_id uuid references public.room_participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(upvoter_id, participant_id)
);

create index if not exists idx_upvotes_participant on public.statement_upvotes(participant_id);

alter table public.statement_upvotes enable row level security;

drop policy if exists "upvotes readable by authenticated" on public.statement_upvotes;
create policy "upvotes readable by authenticated"
  on public.statement_upvotes for select
  to authenticated
  using (true);

drop policy if exists "upvotes insertable by upvoter" on public.statement_upvotes;
create policy "upvotes insertable by upvoter"
  on public.statement_upvotes for insert
  to authenticated
  with check (auth.uid() = upvoter_id);
