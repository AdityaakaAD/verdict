import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SoundToggle } from '@/components/settings/sound-toggle';
import { ProfileToggle } from '@/components/settings/profile-toggle';

export const metadata = { title: 'Settings — Verdict' };
export const dynamic = 'force-dynamic';

interface SettingsRow {
  alias: string;
  region: string;
  timezone: string;
  show_on_leaderboard: boolean;
  notifications_drop: boolean;
  notifications_reveal: boolean;
  notifications_social: boolean;
}

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/settings');

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'alias, region, timezone, show_on_leaderboard, notifications_drop, notifications_reveal, notifications_social',
    )
    .eq('id', user.id)
    .maybeSingle<SettingsRow>();
  if (!profile) redirect('/welcome');

  return (
    <main className="mx-auto max-w-[480px] px-6 pb-24 pt-12">
      <header className="flex items-center justify-between">
        <Link href="/home" className="text-11 text-text-secondary label-caps hover:text-text-primary">
          ← Home
        </Link>
        <span className="text-11 text-text-tertiary label-caps">Settings</span>
      </header>

      <h1 className="mt-10 font-serif text-28 font-medium">Settings</h1>

      <section className="mt-8 rounded-md border-hairline bg-bg-secondary px-5">
        <SectionHeader>Notifications</SectionHeader>
        <ProfileToggle
          field="notifications_drop"
          label="Tonight’s verdict reminder"
          description="A nudge at 8:45 pm local time, fifteen minutes before the drop."
          initial={profile.notifications_drop}
        />
        <ProfileToggle
          field="notifications_reveal"
          label="Morning recap"
          description="At 9 am, see how the world voted last night."
          initial={profile.notifications_reveal}
        />
        <ProfileToggle
          field="notifications_social"
          label="Social"
          description="Upvotes on your statements and your friends’ activity. Batched."
          initial={profile.notifications_social}
        />
      </section>

      <section className="mt-6 rounded-md border-hairline bg-bg-secondary px-5">
        <SectionHeader>Privacy</SectionHeader>
        <ProfileToggle
          field="show_on_leaderboard"
          label="Show me on the leaderboard"
          description="Your alias appears in the daily and weekly rankings if you place."
          initial={profile.show_on_leaderboard}
        />
      </section>

      <section className="mt-6 rounded-md border-hairline bg-bg-secondary px-5">
        <SectionHeader>Sound</SectionHeader>
        <SoundToggle />
      </section>

      <section className="mt-6 rounded-md border-hairline bg-bg-secondary px-5">
        <SectionHeader>Account</SectionHeader>
        <Row label="Alias" value={`@${profile.alias}`} />
        <Row label="Region" value={profile.region} />
        <Row label="Timezone" value={profile.timezone} />
      </section>

      <form action="/signout" method="post" className="mt-8">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-md border-hairline text-15 text-text-primary transition-colors duration-100 hover:border-hairline-active"
        >
          Sign out
        </button>
      </form>

      <footer className="mt-12 flex items-center justify-between text-11 text-text-tertiary label-caps">
        <Link href="/legal">Legal</Link>
        <span className="h-1 w-1 rounded-full bg-text-tertiary" aria-hidden />
        <Link href="/legal#guidelines">Guidelines</Link>
        <span className="h-1 w-1 rounded-full bg-text-tertiary" aria-hidden />
        <Link href="/legal#grievance">Grievance</Link>
      </footer>
    </main>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-b-hairline pb-3 pt-5 text-11 text-text-secondary label-caps">
      {children}
    </p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b-hairline py-4 last:border-b-0">
      <span className="text-13 text-text-secondary">{label}</span>
      <span className="font-mono text-13 text-text-primary">{value}</span>
    </div>
  );
}
