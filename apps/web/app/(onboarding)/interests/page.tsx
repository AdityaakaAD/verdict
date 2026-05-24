'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  INTERESTS,
  INTEREST_LABELS,
  INTERESTS_REQUIRED,
  type Interest,
} from '@verdict/shared';
import { useOnboarding } from '@/components/onboarding/onboarding-store';
import { InterestChip } from '@/components/onboarding/interest-chip';
import { cn } from '@/lib/cn';

export default function InterestsPage() {
  const router = useRouter();
  const { interests, setInterests } = useOnboarding();

  const atCap = interests.length >= INTERESTS_REQUIRED;
  const remaining = INTERESTS_REQUIRED - interests.length;
  const canContinue = interests.length === INTERESTS_REQUIRED;
  const progressPct = (interests.length / INTERESTS_REQUIRED) * 100;

  function toggle(id: Interest) {
    if (interests.includes(id)) {
      setInterests(interests.filter((x) => x !== id));
    } else if (!atCap) {
      setInterests([...interests, id]);
    }
  }

  return (
    <section className="flex h-full flex-col pt-12">
      {/* Progress bar */}
      <div style={{ height: 2, background: 'var(--border-subtle)', borderRadius: 1, overflow: 'hidden', marginBottom: 28 }}>
        <motion.div
          style={{
            height: '100%',
            background: 'var(--accent)',
            borderRadius: 1,
          }}
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      <h1 className="font-serif text-28 font-medium leading-tight">What do you care about?</h1>
      <p className="mt-3 max-w-[36ch] text-15 text-text-secondary">
        Pick five. This is what we send to the courtroom you join.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {INTERESTS.map((id, index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
          >
            <InterestChip
              label={INTEREST_LABELS[id]}
              selected={interests.includes(id)}
              disabled={atCap}
              onToggle={() => toggle(id)}
            />
          </motion.div>
        ))}
      </div>

      <p className="mt-6 text-11 text-text-tertiary label-caps">
        {canContinue
          ? `${INTERESTS_REQUIRED} of ${INTERESTS.length} selected`
          : `Pick ${remaining} more`}
      </p>

      <div className="mt-auto flex gap-3 pt-12">
        <button
          type="button"
          onClick={() => router.push('/welcome')}
          className="flex h-12 flex-1 items-center justify-center rounded-md border-hairline text-15 text-text-secondary hover:border-hairline-active hover:text-text-primary"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => router.push('/region')}
          className={cn(
            'flex h-12 flex-[2] items-center justify-center rounded-md text-15 font-medium transition-colors duration-100',
            canContinue
              ? 'bg-accent text-bg-primary hover:bg-accent-hover'
              : 'bg-bg-tertiary text-text-tertiary',
          )}
        >
          Continue
        </button>
      </div>
    </section>
  );
}
