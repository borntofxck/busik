import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NpcModel } from '../components/models/NpcModel';
import { runtime, nextNpcId, type NpcRuntime } from '../game/runtime';
import { WORLD_DATA } from '../game/worldConfig';
import { useGameStore } from '../store/gameStore';

const SNITCH_LINES = [
  'Бабка сдала Славяна! 👵 Ближайший бусик едет сюда.',
  'Сосед показал пальцем на Славяна… 🫣',
  'Кто-то шепнул патрулю, где прячется Славик.',
];
const DISTRACT_LINES = [
  '«Да не видел я никакого Славика!» — отвлёк бусик 👴',
  '«Тут только куры да огород!» — бусик уехал.',
  '«Славян? Не, уехал давно.» Патруль сбит с толку.',
];

function pickWaypoint(): THREE.Vector3 {
  const wps = WORLD_DATA.npcWaypoints;
  const w = wps[Math.floor(Math.random() * wps.length)];
  return new THREE.Vector3(w.x, 0, w.z);
}

// Деревенский NPC: бродит по деревне, иногда сдаёт Славяна патрулю,
// иногда наоборот отвлекает бусик.
export function Npc({ index }: { index: number }) {
  const idRef = useRef<number>(-1);
  if (idRef.current < 0) idRef.current = nextNpcId();
  const id = idRef.current;

  const group = useRef<THREE.Group>(null);
  const target = useRef<THREE.Vector3>(pickWaypoint());
  const heading = useRef(Math.random() * Math.PI * 2);
  const cooldown = useRef(6 + Math.random() * 10);
  const variant = index % 5;

  const pushMessage = useGameStore((s) => s.pushMessage);

  useEffect(() => {
    const w = WORLD_DATA.npcWaypoints[index % WORLD_DATA.npcWaypoints.length];
    const entry: NpcRuntime = {
      id,
      pos: new THREE.Vector3(w.x, 0, w.z),
      heading: 0,
    };
    runtime.npcs.set(id, entry);
    return () => {
      runtime.npcs.delete(id);
    };
  }, [id, index]);

  useFrame((_, dt) => {
    const npc = runtime.npcs.get(id);
    if (!npc || !group.current) return;

    // движение к цели
    const dir = new THREE.Vector3().subVectors(target.current, npc.pos);
    const dist = dir.length();
    if (dist < 1.2) {
      target.current = pickWaypoint();
    } else {
      dir.normalize();
      const speed = 1.8;
      npc.pos.addScaledVector(dir, speed * dt);
      heading.current = Math.atan2(dir.x, dir.z);
    }
    npc.heading = heading.current;

    group.current.position.set(npc.pos.x, 0, npc.pos.z);
    group.current.rotation.y = heading.current;

    // логика «сдать / отвлечь»
    cooldown.current -= dt;
    if (cooldown.current <= 0) {
      cooldown.current = 12 + Math.random() * 14;

      // найти ближайший бусик
      let nearest: { id: number; d: number } | null = null;
      runtime.buses.forEach((b) => {
        const d = Math.hypot(b.pos.x - npc.pos.x, b.pos.z - npc.pos.z);
        if (!nearest || d < nearest.d) nearest = { id: b.id, d };
      });
      if (!nearest) return;
      const near = nearest as { id: number; d: number };
      if (near.d > 34) return; // бусик слишком далеко — некому доносить

      const bus = runtime.buses.get(near.id);
      if (!bus) return;

      const distToPlayer = Math.hypot(
        runtime.player.pos.x - npc.pos.x,
        runtime.player.pos.z - npc.pos.z,
      );

      if (distToPlayer < 20 && Math.random() < 0.55) {
        // СДАЁТ: ставит метку — бусик едет к последней позиции
        bus.markUntil = runtime.time + 6;
        runtime.alarm.lastKnownPos.copy(runtime.player.pos);
        pushMessage(
          SNITCH_LINES[Math.floor(Math.random() * SNITCH_LINES.length)],
          'danger',
        );
      } else {
        // ОТВЛЕКАЕТ: сбивает тревогу у бусика
        bus.awareness = Math.max(0, bus.awareness - 0.6);
        bus.markUntil = 0;
        pushMessage(
          DISTRACT_LINES[Math.floor(Math.random() * DISTRACT_LINES.length)],
          'fun',
        );
      }
    }
  });

  return (
    <group ref={group}>
      <NpcModel variant={variant} />
    </group>
  );
}
