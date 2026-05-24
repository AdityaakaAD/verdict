'use client';

import { Particles, ParticlesProvider, useParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { particleConfigs } from './configs';
import type { GamePhase } from '@verdict/shared';

type ExtendedPhase = GamePhase | 'win' | 'loss';

interface Props {
  phase: ExtendedPhase;
}

// Module-level init so the reference is stable across Strict Mode remounts.
// ParticlesProvider throws if the init callback changes identity between mounts.
async function initParticles(engine: Parameters<typeof loadSlim>[0]) {
  await loadSlim(engine);
}

function ParticlesInner({ phase }: Props) {
  const { loaded } = useParticlesProvider();
  const config = particleConfigs[phase] ?? particleConfigs['lobby'];

  if (!loaded) return null;

  return (
    <Particles
      id={`particles-${phase}`}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={config as any}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export function ParticleEngine({ phase }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'hidden',
      }}
    >
      <ParticlesProvider init={initParticles}>
        <ParticlesInner phase={phase} />
      </ParticlesProvider>
    </div>
  );
}
