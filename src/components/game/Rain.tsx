import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { runtime } from '../../game/runtime';

const COUNT = 2600;
const AREA = 60;
const HEIGHT = 40;

// Дождь: облако точек-капель вокруг игрока, падает и переиспользуется.
export function Rain() {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * AREA;
      positions[i * 3 + 1] = Math.random() * HEIGHT;
      positions[i * 3 + 2] = (Math.random() - 0.5) * AREA;
      speeds[i] = 22 + Math.random() * 18;
    }
    return { positions, speeds };
  }, []);

  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const px = runtime.player.pos.x;
    const pz = runtime.player.pos.z;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] -= speeds[i] * dt;
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3] = px + (Math.random() - 0.5) * AREA;
        arr[i * 3 + 1] = HEIGHT;
        arr[i * 3 + 2] = pz + (Math.random() - 0.5) * AREA;
      }
    }
    pts.geometry.attributes.position.needsUpdate = true;
    // облако центрируется на игроке по XZ
    pts.position.x = 0;
    pts.position.z = 0;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#9fb0bd"
        size={0.09}
        transparent
        opacity={0.5}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
