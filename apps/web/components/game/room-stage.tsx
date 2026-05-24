'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { GameState, ParticipantState, Scenario, VoteSide } from '@verdict/shared';
import { phaseDurationSeconds } from '@verdict/shared';
import type { Rebuttal } from '@/lib/socket/use-room';
import { LobbyScreen } from './GamePhases/LobbyScreen';
import { ScenarioReveal } from './GamePhases/ScenarioReveal';
import { StatementPhase } from './GamePhases/StatementPhase';
import { VotingPhase } from './GamePhases/VotingPhase';
import { RevealSequence } from './GamePhases/RevealSequence';
import { DebatePhase } from './GamePhases/DebatePhase';
import { ConversionEvent } from './GamePhases/ConversionEvent';
import { ResultScreen } from './GamePhases/ResultScreen';

// Renders the right per-phase screen for a given GameState. Used by both
// practice mode and the live socket page — only the dispatchers differ.

export interface RoomStageHandlers {
  onSubmitStatement: (text: string) => void;
  onSubmitVote: (vote: VoteSide) => void;
  onChangeVote: (vote: VoteSide) => void;
  onUpvote: (participantId: string) => void;
  onSendRebuttal?: (parentParticipantId: string, text: string) => void;
  onReport?: (participantId: string) => void;
  onPlayAgain?: () => void;
}

export type { Rebuttal };

interface Props {
  state: GameState;
  selfId: string;
  remainingMs: number;
  handlers: RoomStageHandlers;
  homeHref?: string;
  roomId?: string;
  selfUserId?: string;
  rebuttals?: Rebuttal[];
}

export function RoomStage({ state, selfId, remainingMs, handlers, homeHref = '/home', roomId, selfUserId, rebuttals = [] }: Props) {
  const scenario = state.scenario as Scenario | null;
  if (!scenario) return null;

  const total = phaseDurationSeconds(state.phase) * 1000;
  const minoritySide = state.revealSnapshot?.minoritySide ?? 'tie';
  const voteBreakdown = countVotes(state.participants);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {state.phase === 'lobby' && (
          <LobbyScreen
            participants={state.participants}
            selfId={selfId}
            remainingMs={remainingMs}
          />
        )}

        {state.phase === 'scenario' && (
          <ScenarioReveal
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            remainingMs={remainingMs}
            totalMs={total}
          />
        )}

        {state.phase === 'statement' && (
          <StatementPhase
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            remainingMs={remainingMs}
            totalMs={total}
            onSubmit={handlers.onSubmitStatement}
          />
        )}

        {state.phase === 'voting' && (
          <VotingPhase
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            remainingMs={remainingMs}
            totalMs={total}
            onVote={handlers.onSubmitVote}
          />
        )}

        {state.phase === 'reveal' && (
          <RevealSequence
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            minoritySide={minoritySide}
            voteBreakdown={voteBreakdown}
          />
        )}

        {state.phase === 'debate' && (
          <DebatePhase
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            minoritySide={minoritySide}
            remainingMs={remainingMs}
            totalMs={total}
            onUpvote={handlers.onUpvote}
            onSendRebuttal={handlers.onSendRebuttal}
            rebuttals={rebuttals}
          />
        )}

        {state.phase === 'conversion' && (
          <ConversionEvent
            scenario={scenario}
            participants={state.participants}
            selfId={selfId}
            remainingMs={remainingMs}
            totalMs={total}
            onChangeVote={handlers.onChangeVote}
          />
        )}

        {(state.phase === 'result' || state.phase === 'completed') && state.result && (
          <ResultScreen
            scenario={scenario}
            participants={state.participants}
            result={state.result}
            selfId={selfId}
            roomId={roomId}
            selfUserId={selfUserId}
            primaryCta={
              handlers.onPlayAgain
                ? { label: 'Play another practice round', onClick: handlers.onPlayAgain }
                : undefined
            }
            secondaryCta={{ label: 'Back to the courtroom', href: homeHref }}
          />
        )}
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
