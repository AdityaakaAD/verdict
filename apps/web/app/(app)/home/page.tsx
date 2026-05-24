import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TIERS, type TierId } from '@verdict/shared';
import { createClient } from '@/lib/supabase/server';
import { FeaturedCard } from '@/components/home/FeaturedCard';
import { TopVoicesFeed } from '@/components/home/TopVoicesFeed';

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

interface GrandCaseRow {
  id: string;
  title: string;
  week_start: string;
  total_participants: number;
}

interface GrandCaseChapterRow {
  chapter_number: number;
  title: string;
  drops_at: string;
}

interface SpecialEventRow {
  id: string;
  text: string;
  question: string;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Active grand case
  const { data: grandCase } = await db
    .from('grand_cases')
    .select('id, title, week_start, total_participants')
    .eq('is_active', true)
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: GrandCaseRow | null };

  // Current dropped chapter
  let currentChapter: GrandCaseChapterRow | null = null;
  if (grandCase) {
    const { data: ch } = await db
      .from('grand_case_chapters')
      .select('chapter_number, title, drops_at')
      .eq('case_id', grandCase.id)
      .lte('drops_at', new Date().toISOString())
      .order('chapter_number', { ascending: false })
      .limit(1)
      .maybeSingle();
    currentChapter = ch as GrandCaseChapterRow | null;
  }

  // Special event scenario (breaking/topical, last 6 hours)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data: specialEvent } = await db
    .from('scenarios')
    .select('id, text, question')
    .eq('is_active', true)
    .eq('freshness_tier', 'topical')
    .gte('created_at', sixHoursAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: SpecialEventRow | null };

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

      {/* Special event — if active, shows ABOVE featured card */}
      {specialEvent && (
        <section className="mt-10">
          <Link href="/match" className="block">
            <div className="rounded-md border-hairline bg-bg-secondary p-5 relative overflow-hidden">
              {/* Pulsing live indicator */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="h-2 w-2 rounded-full bg-accent animate-pulse-subtle"
                  aria-hidden
                />
                <span className="text-11 text-accent label-caps font-medium">Live · Breaking</span>
              </div>
              <p className="font-serif text-15 leading-relaxed text-text-primary line-clamp-3">
                {specialEvent.text}
              </p>
              <p className="mt-2 text-13 text-text-secondary">{specialEvent.question}</p>
              <p className="mt-3 text-11 text-accent label-caps">Join now →</p>
            </div>
          </Link>
        </section>
      )}

      {/* Featured card — 3D tilt, noise texture, crimson depletion bar */}
      <section className={specialEvent ? 'mt-4' : 'mt-12'}>
        <FeaturedCard timezone={profile.timezone} />
        <div className="mt-3 flex flex-col gap-3">
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
              href="/swipe"
              className="flex h-11 items-center justify-center rounded-md border-hairline text-13 text-text-primary transition-colors duration-100 hover:border-hairline-active"
            >
              Swipe feed
            </Link>
          </div>
        </div>
      </section>

      {/* Grand Case card */}
      {grandCase && currentChapter && (
        <section className="mt-8">
          <Link href="/grand-case" className="block">
            <div className="rounded-md border-hairline bg-bg-secondary p-5 hover:border-hairline-active transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-11 text-accent label-caps font-medium">Grand Case</span>
                <span className="text-11 text-text-tertiary label-caps">
                  Day {currentChapter.chapter_number} of 5
                </span>
              </div>
              <p className="font-serif text-18 font-medium text-text-primary">
                {grandCase.title}
              </p>
              <p className="mt-1 text-13 text-text-secondary">{currentChapter.title}</p>
              {/* Progress dots */}
              <div className="mt-3 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="h-1 flex-1 rounded-full"
                    style={{
                      background:
                        n < currentChapter.chapter_number
                          ? 'var(--text-tertiary)'
                          : n === currentChapter.chapter_number
                          ? 'var(--accent)'
                          : 'var(--bg-tertiary)',
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-11 text-text-tertiary">
                  {grandCase.total_participants.toLocaleString()} following
                </span>
                <span className="text-11 text-text-secondary">Read today →</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Your standing */}
      <section className="mt-8 grid grid-cols-3 gap-3">
        <Stat label="Tier" value={tier!.name} />
        <Stat label="Score" value={String(profile.verdict_score)} mono />
        <Stat label="Streak" value={`${profile.current_streak}d`} mono accent={profile.current_streak > 0} />
      </section>

      {/* Yesterday's verdict */}
      <section className="mt-8">
        <p className="text-11 text-text-secondary label-caps">Yesterday</p>
        <div className="mt-3 rounded-md border-hairline bg-bg-secondary p-5">
          <p className="text-15 text-text-secondary">
            The courtroom hasn&apos;t met yet. When it does, last night&apos;s split lands here.
          </p>
        </div>
      </section>

      {/* Top voices */}
      <section className="mt-8">
        <p className="text-11 text-text-secondary label-caps">Top voices</p>
        <TopVoicesFeed voices={[]} />
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
        <Link
          href="/library"
          className="rounded-md border-hairline bg-bg-secondary p-5 transition-colors duration-100 hover:border-hairline-active"
        >
          <p className="text-11 text-text-secondary label-caps">Browse</p>
          <p className="mt-2 font-serif text-18">Scenario library</p>
        </Link>
        <Link
          href="/profile"
          className="rounded-md border-hairline bg-bg-secondary p-5 transition-colors duration-100 hover:border-hairline-active"
        >
          <p className="text-11 text-text-secondary label-caps">Identity</p>
          <p className="mt-2 font-serif text-18">Fingerprint</p>
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
