'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { votedCount, totalPlayers, type ParticipantState, type Scenario, type VoteSide } from '@verdict/shared';
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
  onVote: (vote: VoteSide) => void;
}

export function VotingPhase({ scenario, participants, selfId, remainingMs, totalMs, onVote }: Props) {
  const self = participants.find((p) => p.id === selfId);
  const selfVote = self?.vote ?? null;
  const voted = votedCount({ participants } as never);
  const total = totalPlayers({ participants } as never);
  const isUrgent = remainingMs < 10_000;

  // Start heartbeat sound at 10s remaining
  useEffect(() => {
    if (isUrgent) {
      sounds.play('heartbeat');
    } else {
      sounds.stop('heartbeat');
    }
    return () => { sounds.stop('heartbeat'); };
  }, [isUrgent]);

  function handleVote(side: VoteSide) {
    if (selfVote) return;
    sounds.play('vote_tap');
    navigator.vibrate?.(15);
    onVote(side);
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 3D — room dims, particles converge to table, camera pushes in */}
      <JuryChamber phase="voting" participants={participants} selfId={selfId} />

      {/* Dark vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,11,0.5) 100%)',
          pointerEvents: 'none',
          zIndex: 8,
        }}
      />

      {/* Linear depleting bar — top of screen */}
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
            background: isUrgent ? 'var(--accent)' : 'var(--text-secondary)',
            transformOrigin: '0% 50%',
          }}
          animate={{ scaleX: remainingMs / totalMs }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>

      {/* Center UI */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          pointerEvents: 'none',
          zIndex: 15,
          gap: 24,
        }}
      >
        {/* Timer ring — enlarged */}
        <TimerRing remainingMs={remainingMs} totalMs={totalMs} large enableTick />

        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              color: 'var(--text-secondary)',
              letterSpacing: '-0.01em',
            }}
          >
            Lock your verdict
          </p>
          <p
            style={{
              marginTop: 4,
              fontFamily: 'var(--font-mono-display)',
              fontSize: 11,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Your vote stays private
          </p>
        </div>

        {/* Vote buttons */}
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'auto' }}>
          {(['a', 'b'] as VoteSide[]).map((side) => {
            const label = side === 'a' ? scenario.sideALabel : scenario.sideBLabel;
            const meaning = side === 'a' ? scenario.sideAMeaning : scenario.sideBMeaning;
            const selected = selfVote === side;
            const locked = selfVote !== null && !selected;

            return (
              <motion.button
                key={side}
                type="button"
                onClick={() => handleVote(side)}
                disabled={!!selfVote}
                animate={
                  !selfVote
                    ? { scale: [1, 1.015, 1] }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  padding: '16px 18px',
                  borderRadius: 12,
                  border: `0.5px solid ${selected ? 'var(--border-active)' : 'var(--vote-neutral)'}`,
                  background: selected ? 'var(--bg-tertiary)' : 'rgba(15,15,17,0.7)',
                  cursor: selfVote ? 'default' : 'pointer',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  opacity: locked ? 0.5 : 1,
                  transition: 'opacity 0.2s, border-color 0.2s',
                }}
              >
                {selected && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--text-secondary)',
                      marginBottom: 4,
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {label}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{meaning}</span>
              </motion.button>
            );
          })}
        </div>

        <motion.p
          key={voted}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          style={{
            fontFamily: 'var(--font-mono-display)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {voted} of {total} voted
        </motion.p>
      </div>

      <ParticleEngine phase="voting" />
    </div>
  );
}
