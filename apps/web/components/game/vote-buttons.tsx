'use client';

import { motion } from 'framer-motion';
import type { Scenario, VoteSide } from '@verdict/shared';
import { sounds } from '@/lib/sounds';

// Four states (spec § UI/VoteButtons):
//   idle     — neither voted; both buttons breathe (scale pulse 2s loop)
//   prelock  — one selected, not yet locked; dot indicator, NO color
//   locked   — vote cast, no change allowed; other button dimmed
//   revealed — showColors=true; crimson/blue applied (conversion phase only)
//
// Color is NEVER shown before the reveal. This is the rule that must never break.

interface Props {
  scenario: Scenario;
  selected: VoteSide | null;
  allowChange?: boolean;
  onPick: (vote: VoteSide) => void;
  showColors?: boolean;
}

export function VoteButtons({ scenario, selected, allowChange, onPick, showColors }: Props) {
  const locked = selected !== null && !allowChange;

  return (
    <div className="grid grid-cols-1 gap-3">
      {(['a', 'b'] as VoteSide[]).map((side) => (
        <VoteButton
          key={side}
          side={side}
          label={side === 'a' ? scenario.sideALabel : scenario.sideBLabel}
          meaning={side === 'a' ? scenario.sideAMeaning : scenario.sideBMeaning}
          isSelected={selected === side}
          isOtherSelected={selected !== null && selected !== side}
          locked={locked}
          showColors={showColors}
          onPick={() => onPick(side)}
        />
      ))}
    </div>
  );
}

interface ButtonProps {
  side: VoteSide;
  label: string;
  meaning: string;
  isSelected: boolean;
  isOtherSelected: boolean;
  locked: boolean;
  showColors?: boolean;
  onPick: () => void;
}

function VoteButton({
  side,
  label,
  meaning,
  isSelected,
  isOtherSelected,
  locked,
  showColors,
  onPick,
}: ButtonProps) {
  const idle = !isSelected && !isOtherSelected;

  // Border color — never crimson/blue before reveal
  let borderColor = 'var(--vote-neutral)';
  let bgColor = 'transparent';
  if (showColors && isSelected) {
    borderColor = side === 'a' ? 'var(--vote-a)' : 'var(--vote-b)';
    bgColor = side === 'a' ? 'rgba(255,59,48,0.10)' : 'rgba(45,127,249,0.10)';
  } else if (isSelected) {
    borderColor = '#3A3A42';
  } else if (isOtherSelected) {
    borderColor = 'var(--vote-neutral)';
  }

  return (
    <motion.button
      type="button"
      // Breathing invitation while idle; stops once any vote cast
      animate={idle ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={idle ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.1 }}
      whileTap={locked && !showColors ? undefined : { scale: 0.96 }}
      onClick={() => {
        if (locked && !showColors) return;
        sounds.play('vote_tap');
        navigator.vibrate?.(10);
        onPick();
      }}
      disabled={locked && !showColors}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6,
        padding: '16px',
        borderRadius: 10,
        border: `0.5px solid ${borderColor}`,
        background: bgColor,
        cursor: locked && !showColors ? 'not-allowed' : 'pointer',
        opacity: isOtherSelected && !showColors ? 0.5 : 1,
        transition: 'border-color 0.2s, opacity 0.2s, background 0.2s',
        textAlign: 'left',
        fontFamily: 'inherit',
        width: '100%',
      }}
    >
      {/* Prelock dot — appears when this button is selected, no color */}
      {isSelected && !showColors && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'var(--text-secondary)',
            display: 'block',
          }}
        />
      )}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        {meaning}
      </span>
    </motion.button>
  );
}
