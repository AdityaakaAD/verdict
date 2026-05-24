'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { track } from '@/lib/analytics/posthog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Fingerprint {
  individual_vs_collective: number;
  rule_vs_outcome: number;
  loyalty_vs_honesty: number;
  caution_vs_action: number;
  head_vs_heart: number;
  minority_rate: number;
  conversion_rate: number;
  statement_quality: number;
  consistency_score: number;
  archetype: string | null;
  archetype_description: string | null;
  percentile_minority: number | null;
  percentile_conversion: number | null;
  total_votes: number;
}

interface Twin {
  alias: string;
  matchScore: number;
}

// ---------------------------------------------------------------------------
// Archetypes
// ---------------------------------------------------------------------------

const ARCHETYPES: Record<string, { icon: string; description: string }> = {
  contrarian: {
    icon: '◈',
    description: 'You hold the minority position more than 60% of the time. You don\'t follow the crowd — you question it.',
  },
  pragmatist: {
    icon: '◆',
    description: 'Outcomes matter more to you than rules. You judge by results, not by the book.',
  },
  guardian: {
    icon: '◉',
    description: 'You protect the collective over the individual. Society\'s stability is your north star.',
  },
  advocate: {
    icon: '◌',
    description: 'Individual rights come first for you. You distrust systems that override personal choice.',
  },
  idealist: {
    icon: '△',
    description: 'Rules are rules. You believe consistent principles protect everyone equally.',
  },
  loyalist: {
    icon: '▣',
    description: 'Loyalty runs deep. You protect your own, even when it\'s complicated.',
  },
  truth_seeker: {
    icon: '▷',
    description: 'Honesty over comfort, always. Truth serves everyone better long term.',
  },
  calculated: {
    icon: '⬡',
    description: 'You think before you feel. Logic guides your verdicts more than emotion.',
  },
  empath: {
    icon: '◎',
    description: 'You feel before you reason. Human experience weighs heavier than abstract principle.',
  },
  balanced: {
    icon: '◈',
    description: 'You resist easy categories. Your verdicts shift with context — and that\'s a strength.',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  userId: string;
}

const UNLOCK_THRESHOLD = 10;   // minimum votes to show fingerprint
const ARCHETYPE_THRESHOLD = 25; // minimum votes to reveal archetype
const TWIN_THRESHOLD = 50;      // minimum votes to show moral twin

export function MoralFingerprint({ userId }: Props) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [fp, setFp] = useState<Fingerprint | null>(null);
  const [twin, setTwin] = useState<Twin | null>(null);
  const [loading, setLoading] = useState(true);
  const tracked = useRef(false);

  useEffect(() => {
    async function load() {
      const { data } = await db
        .from('moral_fingerprint')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      setFp(data as Fingerprint | null);

      if (data && data.total_votes >= TWIN_THRESHOLD) {
        // Find user with most similar dimension scores (simple Euclidean)
        const { data: others } = await db
          .from('moral_fingerprint')
          .select('user_id, individual_vs_collective, rule_vs_outcome, loyalty_vs_honesty, caution_vs_action, head_vs_heart, profiles!user_id(alias)')
          .neq('user_id', userId)
          .gte('total_votes', TWIN_THRESHOLD)
          .limit(100);

        if (others && others.length > 0) {
          let best: { alias: string; dist: number } | null = null;
          for (const o of others) {
            const dist = Math.sqrt(
              Math.pow(o.individual_vs_collective - data.individual_vs_collective, 2) +
              Math.pow(o.rule_vs_outcome - data.rule_vs_outcome, 2) +
              Math.pow(o.loyalty_vs_honesty - data.loyalty_vs_honesty, 2) +
              Math.pow(o.caution_vs_action - data.caution_vs_action, 2) +
              Math.pow(o.head_vs_heart - data.head_vs_heart, 2),
            );
            if (!best || dist < best.dist) {
              best = { alias: o.profiles?.alias ?? 'unknown', dist };
            }
          }
          if (best) {
            const matchScore = Math.round(100 - (best.dist / (Math.sqrt(5) * 100)) * 100);
            setTwin({ alias: best.alias, matchScore });
          }
        }
      }

      setLoading(false);
    }
    load();
  }, [userId]);

  useEffect(() => {
    if (!tracked.current && !loading) {
      tracked.current = true;
      track('fingerprint_viewed');
      if (fp && fp.total_votes >= UNLOCK_THRESHOLD) {
        track('fingerprint_unlocked', { total_votes: fp.total_votes });
      }
      if (fp?.archetype) {
        track('fingerprint_archetype_seen', { archetype: fp.archetype });
      }
    }
  }, [loading, fp]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
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

  const totalVotes = fp?.total_votes ?? 0;
  const unlocked = totalVotes >= UNLOCK_THRESHOLD;
  const archetypeUnlocked = totalVotes >= ARCHETYPE_THRESHOLD;
  const twinUnlocked = totalVotes >= TWIN_THRESHOLD;

  // Locked state
  if (!unlocked) {
    return (
      <div className="rounded-md border-hairline bg-bg-secondary p-6">
        <p className="text-11 text-text-secondary label-caps mb-3">Moral Fingerprint</p>
        <div className="space-y-2 opacity-30 pointer-events-none select-none" aria-hidden>
          <DimensionBar label="Individual" opposite="Collective" score={50} />
          <DimensionBar label="Rules" opposite="Outcomes" score={50} />
          <DimensionBar label="Loyalty" opposite="Honesty" score={50} />
        </div>
        <div className="mt-5 rounded-md bg-bg-tertiary px-4 py-3">
          <p className="text-13 text-text-secondary text-center">
            Play {UNLOCK_THRESHOLD - totalVotes} more round{UNLOCK_THRESHOLD - totalVotes !== 1 ? 's' : ''} to unlock your Moral Fingerprint.
          </p>
          <p className="mt-1 text-11 text-text-tertiary text-center">
            {totalVotes}/{UNLOCK_THRESHOLD} verdicts cast
          </p>
        </div>
      </div>
    );
  }

  const archetype = fp?.archetype ?? 'balanced';
  const archetypeInfo: { icon: string; description: string } =
    ARCHETYPES[archetype] ?? ARCHETYPES['balanced'] ?? { icon: '○', description: '' };

  const dims: Array<{ left: string; right: string; score: number; key: keyof Fingerprint }> = [
    { left: 'Individual', right: 'Collective', score: fp?.individual_vs_collective ?? 50, key: 'individual_vs_collective' },
    { left: 'Rules', right: 'Outcomes', score: fp?.rule_vs_outcome ?? 50, key: 'rule_vs_outcome' },
    { left: 'Loyalty', right: 'Honesty', score: fp?.loyalty_vs_honesty ?? 50, key: 'loyalty_vs_honesty' },
    { left: 'Caution', right: 'Action', score: fp?.caution_vs_action ?? 50, key: 'caution_vs_action' },
    { left: 'Head', right: 'Heart', score: fp?.head_vs_heart ?? 50, key: 'head_vs_heart' },
  ];

  const minorityRate = Math.round((fp?.minority_rate ?? 0) * 100);
  const conversionRate = Math.round((fp?.conversion_rate ?? 0) * 100);

  return (
    <div className="space-y-5">
      {/* Archetype hero */}
      {archetypeUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-md border-hairline-accent bg-bg-secondary p-6"
        >
          <p className="text-11 text-text-tertiary label-caps">Your archetype</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-36 text-accent" aria-hidden>{archetypeInfo.icon}</span>
            <div>
              <p className="font-serif text-22 font-medium capitalize text-text-primary">
                The {archetype.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <p className="mt-3 text-15 text-text-secondary leading-relaxed">
            {fp?.archetype_description ?? archetypeInfo.description}
          </p>
          <button
            type="button"
            onClick={() => track('fingerprint_shared')}
            className="mt-4 text-11 text-text-tertiary label-caps hover:text-text-secondary transition-colors"
          >
            Share fingerprint ↗
          </button>
        </motion.div>
      )}

      {!archetypeUnlocked && (
        <div className="rounded-md border-hairline bg-bg-secondary p-5">
          <p className="text-11 text-text-secondary label-caps mb-2">Moral Fingerprint</p>
          <p className="text-13 text-text-tertiary">
            {ARCHETYPE_THRESHOLD - totalVotes} more verdicts until your archetype is revealed.
          </p>
        </div>
      )}

      {/* Dimension bars */}
      <div className="rounded-md border-hairline bg-bg-secondary p-5 space-y-5">
        {dims.map((d, i) => (
          <motion.div
            key={d.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <DimensionBar label={d.left} opposite={d.right} score={d.score} />
          </motion.div>
        ))}
      </div>

      {/* Behavioural stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Minority rate"
          value={`${minorityRate}%`}
          sub={
            fp?.percentile_minority
              ? `Top ${fp.percentile_minority}% contrarian`
              : 'Keep playing'
          }
        />
        <StatCard
          label="Conversion rate"
          value={`${conversionRate}%`}
          sub={
            fp?.percentile_conversion
              ? `Top ${fp.percentile_conversion}% converter`
              : 'Keep playing'
          }
        />
        <StatCard
          label="Total verdicts"
          value={String(totalVotes)}
          sub="across all formats"
        />
        <StatCard
          label="Consistency"
          value={`${Math.round((fp?.consistency_score ?? 0) * 100)}%`}
          sub="across categories"
        />
      </div>

      {/* Moral twin */}
      {twinUnlocked && twin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-md border-hairline bg-bg-secondary p-5"
        >
          <p className="text-11 text-text-secondary label-caps mb-3">Moral twin</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-15 text-text-primary">@{twin.alias}</p>
              <p className="mt-1 text-11 text-text-tertiary">
                {twin.matchScore}% match · closest moral profile
              </p>
            </div>
            <button
              type="button"
              onClick={() => track('fingerprint_twin_viewed', { twin_alias: twin.alias })}
              className="text-11 text-text-tertiary label-caps hover:text-text-secondary transition-colors"
            >
              View →
            </button>
          </div>
        </motion.div>
      )}

      {!twinUnlocked && (
        <div className="rounded-md border-hairline bg-bg-secondary p-4">
          <p className="text-11 text-text-tertiary text-center">
            Moral twin unlocks at {TWIN_THRESHOLD} verdicts ({TWIN_THRESHOLD - totalVotes} to go)
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DimensionBar({
  label,
  opposite,
  score,
}: {
  label: string;
  opposite: string;
  score: number;
}) {
  const pct = Math.max(0, Math.min(100, score));
  const extreme = pct < 30 || pct > 70;

  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-11 text-text-secondary label-caps">{label}</span>
        <span className="text-11 text-text-secondary label-caps">{opposite}</span>
      </div>
      <div className="relative h-1 rounded-full bg-bg-tertiary overflow-visible">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-bg-tertiary"
          style={{ width: '100%' }}
        />
        {/* Position indicator */}
        <motion.div
          initial={{ left: '50%' }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div
            className="w-3 h-3 rounded-full border-2"
            style={{
              borderColor: extreme ? 'var(--accent)' : 'var(--text-secondary)',
              background: extreme ? 'var(--accent)' : 'var(--bg-secondary)',
            }}
          />
        </motion.div>
      </div>
      {extreme && (
        <p className="mt-1 text-11 text-text-tertiary">
          {pct < 30
            ? `Strongly ${label.toLowerCase()}-leaning`
            : `Strongly ${opposite.toLowerCase()}-leaning`}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-md border-hairline bg-bg-secondary p-4">
      <p className="text-11 text-text-secondary label-caps">{label}</p>
      <p className="mt-2 font-mono text-18 text-text-primary">{value}</p>
      <p className="mt-1 text-11 text-text-tertiary">{sub}</p>
    </div>
  );
}
