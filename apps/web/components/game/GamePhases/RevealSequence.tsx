'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParticipantState, Scenario, VoteSide } from '@verdict/shared';
import { JuryChamber } from '@/components/game/JuryChamber';
import { ParticleEngine } from '@/components/game/ParticleEngine';
import { sounds } from '@/lib/sounds';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  selfId: string;
  minoritySide: VoteSide | 'tie';
  voteBreakdown: { a: number; b: number };
}

type RevealPhase =
  | 'blackout'
  | 'title'
  | 'flipping'
  | 'tally'
  | 'verdict'
  | 'result';

const TITLE_LETTERS = 'THE VERDICT'.split('');

export function RevealSequence({ scenario, participants, selfId, minoritySide, voteBreakdown }: Props) {
  const [phase, setPhase] = useState<RevealPhase>('blackout');
  const [flippedCount, setFlippedCount] = useState(0);
  const [particlePhase, setParticlePhase] = useState<'reveal' | 'win' | 'loss'>('reveal');
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const self = participants.find((p) => p.id === selfId);
  const userWon =
    self &&
    ((self.wasMinority && minoritySide !== 'tie' && self.vote === minoritySide) ||
      (!self.wasMinority));

  const total = voteBreakdown.a + voteBreakdown.b;
  const aPercent = total > 0 ? (voteBreakdown.a / total) * 100 : 50;

  function addTimer(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timerRefs.current.push(t);
    return t;
  }

  useEffect(() => {
    // Phase 1 — Blackout: 0→400ms
    addTimer(() => {
      setPhase('title');
    }, 400);

    // Phase 2 — Title: 400→1200ms
    addTimer(() => {
      setPhase('flipping');
    }, 1200);

    // Phase 3 — Flip each juror: staggered 300ms apart (up to 7 jurors = ~2100ms)
    const flipDuration = participants.length * 300 + 500;
    participants.forEach((_, i) => {
      addTimer(() => {
        sounds.play('flip');
        navigator.vibrate?.(8);
        setFlippedCount(i + 1);
      }, 1200 + i * 300);
    });

    // Phase 4 — Tally
    addTimer(() => { setPhase('tally'); }, 1200 + flipDuration);

    // Phase 5 — Verdict text
    addTimer(() => {
      setPhase('verdict');
      sounds.play('gong');
      navigator.vibrate?.(25);
      setParticlePhase('reveal');
    }, 1200 + flipDuration + 600);

    // Phase 6 — Result stats
    addTimer(() => {
      setPhase('result');
      if (userWon) {
        sounds.play('win');
        setParticlePhase('win');
        navigator.vibrate?.(15);
        addTimer(() => navigator.vibrate?.(15), 200);
      } else {
        sounds.play('loss');
        setParticlePhase('loss');
      }
    }, 1200 + flipDuration + 1600);

    return () => { timerRefs.current.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verdictText =
    minoritySide === 'tie'
      ? 'Hung jury.'
      : `The ${minoritySide === self?.vote ? 'minority' : 'majority'} held.`;

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 3D backdrop — reveal phase drives juror glow colors */}
      <JuryChamber
        phase="reveal"
        participants={participants}
        selfId={selfId}
        minoritySide={minoritySide}
      />

      {/* Blackout overlay */}
      <motion.div
        animate={{ opacity: phase === 'blackout' ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          zIndex: 30,
          pointerEvents: 'none',
        }}
      />

      {/* Content layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          padding: '0 24px',
          gap: 32,
          pointerEvents: 'none',
        }}
      >
        {/* "THE VERDICT" — letter by letter */}
        <AnimatePresence>
          {(phase === 'title' || phase === 'flipping') && (
            <div style={{ display: 'flex', gap: 2 }}>
              {TITLE_LETTERS.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 14,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {char === ' ' ? ' ' : char}
                </motion.span>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Tally bar */}
        <AnimatePresence>
          {(phase === 'tally' || phase === 'verdict' || phase === 'result') && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ width: '100%', maxWidth: 400 }}
            >
              {/* Bar */}
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  overflow: 'hidden',
                  display: 'flex',
                  background: 'var(--bg-tertiary)',
                }}
              >
                <motion.div
                  initial={{ width: '50%' }}
                  animate={{ width: `${aPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                  style={{ background: 'var(--vote-a)', height: '100%' }}
                />
                <motion.div
                  initial={{ width: '50%' }}
                  animate={{ width: `${100 - aPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                  style={{ background: 'var(--vote-b)', height: '100%' }}
                />
              </div>
              {/* Counts */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  fontFamily: 'var(--font-mono-display)',
                  fontSize: 13,
                }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: 'var(--vote-a)' }}
                >
                  {voteBreakdown.a} {scenario.sideALabel}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: 'var(--vote-b)' }}
                >
                  {scenario.sideBLabel} {voteBreakdown.b}
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verdict text */}
        <AnimatePresence>
          {(phase === 'verdict' || phase === 'result') && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}
            >
              {verdictText}
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Result stats */}
        <AnimatePresence>
          {phase === 'result' && self && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 24 }}
              style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 400 }}
            >
              {[
                {
                  label: 'Started as',
                  value:
                    self.initialVote === 'a' ? scenario.sideALabel : scenario.sideBLabel,
                },
                { label: 'Converted', value: String(self.conversionsMade) },
                {
                  label: 'Score',
                  value: `${self.scoreDelta >= 0 ? '+' : ''}${self.scoreDelta}`,
                  highlight: self.scoreDelta > 0 ? 'var(--success)' : self.scoreDelta < 0 ? 'var(--accent)' : undefined,
                },
              ].map(({ label, value, highlight }) => (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    background: 'rgba(15,15,17,0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderRadius: 10,
                    border: '0.5px solid var(--border-subtle)',
                    padding: '12px 14px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-mono-display)',
                      fontSize: 10,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      marginTop: 6,
                      fontFamily: 'var(--font-mono-display)',
                      fontSize: 16,
                      color: highlight ?? 'var(--text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ParticleEngine phase={particlePhase === 'reveal' ? 'reveal' : particlePhase === 'win' ? 'reveal' : 'reveal'} />
    </div>
  );
}
