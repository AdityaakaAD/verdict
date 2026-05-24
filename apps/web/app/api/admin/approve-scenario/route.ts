// GET /api/admin/approve-scenario?id=<uuid>&token=<prefix>
//
// One-click approve link sent in the founder digest email.
// Sets is_active=true and freshness_tier='topical' on the scenario.
// Secured by a token that matches the first 8 chars of the service role key.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  if (!id || !token) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';
  if (!serviceKey.startsWith(token) || token.length < 8) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from('scenarios')
    .update({ is_active: true, freshness_tier: 'topical' })
    .eq('id', id)
    .eq('source', 'ai_generated');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Redirect to admin confirmation page (or home if none)
  return NextResponse.redirect(new URL(`/?approved=${id}`, request.nextUrl.origin));
}
