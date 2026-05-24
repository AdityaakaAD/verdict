'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { track } from '@/lib/analytics/posthog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GrandCase {
  id: string;
  title: string;
  premise: string;
  category: string;
  week_start: string;
  total_participants: number;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  question: string;
  side_a_label: string;
  side_b_label: string;
  side_a_meaning: string;
  side_b_meaning: string;
  drops_at: string;
}

interface MyVote {
  chapter_id: string;
  vote: 'a' | 'b';
  changed_from_previous: boolean;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GrandCasePage() {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [activeCase, setActiveCase] = useState<GrandCase | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [myVotes, setMyVotes] = useState<MyVote[]>([]);
  const [chapterStats, setChapterStats] = useState<Record<string, { aPct: number; bPct: number; total: number; flipPct: number }>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSoFar, setExpandedSoFar] = useState(false);
  const [votingChapterId, setVotingChapterId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login?next=/grand-case'; return; }
      setUserId(user.id);

      // Fetch current active case
      const { data: gc } = await db
        .from('grand_cases')
        .select('id, title, premise, category, week_start, total_participants')
        .eq('is_active', true)
        .order('week_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!gc) { setLoading(false); return; }
      setActiveCase(gc as GrandCase);
      track('grand_case_opened', { case_id: gc.id });

      // Fetch dropped chapters (drops_at <= now)
      const { data: chs } = await db
        .from('grand_case_chapters')
        .select('id, chapter_number, title, content, question, side_a_label, side_b_label, side_a_meaning, side_b_meaning, drops_at')
        .eq('case_id', gc.id)
        .lte('drops_at', new Date().toISOString())
        .order('chapter_number', { ascending: true });

      const dropped = (chs ?? []) as Chapter[];
      setChapters(dropped);

      // Fetch my votes on this case
      const { data: votes } = await db
        .from('grand_case_votes')
        .select('chapter_id, vote, changed_from_previous')
        .eq('user_id', user.id)
        .eq('case_id', gc.id);

      setMyVotes((votes ?? []) as MyVote[]);

      // Fetch stats per chapter
      const stats: Record<string, { aPct: number; bPct: number; total: number; flipPct: number }> = {};
      for (const ch of dropped) {
        const { data: allVotes } = await db
          .from('grand_case_votes')
          .select('vote, changed_from_previous')
          .eq('chapter_id', ch.id);

        if (allVotes && allVotes.length > 0) {
          const total = allVotes.length;
          const aCount = allVotes.filter((v: { vote: string }) => v.vote === 'a').length;
          const flipped = allVotes.filter((v: { changed_from_previous: boolean }) => v.changed_from_previous).length;
          stats[ch.id] = {
            aPct: Math.round((aCount / total) * 100),
            bPct: 100 - Math.round((aCount / total) * 100),
            total,
            flipPct: Math.round((flipped / total) * 100),
          };
        }
      }
      setChapterStats(stats);
      setLoading(false);

      // Track chapter reads
      if (dropped.length > 0) {
        track('grand_case_chapter_read', {
          case_id: gc.id,
          chapter_number: dropped.at(-1)?.chapter_number ?? 0,
        });
      }
    }
    load();
  }, []);

  async function castVote(chapter: Chapter, vote: 'a' | 'b') {
    if (!userId || !activeCase || submitting) return;
    setSubmitting(true);

    const prevVote = myVotes.find((v) => v.chapter_id === chapter.id);
    if (prevVote) { setSubmitting(false); return; } // already voted

    // Check previous chapter vote (for flip detection)
    const prevChapterVote = chapters.find((c) => c.chapter_number === chapter.chapter_number - 1);
    const prevChapterMyVote = prevChapterVote
      ? myVotes.find((v) => v.chapter_id === prevChapterVote.id)
      : null;
    const changedFromPrevious = prevChapterMyVote
      ? prevChapterMyVote.vote !== vote
      : false;

    await db.from('grand_case_votes').insert({
      user_id: userId,
      case_id: activeCase.id,
      chapter_id: chapter.id,
      vote,
      changed_from_previous: changedFromPrevious,
    });

    // Update fingerprint
    await db.rpc('upsert_fingerprint_vote', {
      p_user_id: userId,
      p_scenario_id: null,
      p_vote: vote,
    });

    setMyVotes((prev) => [...prev, { chapter_id: chapter.id, vote, changed_from_previous: changedFromPrevious }]);
    track('grand_case_voted', {
      case_id: activeCase.id,
      chapter_id: chapter.id,
      vote,
      changed_from_previous: changedFromPrevious,
    });
    setVotingChapterId(null);
    setSubmitting(false);
  }

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

  if (!activeCase) {
    return (
      <main className="mx-auto max-w-[520px] px-6 pb-24 pt-12">
        <header className="flex items-center justify-between">
          <Link href="/home" className="text-11 text-text-secondary label-caps hover:text-text-primary">
            ← Home
          </Link>
          <span className="text-11 text-text-tertiary label-caps">Grand Case</span>
        </header>
        <div className="mt-16 rounded-md border-hairline bg-bg-secondary p-6 text-center">
          <p className="font-serif text-18">No active Grand Case</p>
          <p className="mt-2 text-15 text-text-secondary">
            A new case opens every Monday at 9 PM. Check back then.
          </p>
        </div>
      </main>
    );
  }

  const today = new Date();
  const isFriday = today.getDay() === 5;
  const currentChapter = chapters[chapters.length - 1];
  const prevChapters = chapters.slice(0, -1);

  return (
    <main className="mx-auto max-w-[520px] px-6 pb-24 pt-12">
      <header className="flex items-center justify-between">
        <Link href="/home" className="text-11 text-text-secondary label-caps hover:text-text-primary">
          ← Home
        </Link>
        <span className="text-11 text-accent label-caps font-medium">Grand Case</span>
      </header>

      {/* Case header */}
      <div className="mt-8">
        <p className="text-11 text-accent label-caps">
          Day {chapters.length} of 5
        </p>
        <h1 className="mt-2 font-serif text-28 font-medium">{activeCase.title}.</h1>

        {/* Chapter progress dots */}
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => {
            const dropped = chapters.some((c) => c.chapter_number === n);
            const voted = dropped && myVotes.some(
              (v) => chapters.find((c) => c.chapter_number === n)?.id === v.chapter_id,
            );
            return (
              <div
                key={n}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  background: voted
                    ? 'var(--accent)'
                    : dropped
                    ? 'var(--text-tertiary)'
                    : 'var(--bg-tertiary)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Story so far (collapsible after chapter 2) */}
      {prevChapters.length > 0 && (
        <div className="mt-6 rounded-md border-hairline bg-bg-secondary overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedSoFar((p) => !p)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="text-11 text-text-secondary label-caps">Story so far</span>
            <span className="text-11 text-text-tertiary">
              {expandedSoFar ? '↑' : '↓'}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {expandedSoFar && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-5 pb-5 space-y-4">
                  {prevChapters.map((ch) => {
                    const myVote = myVotes.find((v) => v.chapter_id === ch.id);
                    return (
                      <div key={ch.id}>
                        <p className="text-11 text-accent label-caps">{ch.title}</p>
                        <p className="mt-1 text-13 text-text-secondary leading-relaxed">
                          {ch.content.slice(0, 160)}…
                        </p>
                        {myVote && (
                          <p className="mt-1 font-mono text-11 text-text-tertiary">
                            You said:{' '}
                            <span style={{ color: myVote.vote === 'a' ? 'var(--vote-a)' : 'var(--vote-b)' }}>
                              {myVote.vote === 'a' ? ch.side_a_label : ch.side_b_label}
                            </span>
                            {myVote.changed_from_previous && ' · mind changed'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Current chapter */}
      {currentChapter && (
        <section className="mt-6">
          <div className="rounded-md border-hairline-accent bg-bg-secondary p-5">
            <p className="text-11 text-accent label-caps">{currentChapter.title}</p>
            <p className="mt-4 font-serif text-15 leading-relaxed text-text-primary">
              {currentChapter.content}
            </p>
            <p className="mt-4 text-15 font-medium text-text-primary">
              {currentChapter.question}
            </p>
          </div>

          {/* Vote or result */}
          <ChapterVote
            chapter={currentChapter}
            myVote={myVotes.find((v) => v.chapter_id === currentChapter.id) ?? null}
            prevChapterVote={
              prevChapters.length > 0
                ? myVotes.find((v) => v.chapter_id === prevChapters.at(-1)?.id) ?? null
                : null
            }
            stats={chapterStats[currentChapter.id] ?? null}
            isVoting={votingChapterId === currentChapter.id}
            onStartVote={() => setVotingChapterId(currentChapter.id)}
            onCastVote={(vote) => castVote(currentChapter, vote)}
            submitting={submitting}
          />
        </section>
      )}

      {/* Final verdict (Friday) */}
      {isFriday && chapters.length === 5 && (
        <section className="mt-8 rounded-md border-hairline bg-bg-secondary p-5">
          <p className="text-11 text-accent label-caps mb-3">The Jury Has Deliberated</p>
          <p className="font-serif text-18 text-text-primary">Five days. Five verdicts.</p>
          <p className="mt-2 text-13 text-text-secondary">
            Your vote history across the full case is recorded below.
          </p>
          <div className="mt-4 space-y-2">
            {chapters.map((ch) => {
              const v = myVotes.find((mv) => mv.chapter_id === ch.id);
              return (
                <div key={ch.id} className="flex items-center justify-between">
                  <span className="text-11 text-text-tertiary">{ch.title}</span>
                  {v ? (
                    <span
                      className="font-mono text-11"
                      style={{ color: v.vote === 'a' ? 'var(--vote-a)' : 'var(--vote-b)' }}
                    >
                      {v.vote === 'a' ? ch.side_a_label : ch.side_b_label}
                      {v.changed_from_previous && ' ⟳'}
                    </span>
                  ) : (
                    <span className="text-11 text-text-tertiary">—</span>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => track('grand_case_final_card_shared', { case_id: activeCase.id })}
            className="mt-5 w-full h-11 rounded-md border-hairline text-13 text-text-secondary hover:border-hairline-active transition-colors"
          >
            Share your verdict →
          </button>
        </section>
      )}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Chapter vote sub-component
// ---------------------------------------------------------------------------

function ChapterVote({
  chapter,
  myVote,
  prevChapterVote,
  stats,
  isVoting,
  onStartVote,
  onCastVote,
  submitting,
}: {
  chapter: Chapter;
  myVote: MyVote | null;
  prevChapterVote: MyVote | null;
  stats: { aPct: number; bPct: number; total: number; flipPct: number } | null;
  isVoting: boolean;
  onStartVote: () => void;
  onCastVote: (vote: 'a' | 'b') => void;
  submitting: boolean;
}) {
  if (myVote) {
    // Already voted — show result
    const myLabel = myVote.vote === 'a' ? chapter.side_a_label : chapter.side_b_label;
    const mySide = myVote.vote;
    const sPct = mySide === 'a' ? stats?.aPct ?? 50 : stats?.bPct ?? 50;

    return (
      <div className="mt-4 space-y-4">
        {/* Flip notification */}
        {myVote.changed_from_previous && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md bg-bg-secondary border-hairline-accent px-4 py-3"
          >
            <p className="text-13 text-text-primary">
              You changed your mind today.
            </p>
            {stats && (
              <p className="mt-1 text-11 text-text-tertiary">
                {stats.flipPct}% of players also shifted their position.
              </p>
            )}
          </motion.div>
        )}

        {/* Vote bar */}
        {stats && (
          <div>
            <div className="flex h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-[var(--vote-a)]"
                style={{ width: `${stats.aPct}%`, transition: 'width 0.6s ease-out' }}
              />
              <div
                className="bg-[var(--vote-b)]"
                style={{ width: `${stats.bPct}%`, transition: 'width 0.6s ease-out' }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-11 text-text-tertiary">
              <span style={{ color: mySide === 'a' ? 'var(--vote-a)' : undefined }}>
                {chapter.side_a_label} {stats.aPct}%
              </span>
              <span style={{ color: mySide === 'b' ? 'var(--vote-b)' : undefined }}>
                {stats.bPct}% {chapter.side_b_label}
              </span>
            </div>
          </div>
        )}

        <p className="text-13 text-text-secondary">
          You voted{' '}
          <span
            style={{ color: mySide === 'a' ? 'var(--vote-a)' : 'var(--vote-b)' }}
          >
            {myLabel}
          </span>
          {stats && ` · ${sPct}% agree today.`}
        </p>

        {prevChapterVote && !myVote.changed_from_previous && (
          <p className="text-11 text-text-tertiary">
            Your position is consistent with yesterday.
          </p>
        )}
      </div>
    );
  }

  if (!isVoting) {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onStartVote}
        className="mt-4 w-full h-12 rounded-md bg-accent text-13 font-medium text-bg-primary hover:bg-accent-hover transition-colors"
      >
        Cast today&apos;s verdict →
      </motion.button>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => onCastVote('a')}
        disabled={submitting}
        className="w-full h-14 rounded-md border-hairline text-15 text-text-primary hover:border-hairline-active transition-colors"
      >
        {chapter.side_a_label}
        <span className="block text-11 text-text-tertiary mt-1">{chapter.side_a_meaning}</span>
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => onCastVote('b')}
        disabled={submitting}
        className="w-full h-14 rounded-md border-hairline text-15 text-text-primary hover:border-hairline-active transition-colors"
      >
        {chapter.side_b_label}
        <span className="block text-11 text-text-tertiary mt-1">{chapter.side_b_meaning}</span>
      </motion.button>
      <button
        type="button"
        onClick={() => { /* close */ }}
        className="w-full text-11 text-text-tertiary hover:text-text-secondary transition-colors py-1"
      >
        ← Back
      </button>
    </div>
  );
}
