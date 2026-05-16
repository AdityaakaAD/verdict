-- Addresses Supabase advisor findings from the initial schema:
--   - function_search_path_mutable (gen_invite_code, refresh_leaderboards)
--   - extension_in_public (citext)
--   - materialized_view_in_api (daily_leaderboard, weekly_leaderboard)
--   - auth_rls_initplan on 7 policies
--   - unindexed_foreign_keys on 5 FKs

-- 1. Pin search_path on functions; reference pgcrypto explicitly via the
--    extensions schema so the function stays callable.
create or replace function public.gen_invite_code()
returns text
language sql
set search_path = public, extensions, pg_temp
as $$
  select substr(
    translate(
      encode(extensions.gen_random_bytes(6), 'base64'),
      '/+=', 'xyz'
    ),
    1, 8
  );
$$;

create or replace function public.refresh_leaderboards()
returns void
language plpgsql
set search_path = public, pg_temp
as $$
begin
  refresh materialized view public.daily_leaderboard;
  refresh materialized view public.weekly_leaderboard;
end;
$$;

-- 2. Move citext into the extensions schema (where pgcrypto lives).
drop extension if exists citext;
create extension if not exists citext schema extensions;

-- 3. Materialized leaderboard views shouldn't be reachable via the data API.
--    Reads route through a server endpoint using the service role.
revoke select on public.daily_leaderboard from anon, authenticated;
revoke select on public.weekly_leaderboard from anon, authenticated;

-- 4. Wrap auth.uid() in (select ...) so the planner caches the result and
--    doesn't re-evaluate per row.
drop policy if exists "profiles are insertable by the owner" on public.profiles;
create policy "profiles are insertable by the owner"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles are updatable by the owner" on public.profiles;
create policy "profiles are updatable by the owner"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "rooms readable by participants or when completed" on public.rooms;
create policy "rooms readable by participants or when completed"
  on public.rooms for select
  to authenticated
  using (
    state = 'completed'
    or exists (
      select 1 from public.room_participants rp
      where rp.room_id = rooms.id and rp.user_id = (select auth.uid())
    )
  );

drop policy if exists "participants readable if user is in the room or it is completed" on public.room_participants;
create policy "participants readable if user is in the room or it is completed"
  on public.room_participants for select
  to authenticated
  using (
    exists (
      select 1 from public.rooms r
      where r.id = room_participants.room_id
        and (r.state = 'completed' or exists (
          select 1 from public.room_participants self
          where self.room_id = r.id and self.user_id = (select auth.uid())
        ))
    )
  );

drop policy if exists "history is readable by owner" on public.user_scenario_history;
create policy "history is readable by owner"
  on public.user_scenario_history for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "upvotes insertable by upvoter" on public.statement_upvotes;
create policy "upvotes insertable by upvoter"
  on public.statement_upvotes for insert
  to authenticated
  with check ((select auth.uid()) = upvoter_id);

drop policy if exists "reports readable by reporter" on public.reports;
create policy "reports readable by reporter"
  on public.reports for select
  to authenticated
  using ((select auth.uid()) = reporter_id);

drop policy if exists "reports insertable by authenticated" on public.reports;
create policy "reports insertable by authenticated"
  on public.reports for insert
  to authenticated
  with check ((select auth.uid()) = reporter_id);

-- 5. Covering indexes on foreign keys.
create index if not exists idx_featured_scenarios_scenario on public.featured_scenarios(scenario_id);
create index if not exists idx_profiles_invited_by on public.profiles(invited_by_user_id);
create index if not exists idx_reports_participant on public.reports(participant_id);
create index if not exists idx_reports_reporter on public.reports(reporter_id);
create index if not exists idx_history_scenario on public.user_scenario_history(scenario_id);
