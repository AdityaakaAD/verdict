import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type JurorState =
  | 'empty'
  | 'joining'
  | 'idle'
  | 'typing'
  | 'voted-a'
  | 'voted-b'
  | 'minority'
  | 'majority';

interface Props {
  position: [number, number, number];
  scale?: number;
  alias?: string;
  isYou?: boolean;
  state: JurorState;
  breathOffset?: number;
  /** Statement text shown in speech bubble (null = no bubble) */
  activeBubble?: string | null;
}

// Seat positions from spec — (x, y, z)
export const SEAT_POSITIONS: [number, number, number][] = [
  [-2.4, 0, -0.5],
  [-1.6, 0, -1.2],
  [-0.6, 0, -1.6],
  [0,    0, -1.8],  // seat 3 — YOUR seat
  [0.6,  0, -1.6],
  [1.6,  0, -1.2],
  [2.4,  0, -0.5],
];

export const SEAT_SCALES = [1.0, 0.92, 0.85, 0.85, 0.85, 0.92, 1.0];

export function JurorFigure({
  position,
  scale = 1,
  alias,
  isYou = false,
  state,
  breathOffset = 0,
  activeBubble,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const headLightRef = useRef<THREE.PointLight>(null);

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isYou ? '#222228' : '#1A1A1E',
        roughness: 0.7,
        metalness: 0.2,
        emissive: new THREE.Color(0, 0, 0),
        emissiveIntensity: 0,
      }),
    [isYou],
  );

  const deskMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.9, metalness: 0 }),
    [],
  );

  // Cleanup materials on unmount
  useEffect(() => {
    return () => {
      bodyMat.dispose();
      deskMat.dispose();
    };
  }, [bodyMat, deskMat]);

  useFrame(({ clock }, delta) => {
    if (state === 'empty' || !groupRef.current) return;

    const t = clock.elapsedTime + breathOffset;

    // Idle breathing — torso y-scale oscillates
    if (torsoRef.current) {
      const breathAmt = state === 'idle' || state === 'joining' ? 0.01 : 0.005;
      torsoRef.current.scale.y = 1 + Math.sin(t * (Math.PI * 2 / 3)) * breathAmt;
    }

    // Head tilt for typing
    if (headRef.current) {
      const targetTilt = state === 'typing' ? -Math.PI / 12 : 0;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        targetTilt,
        delta * 6,
      );
    }

    // Head light pulse when typing
    if (headLightRef.current) {
      const targetIntensity = state === 'typing' ? 0.1 + Math.sin(t * 6) * 0.05 : 0;
      headLightRef.current.intensity = THREE.MathUtils.lerp(
        headLightRef.current.intensity,
        targetIntensity,
        delta * 8,
      );
    }

    // Body emissive state
    let targetEmissive = new THREE.Color(0, 0, 0);
    let targetIntensity = 0;

    if (state === 'typing') {
      targetEmissive.set('#2A2A40');
      targetIntensity = 0.2 + Math.sin(t * 4) * 0.2; // oscillates 0→0.4
    } else if (state === 'voted-a' || state === 'minority') {
      targetEmissive.set('#FF3B30');
      targetIntensity = 0.15;
    } else if (state === 'voted-b' || state === 'majority') {
      targetEmissive.set('#2D7FF9');
      targetIntensity = 0.12;
    }

    bodyMat.emissive.lerp(targetEmissive, delta * 4);
    bodyMat.emissiveIntensity = THREE.MathUtils.lerp(
      bodyMat.emissiveIntensity,
      targetIntensity,
      delta * 4,
    );
    bodyMat.color.lerp(
      new THREE.Color(state === 'typing' ? '#333340' : isYou ? '#222228' : '#1A1A1E'),
      delta * 3,
    );
  });

  if (state === 'empty') return null;

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* YOU — floor ring */}
      {isYou && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.015, 8, 48]} />
          <meshStandardMaterial
            color="#FF3B30"
            emissive="#FF3B30"
            emissiveIntensity={0.3}
            roughness={1}
          />
        </mesh>
      )}

      {/* Desk surface */}
      <mesh position={[0, 0.42, 0.14]} material={deskMat} castShadow>
        <boxGeometry args={[0.5, 0.04, 0.25]} />
      </mesh>

      {/* Name plate */}
      {alias && (
        <mesh position={[0, 0.43, 0.27]}>
          <planeGeometry args={[0.3, 0.06]} />
          <meshStandardMaterial color="#1F1F23" roughness={1} />
        </mesh>
      )}

      {/* Chair back */}
      <mesh position={[0, 0.72, -0.19]} material={deskMat}>
        <boxGeometry args={[0.32, 0.3, 0.04]} />
      </mesh>

      {/* Torso */}
      <mesh ref={torsoRef} position={[0, 0.615, 0]} material={bodyMat} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.35, 8]} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.852, 0]} material={bodyMat}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.05, 0]} material={bodyMat} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
      </mesh>

      {/* Head typing light */}
      <pointLight
        ref={headLightRef}
        position={[0, 1.2, 0]}
        color="#6666AA"
        intensity={0}
        decay={3}
        distance={1.2}
      />

      {/* Speech bubble via drei Html — only when active */}
      {activeBubble && (
        <Html
          position={[0, 1.45, 0]}
          center
          distanceFactor={4}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[1, 1]}
        >
          <div
            style={{
              background: '#1A1A1E',
              border: '0.5px solid #2A2A30',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11,
              fontFamily: 'var(--font-inter, Inter, system-ui)',
              color: '#F8F7F4',
              maxWidth: 160,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {activeBubble.length > 80 ? activeBubble.slice(0, 80) + '…' : activeBubble}
          </div>
        </Html>
      )}
    </group>
  );
}
