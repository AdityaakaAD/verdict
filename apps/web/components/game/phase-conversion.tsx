'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ParticipantState, Scenario, VoteSide } from '@verdict/shared';
import { ScenarioCard } from './scenario-card';
import { PhaseTimer } from './phase-timer';
import { VoteButtons } from './vote-buttons';
import { AvatarMark } from './avatar-mark';
import { sounds } from '@/lib/sounds';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  selfId: string;
  remainingMs: number;
  totalMs: number;
  onChangeVote: (vote: VoteSide) => void;
}

export function PhaseConversion({
  scenario,
  participants,
  selfId,
  remainingMs,
  totalMs,
  onChangeVote,
}: Props) {
  const self = participants.find((p) => p.id === selfId);
  const selfVote = self?.vote ?? null;

  // Watch for participants flipping their vote during conversion and play
  // the gong + 80ms white flash for each flip.
  const flippedRef = useRef<Set<string>>(new Set());
  const [flashKey, setFlashKey] = useFlash();

  useEffect(() => {
    participants.forEach((p) => {
      if (p.changedVoteDuringConversion && !flippedRef.current.has(p.id)) {
        flippedRef.current.add(p.id);
        sounds.play('conversion_gong');
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
        setFlashKey();
      }
    });
  }, [participants, setFlashKey]);

  const aCount = participants.filter((p) => p.vote === 'a').length;
  const bCount = participants.filter((p) => p.vote === 'b').length;

  return (
    <section className="relative flex flex-col">
      <AnimatePresence>
        {flashKey ? (
          <motion.div
            key={flashKey}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-none fixed inset-0 z-50 bg-text-primary"
          />
        ) : null}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <p className="text-11 text-text-secondary label-caps">Conversion</p>
        <PhaseTimer remainingMs={remainingMs} totalMs={totalMs} enableTick />
      </header>

      <p className="mt-3 text-15 text-text-secondary">
        You can switch sides. So can everyone else. The room decides who wins.
      </p>

      <div className="mt-5">
        <ScenarioCard scenario={scenario} compact />
      </div>

      <div className="mt-5">
        <VoteButtons
          scenario={scenario}
          selected={selfVote}
          allowChange
          showColors
          onPick={onChangeVote}
        />
      </div>

      <div className="mt-6 flex items-center justify-between rounded-md border-hairline bg-bg-secondary p-4 font-mono text-13">
        <span className="text-text-secondary">
          {scenario.sideALabel}{' '}
          <span className="ml-2 text-text-primary tabular-nums">{aCount}</span>
        </span>
        <span className="text-text-tertiary">vs</span>
        <span className="text-text-secondary">
          <span className="mr-2 text-text-primary tabular-nums">{bCount}</span>
          {scenario.sideBLabel}
        </span>
      </div>

      <ul className="mt-6 space-y-2">
        {participants.map((p) => (
          <ConversionRow key={p.id} participant={p} isSelf={p.id === selfId} />
        ))}
      </ul>
    </section>
  );
}

function ConversionRow({ participant: p, isSelf }: { participant: ParticipantState; isSelf: boolean }) {
  const colorVar = p.vote === 'a' ? 'var(--vote-a)' : p.vote === 'b' ? 'var(--vote-b)' : 'var(--border-subtle)';
  return (
    <motion.li
      layout
      className="flex items-center gap-3 rounded-md border-l-[2px] border-hairline bg-bg-secondary p-3"
      style={{ borderLeftColor: colorVar }}
    >
      <AvatarMark avatarId={p.avatarId as any} size="sm" highlighted={isSelf} />
      <span className="flex-1 truncate font-mono text-13 text-text-secondary">
        @{p.alias}
        {isSelf ? <span className="ml-2 text-accent">· you</span> : null}
      </span>
      {p.changedVoteDuringConversion ? (
        <span className="font-mono text-11 text-accent label-caps">Flipped</span>
      ) : null}
    </motion.li>
  );
}

function useFlash(): [number, () => void] {
  const [k, setK] = useState(0);
  return [k, () => setK((v) => v + 1)];
}
