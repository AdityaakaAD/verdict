// Server-side helper: load the practice user's profile row.

import { createClient } from '@/lib/supabase/server';
import type { AvatarId, TierId } from '@verdict/shared';

export interface PracticeProfile {
  id: string;
  alias: string;
  avatarId: AvatarId;
  tier: TierId;
}

interface ProfileRow {
  id: string;
  alias: string;
  avatar_id: string;
  tier: string;
}

export async function loadPracticeProfile(): Promise<PracticeProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, alias, avatar_id, tier')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (!data) return null;

  return {
    id: data.id,
    alias: data.alias,
    avatarId: data.avatar_id as AvatarId,
    tier: data.tier as TierId,
  };
}
