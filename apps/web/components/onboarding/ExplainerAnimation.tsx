'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { track } from '@/lib/analytics/posthog';

interface Props {
  onComplete: () => void;
}

const TOTAL_DURATION_MS = 45_000;
const SKIP_AVAILABLE_MS = 5_000;

// ---------------------------------------------------------------------------
// Scene definitions
// ---------------------------------------------------------------------------

const scenes = [
  { id: 1, startMs: 0,    endMs: 8000  },
  { id: 2, startMs: 8000, endMs: 18000 },
  { id: 3, startMs: 18000, endMs: 28000 },
  { id: 4, startMs: 28000, endMs: 38000 },
  { id: 5, startMs: 38000, endMs: 45000 },
];

// Simplified juror figure (2D SVG)
function JurorFigure({ x, active, vote }: { x: number; active?: boolean; vote?: 'a' | 'b' }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      {/* Body */}
      <rect x="-8" y="20" width="16" height="22" rx="4"
        fill={active ? 'var(--text-secondary)' : 'var(--bg-tertiary)'}
        opacity={active ? 1 : 0.5}
      />
      {/* Head */}
      <circle cx="0" cy="12" r="9"
        fill={active ? 'var(--text-secondary)' : 'var(--bg-tertiary)'}
        opacity={active ? 1 : 0.5}
      />
      {/* Vote dot */}
      {vote && (
        <circle cx="0" cy="0" r="4"
          fill={vote === 'a' ? 'var(--vote-a)' : 'var(--vote-b)'}
        />
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ExplainerAnimation({ onComplete }: Props) {
  const supabase = createClient();
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    track('explainer_started');
    const t = setTimeout(() => setSkipAvailable(true), SKIP_AVAILABLE_MS);
    return () => clearTimeout(t);
  }, []);

  // Drive elapsed via rAF for smooth progress
  useEffect(() => {
    function tick() {
      const e = Date.now() - startTimeRef.current;
      setElapsed(e);
      if (e >= TOTAL_DURATION_MS) {
        handleComplete('completed');
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  async function markSeen() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await db.from('profiles').update({ has_seen_explainer: true }).eq('id', user.id);
    }
  }

  function handleComplete(reason: 'completed' | 'skipped') {
    if (done) return;
    setDone(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    track(reason === 'skipped' ? 'explainer_skipped' : 'explainer_completed');
    markSeen();
    onComplete();
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentScene = [...scenes].reverse().find((s) => elapsed >= s.startMs) ?? scenes[0]!;
  const progress = Math.min(1, elapsed / TOTAL_DURATION_MS);
  const sceneProgress = currentScene
    ? Math.min(1, (elapsed - currentScene.startMs) / (currentScene.endMs - currentScene.startMs))
    : 0;

  if (done) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary px-6"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-bg-tertiary">
        <motion.div
          className="h-full bg-text-tertiary"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Scene canvas */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {currentScene.id === 1 && <Scene1 progress={sceneProgress} />}
            {currentScene.id === 2 && <Scene2 progress={sceneProgress} />}
            {currentScene.id === 3 && <Scene3 progress={sceneProgress} />}
            {currentScene.id === 4 && <Scene4 progress={sceneProgress} />}
            {currentScene.id === 5 && <Scene5 progress={sceneProgress} onBegin={() => handleComplete('skipped')} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip button */}
      <AnimatePresence>
        {skipAvailable && currentScene.id < 5 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={() => handleComplete('skipped')}
            className="absolute top-8 right-6 text-11 text-text-tertiary label-caps hover:text-text-secondary transition-colors"
          >
            Skip →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

function Scene1({ progress }: { progress: number }) {
  return (
    <div className="text-center space-y-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 0.1 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="text-11 text-text-tertiary label-caps"
      >
        A scenario appears.
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: progress > 0.2 ? 0 : 30, opacity: progress > 0.2 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-md border-hairline bg-bg-secondary p-5 text-left"
      >
        <p className="font-serif text-15 leading-relaxed text-text-primary">
          A doctor tells a patient her treatment failed because the AI that recommended it
          had a known flaw the company never disclosed.
        </p>
        <p className="mt-3 text-13 text-text-secondary">Who is responsible?</p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 0.7 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="text-11 text-text-tertiary"
      >
        Every night at 9 PM.
      </motion.p>
    </div>
  );
}

function Scene2({ progress }: { progress: number }) {
  const jurors = [0, 1, 2, 3, 4, 5];
  return (
    <div className="text-center space-y-6">
      <p className="text-11 text-text-tertiary label-caps">Six strangers read it.</p>

      {/* SVG juror figures */}
      <div className="flex justify-center">
        <svg width="300" height="80" viewBox="0 0 300 80">
          {jurors.map((i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: progress > i * 0.12 ? 1 : 0, y: progress > i * 0.12 ? 0 : 8 }}
              transition={{ duration: 0.3 }}
            >
              <JurorFigure x={30 + i * 46} active={progress > i * 0.12} />
            </motion.g>
          ))}
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 0.5 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <p className="text-13 text-text-secondary">They share their reasoning.</p>
        {[
          '"The company knew and said nothing."',
          '"The doctor should have asked more questions."',
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i === 0 ? -8 : 8 }}
            animate={{ opacity: progress > 0.6 + i * 0.15 ? 1 : 0, x: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-md border-hairline bg-bg-secondary px-3 py-2 text-left"
          >
            <p className="font-serif text-13 text-text-secondary">{s}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function Scene3({ progress }: { progress: number }) {
  const aPct = Math.round(35 + progress * 7);
  const bPct = 100 - aPct;

  return (
    <div className="text-center space-y-6">
      <p className="text-11 text-text-tertiary label-caps">The room votes. Secretly.</p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: progress > 0.1 ? 1 : 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <div className="flex h-3 overflow-hidden rounded-full bg-bg-tertiary">
          <motion.div
            className="bg-[var(--vote-a)]"
            initial={{ width: '50%' }}
            animate={{ width: `${aPct}%` }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <motion.div
            className="bg-[var(--vote-b)]"
            initial={{ width: '50%' }}
            animate={{ width: `${bPct}%` }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </div>
        <div className="flex justify-between font-mono text-13">
          <span style={{ color: 'var(--vote-a)' }}>Company {aPct}%</span>
          <span style={{ color: 'var(--vote-b)' }}>{bPct}% Doctor</span>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 0.6 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="font-serif text-18 text-text-primary"
      >
        Then the verdict reveals.
      </motion.p>
    </div>
  );
}

function Scene4({ progress }: { progress: number }) {
  const converts = Math.floor(progress * 2);

  return (
    <div className="text-center space-y-6">
      <p className="text-11 text-text-tertiary label-caps">The minority gets a chance.</p>

      <div className="flex justify-center">
        <svg width="200" height="80" viewBox="0 0 200 80">
          {/* Main group */}
          {[0, 1, 2, 3].map((i) => (
            <JurorFigure key={i} x={20 + i * 36} active vote="a" />
          ))}
          {/* Moving minority juror */}
          <motion.g
            animate={{ x: progress > 0.3 ? -50 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <JurorFigure x={180} active vote="b" />
          </motion.g>
        </svg>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 0.4 ? 1 : 0 }}
        className="text-15 text-text-secondary"
      >
        Can you change minds?
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 0.6 ? 1 : 0 }}
        className="font-mono text-28 text-accent"
      >
        +{converts}
      </motion.div>
    </div>
  );
}

function Scene5({ onBegin }: { progress: number; onBegin: () => void }) {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-2">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-28 font-medium text-text-primary"
        >
          Your verdict.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-serif text-28 font-medium text-text-primary"
        >
          Your voice.
        </motion.p>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-serif text-22 text-text-secondary"
      >
        verdict.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onBegin}
        className="w-full max-w-xs mx-auto h-14 rounded-md bg-accent text-15 font-medium text-bg-primary hover:bg-accent-hover transition-colors"
      >
        Begin →
      </motion.button>
    </div>
  );
}
