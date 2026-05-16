'use client';

import { useRouter } from 'next/navigation';
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

  function toggle(id: Interest) {
    if (interests.includes(id)) {
      setInterests(interests.filter((x) => x !== id));
    } else if (!atCap) {
      setInterests([...interests, id]);
    }
  }

  return (
    <section className="flex h-full flex-col pt-12">
      <h1 className="font-serif text-28 font-medium leading-tight">What do you care about?</h1>
      <p className="mt-3 max-w-[36ch] text-15 text-text-secondary">
        Pick five. This is what we send to the courtroom you join.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {INTERESTS.map((id) => (
          <InterestChip
            key={id}
            label={INTEREST_LABELS[id]}
            selected={interests.includes(id)}
            disabled={atCap}
            onToggle={() => toggle(id)}
          />
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
