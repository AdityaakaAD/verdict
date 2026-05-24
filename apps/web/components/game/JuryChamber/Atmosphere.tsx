import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  phase?: string;
}

const PHASE_COUNTS: Record<string, number> = {
  lobby: 50,
  scenario: 100,
  statement: 100,
  voting: 150,
  reveal: 300,
  debate: 100,
  conversion: 200,
  result: 30,
  completed: 30,
};

export function Atmosphere({ phase }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const count = 300; // max particles, subset rendered via opacity

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Random position in room bounds
      positions[i * 3]     = (Math.random() - 0.5) * 7.5;
      positions[i * 3 + 1] = Math.random() * 3.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5.5;

      // Slow random drift
      velocities[i * 3]     = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = Math.random() * 0.004 - 0.001; // slight upward bias
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;

      // Default color: muted gray
      colors[i * 3]     = 0.533;
      colors[i * 3 + 1] = 0.529;
      colors[i * 3 + 2] = 0.510;
    }

    return { positions, velocities, colors };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.018,
        vertexColors: true,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const activeCount = PHASE_COUNTS[phase ?? 'lobby'] ?? 50;

    // Update particle positions
    for (let i = 0; i < count; i++) {
      if (i >= activeCount) continue;

      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      arr[ix] = (arr[ix] ?? 0) + (velocities[ix] ?? 0);
      arr[iy] = (arr[iy] ?? 0) + (velocities[iy] ?? 0);
      arr[iz] = (arr[iz] ?? 0) + (velocities[iz] ?? 0);

      // Wrap particles that escape the room
      const x = arr[ix] ?? 0, y = arr[iy] ?? 0, z = arr[iz] ?? 0;
      if (x < -4) arr[ix] = 4;  else if (x > 4) arr[ix] = -4;
      if (y < 0)  arr[iy] = 3.5; else if (y > 3.9) arr[iy] = 0.1;
      if (z < -3) arr[iz] = 3;  else if (z > 3) arr[iz] = -3;
    }

    pos.needsUpdate = true;

    // Fade material opacity toward target
    const targetOpacity = phase === 'result' || phase === 'completed' ? 0.08 : 0.3;
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, delta * 2);
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
