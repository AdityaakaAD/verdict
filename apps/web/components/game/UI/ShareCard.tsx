'use client';

import { useRef } from 'react';
import type { ParticipantState, ResultState, Scenario } from '@verdict/shared';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  result: ResultState;
  selfId: string;
}

export function ShareCard({ scenario, participants, result, selfId }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const self = participants.find((p) => p.id === selfId);
  const topStatement = result.topStatement
    ? participants.find((p) => p.id === result.topStatement?.participantId)
    : null;

  const verdictText =
    result.majorityOutcome === 'unanimous'
      ? 'Unanimous.'
      : result.majorityOutcome === 'hung'
        ? 'Hung jury.'
        : result.minorityWon
          ? 'The minority held.'
          : 'The majority held.';

  const aRatio = result.voteBreakdown.a / (result.voteBreakdown.a + result.voteBreakdown.b || 1);
  const bRatio = 1 - aRatio;

  async function handleShare() {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#F8F7F4',
        scale: 2,
      });
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b: Blob | null) => res(b!), 'image/png'));
      const file = new File([blob], 'verdict.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My verdict' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'verdict.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Silent fail — share not critical
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* The card itself */}
      <div
        ref={cardRef}
        style={{
          background: '#F8F7F4',
          borderRadius: 12,
          padding: '20px 20px 16px',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#0A0A0B',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'Lora, serif', fontSize: 14, fontWeight: 500 }}>
            verdict<span style={{ color: '#FF3B30' }}>.</span>
          </span>
          <span style={{ fontSize: 11, color: '#888782', fontFamily: 'monospace' }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Scenario text */}
        <p style={{ marginTop: 12, fontFamily: 'Lora, serif', fontSize: 14, lineHeight: 1.5, color: '#1A1A1E' }}>
          {scenario.text}
        </p>

        {/* Vote bar */}
        <div style={{ marginTop: 14, display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ background: '#FF3B30', width: `${aRatio * 100}%` }} />
          <div style={{ background: '#2D7FF9', width: `${bRatio * 100}%` }} />
        </div>
        <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888782', fontFamily: 'monospace' }}>
          {aRatio >= 0.2 && <span>{result.voteBreakdown.a} {scenario.sideALabel}</span>}
          {bRatio >= 0.2 && <span>{result.voteBreakdown.b} {scenario.sideBLabel}</span>}
        </div>

        {/* Verdict */}
        <p style={{ marginTop: 12, fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500 }}>
          {verdictText}
        </p>

        {/* Your stats */}
        {self && (
          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            {[
              { label: 'Started as', value: self.initialVote === 'a' ? scenario.sideALabel : scenario.sideBLabel },
              { label: 'Converted', value: String(self.conversionsMade) },
              { label: 'Score', value: `${self.scoreDelta >= 0 ? '+' : ''}${self.scoreDelta}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#888782', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'monospace' }}>{label}</div>
                <div style={{ fontSize: 13, marginTop: 2, fontFamily: 'monospace', color: '#0A0A0B' }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Top statement */}
        {topStatement?.statement && result.topStatement && (
          <div style={{ marginTop: 12, padding: '8px 10px', background: '#1A1A1E', borderRadius: 6, borderLeft: '2px solid #FF3B30' }}>
            <p style={{ fontSize: 12, color: '#F8F7F4', fontFamily: 'Lora, serif', lineHeight: 1.5 }}>
              "{result.topStatement.text}"
            </p>
            <p style={{ marginTop: 4, fontSize: 10, color: '#888782', fontFamily: 'monospace' }}>
              @{topStatement.alias} · {result.topStatement.upvotes} up
            </p>
          </div>
        )}

        {/* Footer */}
        <p style={{ marginTop: 14, fontSize: 10, color: '#5A5A56', fontFamily: 'monospace' }}>
          verdict.app
        </p>
      </div>

      {/* Share button */}
      <button
        type="button"
        onClick={handleShare}
        style={{
          height: 48,
          borderRadius: 10,
          background: 'transparent',
          border: '0.5px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          fontSize: 15,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        Share your verdict
      </button>
    </div>
  );
}
