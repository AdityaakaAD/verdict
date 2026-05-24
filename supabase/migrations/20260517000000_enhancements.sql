-- =============================================================================
-- VERDICT — Enhancement migrations (2026-05-17)
-- Adds: swipe_votes, moral_fingerprint, grand_cases, grand_case_chapters,
--        grand_case_votes, room_comments, room_comment_upvotes
-- Alters: scenarios (dimension_tags), profiles (is_first_verdict, has_seen_explainer)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Add new columns to existing tables
-- ---------------------------------------------------------------------------

-- scenarios: dimension tags for fingerprint scoring
alter table public.scenarios
  add column if not exists dimension_tags jsonb not null default '{}';

-- profiles: first-time flow + explainer tracking
alter table public.profiles
  add column if not exists is_first_verdict boolean not null default false,
  add column if not exists has_seen_explainer boolean not null default false;

-- ---------------------------------------------------------------------------
-- 1. swipe_votes — records each swipe-feed vote (one per user per scenario)
-- ---------------------------------------------------------------------------

create table if not exists public.swipe_votes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  scenario_id  uuid not null references public.scenarios(id) on delete cascade,
  vote         text not null check (vote in ('a', 'b')),
  created_at   timestamptz not null default now(),
  unique(user_id, scenario_id)
);

create index if not exists idx_swipe_votes_user     on public.swipe_votes(user_id);
create index if not exists idx_swipe_votes_scenario on public.swipe_votes(scenario_id);

alter table public.swipe_votes enable row level security;

create policy "swipe_votes: owner can insert"
  on public.swipe_votes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "swipe_votes: owner can read"
  on public.swipe_votes for select to authenticated
  using ((select auth.uid()) = user_id);

-- Materialized view: aggregate swipe split per scenario (refreshed via cron)
create materialized view if not exists public.scenario_swipe_stats as
  select
    scenario_id,
    count(*) filter (where vote = 'a') as a_count,
    count(*) filter (where vote = 'b') as b_count,
    count(*) as total
  from public.swipe_votes
  group by scenario_id
with data;

create unique index if not exists idx_swipe_stats_scenario
  on public.scenario_swipe_stats(scenario_id);

-- Service role can refresh; anon/authenticated can read
create policy "swipe_stats: readable by authenticated"
  on public.scenario_swipe_stats for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 2. moral_fingerprint — per-user dimension scores & archetype
-- ---------------------------------------------------------------------------

create table if not exists public.moral_fingerprint (
  user_id                  uuid primary key references public.profiles(id) on delete cascade,

  -- Moral dimension scores (0 = left pole, 100 = right pole, 50 = balanced)
  individual_vs_collective integer not null default 50
    check (individual_vs_collective between 0 and 100),
  rule_vs_outcome          integer not null default 50
    check (rule_vs_outcome between 0 and 100),
  loyalty_vs_honesty       integer not null default 50
    check (loyalty_vs_honesty between 0 and 100),
  caution_vs_action        integer not null default 50
    check (caution_vs_action between 0 and 100),
  head_vs_heart            integer not null default 50
    check (head_vs_heart between 0 and 100),

  -- Behavioural stats (computed server-side after each vote batch)
  minority_rate            numeric not null default 0,
  conversion_rate          numeric not null default 0,
  statement_quality        numeric not null default 0,
  consistency_score        numeric not null default 0,

  -- Derived identity label
  archetype                text,
  archetype_description    text,

  -- Peer percentiles (recalculated nightly)
  percentile_minority      integer,
  percentile_conversion    integer,

  total_votes              integer not null default 0,
  last_updated             timestamptz not null default now()
);

alter table public.moral_fingerprint enable row level security;

create policy "fingerprint: owner can read"
  on public.moral_fingerprint for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "fingerprint: owner can upsert"
  on public.moral_fingerprint for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "fingerprint: owner can update"
  on public.moral_fingerprint for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Public read for moral twin lookup (alias + dimensions only, no archetype description)
create policy "fingerprint: readable by authenticated for twin matching"
  on public.moral_fingerprint for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 3. grand_cases — weekly serial moral cases
-- ---------------------------------------------------------------------------

create table if not exists public.grand_cases (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  premise             text not null,
  category            text not null references public.scenarios(category) on delete restrict,
  week_start          date not null,
  is_active           boolean not null default true,
  total_participants  integer not null default 0,
  created_at          timestamptz not null default now()
);

create index if not exists idx_grand_cases_active on public.grand_cases(is_active, week_start desc);

alter table public.grand_cases enable row level security;

create policy "grand_cases: readable by authenticated"
  on public.grand_cases for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 4. grand_case_chapters — one chapter per day (Mon–Fri), drops at 9 PM IST
-- ---------------------------------------------------------------------------

create table if not exists public.grand_case_chapters (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid not null references public.grand_cases(id) on delete cascade,
  chapter_number  integer not null check (chapter_number between 1 and 5),
  title           text not null,
  content         text not null,
  question        text not null,
  side_a_label    text not null,
  side_b_label    text not null,
  side_a_meaning  text not null,
  side_b_meaning  text not null,
  drops_at        timestamptz not null,
  dimension_tags  jsonb not null default '{}',
  unique(case_id, chapter_number)
);

create index if not exists idx_chapters_case     on public.grand_case_chapters(case_id);
create index if not exists idx_chapters_drops_at on public.grand_case_chapters(drops_at);

alter table public.grand_case_chapters enable row level security;

create policy "chapters: readable by authenticated when dropped"
  on public.grand_case_chapters for select to authenticated
  using (drops_at <= now());

-- ---------------------------------------------------------------------------
-- 5. grand_case_votes — one vote per user per chapter
-- ---------------------------------------------------------------------------

create table if not exists public.grand_case_votes (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  case_id               uuid not null references public.grand_cases(id) on delete cascade,
  chapter_id            uuid not null references public.grand_case_chapters(id) on delete cascade,
  vote                  text not null check (vote in ('a', 'b')),
  changed_from_previous boolean not null default false,
  created_at            timestamptz not null default now(),
  unique(user_id, chapter_id)
);

create index if not exists idx_case_votes_user    on public.grand_case_votes(user_id);
create index if not exists idx_case_votes_case    on public.grand_case_votes(case_id);
create index if not exists idx_case_votes_chapter on public.grand_case_votes(chapter_id);

alter table public.grand_case_votes enable row level security;

create policy "case_votes: owner can insert"
  on public.grand_case_votes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "case_votes: readable by all authenticated (for flip stats)"
  on public.grand_case_votes for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 6. room_comments — post-game comment thread (expires 24 h after creation)
-- ---------------------------------------------------------------------------

create table if not exists public.room_comments (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  parent_id   uuid references public.room_comments(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 500),
  upvotes     integer not null default 0,
  created_at  timestamptz not null default now(),
  archived_at timestamptz generated always as (created_at + interval '24 hours') stored
);

create index if not exists idx_room_comments_room      on public.room_comments(room_id);
create index if not exists idx_room_comments_author    on public.room_comments(author_id);
create index if not exists idx_room_comments_parent    on public.room_comments(parent_id);
create index if not exists idx_room_comments_archived  on public.room_comments(archived_at);

alter table public.room_comments enable row level security;

create policy "room_comments: readable by authenticated"
  on public.room_comments for select to authenticated
  using (true);

create policy "room_comments: author can insert"
  on public.room_comments for insert to authenticated
  with check ((select auth.uid()) = author_id);

create policy "room_comments: author can update upvotes"
  on public.room_comments for update to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- 7. room_comment_upvotes — deduplicated upvote tracking
-- ---------------------------------------------------------------------------

create table if not exists public.room_comment_upvotes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.room_comments(id) on delete cascade,
  primary key(user_id, comment_id)
);

alter table public.room_comment_upvotes enable row level security;

create policy "comment_upvotes: owner can insert"
  on public.room_comment_upvotes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "comment_upvotes: owner can read"
  on public.room_comment_upvotes for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 8. Helper: refresh scenario_swipe_stats (called by cron / API route)
-- ---------------------------------------------------------------------------

create or replace function public.refresh_swipe_stats()
returns void
language plpgsql
set search_path = public, pg_temp
as $$
begin
  refresh materialized view concurrently public.scenario_swipe_stats;
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. Helper: upsert_fingerprint_vote — called server-side after each vote
--    Moves the relevant dimension by 2 points toward the voted pole.
--    Each dimension key in dimension_tags: "a" means side A = left pole.
-- ---------------------------------------------------------------------------

create or replace function public.upsert_fingerprint_vote(
  p_user_id    uuid,
  p_scenario_id uuid,
  p_vote       text   -- 'a' or 'b'
)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_tags jsonb;
  v_dim  text;
  v_pole text;  -- 'left' or 'right' relative to stored dimension
  v_delta integer;
begin
  select dimension_tags into v_tags from public.scenarios where id = p_scenario_id;
  if v_tags is null or v_tags = '{}'::jsonb then return; end if;

  -- Ensure row exists
  insert into public.moral_fingerprint(user_id)
  values (p_user_id)
  on conflict(user_id) do nothing;

  -- For each dimension in tags, move score by ±2
  for v_dim, v_pole in
    select key, value::text from jsonb_each_text(v_tags)
  loop
    -- tag value 'a' means voting A = left pole (lower score)
    -- tag value 'b' means voting B = left pole
    if (v_pole = 'a' and p_vote = 'a') or (v_pole = 'b' and p_vote = 'b') then
      v_delta := -2;  -- toward left pole (0)
    else
      v_delta := 2;   -- toward right pole (100)
    end if;

    case v_dim
      when 'individual_vs_collective' then
        update public.moral_fingerprint
        set individual_vs_collective = greatest(0, least(100, individual_vs_collective + v_delta)),
            total_votes = total_votes + 1,
            last_updated = now()
        where user_id = p_user_id;
      when 'rule_vs_outcome' then
        update public.moral_fingerprint
        set rule_vs_outcome = greatest(0, least(100, rule_vs_outcome + v_delta)),
            total_votes = total_votes + 1,
            last_updated = now()
        where user_id = p_user_id;
      when 'loyalty_vs_honesty' then
        update public.moral_fingerprint
        set loyalty_vs_honesty = greatest(0, least(100, loyalty_vs_honesty + v_delta)),
            total_votes = total_votes + 1,
            last_updated = now()
        where user_id = p_user_id;
      when 'caution_vs_action' then
        update public.moral_fingerprint
        set caution_vs_action = greatest(0, least(100, caution_vs_action + v_delta)),
            total_votes = total_votes + 1,
            last_updated = now()
        where user_id = p_user_id;
      when 'head_vs_heart' then
        update public.moral_fingerprint
        set head_vs_heart = greatest(0, least(100, head_vs_heart + v_delta)),
            total_votes = total_votes + 1,
            last_updated = now()
        where user_id = p_user_id;
      else null;
    end case;
  end loop;
end;
$$;
