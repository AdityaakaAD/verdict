import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

// Lazily create the floor grid texture once per session
function buildGridTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0D0D0F';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(26,26,30,0.3)';
  ctx.lineWidth = 1;
  const cells = 16;
  const cell = size / cells;
  for (let i = 0; i <= cells; i++) {
    ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(size, i * cell); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  return tex;
}

// Shared materials — created once, reused across instances
const wallMat = new THREE.MeshStandardMaterial({
  color: '#111114',
  roughness: 1.0,
  metalness: 0,
});
const woodMat = new THREE.MeshStandardMaterial({
  color: '#1C1A17',
  roughness: 0.8,
  metalness: 0.05,
});
const ceilingMat = new THREE.MeshStandardMaterial({
  color: '#0A0A0B',
  roughness: 1.0,
  metalness: 0,
});

export function Room() {
  const gridTex = useMemo(() => (typeof window !== 'undefined' ? buildGridTexture() : null), []);

  return (
    <group>
      {/* ── Floor ─────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial
          color="#0D0D0F"
          roughness={0.9}
          metalness={0.1}
          map={gridTex ?? undefined}
          envMapIntensity={0.05}
        />
      </mesh>

      {/* ── Back wall ─────────────────────────────── */}
      <mesh position={[0, 2, -3]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Back wall wood panels — left third */}
      <mesh position={[-2.5, 2, -2.97]}>
        <boxGeometry args={[0.1, 4, 0.05]} />
        <primitive object={woodMat} attach="material" />
      </mesh>

      {/* Back wall wood panels — right third */}
      <mesh position={[2.5, 2, -2.97]}>
        <boxGeometry args={[0.1, 4, 0.05]} />
        <primitive object={woodMat} attach="material" />
      </mesh>

      {/* Wordmark — barely visible etch */}
      <Text
        position={[0, 2, -2.96]}
        fontSize={0.18}
        color="#1F1F23"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        VERDICT
      </Text>

      {/* ── Left wall ─────────────────────────────── */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Left wall slit window — emissive crimson glow */}
      <mesh position={[-3.97, 2, -0.5]}>
        <planeGeometry args={[0.04, 2.4]} />
        <meshStandardMaterial
          color="#FF3B30"
          emissive="#FF3B30"
          emissiveIntensity={0.02}
          roughness={1}
        />
      </mesh>

      {/* ── Right wall ────────────────────────────── */}
      <mesh position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Right wall slit window */}
      <mesh position={[3.97, 2, -0.5]}>
        <planeGeometry args={[0.04, 2.4]} />
        <meshStandardMaterial
          color="#FF3B30"
          emissive="#FF3B30"
          emissiveIntensity={0.02}
          roughness={1}
        />
      </mesh>

      {/* ── Ceiling ───────────────────────────────── */}
      <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 6]} />
        <primitive object={ceilingMat} attach="material" />
      </mesh>

      {/* Recessed ceiling lights — three circles */}
      <CeilingLight position={[-2, 3.98, -0.5]} />
      <CeilingLight position={[0, 3.98, 0.5]} size={0.16} />
      <CeilingLight position={[2, 3.98, -0.5]} />

      {/* Soft pools of light beneath ceiling lights */}
      <pointLight position={[-2, 3.6, -0.5]} color="#FFF5E0" intensity={0.4} decay={2} />
      <pointLight position={[0, 3.6, 0.5]} color="#FFF5E0" intensity={0.4} decay={2} />
      <pointLight position={[2, 3.6, -0.5]} color="#FFF5E0" intensity={0.4} decay={2} />
    </group>
  );
}

function CeilingLight({ position, size = 0.12 }: { position: [number, number, number]; size?: number }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 24]} />
      <meshStandardMaterial
        color="#FFF5E0"
        emissive="#FFF5E0"
        emissiveIntensity={0.4}
        roughness={1}
      />
    </mesh>
  );
}
