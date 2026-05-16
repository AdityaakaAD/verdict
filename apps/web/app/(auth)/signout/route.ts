// POST /signout — invalidates the Supabase session and redirects to the
// marketing page. Wired from a button in /settings (Phase 2) and the profile
// menu. Kept as a route handler (not a server action) so external nav can
// hit it cleanly.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
