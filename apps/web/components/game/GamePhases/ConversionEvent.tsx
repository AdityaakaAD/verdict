'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParticipantState, Scenario, VoteSide } from '@verdict/shared';
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
  onChangeVote: (vote: VoteSide) => void;
}

export function ConversionEvent({
  scenario,
  participants,
  selfId,
  remainingMs,
  totalMs,
  onChangeVote,
}: Props) {
  const self = participants.find((p) => p.id === selfId);
  const selfVote = self?.vote ?? null;

  const [flashKey, setFlashKey] = useState(0);
  const [convertingIds, setConvertingIds] = useState<string[]>([]);
  const flippedRef = useRef<Set<string>>(new Set());

  const aCount = participants.filter((p) => p.vote === 'a').length;
  const bCount = participants.filter((p) => p.vote === 'b').length;

  // Detect conversions and fire the dramatic sequence
  useEffect(() => {
    const newConverters: string[] = [];
    participants.forEach((p) => {
      if (p.changedVoteDuringConversion && !flippedRef.current.has(p.id)) {
        flippedRef.current.add(p.id);
        newConverters.push(p.id);
      }
    });

    if (newConverters.length > 0) {
      setConvertingIds((prev) => [...prev, ...newConverters]);
      setFlashKey((k) => k + 1);
      sounds.play('gong');
      navigator.vibrate?.(25);

      // Clear converting state after animation settles
      setTimeout(() => {
        setConvertingIds((prev) => prev.filter((id) => !newConverters.includes(id)));
      }, 1200);
    }
  }, [participants]);

  function handleSwitch(side: VoteSide) {
    sounds.play('vote_tap');
    navigator.vibrate?.(15);
    onChangeVote(side);
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 3D — jurors in battle-line positions */}
      <JuryChamber
        phase="conversion"
        participants={participants}
        selfId={selfId}
        convertingIds={convertingIds}
      />

      {/* White flash on conversion */}
      <AnimatePresence>
        {flashKey > 0 && (
          <motion.div
            key={flashKey}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#FFF',
              zIndex: 40,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Top bar — timer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'var(--bg-tertiary)',
          zIndex: 20,
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: 'var(--accent)',
            transformOrigin: '0% 50%',
          }}
          animate={{ scaleX: remainingMs / totalMs }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 24px 48px',
          pointerEvents: 'none',
          zIndex: 15,
          gap: 20,
        }}
      >
        {/* Live tally */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <motion.span
            key={aCount}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              fontFamily: 'var(--font-mono-display)',
              fontSize: 28,
              color: 'var(--vote-a)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {aCount}
          </motion.span>
          <span style={{ fontFamily: 'var(--font-mono-display)', fontSize: 13, color: 'var(--text-tertiary)' }}>
            vs
          </span>
          <motion.span
            key={bCount}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              fontFamily: 'var(--font-mono-display)',
              fontSize: 28,
              color: 'var(--vote-b)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {bCount}
          </motion.span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text-secondary)' }}>
            Switch sides or hold your ground.
          </p>
          <p style={{ marginTop: 4, fontFamily: 'var(--font-mono-display)', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your vote stays private
          </p>
        </div>

        {/* Vote buttons — colored (reveal already happened) */}
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'auto' }}>
          {(['a', 'b'] as VoteSide[]).map((side) => {
            const label = side === 'a' ? scenario.sideALabel : scenario.sideBLabel;
            const meaning = side === 'a' ? scenario.sideAMeaning : scenario.sideBMeaning;
            const selected = selfVote === side;
            const color = side === 'a' ? 'var(--vote-a)' : 'var(--vote-b)';

            return (
              <button
                key={side}
                type="button"
                onClick={() => handleSwitch(side)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: selected
                    ? `0.5px solid ${color}`
                    : '0.5px solid var(--border-subtle)',
                  background: selected
                    ? `color-mix(in srgb, ${color} 12%, var(--bg-secondary))`
                    : 'rgba(15,15,17,0.75)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {label}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{meaning}</span>
              </button>
            );
          })}
        </div>

        <TimerRing remainingMs={remainingMs} totalMs={totalMs} size={40} enableTick />
      </div>

      <ParticleEngine phase="conversion" />
    </div>
  );
}
