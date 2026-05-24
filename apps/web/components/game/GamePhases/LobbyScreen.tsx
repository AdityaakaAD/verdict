'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParticipantState } from '@verdict/shared';
import { JuryChamber } from '@/components/game/JuryChamber';
import { ParticleEngine } from '@/components/game/ParticleEngine';
import { sounds } from '@/lib/sounds';

interface Props {
  participants: ParticipantState[];
  selfId: string;
  remainingMs: number;
}

const MAX_JURORS = 7;

export function LobbyScreen({ participants, selfId, remainingMs }: Props) {
  const seconds = Math.ceil(remainingMs / 1000);
  const seated = participants.length;

  const prevCountRef = useRef(seated);
  useEffect(() => {
    if (seated > prevCountRef.current) {
      sounds.play('juror_join');
      navigator.vibrate?.(8);
    }
    prevCountRef.current = seated;
  }, [seated]);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 3D backdrop */}
      <JuryChamber phase="lobby" participants={participants} selfId={selfId} />

      {/* 2D overlay — bottom-anchored column */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 40,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Wordmark */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            top: 24,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          verdict
          <span style={{ color: 'var(--accent)' }}>.</span>
        </motion.p>

        {/* Bottom panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'rgba(10,10,11,0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 14,
            border: '0.5px solid var(--border-subtle)',
            padding: '20px 20px 20px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono-display)',
              fontSize: 11,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            The jury assembles
          </p>

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Seat dots */}
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: MAX_JURORS }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    background: i < seated ? 'var(--text-secondary)' : 'var(--bg-tertiary)',
                    scale: i < seated ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
                  style={{ width: 8, height: 8, borderRadius: '50%' }}
                />
              ))}
            </div>

            <span
              style={{
                fontFamily: 'var(--font-mono-display)',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              {seated} of {MAX_JURORS} seated
            </span>
          </div>

          {/* Joining name toasts */}
          <div style={{ marginTop: 12, minHeight: 20 }}>
            <AnimatePresence mode="popLayout">
              {participants.slice(-1).map((p) => (
                <motion.p
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    fontFamily: 'var(--font-mono-display)',
                    fontSize: 11,
                    color: 'var(--accent)',
                  }}
                >
                  @{p.alias} joined
                </motion.p>
              ))}
            </AnimatePresence>
          </div>

          <div
            style={{
              marginTop: 8,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono-display)',
                fontSize: 11,
                color: 'var(--text-tertiary)',
              }}
            >
              {seconds}s
            </span>
          </div>
        </motion.div>
      </div>

      <ParticleEngine phase="lobby" />
    </div>
  );
}
