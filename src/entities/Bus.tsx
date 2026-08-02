import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BusModel } from '../components/models/BusModel';
import { runtime, nextBusId, type BusRuntime } from '../game/runtime';
import { WORLD_DATA } from '../game/worldConfig';
import { useGameStore } from '../store/gameStore';

// Один патрульный бусик. Регистрирует запись в runtime; движение/AI считает
// GameLoop, здесь — только визуальная синхронизация.
export function Bus({ index }: { index: number }) {
  const idRef = useRef<number>(-1);
  if (idRef.current < 0) idRef.current = nextBusId();
  const id = idRef.current;

  const group = useRef<THREE.Group>(null);
  const shownHeading = useRef(0);
  const [alert, setAlert] = useState(false);
  const pushMessage = useGameStore((s) => s.pushMessage);

  useEffect(() => {
    const loops = WORLD_DATA.patrolLoops;
    const loopIndex = index % loops.length;
    const loop = loops[loopIndex];
    const seg = index % loop.points.length;
    const start = loop.points[seg];
    const entry: BusRuntime = {
      id,
      pos: new THREE.Vector3(start.x, 0, start.z),
      heading: 0,
      speed: runtime.patrolSpeed,
      mode: 'patrol',
      awareness: 0,
      seesPlayer: false,
      loopIndex,
      segIndex: seg,
      detectRadius: runtime.detectRadius,
      searchUntil: 0,
      searchX: start.x,
      searchZ: start.z,
      markUntil: 0,
    };
    runtime.buses.set(id, entry);
    if (index >= 3) {
      pushMessage('Кажется, показался ещё один бусик… 🚐', 'warn');
    }
    return () => {
      runtime.buses.delete(id);
    };
  }, [id, index, pushMessage]);

  useFrame((_, dt) => {
    const b = runtime.buses.get(id);
    if (!b || !group.current) return;
    group.current.position.set(b.pos.x, 0, b.pos.z);

    let diff = b.heading - shownHeading.current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    shownHeading.current += diff * Math.min(1, dt * 8);
    group.current.rotation.y = shownHeading.current;

    const wantAlert = b.mode === 'chase' || b.mode === 'search';
    if (wantAlert !== alert) setAlert(wantAlert);
  });

  return (
    <group ref={group}>
      <BusModel alert={alert} />
      {/* свечение фар (ярче в погоне) */}
      <pointLight
        position={[0, 1, 3]}
        distance={alert ? 22 : 12}
        intensity={alert ? 26 : 10}
        color={alert ? '#ff9a7a' : '#ffe6ac'}
      />
    </group>
  );
}
