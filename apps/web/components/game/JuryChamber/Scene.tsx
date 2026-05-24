'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { FogExp2 } from 'three';
import * as THREE from 'three';
import type { GamePhase, ParticipantState } from '@verdict/shared';
import { Room } from './Room';
import { LightRig } from './LightRig';
import { JurorFigure, SEAT_POSITIONS, SEAT_SCALES, type JurorState } from './JurorFigure';
import { CenterTable } from './CenterTable';
import { Atmosphere } from './Atmosphere';

function isLowGPU(): boolean {
  if (typeof navigator === 'undefined') return false;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  return typeof mem === 'number' && mem < 4;
}

export interface SceneProps {
  phase?: GamePhase;
  participants: ParticipantState[];
  selfId: string;
  minoritySide?: 'a' | 'b' | 'tie' | null;
  convertingIds?: string[];
}

/** Map participants to the 7 seat slots. Self → slot 3 (center). Others fill in join order. */
function buildSeatMap(participants: ParticipantState[], selfId: string): (ParticipantState | null)[] {
  const seats: (ParticipantState | null)[] = Array(7).fill(null);
  const self = participants.find((p) => p.id === selfId);
  const others = participants.filter((p) => p.id !== selfId);

  if (self) seats[3] = self;

  const available = [0, 1, 2, 4, 5, 6];
  others.forEach((p, i) => {
    const slot = available[i];
    if (slot !== undefined) seats[slot] = p;
  });

  return seats;
}

function resolveJurorState(
  p: ParticipantState,
  phase: GamePhase | undefined,
  minoritySide: 'a' | 'b' | 'tie' | null | undefined,
): JurorState {
  if (phase === 'lobby') return 'idle';
  if (phase === 'statement') return p.statement ? 'idle' : 'typing';
  if (phase === 'voting') return p.vote ? (`voted-${p.vote}` as JurorState) : 'typing';
  if (phase === 'reveal' || phase === 'debate' || phase === 'conversion') {
    if (!p.vote) return 'idle';
    if (minoritySide && minoritySide !== 'tie') {
      return p.vote === minoritySide ? 'minority' : 'majority';
    }
    return `voted-${p.vote}` as JurorState;
  }
  if (phase === 'result' || phase === 'completed') {
    return p.vote ? (`voted-${p.vote}` as JurorState) : 'idle';
  }
  return 'idle';
}

// Camera push effect during voting — slow zoom in
function CameraRig({ phase }: { phase?: GamePhase }) {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useFrame(({ camera }, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const targetZ = phase === 'voting' ? 3.5 : phase === 'debate' ? 4.2 : 4;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 0.5);
    camera.lookAt(0, 1, 0);
  });

  return null;
}

function JuryChamberSceneInner({ phase, participants, selfId, minoritySide, convertingIds }: SceneProps) {
  const seats = useMemo(
    () => buildSeatMap(participants, selfId),
    [participants, selfId],
  );

  return (
    <>
      <CameraRig phase={phase} />
      <LightRig phase={phase} />
      <Room />
      <CenterTable phase={phase} />
      <Atmosphere phase={phase} />

      {seats.map((participant, idx) => {
        const position = SEAT_POSITIONS[idx] as [number, number, number];
        const baseScale = SEAT_SCALES[idx] ?? 1;
        const isYou = participant?.id === selfId;
        const scale = isYou ? 1.05 : baseScale;

        if (!participant || !position) return null;

        const state = resolveJurorState(participant, phase, minoritySide);
        const isConverting = convertingIds?.includes(participant.id);

        const activeBubble =
          (phase === 'statement' || phase === 'debate') && participant.statement
            ? participant.statement
            : null;

        return (
          <JurorFigure
            key={participant.id}
            position={position}
            scale={scale}
            alias={participant.alias}
            isYou={isYou}
            state={isConverting ? 'minority' : state}
            breathOffset={idx * 0.7}
            activeBubble={activeBubble}
          />
        );
      })}
    </>
  );
}

export function JuryChamberScene({ phase, participants, selfId, minoritySide, convertingIds }: SceneProps) {
  if (isLowGPU()) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--bg-primary)',
        }}
      />
    );
  }

  return (
    <Canvas
      style={{ width: '100%', height: '100%', display: 'block' }}
      camera={{ fov: 60, position: [0, 2.5, 4], near: 0.1, far: 30 }}
      onCreated={({ camera, scene }) => {
        camera.lookAt(0, 1, 0);
        scene.fog = new FogExp2(0x0a0a0b, 0.15);
      }}
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <JuryChamberSceneInner
        phase={phase}
        participants={participants}
        selfId={selfId}
        minoritySide={minoritySide}
        convertingIds={convertingIds}
      />
    </Canvas>
  );
}
