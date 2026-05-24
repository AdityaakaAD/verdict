'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <section className="flex h-full flex-col items-center pt-16">
      <ScalesOfJustice />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 500,
          marginTop: 28,
          letterSpacing: '-0.01em',
        }}
      >
        verdict<span style={{ color: 'var(--accent)' }}>.</span>
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="mt-3 text-center text-15 text-text-secondary"
        style={{ maxWidth: '28ch' }}
      >
        Judge the world. Be judged by it.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.6 }}
        className="mt-2 text-center text-13 text-text-tertiary"
        style={{ maxWidth: '32ch' }}
      >
        Six strangers. One scenario. Five minutes to decide who got it right.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.1, duration: 0.5, ease: 'easeOut' }}
        style={{ marginTop: 'auto', paddingTop: 64, width: '100%' }}
      >
        <Link
          href="/interests"
          className="flex h-12 w-full items-center justify-center rounded-md bg-accent text-15 font-medium text-bg-primary transition-colors duration-100 hover:bg-accent-hover"
        >
          Begin
        </Link>
      </motion.div>
    </section>
  );
}

function ScalesOfJustice() {
  const stroke = 'var(--text-primary)';

  return (
    <svg
      viewBox="0 0 100 90"
      width={110}
      height={99}
      fill="none"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Fulcrum cap */}
      <motion.circle
        cx={50}
        cy={14}
        r={2.5}
        fill={stroke}
        stroke="none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        style={{ transformOrigin: '50px 14px' }}
      />

      {/* Vertical post */}
      <motion.line
        x1={50} y1={16} x2={50} y2={68}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
      />

      {/* Horizontal beam */}
      <motion.line
        x1={16} y1={26} x2={84} y2={26}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
      />

      {/* Base */}
      <motion.line
        x1={32} y1={68} x2={68} y2={68}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4, ease: 'easeOut' }}
      />

      {/* Left chain */}
      <motion.line
        x1={16} y1={26} x2={16} y2={50}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.35, ease: 'easeOut' }}
      />

      {/* Right chain — slightly shorter for visual tilt */}
      <motion.line
        x1={84} y1={26} x2={84} y2={47}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.3, ease: 'easeOut' }}
      />

      {/* Left pan (lower) */}
      <motion.path
        d="M 6,50 Q 16,58 26,50"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.35, ease: 'easeOut' }}
      />

      {/* Right pan (higher — imbalanced) */}
      <motion.path
        d="M 74,47 Q 84,55 94,47"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.35, ease: 'easeOut' }}
      />
    </svg>
  );
}
