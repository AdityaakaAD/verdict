'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ParticipantState, Scenario, VoteSide } from '@verdict/shared';
import { AvatarMark } from './avatar-mark';
import { sounds } from '@/lib/sounds';

// Reveal screen. Cards flip one-by-one with their color floods. Color is
// reserved for this moment per spec section 11 — first sight of red/blue
// in the entire game.

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  selfId: string;
  minoritySide: VoteSide | 'tie';
  voteBreakdown: { a: number; b: number };
}

export function PhaseReveal({
  scenario,
  participants,
  selfId,
  minoritySide,
  voteBreakdown,
}: Props) {
  // Play the reveal sting once when the phase mounts.
  useEffect(() => {
    sounds.play('vote_flip');
  }, []);

  return (
    <section className="flex flex-col">
      <p className="text-11 text-text-secondary label-caps">The verdict</p>
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-2 font-serif text-28 font-medium leading-tight"
      >
        {minoritySide === 'tie'
          ? 'Hung jury.'
          : minoritySide === 'a'
            ? `${voteBreakdown.b} of you said ${scenario.sideBLabel.toLowerCase()}.`
            : `${voteBreakdown.a} of you said ${scenario.sideALabel.toLowerCase()}.`}
      </motion.h1>
      <p className="mt-2 text-15 text-text-secondary">
        {minoritySide === 'tie'
          ? 'The room is split. The next ninety seconds decide who wins.'
          : minoritySide === 'a'
            ? `${voteBreakdown.a} stood alone on ${scenario.sideALabel.toLowerCase()}.`
            : `${voteBreakdown.b} stood alone on ${scenario.sideBLabel.toLowerCase()}.`}
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-2">
        {participants.map((p, i) => (
          <RevealCard
            key={p.id}
            participant={p}
            scenario={scenario}
            delay={0.1 + i * 0.2}
            isSelf={p.id === selfId}
          />
        ))}
      </ul>
    </section>
  );
}

function RevealCard({
  participant: p,
  scenario,
  delay,
  isSelf,
}: {
  participant: ParticipantState;
  scenario: Scenario;
  delay: number;
  isSelf: boolean;
}) {
  if (p.vote === null) {
    return (
      <li className="flex items-center gap-3 rounded-md border-hairline bg-bg-secondary p-3">
        <AvatarMark avatarId={p.avatarId as any} size="sm" />
        <span className="font-mono text-13 text-text-tertiary">@{p.alias}</span>
        <span className="text-11 text-text-tertiary label-caps">No vote</span>
      </li>
    );
  }

  const sideLabel = p.vote === 'a' ? scenario.sideALabel : scenario.sideBLabel;
  const colorVar = p.vote === 'a' ? 'var(--vote-a)' : 'var(--vote-b)';

  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.96, backgroundColor: 'rgba(31,31,35,0.4)' }}
      animate={{
        opacity: 1,
        scale: 1,
        backgroundColor: 'rgba(15,15,17,1)',
      }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="flex items-center gap-3 rounded-md border-l-[2px] border-hairline bg-bg-secondary p-3"
      style={{ borderLeftColor: colorVar }}
    >
      <AvatarMark avatarId={p.avatarId as any} size="sm" highlighted={isSelf} />
      <span className="flex-1 truncate font-mono text-13 text-text-secondary">
        @{p.alias}
        {isSelf ? <span className="ml-2 text-accent">· you</span> : null}
      </span>
      <span className="font-serif text-13 text-text-primary">{sideLabel}</span>
    </motion.li>
  );
}
