// POST /api/swipe/refresh-stats
//
// Refreshes the scenario_swipe_stats materialized view and returns updated
// vote counts + top statements for a given scenario (or a global refresh if
// no scenario_id is provided).
//
// Called by:
//   - The swipe feed after each batch of 10 votes
//   - The result screen of /swipe to get the latest split before showing it
//
// Auth: requires a valid user session (anon can't refresh).

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RefreshBody {
  scenario_id?: string;
}

interface StatsRow {
  scenario_id: string;
  total_votes: number;
  a_votes: number;
  b_votes: number;
  a_pct: number;
  b_pct: number;
}

interface StatementRow {
  participant_id: string;
  text: string;
  upvotes: number;
  vote: string;
  alias: string;
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: RefreshBody = {};
  try {
    body = await request.json() as RefreshBody;
  } catch {
    // No body — global refresh
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Refresh the materialized view (admin-level RPC exposed as SECURITY DEFINER)
  const { error: refreshError } = await db.rpc('refresh_swipe_stats');
  if (refreshError) {
    console.error('[refresh-stats] RPC error:', refreshError);
    return NextResponse.json({ error: 'Failed to refresh stats' }, { status: 500 });
  }

  // If a scenario_id was provided, return updated stats for that scenario
  if (body.scenario_id) {
    const { data: stats } = await db
      .from('scenario_swipe_stats')
      .select('scenario_id, total_votes, a_votes, b_votes, a_pct, b_pct')
      .eq('scenario_id', body.scenario_id)
      .maybeSingle() as { data: StatsRow | null };

    // Top 3 statements (from completed rooms that used this scenario)
    const { data: statementsRaw } = await db
      .from('room_participants')
      .select('id, statement, statement_upvotes, vote, profiles!user_id(alias)')
      .not('statement', 'is', null)
      .eq('rooms.scenario_id', body.scenario_id)
      .order('statement_upvotes', { ascending: false })
      .limit(3) as { data: StatementRow[] | null };

    return NextResponse.json({
      refreshed: true,
      stats: stats ?? null,
      topStatements: (statementsRaw ?? []).map((s) => ({
        text: s.text,
        upvotes: s.upvotes,
        vote: s.vote,
        alias: s.alias,
      })),
    });
  }

  return NextResponse.json({ refreshed: true });
}
