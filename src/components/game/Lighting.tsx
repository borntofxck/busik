import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { runtime } from '../../game/runtime';

// Тусклый лунный свет + мягкая заливка. Направленный свет и его цель
// следуют за игроком — чёткие тени рядом с ним без огромной shadow-камеры.
export function Lighting() {
  const dir = useRef<THREE.DirectionalLight>(null);
  const target = useRef<THREE.Object3D>(null);

  useFrame(() => {
    if (!dir.current || !target.current) return;
    const p = runtime.player.pos;
    dir.current.position.set(p.x - 30, 55, p.z - 20);
    target.current.position.set(p.x, 0, p.z);
    target.current.updateMatrixWorld();
  });

  return (
    <>
      <ambientLight intensity={0.62} color="#6a7684" />
      <hemisphereLight args={['#5a6a78', '#2a2c22', 0.95]} />
      <directionalLight
        ref={dir}
        color="#c4d2e0"
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-bias={-0.0004}
      >
        <object3D ref={target} attach="target" />
      </directionalLight>
      {/* холодная подсветка неба над сценой */}
      <directionalLight color="#3a4a5c" intensity={0.5} position={[20, 40, 30]} />
    </>
  );
}
