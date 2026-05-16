import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LiveRoom } from './live-room';

export const metadata = { title: 'Room — Verdict' };
export const dynamic = 'force-dynamic';

interface ProfileRow { id: string; alias: string; avatar_id: string; tier: string }

export default async function RoomPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/room/${params.id}`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, alias, avatar_id, tier')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) redirect('/welcome');

  // Check if this room exists in Supabase (completed rooms are public).
  const { data: room } = await supabase
    .from('rooms')
    .select('id, state')
    .eq('id', params.id)
    .maybeSingle<{ id: string; state: string }>();

  if (!room) notFound();

  return (
    <main className="mx-auto max-w-[520px] px-6 pb-24 pt-8">
      <LiveRoom
        roomId={params.id}
        selfUserId={profile.id}
      />
    </main>
  );
}
