import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GamePhase } from '@verdict/shared';

interface Props {
  phase?: GamePhase;
}

export function LightRig({ phase }: Props) {
  const blueRef = useRef<THREE.SpotLight>(null);

  // Smoothly fade blue light in/out based on phase
  useFrame((_, delta) => {
    if (!blueRef.current) return;
    const target = phase === 'reveal' ? 0.04 : 0;
    blueRef.current.intensity = THREE.MathUtils.lerp(
      blueRef.current.intensity,
      target,
      delta * 2,
    );
  });

  return (
    <>
      <ambientLight color="#FFF5E0" intensity={0.15} />

      {/* Main overhead — only light that casts shadows */}
      <spotLight
        position={[0, 4, 0]}
        color="#FFF5E0"
        intensity={1.2}
        angle={0.4}
        penumbra={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
      >
        <object3D attach="target" position={[0, 0, 0]} />
      </spotLight>

      {/* Left wall slit — very faint crimson */}
      <spotLight
        position={[-4, 3, 2]}
        color="#FF3B30"
        intensity={0.08}
        angle={0.6}
        penumbra={0.9}
      />

      {/* Right wall slit — faint blue, reveal-only */}
      <spotLight
        ref={blueRef}
        position={[4, 3, 2]}
        color="#2D7FF9"
        intensity={0}
        angle={0.6}
        penumbra={0.9}
      />

      {/* Evidence table fill */}
      <pointLight position={[0, 1.5, -1]} color="#FFF5E0" intensity={0.3} decay={2} />

      {/* Sky/ground gradient */}
      <hemisphereLight args={['#1A1A2E', '#0A0A0B', 0.2]} />
    </>
  );
}
