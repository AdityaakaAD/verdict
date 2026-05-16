'use server';

import { createClient } from '@/lib/supabase/server';
import type { Scenario } from '@verdict/shared';

interface ScenarioRow {
  id: string; text: string; question: string; context_tag: string | null;
  side_a_label: string; side_b_label: string; side_a_meaning: string;
  side_b_meaning: string; category: string; freshness_tier: string;
  source: string; region_locked: string[]; language: string;
  is_active: boolean; vote_balance_score: number; total_plays: number;
  total_a_votes: number; total_b_votes: number;
}

function rowToScenario(row: ScenarioRow): Scenario {
  return {
    id: row.id, text: row.text, question: row.question,
    contextTag: row.context_tag, sideALabel: row.side_a_label,
    sideBLabel: row.side_b_label, sideAMeaning: row.side_a_meaning,
    sideBMeaning: row.side_b_meaning,
    category: row.category as Scenario['category'],
    freshnessTier: row.freshness_tier as Scenario['freshnessTier'],
    source: row.source as Scenario['source'],
    regionLocked: row.region_locked, language: row.language,
    isActive: row.is_active, voteBalanceScore: row.vote_balance_score,
    totalPlays: row.total_plays, totalAVotes: row.total_a_votes,
    totalBVotes: row.total_b_votes,
  };
}

/** Returns a random active scenario that is not the currently-shown one. */
export async function getNextScenario(excludeId: string): Promise<Scenario | null> {
  const supabase = createClient();

  const { data: rows } = await supabase
    .from('scenarios')
    .select('*')
    .eq('is_active', true)
    .eq('language', 'en')
    .neq('id', excludeId)
    .limit(100)
    .returns<ScenarioRow[]>();

  if (!rows || rows.length === 0) return null;
  const pick = rows[Math.floor(Math.random() * rows.length)]!;
  return rowToScenario(pick);
}
