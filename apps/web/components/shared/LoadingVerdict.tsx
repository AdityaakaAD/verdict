'use client';

import { motion } from 'framer-motion';

interface LoadingVerdictProps {
  context?: string;
}

export function LoadingVerdict({ context = 'loading...' }: LoadingVerdictProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          verdict
        </span>
        <motion.span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            lineHeight: '36px',
            color: 'var(--accent)',
          }}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          .
        </motion.span>
      </div>

      <span
        style={{
          marginTop: '12px',
          fontFamily: 'var(--font-mono-display)',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          letterSpacing: '0.06em',
        }}
      >
        {context}
      </span>
    </div>
  );
}
