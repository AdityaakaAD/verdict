// Service-role Supabase client. Bypasses RLS. ONLY import this from:
//   - Route handlers under /app/api that have already authenticated the caller
//   - Cron job handlers protected by CRON_SECRET
//   - Server-side admin/moderation tooling
//
// Never expose this client to the browser bundle.

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
