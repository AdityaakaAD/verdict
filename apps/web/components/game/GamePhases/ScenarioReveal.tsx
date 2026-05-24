'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParticipantState, Scenario } from '@verdict/shared';
import { JuryChamber } from '@/components/game/JuryChamber';
import { ParticleEngine } from '@/components/game/ParticleEngine';
import { TimerRing } from '@/components/game/UI/TimerRing';
import { sounds } from '@/lib/sounds';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  selfId: string;
  remainingMs: number;
  totalMs: number;
}

type RevealStep = 'dark' | 'spotlight' | 'sweep' | 'text';

export function ScenarioReveal({ scenario, participants, selfId, remainingMs, totalMs }: Props) {
  const [step, setStep] = useState<RevealStep>('dark');
  const [sweepVisible, setSweepVisible] = useState(false);

  useEffect(() => {
    // Sequence: dark(400ms) → spotlight(800ms) → sweep(300ms) → text
    const t1 = setTimeout(() => {
      setStep('spotlight');
      sounds.play('gong');
    }, 400);
    const t2 = setTimeout(() => {
      setStep('sweep');
      setSweepVisible(true);
    }, 1200);
    const t3 = setTimeout(() => {
      setSweepVisible(false);
      setStep('text');
      navigator.vibrate?.(15);
    }, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const scenarioVisible = step === 'text';

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 3D backdrop — scenario phase dims room initially */}
      <JuryChamber phase="scenario" participants={participants} selfId={selfId} />

      {/* Dark overlay that fades during spotlight step */}
      <motion.div
        animate={{ opacity: step === 'dark' ? 0.85 : step === 'spotlight' ? 0.4 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0A0A0B',
          pointerEvents: 'none',
          zIndex: 8,
        }}
      />

      {/* Crimson sweep line */}
      <AnimatePresence>
        {sweepVisible && (
          <motion.div
            initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0, transformOrigin: '100% 50%' }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 2,
              background: 'var(--accent)',
              zIndex: 20,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Scenario text panel — slides up */}
      <AnimatePresence>
        {scenarioVisible && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 280, damping: 28 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px 24px 48px',
              background: 'linear-gradient(to top, rgba(10,10,11,0.97) 80%, transparent)',
              zIndex: 15,
              pointerEvents: 'auto',
            }}
          >
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              {/* Context tag */}
              {scenario.contextTag && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 999,
                    border: '0.5px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono-display)',
                    fontSize: 11,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 12,
                  }}
                >
                  {scenario.contextTag}
                </div>
              )}

              {/* Scenario text */}
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 19,
                  lineHeight: 1.55,
                  color: 'var(--text-primary)',
                  borderLeft: '2px solid var(--accent)',
                  paddingLeft: 14,
                }}
              >
                {scenario.text}
              </p>

              {/* Timer */}
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono-display)' }}>
                  read the case
                </span>
                <TimerRing remainingMs={remainingMs} totalMs={totalMs} size={40} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ParticleEngine phase="scenario" />
    </div>
  );
}
