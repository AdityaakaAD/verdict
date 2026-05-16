// Pure-reducer game state machine. No runtime deps — both the web client
// (practice mode) and the socket server can wrap this to drive the same
// logic. Phase 3 will optionally hoist this into an XState chart on the
// server for visualization + test-time time-travel; the reducer stays the
// authoritative transition function.
//
// All phases & timings come from PHASE_DURATIONS in constants.ts.

import { PHASE_DURATIONS, ROOM_LIMITS, SCORING, STATEMENT_MAX_LENGTH } from './constants';
import type { AvatarId, TierId } from './constants';
import type { GamePhase, MajorityOutcome, Scenario, VoteSide } from './types';

// =============================================================================
// State shapes
// =============================================================================

export interface ParticipantState {
  id: string;
  userId: string | null;
  isBot: boolean;
  botPersona: string | null;
  alias: string;
  avatarId: AvatarId;
  tier: TierId;
  statement: string | null;
  vote: VoteSide | null;
  initialVote: VoteSide | null;
  changedVoteDuringConversion: boolean;
  wasMinority: boolean | null;
  conversionsMade: number;
  statementUpvotes: number;
  scoreDelta: number;
  isConnected: boolean;
}

export interface ResultState {
  majorityOutcome: MajorityOutcome;
  minorityWon: boolean;
  totalConversions: number;
  voteBreakdown: { a: number; b: number };
  topStatement: { participantId: string; text: string; upvotes: number } | null;
}

export interface GameState {
  phase: GamePhase;
  phaseStartedAt: number; // ms epoch
  phaseEndsAt: number; // ms epoch
  scenario: Scenario | null;
  participants: ParticipantState[];
  /** Snapshot of the vote split captured at the start of reveal — drives the conversion bonus math. */
  revealSnapshot: {
    aIds: string[];
    bIds: string[];
    minoritySide: VoteSide | 'tie';
  } | null;
  result: ResultState | null;
}

// =============================================================================
// Events the reducer accepts
// =============================================================================

export type GameEvent =
  | { type: 'lobby_complete' }
  | { type: 'tick'; now: number }
  | { type: 'submit_statement'; participantId: string; text: string }
  | { type: 'submit_vote'; participantId: string; vote: VoteSide }
  | { type: 'change_vote'; participantId: string; vote: VoteSide }
  | { type: 'upvote_statement'; voterId: string; participantId: string }
  | { type: 'force_advance'; now: number }
  | { type: 'reset'; state: GameState };

// =============================================================================
// Public helpers
// =============================================================================

export function phaseDurationSeconds(phase: GamePhase): number {
  if (phase === 'completed') return 0;
  return PHASE_DURATIONS[phase];
}

export function nextPhase(current: GamePhase): GamePhase {
  switch (current) {
    case 'lobby':
      return 'scenario';
    case 'scenario':
      return 'statement';
    case 'statement':
      return 'voting';
    case 'voting':
      return 'reveal';
    case 'reveal':
      return 'debate';
    case 'debate':
      return 'conversion';
    case 'conversion':
      return 'result';
    case 'result':
      return 'completed';
    case 'completed':
      return 'completed';
  }
}

export function createInitialState(args: {
  scenario: Scenario | null;
  participants: ParticipantState[];
  now: number;
}): GameState {
  return {
    phase: 'lobby',
    phaseStartedAt: args.now,
    phaseEndsAt: args.now + phaseDurationSeconds('lobby') * 1000,
    scenario: args.scenario,
    participants: args.participants,
    revealSnapshot: null,
    result: null,
  };
}

// =============================================================================
// Reducer
// =============================================================================

export function reduce(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case 'tick':
      return tick(state, event.now);
    case 'lobby_complete':
      if (state.phase !== 'lobby') return state;
      return advance(state, state.phaseEndsAt - phaseDurationSeconds('lobby') * 1000);
    case 'force_advance':
      return advance(state, event.now);
    case 'reset':
      return event.state;
    case 'submit_statement':
      return applyStatement(state, event.participantId, event.text);
    case 'submit_vote':
      return applyVote(state, event.participantId, event.vote, /*allowChange*/ false);
    case 'change_vote':
      return applyVote(state, event.participantId, event.vote, /*allowChange*/ true);
    case 'upvote_statement':
      return applyUpvote(state, event.participantId, event.voterId);
  }
}

function tick(state: GameState, now: number): GameState {
  if (state.phase === 'completed') return state;
  if (now < state.phaseEndsAt) return state;
  return advance(state, now);
}

function advance(state: GameState, now: number): GameState {
  const next = nextPhase(state.phase);
  const ends = now + phaseDurationSeconds(next) * 1000;

  // Compute side-effects at the moment we cross into specific phases.
  let participants = state.participants;
  let revealSnapshot = state.revealSnapshot;
  let result = state.result;

  if (next === 'reveal' && state.phase === 'voting') {
    revealSnapshot = computeRevealSnapshot(participants);
    participants = participants.map((p) => ({
      ...p,
      initialVote: p.vote,
      wasMinority:
        revealSnapshot!.minoritySide === 'tie'
          ? false
          : p.vote === revealSnapshot!.minoritySide,
    }));
  }

  if (next === 'result' && state.phase === 'conversion' && revealSnapshot) {
    const finalized = finalizeRoundResult(participants, revealSnapshot);
    participants = finalized.participants;
    result = finalized.result;
  }

  return {
    ...state,
    phase: next,
    phaseStartedAt: now,
    phaseEndsAt: ends,
    participants,
    revealSnapshot,
    result,
  };
}

// =============================================================================
// Statement + vote + upvote application
// =============================================================================

function applyStatement(state: GameState, participantId: string, text: string): GameState {
  if (state.phase !== 'statement') return state;
  const trimmed = text.slice(0, STATEMENT_MAX_LENGTH);
  return {
    ...state,
    participants: state.participants.map((p) =>
      p.id === participantId ? { ...p, statement: trimmed } : p,
    ),
  };
}

function applyVote(
  state: GameState,
  participantId: string,
  vote: VoteSide,
  allowChange: boolean,
): GameState {
  const p = state.participants.find((x) => x.id === participantId);
  if (!p) return state;

  if (state.phase === 'voting') {
    return {
      ...state,
      participants: state.participants.map((x) =>
        x.id === participantId ? { ...x, vote } : x,
      ),
    };
  }

  if (state.phase === 'conversion' && allowChange) {
    if (p.vote === vote) return state;
    return {
      ...state,
      participants: state.participants.map((x) =>
        x.id === participantId
          ? { ...x, vote, changedVoteDuringConversion: true }
          : x,
      ),
    };
  }

  return state;
}

function applyUpvote(state: GameState, participantId: string, voterId: string): GameState {
  if (participantId === voterId) return state;
  if (state.phase !== 'debate' && state.phase !== 'conversion' && state.phase !== 'result') {
    return state;
  }
  return {
    ...state,
    participants: state.participants.map((p) =>
      p.id === participantId ? { ...p, statementUpvotes: p.statementUpvotes + 1 } : p,
    ),
  };
}

// =============================================================================
// Reveal / result computation
// =============================================================================

function computeRevealSnapshot(participants: ParticipantState[]): GameState['revealSnapshot'] {
  const aIds = participants.filter((p) => p.vote === 'a').map((p) => p.id);
  const bIds = participants.filter((p) => p.vote === 'b').map((p) => p.id);
  if (aIds.length === bIds.length) {
    return { aIds, bIds, minoritySide: 'tie' };
  }
  const minoritySide: VoteSide = aIds.length < bIds.length ? 'a' : 'b';
  return { aIds, bIds, minoritySide };
}

function finalizeRoundResult(
  participants: ParticipantState[],
  reveal: NonNullable<GameState['revealSnapshot']>,
): { participants: ParticipantState[]; result: ResultState } {
  const aFinal = participants.filter((p) => p.vote === 'a').length;
  const bFinal = participants.filter((p) => p.vote === 'b').length;

  let majorityOutcome: MajorityOutcome;
  if (aFinal === participants.length) majorityOutcome = 'unanimous';
  else if (bFinal === participants.length) majorityOutcome = 'unanimous';
  else if (aFinal === bFinal) majorityOutcome = 'hung';
  else majorityOutcome = aFinal > bFinal ? 'a' : 'b';

  // Did minority win? Only meaningful when initial minority side flipped majority.
  let minorityWon = false;
  if (reveal.minoritySide !== 'tie') {
    const finalMajoritySide = majorityOutcome === 'a' || majorityOutcome === 'b' ? majorityOutcome : null;
    minorityWon = finalMajoritySide === reveal.minoritySide;
  }

  // Conversions: count participants whose vote now equals the original minority side
  // but who started on the opposite side.
  let totalConversions = 0;
  const minoritySideForCompare = reveal.minoritySide === 'tie' ? null : reveal.minoritySide;
  const participantsScored = participants.map((p) => {
    const startedOnMinority = minoritySideForCompare !== null && p.initialVote === minoritySideForCompare;
    const finishedOnMinority = minoritySideForCompare !== null && p.vote === minoritySideForCompare;
    let conversionsMade = p.conversionsMade;
    // Conversion credit is awarded post-hoc to the people who *stayed* on the
    // original minority side after the debate succeeded — they did the convincing.
    if (minorityWon && startedOnMinority && finishedOnMinority && !p.changedVoteDuringConversion) {
      // We attribute conversions evenly to minority holders. Cleaner attribution
      // (per persuasive statement) lands in Phase 3 with the socket-side log.
    }
    if (p.changedVoteDuringConversion && finishedOnMinority && minorityWon) {
      totalConversions += 1;
    }
    return { ...p, conversionsMade };
  });

  // Distribute conversion credit across the minority holders.
  if (minorityWon && totalConversions > 0) {
    const minorityHolders = participantsScored.filter(
      (p) => minoritySideForCompare !== null
        && p.initialVote === minoritySideForCompare
        && !p.changedVoteDuringConversion,
    );
    if (minorityHolders.length > 0) {
      const each = Math.floor(totalConversions / minorityHolders.length);
      const remainder = totalConversions - each * minorityHolders.length;
      minorityHolders.forEach((holder, i) => {
        const bump = each + (i < remainder ? 1 : 0);
        const idx = participantsScored.findIndex((p) => p.id === holder.id);
        if (idx >= 0) {
          participantsScored[idx] = {
            ...participantsScored[idx]!,
            conversionsMade: participantsScored[idx]!.conversionsMade + bump,
          };
        }
      });
    }
  }

  // Final per-participant score delta (spec section 10).
  const withScores = participantsScored.map((p) => {
    const wonRound =
      (p.wasMinority && minorityWon) || (!p.wasMinority && !minorityWon);
    let delta: number;
    if (majorityOutcome === 'unanimous') {
      delta = SCORING.unanimousBonus;
    } else if (wonRound) {
      delta = p.wasMinority ? SCORING.baseWinMinority : SCORING.baseWinMajority;
    } else {
      delta = SCORING.baseLoss;
    }
    delta += p.conversionsMade * SCORING.perConversion;
    if (p.statementUpvotes >= SCORING.topStatementThreshold) {
      delta += SCORING.topStatementBonus;
    }
    if (p.changedVoteDuringConversion) {
      delta += SCORING.convertedPenalty;
    }
    return { ...p, scoreDelta: delta };
  });

  // Top statement: highest upvotes, tiebreak by lowest participant id (stable).
  const topStatementHolder = [...withScores]
    .filter((p) => p.statement && p.statementUpvotes > 0)
    .sort((a, b) =>
      b.statementUpvotes - a.statementUpvotes || (a.id < b.id ? -1 : 1),
    )[0];

  const result: ResultState = {
    majorityOutcome,
    minorityWon,
    totalConversions,
    voteBreakdown: { a: aFinal, b: bFinal },
    topStatement: topStatementHolder
      ? {
          participantId: topStatementHolder.id,
          text: topStatementHolder.statement!,
          upvotes: topStatementHolder.statementUpvotes,
        }
      : null,
  };

  return { participants: withScores, result };
}

// =============================================================================
// Convenience selectors used by the UI
// =============================================================================

export function votedCount(state: GameState): number {
  return state.participants.filter((p) => p.vote !== null).length;
}

export function totalPlayers(state: GameState): number {
  return state.participants.length;
}

export function isPhaseExpired(state: GameState, now: number): boolean {
  return now >= state.phaseEndsAt;
}

export function timeRemainingMs(state: GameState, now: number): number {
  return Math.max(0, state.phaseEndsAt - now);
}

export const ROOM_MIN_PLAYERS = ROOM_LIMITS.minPlayers;
