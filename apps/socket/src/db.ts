// Supabase service-role writes. Only called by the socket server after a
// round completes — never from client-facing code paths.

import { createClient } from '@supabase/supabase-js';
import type { GameState, ParticipantState } from '@verdict/shared';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function persistRoundResult(roomId: string, state: GameState): Promise<void> {
  if (!state.result) return;

  const { result, participants } = state;

  // 1. Update the room row.
  await supabase
    .from('rooms')
    .update({
      state: 'completed',
      result_majority_side: result.majorityOutcome,
      result_minority_won: result.minorityWon,
      total_conversions: result.totalConversions,
      completed_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  // 2. Update each participant's row with final stats.
  await Promise.all(
    participants
      .filter((p) => !p.isBot && p.userId)
      .map((p) =>
        supabase
          .from('room_participants')
          .update({
            statement: p.statement,
            vote: p.vote,
            initial_vote: p.initialVote,
            changed_vote_during_conversion: p.changedVoteDuringConversion,
            was_minority: p.wasMinority,
            conversions_made: p.conversionsMade,
            statement_upvotes: p.statementUpvotes,
            score_delta: p.scoreDelta,
          })
          .eq('room_id', roomId)
          .eq('user_id', p.userId!),
      ),
  );

  // 3. Apply score deltas and update streaks for real players.
  await Promise.all(
    participants
      .filter((p) => !p.isBot && p.userId && p.scoreDelta !== 0)
      .map((p) => applyScoreDelta(p.userId!, p.scoreDelta)),
  );
}

async function applyScoreDelta(userId: string, delta: number): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('verdict_score, tier, last_played_date, current_streak')
    .eq('id', userId)
    .maybeSingle<{
      verdict_score: number;
      tier: string;
      last_played_date: string | null;
      current_streak: number;
    }>();

  if (!profile) return;

  const newScore = Math.max(0, profile.verdict_score + delta);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const newStreak =
    profile.last_played_date === today
      ? profile.current_streak
      : profile.last_played_date === yesterday
        ? profile.current_streak + 1
        : 1;

  const newTier = scoreToTier(newScore);

  await supabase
    .from('profiles')
    .update({
      verdict_score: newScore,
      tier: newTier,
      last_played_date: today,
      current_streak: newStreak,
    })
    .eq('id', userId);
}

function scoreToTier(score: number): string {
  if (score >= 2000) return 'oracle';
  if (score >= 1200) return 'justice';
  if (score >= 600) return 'advocate';
  if (score >= 200) return 'juror';
  return 'citizen';
}

/** Insert a room + participant rows before the game starts. Returns the room id. */
export async function createRoomInDb(opts: {
  scenarioId: string;
  type: string;
  region: string;
  participants: ParticipantState[];
}): Promise<string> {
  const { data: room, error } = await supabase
    .from('rooms')
    .insert({
      scenario_id: opts.scenarioId,
      type: opts.type,
      state: 'lobby',
      player_count: opts.participants.length,
      max_players: 10,
      region: opts.region,
    })
    .select('id')
    .single<{ id: string }>();

  if (error || !room) throw new Error(`Failed to create room: ${error?.message}`);

  await supabase.from('room_participants').insert(
    opts.participants.map((p) => ({
      room_id: room.id,
      user_id: p.userId ?? null,
      is_bot: p.isBot,
      bot_persona: p.botPersona ?? null,
    })),
  );

  return room.id;
}

/** Fetch a random active scenario for quick match. */
export async function pickScenario(region: string): Promise<{ id: string; row: unknown } | null> {
  const { data: rows } = await supabase
    .from('scenarios')
    .select('*')
    .eq('is_active', true)
    .eq('language', 'en')
    .limit(100);

  if (!rows || rows.length === 0) return null;
  const row = rows[Math.floor(Math.random() * rows.length)]!;
  return { id: (row as { id: string }).id, row };
}

export function rowToScenario(row: Record<string, unknown>) {
  return {
    id: row['id'] as string,
    text: row['text'] as string,
    question: row['question'] as string,
    contextTag: (row['context_tag'] as string | null) ?? null,
    sideALabel: row['side_a_label'] as string,
    sideBLabel: row['side_b_label'] as string,
    sideAMeaning: row['side_a_meaning'] as string,
    sideBMeaning: row['side_b_meaning'] as string,
    category: row['category'] as string,
    freshnessTier: row['freshness_tier'] as string,
    source: row['source'] as string,
    regionLocked: (row['region_locked'] as string[]) ?? [],
    language: row['language'] as string,
    isActive: row['is_active'] as boolean,
    voteBalanceScore: row['vote_balance_score'] as number,
    totalPlays: row['total_plays'] as number,
    totalAVotes: row['total_a_votes'] as number,
    totalBVotes: row['total_b_votes'] as number,
  };
}
