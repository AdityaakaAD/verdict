'use client';

import { useState } from 'react';
import type { ParticipantState, Scenario, VoteSide } from '@verdict/shared';
import { ScenarioCard } from './scenario-card';
import { StatementFeed } from './statement-feed';
import { PhaseTimer } from './phase-timer';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  selfId: string;
  minoritySide: VoteSide | 'tie';
  remainingMs: number;
  totalMs: number;
  onUpvote: (participantId: string) => void;
}

export function PhaseDebate({
  scenario,
  participants,
  selfId,
  minoritySide,
  remainingMs,
  totalMs,
  onUpvote,
}: Props) {
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  const minorityFirst = [...participants].sort((a, b) => {
    const aMinor = minoritySide !== 'tie' && a.vote === minoritySide;
    const bMinor = minoritySide !== 'tie' && b.vote === minoritySide;
    if (aMinor === bMinor) return 0;
    return aMinor ? -1 : 1;
  });

  function handleUpvote(id: string) {
    if (upvotedIds.has(id)) return;
    setUpvotedIds((prev) => new Set(prev).add(id));
    onUpvote(id);
  }

  return (
    <section className="flex flex-col">
      <header className="flex items-center justify-between">
        <p className="text-11 text-text-secondary label-caps">Debate</p>
        <PhaseTimer remainingMs={remainingMs} totalMs={totalMs} />
      </header>

      <p className="mt-3 text-15 text-text-secondary">
        Ninety seconds to change minds. Upvote the reasoning you want the room to remember.
      </p>

      <div className="mt-5">
        <ScenarioCard scenario={scenario} compact />
      </div>

      <div className="mt-6">
        <p className="text-11 text-text-secondary label-caps">
          {minoritySide === 'tie' ? 'Both sides' : 'Minority first'}
        </p>
        <div className="mt-3">
          <StatementFeed
            participants={minorityFirst}
            selfId={selfId}
            voteColors
            upvotable
            upvotedIds={upvotedIds}
            onUpvote={handleUpvote}
          />
        </div>
      </div>
    </section>
  );
}
