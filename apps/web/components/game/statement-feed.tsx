'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import type { ParticipantState } from '@verdict/shared';
import { AvatarMark } from './avatar-mark';
import { cn } from '@/lib/cn';
import { sounds } from '@/lib/sounds';

interface Props {
  participants: ParticipantState[];
  voteColors?: boolean;
  upvotable?: boolean;
  selfId?: string;
  onUpvote?: (participantId: string) => void;
  upvotedIds?: Set<string>;
  onReport?: (participantId: string) => void;
}

export function StatementFeed({
  participants,
  voteColors,
  upvotable,
  selfId,
  onUpvote,
  upvotedIds,
  onReport,
}: Props) {
  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {participants
          .filter((p) => p.statement)
          .map((p) => (
            <StatementCard
              key={p.id}
              participant={p}
              voteColors={voteColors}
              upvotable={upvotable && p.id !== selfId}
              isSelf={p.id === selfId}
              alreadyUpvoted={!!upvotedIds?.has(p.id)}
              onUpvote={onUpvote}
              onReport={onReport}
            />
          ))}
      </AnimatePresence>
    </ul>
  );
}

interface CardProps {
  participant: ParticipantState;
  voteColors?: boolean;
  upvotable?: boolean;
  isSelf?: boolean;
  alreadyUpvoted?: boolean;
  onUpvote?: (participantId: string) => void;
  onReport?: (participantId: string) => void;
}

const REPORT_THRESHOLD = -60; // px swiped left to reveal report

function StatementCard({
  participant: p,
  voteColors,
  upvotable,
  isSelf,
  alreadyUpvoted,
  onUpvote,
  onReport,
}: CardProps) {
  const [reported, setReported] = useState(false);
  const dragX = useMotionValue(0);
  const reportOpacity = useTransform(dragX, [0, REPORT_THRESHOLD], [0, 1]);
  const reportScale = useTransform(dragX, [0, REPORT_THRESHOLD], [0.8, 1]);

  const borderLeftColor =
    voteColors && p.vote === 'a'
      ? 'var(--vote-a)'
      : voteColors && p.vote === 'b'
        ? 'var(--vote-b)'
        : undefined;

  function handleUpvote() {
    if (alreadyUpvoted) return;
    sounds.play('vote_tap');
    navigator.vibrate?.(8);
    onUpvote?.(p.id);
  }

  function handleReport() {
    setReported(true);
    onReport?.(p.id);
  }

  if (reported) return null;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 10 }}
    >
      {/* Report action — revealed on left swipe */}
      {!isSelf && onReport && (
        <motion.div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent)',
            opacity: reportOpacity,
            scale: reportScale,
            cursor: 'pointer',
            zIndex: 0,
          }}
          onClick={handleReport}
        >
          <span style={{ fontSize: 11, color: '#fff', fontFamily: 'var(--font-mono-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Report
          </span>
        </motion.div>
      )}

      {/* Card — draggable left */}
      <motion.div
        drag={!isSelf && onReport ? 'x' : false}
        dragConstraints={{ left: REPORT_THRESHOLD, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < REPORT_THRESHOLD) handleReport();
        }}
        className={cn(
          'rounded-md border-hairline bg-bg-secondary p-4',
          voteColors && 'border-l-[2px]',
          isSelf && 'border-hairline-active',
        )}
        style={{ x: dragX, position: 'relative', zIndex: 1, borderLeftColor }}
      >
        <div className="flex items-start gap-3">
          <AvatarMark avatarId={p.avatarId as never} size="sm" highlighted={isSelf} />
          <div className="min-w-0 flex-1">
            {/* Alias row */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate font-mono text-13 text-text-secondary">
                @{p.alias}
                {p.isBot && <span className="ml-2 text-text-tertiary">· juror</span>}
                {isSelf && <span className="ml-2 text-accent">· you</span>}
              </span>
              {/* Upvote count — spring animation on change */}
              {p.statementUpvotes > 0 && (
                <motion.span
                  key={p.statementUpvotes}
                  initial={{ scale: 1.4, color: 'var(--accent)' }}
                  animate={{ scale: 1, color: alreadyUpvoted ? 'var(--accent)' : 'var(--text-tertiary)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="font-mono text-11 tabular-nums"
                >
                  {p.statementUpvotes}
                </motion.span>
              )}
            </div>

            {/* Statement text */}
            <p className="mt-2 text-15 leading-relaxed text-text-primary">{p.statement}</p>

            {/* Upvote row */}
            {upvotable && onUpvote && (
              <button
                type="button"
                onClick={handleUpvote}
                disabled={alreadyUpvoted}
                className={cn(
                  'mt-3 flex items-center gap-1.5 transition-colors duration-100',
                  alreadyUpvoted ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary',
                )}
              >
                <motion.div
                  animate={alreadyUpvoted ? { y: -2 } : { y: 0 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                >
                  <ArrowUp size={14} strokeWidth={2} />
                </motion.div>
                <span className="font-mono text-11 label-caps">
                  {alreadyUpvoted ? 'upvoted' : 'upvote'}
                </span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.li>
  );
}
