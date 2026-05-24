'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function InterestChip({ label, selected, disabled, onToggle }: Props) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      disabled={disabled && !selected}
      animate={selected ? { scale: [0.94, 1.06, 1.0] } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      style={{ position: 'relative', display: 'inline-flex' }}
      className={cn(
        'rounded-full px-4 py-2 text-13 transition-colors duration-100',
        selected
          ? 'border-hairline-accent bg-accent/[0.06] text-text-primary'
          : 'border-hairline text-text-secondary hover:border-hairline-active hover:text-text-primary',
        disabled && !selected && 'cursor-not-allowed opacity-40',
      )}
    >
      {label}
      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Check size={8} strokeWidth={3} color="#fff" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
