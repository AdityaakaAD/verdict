'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParticipantState, Scenario, VoteSide } from '@verdict/shared';
import { JuryChamber } from '@/components/game/JuryChamber';
import { ParticleEngine } from '@/components/game/ParticleEngine';
import { sounds } from '@/lib/sounds';
import type { Rebuttal } from '@/lib/socket/use-room';
import { track } from '@/lib/analytics/posthog';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  selfId: string;
  minoritySide: VoteSide | 'tie';
  remainingMs: number;
  totalMs: number;
  onUpvote: (participantId: string) => void;
  onSendRebuttal?: (parentParticipantId: string, text: string) => void;
  rebuttals?: Rebuttal[];
}

export function DebatePhase({
  scenario,
  participants,
  selfId,
  minoritySide,
  remainingMs,
  totalMs,
  onUpvote,
  onSendRebuttal,
  rebuttals = [],
}: Props) {
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [rebuttalTarget, setRebuttalTarget] = useState<string | null>(null); // participantId
  const [rebuttalDraft, setRebuttalDraft] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const rebuttalInputRef = useRef<HTMLTextAreaElement>(null);
  const prevRebuttalCount = useRef(rebuttals.length);

  const progress = Math.max(0, remainingMs / totalMs);
  const isUrgent = remainingMs < 15_000;

  const minorityFirst = [...participants].sort((a, b) => {
    const aMinor = minoritySide !== 'tie' && a.vote === minoritySide;
    const bMinor = minoritySide !== 'tie' && b.vote === minoritySide;
    if (aMinor === bMinor) return 0;
    return aMinor ? -1 : 1;
  });

  function handleUpvote(id: string) {
    if (upvotedIds.has(id)) return;
    setUpvotedIds((prev) => new Set(prev).add(id));
    sounds.play('vote_tap');
    navigator.vibrate?.(8);
    onUpvote(id);
  }

  // Notify self when their statement gets rebuttaled
  useEffect(() => {
    if (rebuttals.length <= prevRebuttalCount.current) return;
    const newRebuttals = rebuttals.slice(prevRebuttalCount.current);
    prevRebuttalCount.current = rebuttals.length;
    const forSelf = newRebuttals.find((r) => r.parentParticipantId === selfId);
    if (forSelf) {
      setNotification(`@${forSelf.authorAlias} is challenging your statement.`);
      navigator.vibrate?.([8, 60, 8]);
    }
  }, [rebuttals, selfId]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3500);
    return () => clearTimeout(t);
  }, [notification]);

  function openRebuttal(participantId: string) {
    setRebuttalTarget(participantId);
    setRebuttalDraft('');
    setTimeout(() => rebuttalInputRef.current?.focus(), 50);
  }

  function submitRebuttal() {
    if (!rebuttalTarget || !rebuttalDraft.trim() || !onSendRebuttal) return;
    track('rebuttal_sent', {
      parent_participant_id: rebuttalTarget,
      self_participant_id: selfId,
      text_length: rebuttalDraft.trim().length,
    });
    onSendRebuttal(rebuttalTarget, rebuttalDraft.trim());
    setRebuttalTarget(null);
    setRebuttalDraft('');
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 3D backdrop — minority jurors glow crimson and push forward */}
      <JuryChamber
        phase="debate"
        participants={participants}
        selfId={selfId}
        minoritySide={minoritySide}
      />

      {/* Depleting red bar — top of screen */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'var(--bg-tertiary)',
          zIndex: 20,
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: isUrgent ? 'var(--accent)' : 'var(--text-secondary)',
            transformOrigin: '0% 50%',
          }}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>

      {/* Notification toast — fires when your statement is rebuttaled */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key="notif"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              background: 'var(--bg-secondary)',
              border: '0.5px solid var(--accent)',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              fontFamily: 'var(--font-mono-display)',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
            }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Statement feed — scrollable, minority first */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '60px 16px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 8,
            pointerEvents: 'auto',
          }}
        >
          <AnimatePresence initial={false}>
            {minorityFirst.filter((p) => p.statement).map((p) => {
              const isMinority = minoritySide !== 'tie' && p.vote === minoritySide;
              const borderColor =
                p.vote === 'a' ? 'var(--vote-a)' : p.vote === 'b' ? 'var(--vote-b)' : 'var(--border-subtle)';
              const alreadyUpvoted = upvotedIds.has(p.id);
              const isSelf = p.id === selfId;
              const cardRebuttals = rebuttals.filter((r) => r.parentParticipantId === p.id);
              const isRebuttalOpen = rebuttalTarget === p.id;

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Parent statement card — pulses crimson when targeted for rebuttal */}
                  <motion.div
                    animate={isRebuttalOpen ? {
                      boxShadow: [
                        '0 0 0 1px rgba(255,59,48,0.5)',
                        '0 0 0 2.5px rgba(255,59,48,0.8)',
                        '0 0 0 1px rgba(255,59,48,0.5)',
                      ],
                    } : { boxShadow: '0 0 0 0px rgba(255,59,48,0)' }}
                    transition={isRebuttalOpen
                      ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.2 }
                    }
                    style={{
                      background: 'rgba(15,15,17,0.88)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderRadius: 10,
                      border: isRebuttalOpen
                        ? '0.5px solid rgba(255,59,48,0.6)'
                        : '0.5px solid var(--border-subtle)',
                      borderLeft: `2px solid ${borderColor}`,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono-display)',
                          fontSize: 11,
                          color: isSelf ? 'var(--accent)' : isMinority ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        }}
                      >
                        @{p.alias}
                        {isMinority && (
                          <span style={{ marginLeft: 6, color: 'var(--accent)', fontSize: 10 }}>minority</span>
                        )}
                      </span>
                      {p.statementUpvotes > 0 && (
                        <span style={{ fontFamily: 'var(--font-mono-display)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {p.statementUpvotes} up
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-primary)' }}>
                      {p.statement}
                    </p>
                    {!isSelf && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                        <button
                          type="button"
                          onClick={() => handleUpvote(p.id)}
                          disabled={alreadyUpvoted}
                          style={{
                            fontSize: 11,
                            fontFamily: 'var(--font-mono-display)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: alreadyUpvoted ? 'var(--accent)' : 'var(--text-secondary)',
                            background: 'none',
                            border: 'none',
                            cursor: alreadyUpvoted ? 'default' : 'pointer',
                            padding: 0,
                          }}
                        >
                          {alreadyUpvoted ? '↑ Upvoted' : '↑ Upvote'}
                        </button>
                        {onSendRebuttal && (
                          <button
                            type="button"
                            onClick={() => isRebuttalOpen ? setRebuttalTarget(null) : openRebuttal(p.id)}
                            style={{
                              fontSize: 11,
                              fontFamily: 'var(--font-mono-display)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: isRebuttalOpen ? 'var(--accent)' : 'var(--text-tertiary)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            ↩ Rebut
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* Rebuttals — indented, visually connected */}
                  {cardRebuttals.length > 0 && (
                    <div style={{ marginTop: 4, paddingLeft: 14, borderLeft: '2px solid var(--border-subtle)', marginLeft: 8 }}>
                      {cardRebuttals.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            marginTop: 4,
                            background: 'rgba(15,15,17,0.80)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: 8,
                            border: '0.5px solid var(--border-subtle)',
                            padding: '8px 10px',
                          }}
                        >
                          <span style={{ fontFamily: 'var(--font-mono-display)', fontSize: 10, color: r.authorParticipantId === selfId ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                            @{r.authorAlias}
                            <span style={{ marginLeft: 4, color: 'var(--text-tertiary)' }}>↳ @{p.alias}</span>
                          </span>
                          <p style={{ marginTop: 3, fontSize: 13, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                            {r.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline rebuttal composer */}
                  {isRebuttalOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ marginTop: 4, paddingLeft: 14, marginLeft: 8, borderLeft: '2px solid var(--accent)' }}
                    >
                      <div style={{
                        background: 'rgba(15,15,17,0.92)',
                        border: '0.5px solid var(--accent)',
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}>
                        <p style={{ padding: '5px 10px 0', fontSize: 10, fontFamily: 'var(--font-mono-display)', color: 'var(--text-tertiary)' }}>
                          ↳ replying to @{p.alias}
                        </p>
                        <textarea
                          ref={rebuttalInputRef}
                          value={rebuttalDraft}
                          onChange={(e) => setRebuttalDraft(e.target.value.slice(0, 300))}
                          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitRebuttal(); }}
                          placeholder="Your counter-argument…"
                          rows={2}
                          style={{
                            width: '100%',
                            resize: 'none',
                            background: 'transparent',
                            border: 'none',
                            padding: '6px 10px',
                            fontSize: 13,
                            lineHeight: 1.45,
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            outline: 'none',
                          }}
                        />
                        <div style={{ padding: '0 10px 8px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => setRebuttalTarget(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono-display)', color: 'var(--text-tertiary)', padding: 0 }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={submitRebuttal}
                            disabled={!rebuttalDraft.trim()}
                            style={{
                              height: 28,
                              padding: '0 12px',
                              borderRadius: 6,
                              border: 'none',
                              background: rebuttalDraft.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
                              color: rebuttalDraft.trim() ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: rebuttalDraft.trim() ? 'pointer' : 'default',
                              fontFamily: 'inherit',
                            }}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom label */}
        <div
          style={{
            padding: '12px 16px 40px',
            background: 'linear-gradient(to top, rgba(10,10,11,0.92) 60%, transparent)',
            pointerEvents: 'auto',
          }}
        >
          <p style={{ fontSize: 11, fontFamily: 'var(--font-mono-display)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {minoritySide === 'tie' ? 'Both sides' : 'Make your case'} ·{' '}
            {Math.ceil(remainingMs / 1000)}s
          </p>
        </div>
      </div>

      <ParticleEngine phase="debate" />
    </div>
  );
}
