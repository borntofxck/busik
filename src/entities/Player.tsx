import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SlavyanModel } from '../components/models/SlavyanModel';
import { runtime } from '../game/runtime';

// Визуальное представление игрока. Логика движения — в GameLoop,
// здесь только синхронизация группы с runtime и мягкий поворот.
export function Player() {
  const group = useRef<THREE.Group>(null);
  const shownHeading = useRef(runtime.player.heading);

  useFrame((_, dt) => {
    if (!group.current) return;
    const p = runtime.player.pos;
    group.current.position.set(p.x, p.y, p.z);

    // мягкий поворот к целевому направлению
    let diff = runtime.player.heading - shownHeading.current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    shownHeading.current += diff * Math.min(1, dt * 12);
    group.current.rotation.y = shownHeading.current;
  });

  return (
    <group ref={group}>
      <SlavyanModel />
    </group>
  );
}
