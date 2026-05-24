'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { Scenario } from '@verdict/shared';
import { nextDropAt, formatCountdown } from '@/lib/time';

interface Props {
  timezone: string;
  scenario?: Scenario | null;
  jurorCount?: number;
}

const TOTAL_MS = 24 * 60 * 60 * 1000;

export function FeaturedCard({ timezone, scenario, jurorCount = 0 }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const drop = nextDropAt(timezone, new Date(now)).getTime();
  const remaining = Math.max(0, drop - now);
  const isUrgent = remaining < 10 * 60 * 1000;
  const barWidth = `${(remaining / TOTAL_MS) * 100}%`;

  // 3D tilt via pointer tracking
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-1, 1], [5, -5]);
  const rotateY = useTransform(mouseX, [-1, 1], [-5, 5]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
        position: 'relative',
        height: '48vh',
        minHeight: 240,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
        border: '0.5px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 20px 0',
        cursor: 'default',
      }}
    >
      {/* SVG noise texture */}
      <svg
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.025,
        }}
      >
        <filter id="featured-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#featured-noise)" />
      </svg>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <p style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-mono-display)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          Tonight's verdict
        </p>

        {jurorCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: 'var(--font-mono-display)',
            fontSize: 11,
            color: 'var(--text-secondary)',
          }}>
            <motion.span
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 5, height: 5, borderRadius: '50%', background: '#34C759', display: 'inline-block' }}
            />
            {jurorCount} waiting
          </div>
        )}
      </div>

      {/* Scenario / placeholder text */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1, padding: '16px 0' }}>
        {scenario ? (
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 500,
            lineHeight: 1.45,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {scenario.text}
          </p>
        ) : (
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            margin: 0,
          }}>
            The courtroom opens at 9:00 pm. Tonight's scenario drops then.
          </p>
        )}
      </div>

      {/* Countdown row + depletion bar */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 10 }}>
          <span style={{
            fontFamily: 'var(--font-mono-display)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-tertiary)',
          }}>
            Opens in
          </span>
          <span
            suppressHydrationWarning
            style={{
              fontFamily: 'var(--font-mono-display)',
              fontSize: 15,
              fontVariantNumeric: 'tabular-nums',
              color: isUrgent ? 'var(--accent)' : 'var(--text-primary)',
            }}
          >
            {formatCountdown(remaining)}
          </span>
        </div>

        {/* Crimson depletion bar — depletes toward zero as countdown runs out */}
        <div style={{
          height: 3,
          background: 'rgba(255,59,48,0.10)',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: barWidth,
            background: isUrgent
              ? 'linear-gradient(90deg, #FF3B30, #FF6B30)'
              : 'linear-gradient(90deg, rgba(255,59,48,0.65), rgba(255,59,48,0.35))',
            transition: 'width 1s linear',
            borderRadius: '0 0 0 12px',
          }} />
        </div>
      </div>
    </motion.div>
  );
}
