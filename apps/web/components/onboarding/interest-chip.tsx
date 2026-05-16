'use client';

import { cn } from '@/lib/cn';

interface Props {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function InterestChip({ label, selected, disabled, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      disabled={disabled && !selected}
      className={cn(
        'rounded-full px-4 py-2 text-13 transition-colors duration-100',
        selected
          ? 'border-hairline-accent bg-accent/[0.06] text-text-primary'
          : 'border-hairline text-text-secondary hover:border-hairline-active hover:text-text-primary',
        disabled && !selected && 'cursor-not-allowed opacity-40',
      )}
    >
      {label}
    </button>
  );
}
