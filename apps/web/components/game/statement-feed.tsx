'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ParticipantState, VoteSide } from '@verdict/shared';
import { AvatarMark } from './avatar-mark';
import { cn } from '@/lib/cn';
import { sounds } from '@/lib/sounds';

// Statement feed. Each participant has one statement card; cards animate
// in as bots/humans submit. During debate and conversion phases the
// reveal-side coloring is shown on the left border of each card so the
// room split is visible at a glance.

interface Props {
  participants: ParticipantState[];
  /** When non-null, sides A/B carry their final reveal colors on the border. */
  voteColors?: boolean;
  /** Allow tapping a card to upvote (debate phase). */
  upvotable?: boolean;
  selfId?: string;
  onUpvote?: (participantId: string) => void;
  /** Set of participant ids already upvoted by the local user. */
  upvotedIds?: Set<string>;
}

export function StatementFeed({
  participants,
  voteColors,
  upvotable,
  selfId,
  onUpvote,
  upvotedIds,
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
}

function StatementCard({
  participant: p,
  voteColors,
  upvotable,
  isSelf,
  alreadyUpvoted,
  onUpvote,
}: CardProps) {
  const borderColor =
    voteColors && p.vote === 'a'
      ? { borderLeftColor: 'var(--vote-a)' }
      : voteColors && p.vote === 'b'
        ? { borderLeftColor: 'var(--vote-b)' }
        : undefined;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-md border-hairline bg-bg-secondary p-4',
        voteColors && 'border-l-[2px]',
        isSelf && 'border-hairline-active',
      )}
      style={borderColor}
    >
      <div className="flex items-start gap-3">
        <AvatarMark avatarId={p.avatarId as any} size="sm" highlighted={isSelf} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-mono text-13 text-text-secondary">
              @{p.alias}
              {p.isBot ? <span className="ml-2 text-text-tertiary">·  juror</span> : null}
              {isSelf ? <span className="ml-2 text-accent">· you</span> : null}
            </span>
            {p.statementUpvotes > 0 ? (
              <span className="font-mono text-11 text-text-tertiary label-caps">
                {p.statementUpvotes} up
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-15 leading-relaxed text-text-primary">{p.statement}</p>
          {upvotable && onUpvote ? (
            <button
              type="button"
              onClick={() => {
                if (alreadyUpvoted) return;
                sounds.play('vote_tap');
                onUpvote(p.id);
              }}
              disabled={alreadyUpvoted}
              className={cn(
                'mt-3 text-11 label-caps transition-colors duration-100',
                alreadyUpvoted
                  ? 'text-text-tertiary'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {alreadyUpvoted ? 'Upvoted' : 'Upvote'}
            </button>
          ) : null}
        </div>
      </div>
    </motion.li>
  );
}
