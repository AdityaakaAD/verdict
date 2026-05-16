import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TIERS, type TierId } from '@verdict/shared';
import { createClient } from '@/lib/supabase/server';
import { HomeCountdown } from '@/components/home/countdown';

export const metadata = { title: 'Home — Verdict' };
export const dynamic = 'force-dynamic';

interface ProfileRow {
  alias: string;
  avatar_id: string;
  region: string;
  timezone: string;
  tier: string;
  verdict_score: number;
  current_streak: number;
}

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/home');

  const { data: profile } = await supabase
    .from('profiles')
    .select('alias, avatar_id, region, timezone, tier, verdict_score, current_streak')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) redirect('/welcome');

  const tier = TIERS.find((t) => t.id === (profile.tier as TierId)) ?? TIERS[0];

  return (
    <main className="mx-auto max-w-[480px] px-6 pb-28 pt-12">
      <header className="flex items-center justify-between">
        <span className="font-serif text-22 font-medium tracking-tight">verdict</span>
        <Link
          href="/profile"
          className="font-mono text-13 text-text-secondary hover:text-text-primary"
        >
          @{profile.alias}
        </Link>
      </header>

      {/* Tonight's verdict — the page's centerpiece */}
      <section className="mt-12 rounded-lg border-hairline bg-bg-secondary p-5">
        <div className="flex items-center justify-between">
          <p className="text-11 text-text-secondary label-caps">
            <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-accent align-middle" aria-hidden />
            Tonight’s verdict
          </p>
          <HomeCountdown timezone={profile.timezone} />
        </div>
        <h1 className="mt-3 font-serif text-22 font-medium leading-tight">
          The courtroom opens at 9:00 pm.
        </h1>
        <p className="mt-2 text-13 text-text-secondary">
          One scenario. Five minutes. Reserve your seat when the timer hits zero.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <Link
            href="/match"
            className="flex h-11 items-center justify-center rounded-md bg-accent text-13 font-medium text-bg-primary transition-colors duration-100 hover:bg-accent-hover"
          >
            Quick match
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/room/practice"
              className="flex h-11 items-center justify-center rounded-md border-hairline text-13 text-text-primary transition-colors duration-100 hover:border-hairline-active"
            >
              Practice round
            </Link>
            <Link
              href="/library"
              className="flex h-11 items-center justify-center rounded-md border-hairline text-13 text-text-primary transition-colors duration-100 hover:border-hairline-active"
            >
              Browse library
            </Link>
          </div>
        </div>
      </section>

      {/* Your standing */}
      <section className="mt-8 grid grid-cols-3 gap-3">
        <Stat label="Tier" value={tier.name} />
        <Stat label="Score" value={String(profile.verdict_score)} mono />
        <Stat label="Streak" value={`${profile.current_streak}d`} mono accent={profile.current_streak > 0} />
      </section>

      {/* Yesterday's verdict — placeholder until Phase 4 completes a real round */}
      <section className="mt-8">
        <p className="text-11 text-text-secondary label-caps">Yesterday</p>
        <div className="mt-3 rounded-md border-hairline bg-bg-secondary p-5">
          <p className="text-15 text-text-secondary">
            The courtroom hasn’t met yet. When it does, last night’s split lands here.
          </p>
        </div>
      </section>

      {/* Top voices — placeholder until real upvotes exist */}
      <section className="mt-8">
        <p className="text-11 text-text-secondary label-caps">Top voices</p>
        <div className="mt-3 rounded-md border-hairline bg-bg-secondary p-5">
          <p className="text-15 text-text-secondary">
            Statements that win the room show up here the next morning.
          </p>
        </div>
      </section>

      {/* Secondary destinations */}
      <section className="mt-8 grid grid-cols-2 gap-3">
        <Link
          href="/leaderboard"
          className="rounded-md border-hairline bg-bg-secondary p-5 transition-colors duration-100 hover:border-hairline-active"
        >
          <p className="text-11 text-text-secondary label-caps">Today</p>
          <p className="mt-2 font-serif text-18">Leaderboard</p>
        </Link>
        <Link
          href="/feed"
          className="rounded-md border-hairline bg-bg-secondary p-5 transition-colors duration-100 hover:border-hairline-active"
        >
          <p className="text-11 text-text-secondary label-caps">Yesterday</p>
          <p className="mt-2 font-serif text-18">Top voices</p>
        </Link>
      </section>

      <footer className="mt-12 flex items-center justify-between text-11 text-text-tertiary label-caps">
        <Link href="/settings">Settings</Link>
        <span className="h-1 w-1 rounded-full bg-text-tertiary" aria-hidden />
        <Link href="/legal">Legal</Link>
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border-hairline bg-bg-secondary p-4">
      <p className="text-11 text-text-secondary label-caps">{label}</p>
      <p
        className={
          'mt-2 ' +
          (mono ? 'font-mono ' : 'font-serif ') +
          'text-18 ' +
          (accent ? 'text-accent' : 'text-text-primary')
        }
      >
        {value}
      </p>
    </div>
  );
}
