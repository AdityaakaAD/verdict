'use client';

import { AVATAR_IDS, type AvatarId } from '@verdict/shared';
import { cn } from '@/lib/cn';

// Abstract avatars are rendered as initial-letter glyphs in a tile for now.
// Phase 2 swaps these for hand-drawn SVGs, but the IDs are stable so any
// already-onboarded user keeps their pick.

interface Props {
  selected: AvatarId | null;
  onSelect: (id: AvatarId) => void;
}

export function AvatarGrid({ selected, onSelect }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Avatar"
      className="grid grid-cols-6 gap-2 sm:grid-cols-8"
    >
      {AVATAR_IDS.map((id) => {
        const isSelected = selected === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(id)}
            className={cn(
              'flex aspect-square items-center justify-center rounded-md transition-colors duration-100',
              isSelected
                ? 'border-hairline-accent bg-accent/[0.08]'
                : 'border-hairline bg-bg-secondary hover:border-hairline-active',
            )}
          >
            <span
              className={cn(
                'font-serif text-18',
                isSelected ? 'text-accent' : 'text-text-secondary',
              )}
            >
              {id.charAt(0).toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
