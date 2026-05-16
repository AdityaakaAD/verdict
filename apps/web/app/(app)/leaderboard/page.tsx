import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TIERS, type TierId } from '@verdict/shared';

export const metadata = { title: 'Leaderboard — Verdict' };
export const dynamic = 'force-dynamic';

interface LeaderboardRow {
  user_id: string;
  alias: string;
  avatar_id: string;
  region: string;
  tier: string;
  quality_score: number;
  rounds_played: number;
}

interface ProfileRow {
  region: string;
  tier: string;
  verdict_score: number;
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/leaderboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('region, tier, verdict_score')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) redirect('/welcome');

  const tab = searchParams.tab === 'weekly' ? 'weekly' : 'daily';
  const view = tab === 'weekly' ? 'weekly_leaderboard' : 'daily_leaderboard';

  const { data: rawRows } = await supabase
    .from(view as 'daily_leaderboard')
    .select('user_id, alias, avatar_id, region, tier, quality_score, rounds_played')
    .eq('region', profile.region)
    .order('quality_score', { ascending: false })
    .limit(50);

  const rows = rawRows as LeaderboardRow[] | null;

  const entries = rows ?? [];
  const myRank = entries.findIndex((r) => r.user_id === user.id) + 1;

  return (
    <main className="mx-auto max-w-[480px] px-6 pb-24 pt-12">
      <header className="flex items-center justify-between">
        <Link href="/home" className="text-11 text-text-secondary label-caps hover:text-text-primary">
          ← Home
        </Link>
        <span className="text-11 text-text-tertiary label-caps">Leaderboard</span>
      </header>

      <h1 className="mt-10 font-serif text-28 font-medium">Leaderboard.</h1>
      <p className="mt-2 text-15 text-text-secondary">
        Ranked by quality score — minority wins, conversions, and top statements.
      </p>

      {/* Tab switcher */}
      <div className="mt-6 flex gap-2">
        {(['daily', 'weekly'] as const).map((t) => (
          <Link
            key={t}
            href={`/leaderboard?tab=${t}`}
            className={
              'flex h-9 flex-1 items-center justify-center rounded-md text-13 transition-colors ' +
              (tab === t
                ? 'bg-bg-secondary text-text-primary border-hairline'
                : 'text-text-secondary hover:text-text-primary')
            }
          >
            {t === 'daily' ? 'Today' : 'This week'}
          </Link>
        ))}
      </div>

      {/* My rank callout */}
      {myRank > 0 ? (
        <div className="mt-5 flex items-center justify-between rounded-md border-hairline-accent bg-bg-secondary px-4 py-3">
          <span className="text-13 text-text-secondary">Your rank</span>
          <span className="font-mono text-15 text-accent">#{myRank}</span>
        </div>
      ) : (
        <div className="mt-5 rounded-md border-hairline bg-bg-secondary px-4 py-3">
          <p className="text-13 text-text-secondary">
            Play a round tonight to appear on the leaderboard.
          </p>
        </div>
      )}

      {/* Table */}
      {entries.length === 0 ? (
        <div className="mt-8 rounded-md border-hairline bg-bg-secondary p-5">
          <p className="text-15 text-text-secondary">
            No results yet. The leaderboard populates after tonight's verdict.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {entries.map((row, i) => {
            const tierObj = TIERS.find((t) => t.id === (row.tier as TierId)) ?? TIERS[0]!;
            const isMe = row.user_id === user.id;
            return (
              <li
                key={row.user_id}
                className={
                  'flex items-center gap-4 rounded-md border-hairline bg-bg-secondary px-4 py-3 ' +
                  (isMe ? 'border-hairline-accent' : '')
                }
              >
                <span className="w-6 font-mono text-13 text-text-tertiary tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono text-13 text-text-primary">
                    @{row.alias}
                    {isMe ? <span className="ml-2 text-accent">· you</span> : null}
                  </p>
                  <p className="text-11 text-text-tertiary label-caps">
                    {tierObj.name} · {row.rounds_played} {row.rounds_played === 1 ? 'round' : 'rounds'}
                  </p>
                </div>
                <span className="font-mono text-15 text-text-primary tabular-nums">
                  {row.quality_score}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
