'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
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
  total_a_votes: number;
  total_b_votes: number;
  total_plays: number;
}

interface TopStatement {
  statement: string;
  vote: string;
  alias: string;
}

type Screen = 'vote' | 'result';

export default function FirstVerdictPage() {
  const router = useRouter();
  const supabase = createClient();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [screen, setScreen] = useState<Screen>('vote');
  const [myVote, setMyVote] = useState<'a' | 'b' | null>(null);
  const [topStatements, setTopStatements] = useState<TopStatement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      // Pick most-played active scenario
      const { data: s } = await db
        .from('scenarios')
        .select('id, text, question, context_tag, side_a_label, side_b_label, side_a_meaning, side_b_meaning, total_a_votes, total_b_votes, total_plays')
        .eq('is_active', true)
        .eq('language', 'en')
        .order('total_plays', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (s) {
        setScenario(s as Scenario);
        track('first_verdict_viewed', { scenario_id: s.id });

        // Fetch top 3 statements for this scenario
        const { data: stmts } = await db
          .from('room_participants')
          .select('statement, vote, profiles!user_id(alias)')
          .not('statement', 'is', null)
          .gt('statement_upvotes', 0)
          .order('statement_upvotes', { ascending: false })
          .limit(3);

        if (stmts) {
          setTopStatements(
            stmts
              .filter((r: { statement: string | null; vote: string | null; profiles: { alias: string } | null }) => r.statement && r.profiles)
              .map((r: { statement: string; vote: string; profiles: { alias: string } }) => ({
                statement: r.statement,
                vote: r.vote,
                alias: r.profiles.alias,
              })),
          );
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleVote(side: 'a' | 'b') {
    if (!scenario || myVote) return;
    setMyVote(side);
    navigator.vibrate?.(10);
    track('first_verdict_voted', { scenario_id: scenario.id, vote: side });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Record as a swipe_vote (counts toward real tally)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await db.from('swipe_votes').upsert(
        { user_id: user.id, scenario_id: scenario.id, vote: side },
        { onConflict: 'user_id,scenario_id' },
      );
      // Mark is_first_verdict done
      await db.from('profiles')
        .update({ is_first_verdict: true })
        .eq('id', user.id);
    }

    setTimeout(() => setScreen('result'), 150);
  }

  if (loading || !scenario) {
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

  const total = scenario.total_a_votes + scenario.total_b_votes;
  const aPct = total > 0 ? Math.round((scenario.total_a_votes / total) * 100) : 50;
  const bPct = 100 - aPct;
  const agreedPct = myVote === 'a' ? aPct : bPct;
  const isMinority = agreedPct < 50;

  return (
    <div className="fixed inset-0 flex flex-col bg-bg-primary">
      <AnimatePresence mode="wait">
        {screen === 'vote' ? (
          <motion.div
            key="vote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-1 px-6"
          >
            {/* Scenario text — centered on screen */}
            <div className="flex-1 flex flex-col justify-center">
              {scenario.context_tag && (
                <p className="mb-5 text-11 text-text-tertiary label-caps text-center">
                  {scenario.context_tag}
                </p>
              )}
              <p className="font-serif text-[20px] leading-[30px] text-text-primary text-center">
                {scenario.text}
              </p>
              <p className="mt-4 text-15 text-text-secondary text-center">
                {scenario.question}
              </p>
            </div>

            {/* Vote buttons */}
            <div className="pb-16 space-y-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleVote('a')}
                className="w-full h-14 rounded-md border-hairline text-15 text-text-primary font-medium transition-colors hover:border-hairline-active"
              >
                {scenario.side_a_label}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleVote('b')}
                className="w-full h-14 rounded-md border-hairline text-15 text-text-primary font-medium transition-colors hover:border-hairline-active"
              >
                {scenario.side_b_label}
              </motion.button>

              {/* Footer hint */}
              <p className="pt-2 text-center text-11 text-text-tertiary">
                See what others think →
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1 overflow-y-auto px-6 pt-12 pb-8"
          >
            {/* Split bar */}
            <div>
              <div className="flex h-2 overflow-hidden rounded-full">
                <motion.div
                  className="bg-[var(--vote-a)]"
                  initial={{ width: '50%' }}
                  animate={{ width: `${aPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                <motion.div
                  className="bg-[var(--vote-b)]"
                  initial={{ width: '50%' }}
                  animate={{ width: `${bPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-11 text-text-secondary">
                <span
                  style={{
                    color: myVote === 'a' ? 'var(--vote-a)' : 'var(--text-tertiary)',
                  }}
                >
                  {scenario.side_a_label} {aPct}%
                </span>
                <span
                  style={{
                    color: myVote === 'b' ? 'var(--vote-b)' : 'var(--text-tertiary)',
                  }}
                >
                  {bPct}% {scenario.side_b_label}
                </span>
              </div>
            </div>

            {/* Outcome line */}
            <div className="mt-8">
              <p className="font-serif text-28 font-medium leading-tight">
                {isMinority
                  ? 'You were in the minority.'
                  : `${agreedPct}% agreed with you.`}
              </p>
              {isMinority && (
                <p className="mt-2 text-15 text-text-secondary">
                  Only {agreedPct}% took your position. The minority gets a voice in the live debate.
                </p>
              )}
            </div>

            {/* Top statements */}
            {topStatements.length > 0 && (
              <div className="mt-8 space-y-3">
                <p className="text-11 text-text-secondary label-caps">What players said</p>
                {topStatements.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-md border-hairline bg-bg-secondary p-4"
                    style={{
                      borderLeftWidth: 2,
                      borderLeftColor:
                        s.vote === 'a' ? 'var(--vote-a)' : 'var(--vote-b)',
                    }}
                  >
                    <p className="font-serif text-15 leading-relaxed text-text-primary">
                      &ldquo;{s.statement}&rdquo;
                    </p>
                    <p className="mt-2 font-mono text-11 text-text-tertiary">
                      @{s.alias}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => {
                  track('first_verdict_join_live', { scenario_id: scenario.id });
                  router.push('/match');
                }}
                className="w-full h-12 rounded-md bg-accent text-13 font-medium text-bg-primary hover:bg-accent-hover transition-colors"
              >
                Join the live debate →
              </button>
              <button
                type="button"
                onClick={() => {
                  track('first_verdict_next_scenario');
                  router.push('/swipe');
                }}
                className="w-full h-12 rounded-md border-hairline text-13 text-text-secondary hover:border-hairline-active transition-colors"
              >
                Next scenario →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
