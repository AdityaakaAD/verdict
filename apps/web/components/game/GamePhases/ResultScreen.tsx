'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ParticipantState, ResultState, Scenario } from '@verdict/shared';
import { JuryChamber } from '@/components/game/JuryChamber';
import { ParticleEngine } from '@/components/game/ParticleEngine';
import { ShareCard } from '@/components/game/UI/ShareCard';
import { CommentThread } from '@/components/game/UI/CommentThread';
import { sounds } from '@/lib/sounds';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  result: ResultState;
  selfId: string;
  roomId?: string;
  selfUserId?: string;
  primaryCta?: { label: string; onClick: () => void };
  secondaryCta?: { label: string; href: string };
}

export function ResultScreen({
  scenario,
  participants,
  result,
  selfId,
  roomId,
  selfUserId,
  primaryCta,
  secondaryCta,
}: Props) {
  const self = participants.find((p) => p.id === selfId);
  const userWon =
    self &&
    ((self.wasMinority && result.minorityWon) || (!self.wasMinority && !result.minorityWon));
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    if (userWon) {
      sounds.play('win');
      navigator.vibrate?.(15);
      setTimeout(() => navigator.vibrate?.(15), 200);
    } else {
      sounds.play('loss');
    }
  }, [userWon]);

  const headlineText =
    result.majorityOutcome === 'unanimous'
      ? 'Unanimous.'
      : result.majorityOutcome === 'hung'
        ? 'Hung jury.'
        : result.minorityWon
          ? userWon
            ? 'You changed minds.'
            : 'The minority held.'
          : userWon
            ? 'The majority held.'
            : 'The majority held.';

  const minoritySide = result.majorityOutcome === 'a' ? 'b' : result.majorityOutcome === 'b' ? 'a' : null;

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 3D — room settles, jurors show final vote colors */}
      <JuryChamber
        phase="result"
        participants={participants}
        selfId={selfId}
        minoritySide={minoritySide ?? undefined}
      />

      {/* Slight dim on loss */}
      {!userWon && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,10,11,0.3)',
            zIndex: 8,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Scrollable overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          zIndex: 15,
          pointerEvents: 'auto',
        }}
      >
        {/* Inner wrapper: short content stays at bottom, tall content scrolls from top */}
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 240, damping: 26 }}
          style={{
            background: 'linear-gradient(to top, rgba(10,10,11,0.97) 70%, transparent)',
            padding: '32px 20px 48px',
          }}
        >
          <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Headline */}
            <div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 32,
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                }}
              >
                {headlineText}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                style={{ marginTop: 8, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}
              >
                {scenario.contextTag ? `${scenario.contextTag}. ` : ''}
                Final split: {result.voteBreakdown.a} to {result.voteBreakdown.b}.
                {result.totalConversions > 0
                  ? ` ${result.totalConversions} ${result.totalConversions === 1 ? 'juror' : 'jurors'} crossed.`
                  : ''}
              </motion.p>
            </div>

            {/* Your result card */}
            {self && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '0.5px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '16px 18px',
                }}
              >
                <p style={{ fontSize: 11, fontFamily: 'var(--font-mono-display)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  You
                </p>
                <p style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>
                  {userWon ? 'You were right.' : 'You were on the losing side.'}
                </p>
                <p
                  style={{
                    marginTop: 6,
                    fontFamily: 'var(--font-mono-display)',
                    fontSize: 15,
                    color: self.scoreDelta > 0 ? 'var(--success)' : self.scoreDelta < 0 ? 'var(--accent)' : 'var(--text-secondary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {self.scoreDelta >= 0 ? '+' : ''}{self.scoreDelta} verdict score
                </p>
              </motion.div>
            )}

            {/* Score deltas */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <p style={{ fontSize: 11, fontFamily: 'var(--font-mono-display)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Score deltas
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...participants]
                  .sort((a, b) => b.scoreDelta - a.scoreDelta)
                  .map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'var(--bg-secondary)',
                        border: '0.5px solid var(--border-subtle)',
                        borderRadius: 10,
                        padding: '10px 14px',
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          fontFamily: 'var(--font-mono-display)',
                          fontSize: 13,
                          color: p.id === selfId ? 'var(--accent)' : 'var(--text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        @{p.alias}{p.id === selfId ? ' · you' : ''}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono-display)',
                          fontSize: 13,
                          fontVariantNumeric: 'tabular-nums',
                          color:
                            p.scoreDelta > 0
                              ? 'var(--text-primary)'
                              : p.scoreDelta < 0
                                ? 'var(--text-tertiary)'
                                : 'var(--text-secondary)',
                        }}
                      >
                        {p.scoreDelta >= 0 ? '+' : ''}{p.scoreDelta}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>

            {/* Share card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <ShareCard
                scenario={scenario}
                participants={participants}
                result={result}
                selfId={selfId}
              />
            </motion.div>

            {/* Comment thread — live rooms only */}
            {roomId && selfUserId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <CommentThread
                  roomId={roomId}
                  selfUserId={selfUserId}
                  selfAlias={self?.alias ?? 'you'}
                />
              </motion.div>
            )}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {primaryCta && (
                <button
                  type="button"
                  onClick={primaryCta.onClick}
                  style={{
                    height: 48,
                    borderRadius: 10,
                    background: 'var(--accent)',
                    border: 'none',
                    color: 'var(--bg-primary)',
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {primaryCta.label}
                </button>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 48,
                    borderRadius: 10,
                    border: '0.5px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: 15,
                    textDecoration: 'none',
                  }}
                >
                  {secondaryCta.label}
                </Link>
              )}
            </motion.div>
          </div>
        </motion.div>
        </div>
      </div>

      <ParticleEngine phase={userWon ? 'reveal' : 'lobby'} />
    </div>
  );
}
