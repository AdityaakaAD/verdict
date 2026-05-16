-- daily_leaderboard / weekly_leaderboard: materialized views refreshed every
-- 5 min by the leaderboard-refresh cron. Quality score (NOT total rounds) is
-- the ranking metric per spec section 10.

create materialized view if not exists public.daily_leaderboard as
select
  p.id as user_id,
  p.alias,
  p.avatar_id,
  p.region,
  p.tier,
  (
    coalesce(count(rp.id) filter (where rp.was_minority = true and r.result_minority_won = true), 0) * 3
    + coalesce(sum(rp.conversions_made), 0) * 2
    + coalesce(sum(rp.statement_upvotes), 0)
  )::int as quality_score,
  count(rp.id)::int as rounds_played
from public.profiles p
join public.room_participants rp on rp.user_id = p.id
join public.rooms r on r.id = rp.room_id
where r.completed_at >= current_date
  and p.show_on_leaderboard = true
  and p.is_banned = false
group by p.id, p.alias, p.avatar_id, p.region, p.tier;

create index if not exists idx_daily_lb_region_score
  on public.daily_leaderboard(region, quality_score desc);

create materialized view if not exists public.weekly_leaderboard as
select
  p.id as user_id,
  p.alias,
  p.avatar_id,
  p.region,
  p.tier,
  (
    coalesce(count(rp.id) filter (where rp.was_minority = true and r.result_minority_won = true), 0) * 3
    + coalesce(sum(rp.conversions_made), 0) * 2
    + coalesce(sum(rp.statement_upvotes), 0)
  )::int as quality_score,
  count(rp.id)::int as rounds_played
from public.profiles p
join public.room_participants rp on rp.user_id = p.id
join public.rooms r on r.id = rp.room_id
where r.completed_at >= date_trunc('week', current_date)
  and p.show_on_leaderboard = true
  and p.is_banned = false
group by p.id, p.alias, p.avatar_id, p.region, p.tier;

create index if not exists idx_weekly_lb_region_score
  on public.weekly_leaderboard(region, quality_score desc);

-- Helper called by the cron route. Concurrent refresh requires a unique
-- index, which we don't have on the materialized view itself — non-concurrent
-- is fine at the volumes we expect during Phase 4.
create or replace function public.refresh_leaderboards()
returns void
language plpgsql
as $$
begin
  refresh materialized view public.daily_leaderboard;
  refresh materialized view public.weekly_leaderboard;
end;
$$;
