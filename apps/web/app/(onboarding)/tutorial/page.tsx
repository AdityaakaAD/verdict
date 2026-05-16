'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { INTERESTS_REQUIRED } from '@verdict/shared';
import { useOnboarding } from '@/components/onboarding/onboarding-store';
import { completeOnboarding } from '../actions';
import { cn } from '@/lib/cn';

// Phase 1: tutorial page is the final confirmation + profile-creation step.
// Phase 2 swaps the body with the rigged 5-bot tutorial round (user as
// minority-of-1, wins, gets dropped into a real Quick Match).

export default function TutorialPage() {
  const router = useRouter();
  const { interests, region, timezone, alias, avatarId, reset } = useOnboarding();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const ready =
    interests.length === INTERESTS_REQUIRED && region && timezone && alias && avatarId;

  function handleComplete() {
    if (!ready) {
      router.push('/welcome');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        alias,
        avatarId,
        region,
        timezone,
        interests,
      });
      if (result && result.ok === false) {
        setError(result.error);
        return;
      }
      reset();
      // completeOnboarding redirects to /home on success; this is a fallback.
      router.push('/home');
    });
  }

  return (
    <section className="flex h-full flex-col pt-12">
      <p className="text-11 text-text-secondary label-caps">
        <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-accent align-middle" aria-hidden />
        Almost there
      </p>
      <h1 className="mt-4 font-serif text-28 font-medium leading-tight">One practice round.</h1>
      <p className="mt-3 max-w-[36ch] text-15 text-text-secondary">
        Five bots, one scenario. Feel the loop, then play for real.
      </p>

      <div className="mt-8 space-y-3 rounded-md border-hairline bg-bg-secondary p-5">
        <Row label="Alias" value={alias ? `@${alias}` : '—'} />
        <Row label="Region" value={region ?? '—'} />
        <Row label="Timezone" value={timezone ?? '—'} />
        <Row label="Interests" value={`${interests.length} of ${INTERESTS_REQUIRED}`} />
        <Row label="Avatar" value={avatarId ?? '—'} />
      </div>

      {error ? <p className="mt-4 text-13 text-accent">{error}</p> : null}

      <div className="mt-auto flex gap-3 pt-12">
        <button
          type="button"
          onClick={() => router.push('/avatar')}
          disabled={pending}
          className="flex h-12 flex-1 items-center justify-center rounded-md border-hairline text-15 text-text-secondary hover:border-hairline-active hover:text-text-primary disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={!ready || pending}
          className={cn(
            'flex h-12 flex-[2] items-center justify-center rounded-md text-15 font-medium transition-colors duration-100',
            ready && !pending
              ? 'bg-accent text-bg-primary hover:bg-accent-hover'
              : 'bg-bg-tertiary text-text-tertiary',
          )}
        >
          {pending ? 'Opening…' : 'Step into the courtroom'}
        </button>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-11 text-text-secondary label-caps">{label}</span>
      <span className="font-mono text-13 text-text-primary">{value}</span>
    </div>
  );
}
