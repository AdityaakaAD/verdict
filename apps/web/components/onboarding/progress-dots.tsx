'use client';

import { usePathname } from 'next/navigation';
import { STEP_ORDER, type OnboardingStep } from './onboarding-store';
import { cn } from '@/lib/cn';

// Six dots, one per onboarding step. The dot for the current route is
// filled (crimson); completed dots are filled with --text-secondary; future
// dots are outlined.

export function ProgressDots() {
  const pathname = usePathname();
  const current = pathname.split('/').filter(Boolean)[0] as OnboardingStep | undefined;
  const currentIndex = current ? STEP_ORDER.indexOf(current) : -1;

  return (
    <nav aria-label="Onboarding progress" className="flex items-center gap-1.5">
      {STEP_ORDER.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isPast = i < currentIndex;
        return (
          <span
            key={step}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'h-1.5 rounded-full transition-all duration-200',
              isCurrent
                ? 'w-5 bg-accent'
                : isPast
                  ? 'w-1.5 bg-text-secondary'
                  : 'w-1.5 bg-border-active',
            )}
          />
        );
      })}
    </nav>
  );
}
