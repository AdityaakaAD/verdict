'use client';

import { motion } from 'framer-motion';
import type { Scenario } from '@verdict/shared';

interface Props {
  scenario: Scenario;
  /** Compact variant for statement/voting screens; full variant for the scenario phase. */
  compact?: boolean;
}

export function ScenarioCard({ scenario, compact }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-lg border-hairline bg-bg-secondary p-5"
    >
      {scenario.contextTag ? (
        <p className="text-11 text-text-secondary label-caps">{scenario.contextTag}</p>
      ) : null}
      <p
        className={
          compact
            ? 'mt-3 font-serif text-15 leading-relaxed text-text-primary'
            : 'mt-3 font-serif text-18 leading-relaxed text-text-primary'
        }
      >
        {scenario.text}
      </p>
      <p className="mt-4 font-serif text-18 text-text-primary">{scenario.question}</p>
    </motion.article>
  );
}
