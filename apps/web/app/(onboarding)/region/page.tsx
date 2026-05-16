'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { REGIONS, regionFromCode } from '@/lib/regions';
import { useOnboarding } from '@/components/onboarding/onboarding-store';
import { cn } from '@/lib/cn';

export default function RegionPage() {
  const router = useRouter();
  const { region, timezone, setRegion } = useOnboarding();

  // Default: best-effort browser timezone → match to a known region; else IN.
  useEffect(() => {
    if (region) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const match = REGIONS.find((r) => r.timezone === tz);
    if (match) setRegion(match.code, match.timezone);
    else setRegion('IN', 'Asia/Kolkata');
  }, [region, setRegion]);

  const canContinue = Boolean(region && timezone);

  return (
    <section className="flex h-full flex-col pt-12">
      <h1 className="font-serif text-28 font-medium leading-tight">Where are you reading from?</h1>
      <p className="mt-3 max-w-[36ch] text-15 text-text-secondary">
        This shapes the scenarios you see and the leaderboard you compete on.
      </p>

      <div className="mt-8">
        <label className="block">
          <span className="block text-11 text-text-secondary label-caps">Region</span>
          <select
            value={region ?? 'IN'}
            onChange={(e) => {
              const r = regionFromCode(e.target.value);
              setRegion(r.code, r.timezone);
            }}
            className="mt-2 h-12 w-full appearance-none rounded-md border-hairline bg-bg-secondary px-3 text-15 text-text-primary focus:border-hairline-accent"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        {timezone ? (
          <p className="mt-4 text-11 text-text-tertiary label-caps">
            Timezone <span className="ml-2 font-mono text-text-secondary">{timezone}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex gap-3 pt-12">
        <button
          type="button"
          onClick={() => router.push('/interests')}
          className="flex h-12 flex-1 items-center justify-center rounded-md border-hairline text-15 text-text-secondary hover:border-hairline-active hover:text-text-primary"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => router.push('/alias')}
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
