import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface AuthUser {
  id: string;
  alias: string;
  avatarId: string;
  tier: string;
  region: string;
  isBanned: boolean;
}

/** Verify a Supabase JWT and return the authenticated user's profile.
 *  Returns null if the token is invalid or the profile does not exist. */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('alias, avatar_id, tier, region, is_banned')
    .eq('id', user.id)
    .maybeSingle<{
      alias: string;
      avatar_id: string;
      tier: string;
      region: string;
      is_banned: boolean;
    }>();

  if (!profile) return null;
  if (profile.is_banned) return null;

  return {
    id: user.id,
    alias: profile.alias,
    avatarId: profile.avatar_id,
    tier: profile.tier,
    region: profile.region,
    isBanned: false,
  };
}
