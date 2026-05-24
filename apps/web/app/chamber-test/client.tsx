'use client';

import { useState } from 'react';
import { JuryChamber } from '@/components/game/JuryChamber';
import type { GamePhase } from '@verdict/shared';

const PHASES: GamePhase[] = ['lobby', 'scenario', 'statement', 'voting', 'reveal', 'debate', 'conversion', 'result'];

export function ChamberTestClient() {
  const [phase, setPhase] = useState<GamePhase>('lobby');

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0A0A0B', position: 'relative' }}>
      <JuryChamber phase={phase} />

      {/* Phase switcher — dev only */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
        zIndex: 20,
        pointerEvents: 'auto',
      }}>
        {PHASES.map((p) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            style={{
              padding: '6px 12px',
              background: phase === p ? '#FF3B30' : '#1A1A1E',
              color: '#F8F7F4',
              border: '0.5px solid #1F1F23',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
