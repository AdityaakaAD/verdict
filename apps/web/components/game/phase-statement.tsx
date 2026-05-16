'use client';

import { useEffect, useState } from 'react';
import { STATEMENT_MAX_LENGTH, type ParticipantState, type Scenario } from '@verdict/shared';
import { ScenarioCard } from './scenario-card';
import { StatementFeed } from './statement-feed';
import { PhaseTimer } from './phase-timer';
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

export function PhaseStatement({
  scenario,
  participants,
  selfId,
  remainingMs,
  totalMs,
  onSubmit,
}: Props) {
  const self = participants.find((p) => p.id === selfId);
  const submitted = !!self?.statement;

  const [draft, setDraft] = useState('');
  const charsLeft = STATEMENT_MAX_LENGTH - draft.length;
  const canSubmit = draft.trim().length >= 3 && !submitted;

  // Auto-clear the draft once the server-authoritative statement lands.
  useEffect(() => {
    if (submitted) setDraft('');
  }, [submitted]);

  function handleSubmit() {
    if (!canSubmit) return;
    sounds.play('statement_send');
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8);
    onSubmit(draft.trim());
  }

  return (
    <section className="flex flex-col">
      <header className="flex items-center justify-between">
        <p className="text-11 text-text-secondary label-caps">Argue your side</p>
        <PhaseTimer remainingMs={remainingMs} totalMs={totalMs} enableTick />
      </header>

      <div className="mt-4">
        <ScenarioCard scenario={scenario} compact />
      </div>

      {!submitted ? (
        <div className="mt-5 space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, STATEMENT_MAX_LENGTH))}
            placeholder="Type the reasoning you want the room to hear."
            rows={3}
            className="w-full resize-none rounded-md border-hairline bg-bg-secondary p-3 text-15 leading-relaxed text-text-primary placeholder:text-text-tertiary focus:border-hairline-accent focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'font-mono text-11 label-caps',
                charsLeft < 20 ? 'text-accent' : 'text-text-tertiary',
              )}
            >
              {charsLeft}
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'h-10 rounded-md px-5 text-13 font-medium transition-colors duration-100',
                canSubmit
                  ? 'bg-accent text-bg-primary hover:bg-accent-hover'
                  : 'bg-bg-tertiary text-text-tertiary',
              )}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-13 text-text-secondary">
          Your reasoning is in. Watch the room come together.
        </p>
      )}

      <div className="mt-8">
        <p className="text-11 text-text-secondary label-caps">In the room</p>
        <div className="mt-3">
          <StatementFeed participants={participants} selfId={selfId} />
        </div>
      </div>
    </section>
  );
}
