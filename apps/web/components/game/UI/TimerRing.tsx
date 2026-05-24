'use client';

import { useEffect, useRef } from 'react';
import { sounds } from '@/lib/sounds';

interface Props {
  remainingMs: number;
  totalMs: number;
  size?: number;
  /** Show enlarged version for voting phase */
  large?: boolean;
  /** Play tick sound every second in last 10s */
  enableTick?: boolean;
}

export function TimerRing({ remainingMs, totalMs, size = 48, large, enableTick }: Props) {
  const diameter = large ? 96 : size;
  const radius = (diameter - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, remainingMs / totalMs));
  const dashOffset = circumference * (1 - progress);
  const seconds = Math.ceil(remainingMs / 1000);
  const isUrgent = remainingMs < 10_000;

  const lastTickSecRef = useRef(-1);

  useEffect(() => {
    if (!enableTick || !isUrgent) return;
    if (seconds !== lastTickSecRef.current && seconds > 0) {
      lastTickSecRef.current = seconds;
      sounds.play('tick');
    }
  }, [seconds, isUrgent, enableTick]);

  return (
    <div
      style={{
        position: 'relative',
        width: diameter,
        height: diameter,
        flexShrink: 0,
      }}
    >
      <svg
        width={diameter}
        height={diameter}
        style={{ transform: 'rotate(-90deg)', display: 'block' }}
      >
        {/* Track */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={3}
        />
        {/* Progress arc */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={isUrgent ? 'var(--accent)' : 'var(--text-secondary)'}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s',
            ...(isUrgent
              ? { animation: 'timerPulse 0.8s ease-in-out infinite' }
              : {}),
          }}
        />
      </svg>

      {/* Center label */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono-display)',
          fontSize: large ? 18 : 11,
          color: isUrgent ? 'var(--accent)' : 'var(--text-secondary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {seconds}
      </span>

      <style>{`
        @keyframes timerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
