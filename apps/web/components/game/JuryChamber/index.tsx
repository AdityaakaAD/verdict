'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { GamePhase, ParticipantState } from '@verdict/shared';
import { LoadingVerdict } from '@/components/shared/LoadingVerdict';
import type { SceneProps } from './Scene';

export interface JuryChamberProps {
  phase?: GamePhase;
  participants?: ParticipantState[];
  selfId?: string;
  minoritySide?: 'a' | 'b' | 'tie' | null;
  convertingIds?: string[];
  children?: React.ReactNode;
}

const JuryChamberScene = dynamic(
  () => import('./Scene').then((m) => ({ default: m.JuryChamberScene })),
  {
    ssr: false,
    loading: () => <LoadingVerdict context="loading the chamber..." />,
  },
);

export function JuryChamber({
  phase,
  participants = [],
  selfId = '',
  minoritySide,
  convertingIds,
  children,
}: JuryChamberProps) {
  const sceneProps: SceneProps = { phase, participants, selfId, minoritySide, convertingIds };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Suspense fallback={<LoadingVerdict context="loading the chamber..." />}>
        <JuryChamberScene {...sceneProps} />
      </Suspense>

      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
