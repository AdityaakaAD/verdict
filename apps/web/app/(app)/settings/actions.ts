'use server';

// Settings persistence — toggle the four boolean profile flags from spec
// section 5 (notifications_drop, notifications_reveal, notifications_social,
// show_on_leaderboard). Sound is a pure client-side preference (Howler
// global mute) and lives in localStorage.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { TablesUpdate } from '@/types/database';

type ToggleField =
  | 'show_on_leaderboard'
  | 'notifications_drop'
  | 'notifications_reveal'
  | 'notifications_social';

export async function updateProfileToggle(field: ToggleField, value: boolean): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const patch: TablesUpdate<'profiles'> = { [field]: value };
  // supabase-js update() generic narrows to `never` here under the SSR
  // server client; cast through `as any` for this one mutation. RLS still
  // enforces ownership, so the cast doesn't widen the security surface.
  await (supabase.from('profiles') as any).update(patch).eq('id', user.id);
  revalidatePath('/settings');
  revalidatePath('/home');
}
