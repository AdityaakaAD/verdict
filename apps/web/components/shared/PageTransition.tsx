'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  trigger: boolean;
  onMidpoint?: () => void;
  onComplete?: () => void;
}

export function PageTransition({ trigger, onMidpoint, onComplete }: PageTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');

  useEffect(() => {
    if (!trigger) return;
    setPhase('in');
  }, [trigger]);

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: 'var(--accent)',
            transformOrigin: '0% 50%',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          initial={{ scaleX: 0 }}
          animate={
            phase === 'in'
              ? {
                  scaleX: 1,
                  transition: { duration: 0.14, ease: 'easeIn' },
                }
              : {
                  scaleX: 0,
                  transition: { duration: 0.14, ease: 'easeOut' },
                }
          }
          onAnimationComplete={() => {
            if (phase === 'in') {
              onMidpoint?.();
              setPhase('out');
            } else if (phase === 'out') {
              setPhase('idle');
              onComplete?.();
            }
          }}
        />
      )}
    </AnimatePresence>
  );
}
