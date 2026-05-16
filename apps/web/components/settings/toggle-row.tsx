'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  description?: string;
  initial: boolean;
  onChange: (value: boolean) => void | Promise<void>;
}

export function ToggleRow({ label, description, initial, onChange }: Props) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function flip() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      await onChange(next);
    });
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b-hairline py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-15 text-text-primary">{label}</p>
        {description ? (
          <p className="mt-1 text-13 text-text-secondary">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={flip}
        disabled={pending}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150',
          on ? 'bg-accent' : 'bg-bg-tertiary',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-text-primary transition-transform duration-150',
            on ? 'translate-x-[22px]' : 'translate-x-[2px]',
          )}
        />
      </button>
    </div>
  );
}
