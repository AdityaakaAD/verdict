'use client';

import { motion } from 'framer-motion';
import type { Scenario, VoteSide } from '@verdict/shared';
import { cn } from '@/lib/cn';
import { sounds } from '@/lib/sounds';

// Neutral-grey vote buttons used during the voting phase. Per spec section 11
// the color reveal is the drama — these stay colorless until after the
// reveal animation runs. Use ColoredVoteButtons for the conversion phase
// where sides have already been revealed.

interface Props {
  scenario: Scenario;
  selected: VoteSide | null;
  /** When true (conversion phase), tapping a button re-casts the user's vote. */
  allowChange?: boolean;
  onPick: (vote: VoteSide) => void;
  /** Optional flavor — show the side that the current vote is on, with the
   *  reveal colors applied. Used during conversion. */
  showColors?: boolean;
}

export function VoteButtons({ scenario, selected, allowChange, onPick, showColors }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <VoteButton
        side="a"
        label={scenario.sideALabel}
        meaning={scenario.sideAMeaning}
        selected={selected === 'a'}
        showColors={showColors}
        disabled={!allowChange && selected !== null}
        onPick={() => onPick('a')}
      />
      <VoteButton
        side="b"
        label={scenario.sideBLabel}
        meaning={scenario.sideBMeaning}
        selected={selected === 'b'}
        showColors={showColors}
        disabled={!allowChange && selected !== null}
        onPick={() => onPick('b')}
      />
    </div>
  );
}

interface ButtonProps {
  side: VoteSide;
  label: string;
  meaning: string;
  selected: boolean;
  showColors?: boolean;
  disabled?: boolean;
  onPick: () => void;
}

function VoteButton({ side, label, meaning, selected, showColors, disabled, onPick }: ButtonProps) {
  const colorClass = showColors
    ? side === 'a'
      ? selected
        ? 'border-hairline-accent bg-vote-a/[0.12] text-text-primary'
        : 'border-hairline bg-bg-secondary text-text-primary hover:border-hairline-active'
      : selected
        ? 'border-[0.5px] border-[var(--vote-b)] bg-[color:var(--vote-b)]/[0.12] text-text-primary'
        : 'border-hairline bg-bg-secondary text-text-primary hover:border-hairline-active'
    : selected
      ? 'border-hairline-active bg-bg-tertiary text-text-primary'
      : 'border-hairline bg-bg-secondary text-text-primary hover:border-hairline-active';

  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      onClick={() => {
        if (disabled) return;
        sounds.play('vote_tap');
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
        onPick();
      }}
      disabled={disabled}
      className={cn(
        'flex flex-col items-start gap-1 rounded-md p-4 text-left transition-colors duration-100',
        colorClass,
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span className="font-serif text-18 font-medium">{label}</span>
      <span className="text-13 text-text-secondary">{meaning}</span>
    </motion.button>
  );
}
