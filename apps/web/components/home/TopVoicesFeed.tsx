'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export interface TopVoice {
  id: string;
  alias: string;
  quote: string;
  upvotes: number;
  scenarioText?: string;
}

interface Props {
  voices: TopVoice[];
  upvotedIds?: Set<string>;
  onUpvote?: (id: string) => void;
  onReport?: (id: string) => void;
}

const REPORT_THRESHOLD = -60;

export function TopVoicesFeed({ voices, upvotedIds, onUpvote, onReport }: Props) {
  if (voices.length === 0) {
    return (
      <div className="mt-3 rounded-md border-hairline bg-bg-secondary p-5">
        <p className="text-15 text-text-secondary">
          Statements that win the room show up here the next morning.
        </p>
      </div>
    );
  }

  const maxUpvotes = Math.max(...voices.map((v) => v.upvotes));

  return (
    <ul className="mt-3 space-y-2">
      {voices.map((voice) => (
        <VoiceRow
          key={voice.id}
          voice={voice}
          isTop={voice.upvotes === maxUpvotes}
          alreadyUpvoted={!!upvotedIds?.has(voice.id)}
          onUpvote={onUpvote}
          onReport={onReport}
        />
      ))}
    </ul>
  );
}

interface RowProps {
  voice: TopVoice;
  isTop: boolean;
  alreadyUpvoted: boolean;
  onUpvote?: (id: string) => void;
  onReport?: (id: string) => void;
}

function VoiceRow({ voice, isTop, alreadyUpvoted, onUpvote, onReport }: RowProps) {
  const [reported, setReported] = useState(false);
  const dragX = useMotionValue(0);
  const reportOpacity = useTransform(dragX, [0, REPORT_THRESHOLD], [0, 1]);

  function handleUpvote() {
    if (alreadyUpvoted) return;
    onUpvote?.(voice.id);
  }

  function handleReport() {
    setReported(true);
    onReport?.(voice.id);
  }

  if (reported) return null;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}
    >
      {/* Report action revealed on left swipe */}
      {onReport && (
        <motion.div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent)',
            opacity: reportOpacity,
            cursor: 'pointer',
            zIndex: 0,
          }}
          onClick={handleReport}
        >
          <span style={{
            fontSize: 11,
            color: '#fff',
            fontFamily: 'var(--font-mono-display)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Report
          </span>
        </motion.div>
      )}

      {/* Card — draggable left */}
      <motion.div
        drag={onReport ? 'x' : false}
        dragConstraints={{ left: REPORT_THRESHOLD, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < REPORT_THRESHOLD) handleReport();
        }}
        className="rounded-md border-hairline bg-bg-secondary p-4"
        style={{
          x: dragX,
          position: 'relative',
          zIndex: 1,
          borderLeft: isTop ? '2px solid var(--gold)' : undefined,
        }}
      >
        <div className="flex items-start gap-3">
          {/* Upvote column */}
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <button
              type="button"
              onClick={handleUpvote}
              disabled={alreadyUpvoted}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: alreadyUpvoted ? 'default' : 'pointer',
                color: alreadyUpvoted ? 'var(--accent)' : 'var(--text-tertiary)',
                transition: 'color 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <motion.div
                animate={alreadyUpvoted ? { y: -2 } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 20 }}
              >
                <ArrowUp size={14} strokeWidth={2} />
              </motion.div>
              <motion.span
                key={voice.upvotes}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                style={{
                  fontFamily: 'var(--font-mono-display)',
                  fontSize: 11,
                  fontVariantNumeric: 'tabular-nums',
                  color: alreadyUpvoted ? 'var(--accent)' : 'var(--text-tertiary)',
                }}
              >
                {voice.upvotes}
              </motion.span>
            </button>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-11 text-text-secondary">
              @{voice.alias}
              {isTop && (
                <span style={{ marginLeft: 8, color: 'var(--gold)' }}>· top voice</span>
              )}
            </p>
            <p className="mt-1.5 text-14 leading-relaxed text-text-primary">
              "{voice.quote}"
            </p>
            {voice.scenarioText && (
              <p className="mt-1 text-11 text-text-tertiary line-clamp-1">
                {voice.scenarioText}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.li>
  );
}
