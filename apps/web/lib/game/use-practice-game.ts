'use client';

// Practice-mode controller. Owns the GameState reducer, the 60-FPS-ish tick
// loop, and the scripted bot schedule. All state lives client-side; nothing
// here touches the server (no analytics writes, no scoring persistence).

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  createInitialState,
  phaseDurationSeconds,
  reduce,
  timeRemainingMs,
  type GameEvent,
  type GameState,
  type Scenario,
  type VoteSide,
} from '@verdict/shared';
import {
  buildPracticeRound,
  botStatement,
  PRACTICE_BOTS,
  type PracticeBotPlan,
} from './bots';

export interface PracticeUser {
  id: string;
  userId: string;
  alias: string;
  avatarId: Parameters<typeof buildPracticeRound>[0]['user']['avatarId'];
  tier: Parameters<typeof buildPracticeRound>[0]['user']['tier'];
}

export interface UsePracticeGameResult {
  state: GameState;
  plan: PracticeBotPlan;
  /** The participant ID of the human player (always the first participant). */
  userId: string;
  /** Milliseconds remaining in the current phase. Recomputed per tick. */
  remainingMs: number;
  /** True from the moment the round enters `voting` until the user has cast. */
  needsVote: boolean;
  submitStatement: (text: string) => void;
  submitVote: (vote: VoteSide) => void;
  changeVote: (vote: VoteSide) => void;
  upvote: (participantId: string) => void;
  /** Restart the round from `lobby` with fresh scripted bots. */
  reset: () => void;
}

/**
 * Drive the practice round. The hook re-seeds when `scenario` or `user.id`
 * change, otherwise it stays stable across renders.
 */
export function usePracticeGame(args: {
  scenario: Scenario;
  user: PracticeUser;
}): UsePracticeGameResult {
  const { scenario, user } = args;

  // Build the rigged round once per (scenario, user) pair. Re-seeded by reset().
  const [seed, setSeed] = useState(0);
  const plan = useMemo<PracticeBotPlan>(
    () =>
      buildPracticeRound({
        scenario,
        user: {
          id: user.id,
          userId: user.userId,
          alias: user.alias,
          avatarId: user.avatarId,
          tier: user.tier,
        },
        // Cheap deterministic RNG so a re-render doesn't reshuffle the round.
        rng: makeRng(`${user.id}:${scenario.id}:${seed}`),
      }),
    [scenario, user.id, user.userId, user.alias, user.avatarId, user.tier, seed],
  );

  const initialState = useMemo<GameState>(
    () => createInitialState({ scenario, participants: plan.participants, now: Date.now() }),
    [scenario, plan],
  );

  const [state, dispatch] = useReducer(reduce, initialState);

  // Reset the reducer state when the seed (and therefore the plan) changes.
  // Dispatch 'reset' with the freshly-computed initialState so the reducer
  // returns a brand-new lobby — force_advance stays completed on a finished game.
  const lastSeedRef = useRef(seed);
  useEffect(() => {
    if (lastSeedRef.current !== seed) {
      lastSeedRef.current = seed;
      dispatch({ type: 'reset', state: initialState });
    }
  }, [seed, initialState]);

  // Phase ticker — drives both phase-end advances and the bot schedule.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (state.phase === 'completed') return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [state.phase]);

  // Tick the machine whenever `now` crosses the phase boundary.
  useEffect(() => {
    dispatch({ type: 'tick', now });
  }, [now]);

  // -----------------------------------------------------------------------
  // Bot script execution
  // -----------------------------------------------------------------------

  // Track which scheduled events we've already dispatched so we don't replay.
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const elapsedInPhase = now - state.phaseStartedAt;

    if (state.phase === 'lobby') {
      // Practice mode skips the lobby — collapse it to ~1.5s of "joining...".
      if (elapsedInPhase >= 1500 && !firedRef.current.has('lobby_complete')) {
        firedRef.current.add('lobby_complete');
        dispatch({ type: 'force_advance', now });
      }
      return;
    }

    if (state.phase === 'statement') {
      PRACTICE_BOTS.forEach((bot) => {
        const key = `stmt:${bot.id}`;
        const due = plan.statementSchedule[bot.id] ?? 0;
        if (elapsedInPhase >= due && !firedRef.current.has(key)) {
          firedRef.current.add(key);
          const side = plan.initialVotes[bot.id]!;
          const text = botStatement(bot, scenario, side, hashSeed(`${bot.id}:${scenario.id}`));
          dispatch({ type: 'submit_statement', participantId: bot.id, text });
        }
      });
      return;
    }

    if (state.phase === 'voting') {
      PRACTICE_BOTS.forEach((bot) => {
        const key = `vote:${bot.id}`;
        const due = plan.voteSchedule[bot.id] ?? 0;
        if (elapsedInPhase >= due && !firedRef.current.has(key)) {
          firedRef.current.add(key);
          dispatch({
            type: 'submit_vote',
            participantId: bot.id,
            vote: plan.initialVotes[bot.id]!,
          });
        }
      });
      return;
    }

    if (state.phase === 'debate') {
      // Bots upvote the user's statement during debate if it exists. One
      // small ego-stroke for the player.
      const userParticipant = state.participants.find((p) => p.id === plan.participants[0]!.id);
      if (userParticipant?.statement && !firedRef.current.has('debate_upvote_round')) {
        firedRef.current.add('debate_upvote_round');
        // Two bots upvote the user — enough to clear the top-statement bonus.
        const upvoters = PRACTICE_BOTS.slice(0, 3);
        upvoters.forEach((bot) => {
          dispatch({
            type: 'upvote_statement',
            participantId: userParticipant.id,
            voterId: bot.id,
          });
        });
      }
      return;
    }

    if (state.phase === 'conversion') {
      plan.conversionFlips.forEach((flip) => {
        const key = `flip:${flip.participantId}`;
        if (elapsedInPhase >= flip.atMsIntoConversion && !firedRef.current.has(key)) {
          firedRef.current.add(key);
          dispatch({
            type: 'change_vote',
            participantId: flip.participantId,
            vote: flip.newSide,
          });
        }
      });
      return;
    }
  }, [now, state.phase, state.phaseStartedAt, state.participants, plan, scenario]);

  // -----------------------------------------------------------------------
  // Imperative actions surfaced to the UI
  // -----------------------------------------------------------------------

  const userParticipantId = plan.participants[0]!.id;

  const submitStatement = useCallback(
    (text: string) => {
      dispatch({ type: 'submit_statement', participantId: userParticipantId, text });
    },
    [userParticipantId],
  );

  const submitVote = useCallback(
    (vote: VoteSide) => {
      dispatch({ type: 'submit_vote', participantId: userParticipantId, vote });
    },
    [userParticipantId],
  );

  const changeVote = useCallback(
    (vote: VoteSide) => {
      dispatch({ type: 'change_vote', participantId: userParticipantId, vote });
    },
    [userParticipantId],
  );

  const upvote = useCallback(
    (participantId: string) => {
      dispatch({ type: 'upvote_statement', participantId, voterId: userParticipantId });
    },
    [userParticipantId],
  );

  const reset = useCallback(() => {
    firedRef.current = new Set();
    setSeed((s) => s + 1);
    setNow(Date.now());
  }, []);

  const userParticipant = state.participants.find((p) => p.id === userParticipantId);
  const needsVote = state.phase === 'voting' && (userParticipant?.vote ?? null) === null;

  return {
    state,
    plan,
    userId: userParticipantId,
    remainingMs: timeRemainingMs(state, now),
    needsVote,
    submitStatement,
    submitVote,
    changeVote,
    upvote,
    reset,
  };
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/** Small deterministic RNG; not cryptographic, just stable per seed string. */
function makeRng(seed: string): () => number {
  let h = hashSeed(seed);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 0xffffffff;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export { phaseDurationSeconds };
