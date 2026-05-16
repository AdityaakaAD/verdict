// Server-side helper: pick a scenario for a practice round.
// Strategy: prefer scenarios the user hasn't played; fall back to any active
// scenario if their history is exhausted. Evergreen is preferred over
// topical/seasonal to keep practice rounds replayable across days.

import { createClient } from '@/lib/supabase/server';
import type { Scenario } from '@verdict/shared';

export async function loadPracticeScenario(userId: string): Promise<Scenario | null> {
  const supabase = createClient();

  // Try unseen first.
  const { data: history } = await supabase
    .from('user_scenario_history')
    .select('scenario_id')
    .eq('user_id', userId)
    .returns<{ scenario_id: string }[]>();

  const seenIds = (history ?? []).map((r) => r.scenario_id);

  let query = supabase
    .from('scenarios')
    .select('*')
    .eq('is_active', true)
    .eq('language', 'en')
    .order('freshness_tier', { ascending: true }) // evergreen sorts first alphabetically
    .limit(50);

  if (seenIds.length > 0) {
    query = query.not('id', 'in', `(${seenIds.join(',')})`);
  }

  const { data: rows } = await query.returns<ScenarioRow[]>();
  let picked: ScenarioRow | null =
    rows && rows.length > 0 ? rows[Math.floor(Math.random() * rows.length)]! : null;

  // If everything's been seen, fall back to any active scenario.
  if (!picked) {
    const { data: fallback } = await supabase
      .from('scenarios')
      .select('*')
      .eq('is_active', true)
      .eq('language', 'en')
      .limit(50)
      .returns<ScenarioRow[]>();
    if (fallback && fallback.length > 0) {
      picked = fallback[Math.floor(Math.random() * fallback.length)] ?? null;
    }
  }

  if (!picked) return null;
  return rowToScenario(picked);
}

interface ScenarioRow {
  id: string;
  text: string;
  question: string;
  context_tag: string | null;
  side_a_label: string;
  side_b_label: string;
  side_a_meaning: string;
  side_b_meaning: string;
  category: string;
  freshness_tier: string;
  source: string;
  region_locked: string[];
  language: string;
  is_active: boolean;
  vote_balance_score: number;
  total_plays: number;
  total_a_votes: number;
  total_b_votes: number;
}

function rowToScenario(row: {
  id: string;
  text: string;
  question: string;
  context_tag: string | null;
  side_a_label: string;
  side_b_label: string;
  side_a_meaning: string;
  side_b_meaning: string;
  category: string;
  freshness_tier: string;
  source: string;
  region_locked: string[];
  language: string;
  is_active: boolean;
  vote_balance_score: number;
  total_plays: number;
  total_a_votes: number;
  total_b_votes: number;
}): Scenario {
  return {
    id: row.id,
    text: row.text,
    question: row.question,
    contextTag: row.context_tag,
    sideALabel: row.side_a_label,
    sideBLabel: row.side_b_label,
    sideAMeaning: row.side_a_meaning,
    sideBMeaning: row.side_b_meaning,
    category: row.category as Scenario['category'],
    freshnessTier: row.freshness_tier as Scenario['freshnessTier'],
    source: row.source as Scenario['source'],
    regionLocked: row.region_locked,
    language: row.language,
    isActive: row.is_active,
    voteBalanceScore: row.vote_balance_score,
    totalPlays: row.total_plays,
    totalAVotes: row.total_a_votes,
    totalBVotes: row.total_b_votes,
  };
}
