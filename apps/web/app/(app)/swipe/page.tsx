'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { createClient } from '@/lib/supabase/client';
import { track } from '@/lib/analytics/posthog';

const BATCH_SIZE = 10;

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

// Offline cache — 10 cards, survives page refresh via sessionStorage
const CACHE_KEY = 'verdict_swipe_cache';

function readCache(): Scenario[] {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function writeCache(s: Scenario[]) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

export default function SwipePage() {
  const router = useRouter();
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [cursor, setCursor] = useState(0);       // index of card currently shown
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<Record<string, SwipeStats>>({});
  const [statements, setStatements] = useState<Record<string, TopStatement[]>>({});
  const [exhausted, setExhausted] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = useRef<string | null>(null);

  // Progress dots (10 per batch)
  const progress = scenarios.length > 0
    ? ((cursor % BATCH_SIZE) + 1)
    : 0;

  // ─── Load a batch of scenarios ────────────────────────────────────────────

  const loadBatch = useCallback(async (excludeIds: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login?next=/swipe'); return; }
    userId.current = user.id;

    // Already-voted scenarios in swipe + played in rooms → exclude
    const { data: swipeDone } = await db
      .from('swipe_votes')
      .select('scenario_id')
      .eq('user_id', user.id);

    const { data: roomDone } = await db
      .from('user_scenario_history')
      .select('scenario_id')
      .eq('user_id', user.id);

    const exclude = new Set([
      ...excludeIds,
      ...(swipeDone ?? []).map((r: { scenario_id: string }) => r.scenario_id),
      ...(roomDone ?? []).map((r: { scenario_id: string }) => r.scenario_id),
    ]);

    let query = db
      .from('scenarios')
      .select('id, text, question, context_tag, side_a_label, side_b_label, side_a_meaning, side_b_meaning')
      .eq('is_active', true)
      .eq('language', 'en')
      .order('total_plays', { ascending: false })
      .limit(BATCH_SIZE);

    if (exclude.size > 0) {
      query = query.not('id', 'in', `(${[...exclude].join(',')})`);
    }

    const { data } = await query;

    if (!data || data.length === 0) { setLoading(false); setExhausted(true); return; }

    writeCache(data);
    setScenarios((prev) => [...prev, ...data]);
    setSeenIds((prev) => {
      const next = new Set(prev);
      data.forEach((s: Scenario) => next.add(s.id));
      return next;
    });

    // Pre-fetch stats + statements for the batch
    await prefetchBatch(data as Scenario[]);
    setLoading(false);
  }, []);

  async function prefetchBatch(batch: Scenario[]) {
    const ids = batch.map((s) => s.id);

    // Swipe stats
    const { data: statsData } = await db
      .from('scenario_swipe_stats')
      .select('scenario_id, a_count, b_count, total')
      .in('scenario_id', ids);

    if (statsData) {
      const map: Record<string, SwipeStats> = {};
      statsData.forEach((r: { scenario_id: string; a_count: number; b_count: number; total: number }) => {
        map[r.scenario_id] = { a_count: r.a_count, b_count: r.b_count, total: r.total };
      });
      setStats((prev) => ({ ...prev, ...map }));
    }

    // Top statements (up to 3 per scenario — we just fetch global top and filter)
    const { data: stmts } = await db
      .from('room_participants')
      .select('scenario_id:rooms!inner(scenario_id), statement, vote, profiles!user_id(alias), statement_upvotes')
      .in('rooms.scenario_id', ids)
      .not('statement', 'is', null)
      .gt('statement_upvotes', 0)
      .order('statement_upvotes', { ascending: false })
      .limit(ids.length * 3);

    if (stmts) {
      const map: Record<string, TopStatement[]> = {};
      stmts.forEach((r: { scenario_id: { scenario_id: string }; statement: string; vote: string; profiles: { alias: string } }) => {
        const sid = r.scenario_id?.scenario_id;
        if (!sid || !r.statement || !r.profiles) return;
        if (!map[sid]) map[sid] = [];
        if (map[sid].length < 3) {
          map[sid].push({ statement: r.statement, vote: r.vote, alias: r.profiles.alias });
        }
      });
      setStatements((prev) => ({ ...prev, ...map }));
    }
  }

  useEffect(() => {
    // Try cache first for instant feel
    const cached = readCache();
    if (cached.length) {
      setScenarios(cached);
      setLoading(false);
      prefetchBatch(cached);
    }
    loadBatch([...seenIds]);
    track('swipe_feed_opened');
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────

  async function handleVote(side: 'a' | 'b') {
    const s = scenarios[cursor];
    if (!s || !userId.current) return;
    await db.from('swipe_votes').upsert(
      { user_id: userId.current, scenario_id: s.id, vote: side },
      { onConflict: 'user_id,scenario_id' },
    );
    // Trigger fingerprint update via DB function
    await db.rpc('upsert_fingerprint_vote', {
      p_user_id: userId.current,
      p_scenario_id: s.id,
      p_vote: side,
    });
  }

  function advance() {
    const next = cursor + 1;
    if (next >= scenarios.length) {
      // End of current batch
      if (scenarios.length % BATCH_SIZE === 0) {
        // Load next batch
        loadBatch([...seenIds]);
      } else {
        setExhausted(true);
      }
    } else {
      setCursor(next);
      // Pre-load next batch when 3 cards left
      if (scenarios.length - next === 3 && scenarios.length % BATCH_SIZE === 0) {
        loadBatch([...seenIds]);
      }
    }
  }

  function handleSkip() {
    advance();
  }

  function handleNext() {
    advance();
  }

  function handleJoinLive() {
    const s = scenarios[cursor];
    if (s) {
      track('swipe_join_live', { scenario_id: s.id });
      router.push('/match');
    }
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg-primary">
        <div className="h-1 w-16 rounded-full bg-bg-tertiary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-text-tertiary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          />
        </div>
      </div>
    );
  }

  if (exhausted || scenarios.length === 0) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg-primary px-8 text-center">
        <p className="font-serif text-22 font-medium">You&apos;re all caught up.</p>
        <p className="mt-3 text-15 text-text-secondary">
          You&apos;ve seen today&apos;s feed. More scenarios tomorrow.
        </p>
        <Link
          href="/match"
          className="mt-8 flex h-12 w-full max-w-xs items-center justify-center rounded-md bg-accent text-13 font-medium text-bg-primary hover:bg-accent-hover transition-colors"
        >
          Join the live debate →
        </Link>
        <Link
          href="/home"
          className="mt-3 flex h-12 w-full max-w-xs items-center justify-center rounded-md border-hairline text-13 text-text-secondary hover:border-hairline-active transition-colors"
        >
          ← Home
        </Link>
      </div>
    );
  }

  const current = scenarios[cursor];

  return (
    <div className="fixed inset-0 flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <Link href="/home" className="text-11 text-text-secondary label-caps hover:text-text-primary">
          ← Home
        </Link>
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: Math.min(BATCH_SIZE, scenarios.length) }).map((_, i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full"
              style={{
                background:
                  i < cursor % BATCH_SIZE
                    ? 'var(--text-tertiary)'
                    : i === cursor % BATCH_SIZE
                    ? 'var(--text-primary)'
                    : 'var(--bg-tertiary)',
              }}
            />
          ))}
        </div>
        <span className="text-11 text-text-tertiary label-caps">
          {progress}/{Math.min(BATCH_SIZE, scenarios.length)}
        </span>
      </div>

      {/* Card stack */}
      <div className="relative flex-1 px-4 pb-6" style={{ overflow: 'hidden' }}>
        {/* Peek of next card */}
        {scenarios[cursor + 1] && (
          <div
            className="absolute inset-x-6 rounded-xl border-hairline bg-bg-secondary"
            style={{ bottom: 24, top: 8, transform: 'scale(0.97)', transformOrigin: 'bottom' }}
          />
        )}

        {/* Active card */}
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={`${current.id}-${cursor}`}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'absolute', inset: '0 16px 24px' }}
            >
              <SwipeCard
                scenario={current}
                stats={stats[current.id] ?? null}
                topStatements={statements[current.id] ?? []}
                onVote={handleVote}
                onSkip={handleSkip}
                onJoinLive={handleJoinLive}
                onNext={handleNext}
                isActive
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe hint */}
      <p className="pb-safe px-6 pb-4 text-center text-11 text-text-tertiary">
        Swipe right to agree · left to disagree · up to skip
      </p>
    </div>
  );
}
