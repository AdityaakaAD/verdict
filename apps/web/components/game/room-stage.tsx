'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type {
  GameState,
  ParticipantState,
  Scenario,
  VoteSide,
} from '@verdict/shared';
import { phaseDurationSeconds } from '@verdict/shared';
import { PhaseLobby } from './phase-lobby';
import { PhaseScenario } from './phase-scenario';
import { PhaseStatement } from './phase-statement';
import { PhaseVoting } from './phase-voting';
import { PhaseReveal } from './phase-reveal';
import { PhaseDebate } from './phase-debate';
import { PhaseConversion } from './phase-conversion';
import { PhaseResult } from './phase-result';

// Renders the right per-phase screen for a given GameState. The same
// component is used by both practice mode (Phase 2) and the live socket
// page (Phase 3) — only the dispatchers differ.

export interface RoomStageHandlers {
  onSubmitStatement: (text: string) => void;
  onSubmitVote: (vote: VoteSide) => void;
  onChangeVote: (vote: VoteSide) => void;
  onUpvote: (participantId: string) => void;
  onPlayAgain?: () => void;
}

interface Props {
  state: GameState;
  selfId: string;
  remainingMs: number;
  handlers: RoomStageHandlers;
  /** Where the "back to home" CTA on the result screen should go. */
  homeHref?: string;
}

export function RoomStage({ state, selfId, remainingMs, handlers, homeHref = '/home' }: Props) {
  const scenario = state.scenario as Scenario | null;

  if (!scenario) return null;

  const total = phaseDurationSeconds(state.phase) * 1000;
  const minoritySide = state.revealSnapshot?.minoritySide ?? 'tie';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.phase}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
      >
        {state.phase === 'lobby' ? (
          <PhaseLobby participants={state.participants} remainingMs={remainingMs} />
        ) : null}

        {state.phase === 'scenario' ? (
          <PhaseScenario scenario={scenario} remainingMs={remainingMs} totalMs={total} />
        ) : null}

        {state.phase === 'statement' ? (
          <PhaseStatement
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            remainingMs={remainingMs}
            totalMs={total}
            onSubmit={handlers.onSubmitStatement}
          />
        ) : null}

        {state.phase === 'voting' ? (
          <PhaseVoting
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            remainingMs={remainingMs}
            totalMs={total}
            onVote={handlers.onSubmitVote}
          />
        ) : null}

        {state.phase === 'reveal' ? (
          <PhaseReveal
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            minoritySide={minoritySide}
            voteBreakdown={countVotes(state.participants)}
          />
        ) : null}

        {state.phase === 'debate' ? (
          <PhaseDebate
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            minoritySide={minoritySide}
            remainingMs={remainingMs}
            totalMs={total}
            onUpvote={handlers.onUpvote}
          />
        ) : null}

        {state.phase === 'conversion' ? (
          <PhaseConversion
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            remainingMs={remainingMs}
            totalMs={total}
            onChangeVote={handlers.onChangeVote}
          />
        ) : null}

        {(state.phase === 'result' || state.phase === 'completed') && state.result ? (
          <PhaseResult
            scenario={scenario}
            participants={state.participants}
            result={state.result}
            selfId={selfId}
            primaryCta={
              handlers.onPlayAgain
                ? { label: 'Play another practice round', onClick: handlers.onPlayAgain }
                : undefined
            }
            secondaryCta={{ label: 'Back to the courtroom', href: homeHref }}
          />
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}

function countVotes(participants: ParticipantState[]): { a: number; b: number } {
  return participants.reduce(
    (acc, p) => {
      if (p.vote === 'a') acc.a += 1;
      else if (p.vote === 'b') acc.b += 1;
      return acc;
    },
    { a: 0, b: 0 },
  );
}
