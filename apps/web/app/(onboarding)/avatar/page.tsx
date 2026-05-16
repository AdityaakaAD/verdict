'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/components/onboarding/onboarding-store';
import { AvatarGrid } from '@/components/onboarding/avatar-grid';
import { cn } from '@/lib/cn';

export default function AvatarPage() {
  const router = useRouter();
  const { avatarId, setAvatar } = useOnboarding();

  const canContinue = Boolean(avatarId);

  return (
    <section className="flex h-full flex-col pt-12">
      <h1 className="font-serif text-28 font-medium leading-tight">Pick a mark.</h1>
      <p className="mt-3 max-w-[36ch] text-15 text-text-secondary">
        This is what other jurors see beside your verdict.
      </p>

      <div className="mt-8">
        <AvatarGrid selected={avatarId} onSelect={setAvatar} />
      </div>

      <div className="mt-auto flex gap-3 pt-12">
        <button
          type="button"
          onClick={() => router.push('/alias')}
          className="flex h-12 flex-1 items-center justify-center rounded-md border-hairline text-15 text-text-secondary hover:border-hairline-active hover:text-text-primary"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => router.push('/tutorial')}
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
