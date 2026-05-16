'use client';

import { motion } from 'framer-motion';
import { votedCount, totalPlayers, type ParticipantState, type Scenario, type VoteSide } from '@verdict/shared';
import { ScenarioCard } from './scenario-card';
import { VoteButtons } from './vote-buttons';
import { PhaseTimer } from './phase-timer';
import { StatementFeed } from './statement-feed';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  selfId: string;
  remainingMs: number;
  totalMs: number;
  onVote: (vote: VoteSide) => void;
}

export function PhaseVoting({
  scenario,
  participants,
  selfId,
  remainingMs,
  totalMs,
  onVote,
}: Props) {
  const self = participants.find((p) => p.id === selfId);
  const selfVote = self?.vote ?? null;
  const voted = votedCount({ participants } as never);
  const total = totalPlayers({ participants } as never);

  return (
    <section className="flex flex-col">
      <header className="flex items-center justify-between">
        <p className="text-11 text-text-secondary label-caps">Cast your verdict</p>
        <PhaseTimer remainingMs={remainingMs} totalMs={totalMs} enableTick />
      </header>

      <div className="mt-4">
        <ScenarioCard scenario={scenario} compact />
      </div>

      <div className="mt-5">
        <VoteButtons scenario={scenario} selected={selfVote} onPick={onVote} />
      </div>

      <p className="mt-4 font-mono text-11 text-text-tertiary label-caps">
        <motion.span
          key={voted}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {voted} of {total} voted
        </motion.span>
      </p>

      <div className="mt-8">
        <p className="text-11 text-text-secondary label-caps">Statements</p>
        <div className="mt-3">
          <StatementFeed participants={participants} selfId={selfId} />
        </div>
      </div>
    </section>
  );
}
