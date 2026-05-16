-- reports: spec section 19. Insertable by any authenticated user; only the
-- reporter (and service role) can read their own report.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) not null,
  reported_user_id uuid references public.profiles(id) not null,
  participant_id uuid references public.room_participants(id),
  reason text not null,
  details text,
  status text not null default 'pending',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reason_valid check (reason in (
    'harassment','hate_speech','spam','self_harm','explicit_content','other'
  )),
  constraint status_valid check (status in ('pending','resolved','dismissed'))
);

create index if not exists idx_reports_status on public.reports(status, created_at desc);
create index if not exists idx_reports_reported on public.reports(reported_user_id);

alter table public.reports enable row level security;

drop policy if exists "reports readable by reporter" on public.reports;
create policy "reports readable by reporter"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

drop policy if exists "reports insertable by authenticated" on public.reports;
create policy "reports insertable by authenticated"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);
