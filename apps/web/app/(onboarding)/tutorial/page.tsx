'use client';

import { useRouter } from 'next/navigation';
import { INTERESTS_REQUIRED } from '@verdict/shared';
import { useOnboarding } from '@/components/onboarding/onboarding-store';
import { TutorialClient } from './tutorial-client';

export default function TutorialPage() {
  const router = useRouter();
  const { interests, region, timezone, alias, avatarId } = useOnboarding();

  const ready =
    interests.length === INTERESTS_REQUIRED && region && timezone && alias && avatarId;

  if (!ready) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-15 text-text-secondary">
          Complete onboarding first.
        </p>
        <button
          type="button"
          onClick={() => router.push('/welcome')}
          className="font-mono text-13 text-accent"
        >
          Start over
        </button>
      </section>
    );
  }

  return (
    <TutorialClient
      onboardingData={{
        alias: alias!,
        avatarId: avatarId!,
        region: region!,
        timezone: timezone!,
        interests,
      }}
    />
  );
}
