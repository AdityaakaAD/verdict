import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MatchmakingClient } from './matchmaking-client';

export const metadata = { title: 'Finding a room — Verdict' };
export const dynamic = 'force-dynamic';

interface ProfileRow { region: string; timezone: string }

export default async function MatchPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/match');

  const { data: profile } = await supabase
    .from('profiles')
    .select('region, timezone')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) redirect('/welcome');

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center px-6">
      <MatchmakingClient region={profile.region} />
    </main>
  );
}
