import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  phase?: string;
}

export function CenterTable({ phase }: Props) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMat = useRef(
    new THREE.MeshStandardMaterial({
      color: '#FF3B30',
      emissive: '#FF3B30',
      emissiveIntensity: 0,
      roughness: 1,
      transparent: true,
      opacity: 0,
    }),
  );

  useFrame(({ clock }, delta) => {
    const mat = ringMat.current;
    const isVoting = phase === 'voting';
    const isReveal = phase === 'reveal';
    const targetIntensity = isVoting
      ? 0.1 + Math.sin(clock.elapsedTime * 4) * 0.3  // fast pulse
      : isReveal
      ? 0.4
      : 0;
    const targetOpacity = isVoting || isReveal ? 0.8 : 0;

    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, delta * 3);
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 3);
  });

  return (
    <group position={[0, 0, 0.5]}>
      {/* Table top */}
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.55, 0.06, 32]} />
        <meshStandardMaterial color="#1C1A17" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Table base */}
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.42, 16]} />
        <meshStandardMaterial color="#1C1A17" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Case file document prop */}
      <mesh
        position={[0, 0.493, 0]}
        rotation={[phase === 'scenario' ? -Math.PI / 12 : 0, 0.3, 0]}
      >
        <boxGeometry args={[0.3, 0.005, 0.4]} />
        <meshStandardMaterial color="#1A1815" roughness={1} />
      </mesh>

      {/* Table fill light */}
      <pointLight position={[0, 1.2, 0]} color="#FFF5E0" intensity={0.5} decay={2} />

      {/* Voting/reveal ring — around table edge */}
      <mesh ref={ringRef} position={[0, 0.495, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.015, 8, 64]} />
        <primitive object={ringMat.current} attach="material" />
      </mesh>
    </group>
  );
}
