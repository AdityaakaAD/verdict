'use client';

import { motion } from 'framer-motion';
import type { ParticipantState } from '@verdict/shared';
import { AvatarMark } from './avatar-mark';

interface Props {
  participants: ParticipantState[];
  remainingMs: number;
}

export function PhaseLobby({ participants, remainingMs }: Props) {
  const seconds = Math.ceil(remainingMs / 1000);
  return (
    <section className="flex flex-col items-center pt-16 text-center">
      <motion.div
        className="h-2 w-2 rounded-full bg-accent"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <p className="mt-6 font-serif text-22 font-medium">Gathering the jurors.</p>
      <p className="mt-3 text-15 text-text-secondary">
        {participants.length}{' '}
        {participants.length === 1 ? 'juror is here' : 'jurors are here'}.
        {' '}
        <span className="font-mono">{seconds}s</span>
      </p>

      <ul className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {participants.map((p) => (
          <li key={p.id} className="flex flex-col items-center gap-1">
            <AvatarMark avatarId={p.avatarId as any} size="md" />
            <span className="font-mono text-11 text-text-tertiary">@{p.alias}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
