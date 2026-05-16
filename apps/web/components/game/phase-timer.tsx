'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { sounds } from '@/lib/sounds';

// Phase timer: small monospace number that counts down to zero. Plays the
// tick sound in the final 5 seconds of any phase that's user-actionable
// (statement, voting).

interface Props {
  remainingMs: number;
  totalMs: number;
  /** When true, play the tick sound in the final 5s. */
  enableTick?: boolean;
  className?: string;
}

export function PhaseTimer({ remainingMs, totalMs, enableTick, className }: Props) {
  const seconds = Math.ceil(remainingMs / 1000);
  const [tickActive, setTickActive] = useState(false);

  useEffect(() => {
    const shouldTick = !!enableTick && remainingMs <= 5_000 && remainingMs > 0;
    if (shouldTick && !tickActive) {
      setTickActive(true);
      sounds.play('tick');
    } else if (!shouldTick && tickActive) {
      setTickActive(false);
      sounds.stop('tick');
    }
    return () => {
      if (tickActive) sounds.stop('tick');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, enableTick]);

  const critical = remainingMs <= 5_000;

  return (
    <span
      aria-label={`${seconds} seconds remaining`}
      className={cn(
        'font-mono tabular-nums transition-colors duration-100',
        critical ? 'text-accent' : 'text-text-secondary',
        className,
      )}
    >
      {String(seconds).padStart(2, '0')}s
    </span>
  );
}
