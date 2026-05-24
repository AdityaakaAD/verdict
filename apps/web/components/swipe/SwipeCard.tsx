'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { track } from '@/lib/analytics/posthog';

interface Scenario {
  id: string;
  text: string;
  question: string;
  context_tag: string | null;
  side_a_label: string;
  side_b_label: string;
  side_a_meaning: string;
  side_b_meaning: string;
}

interface SwipeStats {
  a_count: number;
  b_count: number;
  total: number;
}

interface TopStatement {
  statement: string;
  vote: string;
  alias: string;
}

interface Props {
  scenario: Scenario;
  stats: SwipeStats | null;
  topStatements: TopStatement[];
  onVote: (vote: 'a' | 'b') => void;
  onSkip: () => void;
  onJoinLive: () => void;
  onNext: () => void;
  isActive: boolean;
}

const SWIPE_THRESHOLD = 80; // px to commit a swipe

export function SwipeCard({
  scenario,
  stats,
  topStatements,
  onVote,
  onSkip,
  onJoinLive,
  onNext,
  isActive,
}: Props) {
  const [voted, setVoted] = useState<'a' | 'b' | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const frontOpacity = useTransform(x, [-150, -80, 0, 80, 150], [0, 1, 1, 1, 0]);

  // Color hint while swiping
  const aHint = useTransform(x, [0, 120], [0, 0.15]);
  const bHint = useTransform(x, [-120, 0], [0.15, 0]);

  const dragStartX = useRef(0);

  function commitVote(side: 'a' | 'b', method: 'swipe' | 'tap') {
    if (voted) return;
    setVoted(side);
    navigator.vibrate?.(10);
    track('swipe_card_voted', { scenario_id: scenario.id, vote: side, method });
    onVote(side);
    // Flip to result
    setTimeout(() => setFlipped(true), 180);
  }

  async function handleDragEnd(_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number } }) {
    setDragging(false);
    const { x: ox, y: oy } = info.offset;
    const speed = Math.abs(info.velocity.x);

    // Swipe up = skip
    if (oy < -100 && Math.abs(ox) < 60) {
      await animate(x, 0, { duration: 0.3 });
      track('swipe_card_skipped', { scenario_id: scenario.id });
      onSkip();
      return;
    }

    // Swipe right = A, left = B
    if (ox > SWIPE_THRESHOLD || speed > 500 && ox > 40) {
      await animate(x, 400, { duration: 0.25 });
      commitVote('a', 'swipe');
    } else if (ox < -SWIPE_THRESHOLD || speed > 500 && ox < -40) {
      await animate(x, -400, { duration: 0.25 });
      commitVote('b', 'swipe');
    } else {
      await animate(x, 0, { duration: 0.3, type: 'spring', stiffness: 300 });
    }
  }

  const total = stats?.total ?? 0;
  const aPct = total > 0 ? Math.round(((stats?.a_count ?? 0) / total) * 100) : 50;
  const bPct = 100 - aPct;
  const agreedPct = voted === 'a' ? aPct : bPct;

  return (
    <div className="relative w-full" style={{ height: '100%' }}>
      {/* ── FRONT: pre-vote card ── */}
      <motion.div
        drag={isActive && !voted}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragStart={() => { setDragging(true); dragStartX.current = x.get(); }}
        onDragEnd={handleDragEnd}
        style={{
          x,
          rotate,
          opacity: flipped ? 0 : frontOpacity,
          position: 'absolute',
          inset: 0,
          cursor: isActive && !voted ? 'grab' : 'default',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {/* Swipe direction hints */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            background: 'var(--vote-a)',
            opacity: aHint,
            pointerEvents: 'none',
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            background: 'var(--vote-b)',
            opacity: bHint,
            pointerEvents: 'none',
          }}
        />

        {/* Card body */}
        <div
          className="rounded-xl border-hairline bg-bg-secondary"
          style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 20px 20px' }}
        >
          {/* Context tag */}
          {scenario.context_tag && (
            <p className="text-11 text-text-tertiary label-caps mb-4">
              {scenario.context_tag}
            </p>
          )}

          {/* Scenario text */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <p className="font-serif text-[19px] leading-[28px] text-text-primary">
              {scenario.text}
            </p>
          </div>

          {/* Question */}
          <p className="mt-4 text-15 text-text-secondary">{scenario.question}</p>

          {/* Swipe hint */}
          {!dragging && (
            <p className="mt-5 text-11 text-text-tertiary text-center">
              ← {scenario.side_b_label} &nbsp;·&nbsp; {scenario.side_a_label} →
            </p>
          )}

          {/* Tap buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => commitVote('a', 'tap')}
              disabled={!!voted}
              className="h-12 rounded-md border-hairline text-13 text-text-primary hover:border-hairline-active transition-colors"
            >
              {scenario.side_a_label}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => commitVote('b', 'tap')}
              disabled={!!voted}
              className="h-12 rounded-md border-hairline text-13 text-text-primary hover:border-hairline-active transition-colors"
            >
              {scenario.side_b_label}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── BACK: result card (revealed after vote) ── */}
      <motion.div
        initial={false}
        animate={{ opacity: flipped ? 1 : 0, y: flipped ? 0 : 16 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: flipped ? 'auto' : 'none',
        }}
      >
        <div
          className="rounded-xl border-hairline bg-bg-secondary overflow-y-auto"
          style={{ height: '100%', padding: '24px 20px 20px' }}
        >
          {/* Vote bar */}
          <div className="flex h-2 overflow-hidden rounded-full">
            <motion.div
              className="bg-[var(--vote-a)]"
              initial={{ width: '50%' }}
              animate={{ width: flipped ? `${aPct}%` : '50%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <motion.div
              className="bg-[var(--vote-b)]"
              initial={{ width: '50%' }}
              animate={{ width: flipped ? `${bPct}%` : '50%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-11">
            <span style={{ color: voted === 'a' ? 'var(--vote-a)' : 'var(--text-tertiary)' }}>
              {scenario.side_a_label} {aPct}%
            </span>
            <span style={{ color: voted === 'b' ? 'var(--vote-b)' : 'var(--text-tertiary)' }}>
              {bPct}% {scenario.side_b_label}
            </span>
          </div>

          {/* Outcome */}
          <p className="mt-5 font-serif text-[22px] leading-[30px] text-text-primary">
            {agreedPct < 50
              ? 'You were in the minority.'
              : `${agreedPct}% think the same.`}
          </p>

          {/* Top statements */}
          {topStatements.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="text-11 text-text-tertiary label-caps">What players said</p>
              {topStatements.map((s, i) => (
                <div
                  key={i}
                  className="rounded-md border-hairline bg-bg-primary p-3"
                  style={{
                    borderLeftWidth: 2,
                    borderLeftColor:
                      s.vote === 'a' ? 'var(--vote-a)' : 'var(--vote-b)',
                  }}
                >
                  <p className="font-serif text-13 leading-relaxed text-text-primary">
                    &ldquo;{s.statement}&rdquo;
                  </p>
                  <p className="mt-1 font-mono text-11 text-text-tertiary">
                    @{s.alias}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={onJoinLive}
              className="w-full h-11 rounded-md bg-accent text-13 font-medium text-bg-primary hover:bg-accent-hover transition-colors"
            >
              Join the live debate →
            </button>
            <button
              type="button"
              onClick={onNext}
              className="w-full h-11 rounded-md border-hairline text-13 text-text-secondary hover:border-hairline-active transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
