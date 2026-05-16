'use client';

// Browser-side Supabase client (anon key only — RLS enforces access).
// Typed via the Database type generated from the live project schema.

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (cached) return cached;
  cached = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return cached;
}
