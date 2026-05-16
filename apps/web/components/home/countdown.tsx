'use client';

import { useEffect, useState } from 'react';
import { nextDropAt, formatCountdown } from '@/lib/time';

interface Props {
  timezone: string;
  /** When the drop is live (within the round window) this is shown instead. */
  liveLabel?: string;
}

export function HomeCountdown({ timezone, liveLabel = 'Live now' }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const drop = nextDropAt(timezone, new Date(now)).getTime();
  const remaining = drop - now;

  // The Featured round runs ~5 minutes from 9 PM; show "live now" for that
  // window so the home screen reads as actively in-session.
  const ROUND_LENGTH_MS = 5 * 60 * 1000;
  const elapsedFromLastDrop = ROUND_LENGTH_MS - (drop - now - 24 * 60 * 60 * 1000);
  const isLive = elapsedFromLastDrop >= 0 && elapsedFromLastDrop <= ROUND_LENGTH_MS;

  if (isLive) {
    return <span className="font-mono text-accent">{liveLabel}</span>;
  }

  return (
    <span className="font-mono text-text-primary tabular-nums" suppressHydrationWarning>
      {formatCountdown(remaining)}
    </span>
  );
}
