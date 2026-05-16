import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TIERS, type AvatarId, type TierId } from '@verdict/shared';
import { createClient } from '@/lib/supabase/server';
import { AvatarMark } from '@/components/game/avatar-mark';

export const metadata = { title: 'Profile — Verdict' };
export const dynamic = 'force-dynamic';

interface ProfileRow {
  alias: string;
  avatar_id: string;
  region: string;
  timezone: string;
  tier: string;
  verdict_score: number;
  current_streak: number;
  longest_streak: number;
  invite_code: string;
  successful_invites: number;
  badges_earned: string[];
  created_at: string;
}

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/profile');

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'alias, avatar_id, region, timezone, tier, verdict_score, current_streak, longest_streak, invite_code, successful_invites, badges_earned, created_at',
    )
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) redirect('/welcome');

  const tierIdx = TIERS.findIndex((t) => t.id === (profile.tier as TierId));
  const tier = TIERS[Math.max(0, tierIdx)] ?? TIERS[0];
  const nextTier = TIERS[Math.min(TIERS.length - 1, tierIdx + 1)];
  const tierProgress = tier.max === Infinity
    ? 1
    : Math.min(1, Math.max(0, (profile.verdict_score - tier.min) / (tier.max - tier.min)));

  return (
    <main className="mx-auto max-w-[480px] px-6 pb-24 pt-12">
      <header className="flex items-center justify-between">
        <Link href="/home" className="text-11 text-text-secondary label-caps hover:text-text-primary">
          ← Home
        </Link>
        <Link
          href="/settings"
          className="text-11 text-text-secondary label-caps hover:text-text-primary"
        >
          Settings
        </Link>
      </header>

      <section className="mt-10 flex items-center gap-4">
        <AvatarMark avatarId={profile.avatar_id as AvatarId} size="lg" />
        <div>
          <p className="font-mono text-15 text-text-primary">@{profile.alias}</p>
          <p className="font-mono text-11 text-text-tertiary label-caps">
            {profile.region} · {tier.name}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-11 text-text-secondary label-caps">Verdict score</p>
        <p className="mt-2 font-mono text-36 text-text-primary tabular-nums">
          {profile.verdict_score}
        </p>
        <div className="mt-3 h-1.5 w-full rounded-full bg-bg-tertiary">
          <div
            className="h-1.5 rounded-full bg-accent"
            style={{ width: `${tierProgress * 100}%` }}
          />
        </div>
        {nextTier && nextTier.id !== tier.id ? (
          <p className="mt-2 text-11 text-text-tertiary label-caps">
            {nextTier.min - profile.verdict_score > 0
              ? `${nextTier.min - profile.verdict_score} to ${nextTier.name}`
              : `Promoted to ${nextTier.name}`}
          </p>
        ) : (
          <p className="mt-2 text-11 text-text-tertiary label-caps">Top tier</p>
        )}
      </section>

      <section className="mt-10 grid grid-cols-2 gap-3">
        <Stat label="Current streak" value={`${profile.current_streak}d`} accent={profile.current_streak > 0} />
        <Stat label="Longest streak" value={`${profile.longest_streak}d`} />
        <Stat label="Badges" value={`${profile.badges_earned.length}/50`} />
        <Stat label="Invites converted" value={String(profile.successful_invites)} />
      </section>

      <section className="mt-10 rounded-md border-hairline bg-bg-secondary p-5">
        <p className="text-11 text-text-secondary label-caps">Invite a juror</p>
        <p className="mt-2 font-mono text-22 text-text-primary tabular-nums">
          {profile.invite_code}
        </p>
        <p className="mt-2 text-13 text-text-secondary">
          Share this code. When someone joins their first real round, you both unlock a badge.
        </p>
      </section>

      <section className="mt-10">
        <p className="text-11 text-text-secondary label-caps">Recent rounds</p>
        <div className="mt-3 rounded-md border-hairline bg-bg-secondary p-5">
          <p className="text-15 text-text-secondary">
            Your round history will land here. Practice doesn’t count.
          </p>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border-hairline bg-bg-secondary p-4">
      <p className="text-11 text-text-secondary label-caps">{label}</p>
      <p
        className={
          'mt-2 font-mono text-22 tabular-nums ' +
          (accent ? 'text-accent' : 'text-text-primary')
        }
      >
        {value}
      </p>
    </div>
  );
}
