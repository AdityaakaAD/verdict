'use client';

import { motion } from 'framer-motion';
import type { Scenario } from '@verdict/shared';
import { ScenarioCard } from './scenario-card';
import { PhaseTimer } from './phase-timer';

interface Props {
  scenario: Scenario;
  remainingMs: number;
  totalMs: number;
}

export function PhaseScenario({ scenario, remainingMs, totalMs }: Props) {
  return (
    <section className="flex flex-col">
      <header className="flex items-center justify-between">
        <p className="text-11 text-text-secondary label-caps">
          <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-accent align-middle" aria-hidden />
          Read carefully
        </p>
        <PhaseTimer remainingMs={remainingMs} totalMs={totalMs} />
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        <ScenarioCard scenario={scenario} />
      </motion.div>

      <p className="mt-6 text-13 text-text-tertiary">
        You will write your reasoning publicly. You will vote privately.
      </p>
    </section>
  );
}
