import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense } from 'react';
import { Scene } from './Scene';

export function Experience() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ fov: 55, near: 0.1, far: 320, position: [0, 6, 30] }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0b100e');
      }}
    >
      <Suspense fallback={null}>
        <Scene />
        <Preload all />
      </Suspense>
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
