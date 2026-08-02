// Общий изменяемый runtime-стейт (вне React) для «горячих» данных 60 раз/сек:
// позиции игрока/бусиков/NPC, коллизии, скрытность, состояние тревоги.
// React-store (Zustand) хранит только то, что нужно UI (здоровье, очки и т.д.).

import * as THREE from 'three';
import { WORLD_DATA } from './worldConfig';
import { BUS, PLAYER } from './constants';

export type BusMode = 'patrol' | 'chase' | 'search' | 'return';

export interface BusRuntime {
  id: number;
  pos: THREE.Vector3;
  heading: number; // рад, направление «носа»
  speed: number;
  mode: BusMode;
  awareness: number; // 0..1
  seesPlayer: boolean;
  loopIndex: number;
  segIndex: number;
  detectRadius: number;
  searchUntil: number;
  searchX: number;
  searchZ: number;
  markUntil: number; // «метка» от NPC до этого времени показывает игрока
}

export interface NpcRuntime {
  id: number;
  pos: THREE.Vector3;
  heading: number;
}

export interface RuntimeState {
  player: {
    pos: THREE.Vector3;
    heading: number;
    concealment: number; // 0..1, насколько игрок укрыт
    inBarn: boolean;
    inForest: boolean;
    alive: boolean;
  };
  buses: Map<number, BusRuntime>;
  npcs: Map<number, NpcRuntime>;
  alarm: {
    active: boolean;
    since: number;
    lastContact: number;
    lastKnownPos: THREE.Vector3;
  };
  /** Игровое время в секундах (идёт только во время playing). */
  time: number;
  detectRadius: number;
  patrolSpeed: number;
  /** Геймплейные счётчики (авторитетный источник, UI зеркалит их). */
  stats: {
    health: number;
    stamina: number;
    boostUntil: number;
    boostMul: number;
    speedMul: number; // текущий отображаемый множитель скорости
    score: number;
    escapes: number;
    supplies: number;
    sprinting: boolean;
  };
}

export const runtime: RuntimeState = {
  player: {
    pos: new THREE.Vector3(0, 0, 20),
    heading: 0,
    concealment: 0,
    inBarn: false,
    inForest: false,
    alive: true,
  },
  buses: new Map(),
  npcs: new Map(),
  alarm: {
    active: false,
    since: 0,
    lastContact: 0,
    lastKnownPos: new THREE.Vector3(),
  },
  time: 0,
  detectRadius: BUS.BASE_DETECT_RADIUS,
  patrolSpeed: BUS.BASE_PATROL_SPEED,
  stats: {
    health: PLAYER.MAX_HEALTH,
    stamina: PLAYER.MAX_STAMINA,
    boostUntil: 0,
    boostMul: 1,
    speedMul: 1,
    score: 0,
    escapes: 0,
    supplies: 0,
    sprinting: false,
  },
};

export function resetRuntime(): void {
  runtime.player.pos.set(0, 0, 20);
  runtime.player.heading = 0;
  runtime.player.concealment = 0;
  runtime.player.inBarn = false;
  runtime.player.inForest = false;
  runtime.player.alive = true;
  runtime.buses.clear();
  runtime.npcs.clear();
  runtime.alarm.active = false;
  runtime.alarm.since = 0;
  runtime.alarm.lastContact = 0;
  runtime.alarm.lastKnownPos.set(0, 0, 0);
  runtime.time = 0;
  runtime.detectRadius = BUS.BASE_DETECT_RADIUS;
  runtime.patrolSpeed = BUS.BASE_PATROL_SPEED;
  runtime.stats.health = PLAYER.MAX_HEALTH;
  runtime.stats.stamina = PLAYER.MAX_STAMINA;
  runtime.stats.boostUntil = 0;
  runtime.stats.boostMul = 1;
  runtime.stats.speedMul = 1;
  runtime.stats.score = 0;
  runtime.stats.escapes = 0;
  runtime.stats.supplies = 0;
  runtime.stats.sprinting = false;
}

// ── Коллизии игрока с постройками ──────────────────────────────────────────
const _tmp = new THREE.Vector3();

export function resolveBuildingCollision(pos: THREE.Vector3, radius: number): void {
  for (const b of WORLD_DATA.buildings) {
    if (b.collideRadius <= 0) continue;
    const dx = pos.x - b.position.x;
    const dz = pos.z - b.position.z;
    const dist = Math.hypot(dx, dz);
    const min = b.collideRadius + radius;
    if (dist < min && dist > 1e-4) {
      const push = (min - dist) / dist;
      pos.x += dx * push;
      pos.z += dz * push;
    } else if (dist <= 1e-4) {
      pos.x += min;
    }
  }
  // границы мира
  const lim = 104;
  pos.x = THREE.MathUtils.clamp(pos.x, -lim, lim);
  pos.z = THREE.MathUtils.clamp(pos.z, -lim, lim);
}

// ── Скрытность игрока ────────────────────────────────────────────────────────
export function computeConcealment(pos: THREE.Vector3): {
  concealment: number;
  inBarn: boolean;
  inForest: boolean;
} {
  let best = 0;
  let inBarn = false;

  for (const b of WORLD_DATA.buildings) {
    if (b.hideStrength <= 0 || b.hideRadius <= 0) continue;
    const dist = Math.hypot(pos.x - b.position.x, pos.z - b.position.z);
    if (dist < b.hideRadius) {
      const f = b.hideStrength * (1 - dist / b.hideRadius);
      if (f > best) best = f;
      if (b.type === 'barn' && dist < b.hideRadius * 0.75) inBarn = true;
    }
  }

  let inForest = false;
  for (const zone of WORLD_DATA.forestZones) {
    const dist = Math.hypot(pos.x - zone.center.x, pos.z - zone.center.z);
    if (dist < zone.radius) {
      inForest = true;
      const f = 0.82 * (1 - Math.min(1, dist / zone.radius) * 0.4);
      if (f > best) best = f;
    }
  }

  // огороды/поля дают немного скрытности
  for (const fld of WORLD_DATA.fields) {
    const d = _tmp.set(pos.x - fld.center.x, 0, pos.z - fld.center.z);
    if (Math.abs(d.x) < fld.width / 2 && Math.abs(d.z) < fld.depth / 2) {
      if (0.3 > best) best = 0.3;
    }
  }

  return { concealment: Math.min(1, best), inBarn, inForest };
}

let _busId = 0;
export function nextBusId(): number {
  return _busId++;
}

let _npcId = 0;
export function nextNpcId(): number {
  return _npcId++;
}

// Проверка «видит ли бусик игрока» с учётом угла обзора и укрытия.
export function busSeesPlayer(bus: BusRuntime): { sees: boolean; dist: number } {
  const p = runtime.player.pos;
  const dx = p.x - bus.pos.x;
  const dz = p.z - bus.pos.z;
  const dist = Math.hypot(dx, dz);

  // NPC поставил метку — цель видна независимо от угла/укрытия
  if (runtime.time < bus.markUntil && dist < bus.detectRadius * 2.2) {
    return { sees: true, dist };
  }

  const effRadius = bus.detectRadius * (1 - runtime.player.concealment * 0.92);
  if (dist > effRadius) return { sees: false, dist };

  // поле зрения
  const toPlayer = Math.atan2(dx, dz);
  let diff = Math.abs(toPlayer - bus.heading);
  while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
  // на близкой дистанции замечают и сбоку
  const fov = dist < 6 ? Math.PI : BUS.FOV_HALF;
  if (diff > fov) return { sees: false, dist };

  return { sees: true, dist };
}

export const PLAYER_COLLIDE_RADIUS = PLAYER.RADIUS;
