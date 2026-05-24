'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATEMENT_MAX_LENGTH, type ParticipantState, type Scenario } from '@verdict/shared';
import { JuryChamber } from '@/components/game/JuryChamber';
import { ParticleEngine } from '@/components/game/ParticleEngine';
import { TimerRing } from '@/components/game/UI/TimerRing';
import { sounds } from '@/lib/sounds';
import { cn } from '@/lib/cn';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  selfId: string;
  remainingMs: number;
  totalMs: number;
  onSubmit: (text: string) => void;
}

export function StatementPhase({ scenario, participants, selfId, remainingMs, totalMs, onSubmit }: Props) {
  const self = participants.find((p) => p.id === selfId);
  const submitted = !!self?.statement;
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const autoSubmittedRef = useRef(false);
  const charsLeft = STATEMENT_MAX_LENGTH - draft.length;
  const canSubmit = draft.trim().length >= 3 && !submitted;

  useEffect(() => {
    if (submitted) { setDraft(''); autoSubmittedRef.current = false; }
  }, [submitted]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (submitted || autoSubmittedRef.current || remainingMs > 0) return;
    autoSubmittedRef.current = true;
    const trimmed = draft.trim();
    if (trimmed.length >= 3) {
      sounds.play('statement_send');
      onSubmit(trimmed);
      setToast("Time's up — your statement was submitted.");
    } else {
      setToast("Time's up — no statement recorded.");
    }
  }, [remainingMs, submitted, draft, onSubmit]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function handleSubmit() {
    if (!canSubmit) return;
    sounds.play('statement_send');
    navigator.vibrate?.(8);
    onSubmit(draft.trim());
  }

  const withStatements = participants.filter((p) => p.statement);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 3D backdrop — jurors glow/type per their state */}
      <JuryChamber phase="statement" participants={participants} selfId={selfId} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
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
              border: '0.5px solid var(--border-subtle)',
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
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
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
        {/* Statement feed — upper portion */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '80px 16px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 8,
            pointerEvents: 'auto',
          }}
        >
          <AnimatePresence initial={false}>
            {withStatements.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'rgba(15,15,17,0.85)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: 10,
                  border: '0.5px solid var(--border-subtle)',
                  padding: '10px 12px',
                  display: 'flex',
                  gap: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono-display)',
                      fontSize: 11,
                      color: p.id === selfId ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}
                  >
                    @{p.alias}
                  </span>
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      lineHeight: 1.45,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {p.statement}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input area */}
        <div
          style={{
            background: 'rgba(10,10,11,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '0.5px solid var(--border-subtle)',
            padding: '12px 16px 32px',
            pointerEvents: 'auto',
          }}
        >
          {/* Scenario + timer row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                flex: 1,
                paddingRight: 12,
              }}
            >
              {scenario.text}
            </p>
            <TimerRing remainingMs={remainingMs} totalMs={totalMs} size={40} enableTick />
          </div>

          {!submitted ? (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, STATEMENT_MAX_LENGTH))}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                placeholder="Write your reasoning."
                rows={3}
                style={{
                  width: '100%',
                  resize: 'none',
                  background: 'var(--bg-secondary)',
                  border: '0.5px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono-display)',
                    fontSize: 11,
                    color: charsLeft < 20 ? 'var(--accent)' : 'var(--text-tertiary)',
                  }}
                >
                  {charsLeft}
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{
                    height: 38,
                    padding: '0 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: canSubmit ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: canSubmit ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: canSubmit ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                  }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Your reasoning is in. Watch the room come together.
            </p>
          )}
        </div>
      </div>

      <ParticleEngine phase="statement" />
    </div>
  );
}
