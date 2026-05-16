import { cn } from '@/lib/cn';
import type { AvatarId } from '@verdict/shared';

// Cheap, dependency-free avatar glyph. Uses the first letter of the avatar
// id on a neutral tile. Phase 3 swaps these for hand-drawn SVGs without
// changing the consumer API.

interface Props {
  avatarId: AvatarId;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
  className?: string;
}

const SIZES = {
  sm: 'h-7 w-7 text-13',
  md: 'h-10 w-10 text-15',
  lg: 'h-14 w-14 text-22',
} as const;

export function AvatarMark({ avatarId, size = 'md', highlighted, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-serif',
        SIZES[size],
        highlighted
          ? 'border-hairline-accent bg-accent/[0.08] text-accent'
          : 'border-hairline bg-bg-secondary text-text-secondary',
        className,
      )}
      aria-hidden
    >
      {avatarId.charAt(0).toUpperCase()}
    </span>
  );
}
