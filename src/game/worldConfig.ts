// Процедурная генерация деревни: дома, дороги, лес, поля, река, кладбище и т.д.
// Всё детерминировано сидом, чтобы рендер и системы (AI/коллизии) видели один мир.

import { mulberry32, randRange, pick } from './rng';
import { WORLD } from './constants';

export type Vec2 = { x: number; z: number };

export type BuildingType =
  | 'house'
  | 'church'
  | 'shop'
  | 'busstop'
  | 'barn'
  | 'well';

export interface Building {
  id: string;
  type: BuildingType;
  position: Vec2;
  rotation: number;
  width: number;
  depth: number;
  height: number;
  /** Радиус круговой коллизии (0 — сквозь можно проходить, напр. сарай). */
  collideRadius: number;
  /** Радиус «укрытия»: находясь внутри, игрок хуже виден. */
  hideRadius: number;
  /** Сила укрытия 0..1. */
  hideStrength: number;
  colorVariant: number;
}

export interface TreeInstance {
  position: Vec2;
  scale: number;
  rotation: number;
  kind: 0 | 1; // 0 — ель, 1 — лиственное
}

export interface FieldPlot {
  center: Vec2;
  width: number;
  depth: number;
  rotation: number;
  crop: number;
}

export interface FenceRun {
  points: Vec2[];
}

export interface GraveInstance {
  position: Vec2;
  rotation: number;
  kind: 0 | 1; // 0 — крест, 1 — плита
}

export interface RoadSegment {
  a: Vec2;
  b: Vec2;
  width: number;
}

export interface PatrolLoop {
  points: Vec2[];
}

export interface WorldData {
  buildings: Building[];
  trees: TreeInstance[];
  fields: FieldPlot[];
  fences: FenceRun[];
  graves: GraveInstance[];
  roads: RoadSegment[];
  patrolLoops: PatrolLoop[];
  river: Vec2[];
  forestZones: { center: Vec2; radius: number }[];
  cemetery: { center: Vec2; radius: number };
  spawnPoints: Vec2[];
  npcWaypoints: Vec2[];
}

const HALF = WORLD.HALF;

// ── Дорожная сеть ────────────────────────────────────────────────────────────
// Крест по центру + внешнее кольцо. Бусики патрулируют замкнутые петли.

const ROAD_W = 6;

function buildRoads(): RoadSegment[] {
  const r: RoadSegment[] = [];
  // горизонтальная главная
  r.push({ a: { x: -HALF + 6, z: 0 }, b: { x: HALF - 6, z: 0 }, width: ROAD_W });
  // вертикальная главная
  r.push({ a: { x: 0, z: -HALF + 6 }, b: { x: 0, z: HALF - 6 }, width: ROAD_W });
  // внешнее кольцо
  const ring = 82;
  r.push({ a: { x: -ring, z: -ring }, b: { x: ring, z: -ring }, width: ROAD_W });
  r.push({ a: { x: ring, z: -ring }, b: { x: ring, z: ring }, width: ROAD_W });
  r.push({ a: { x: ring, z: ring }, b: { x: -ring, z: ring }, width: ROAD_W });
  r.push({ a: { x: -ring, z: ring }, b: { x: -ring, z: -ring }, width: ROAD_W });
  return r;
}

function buildPatrolLoops(): PatrolLoop[] {
  const ring = 82;
  return [
    // внешнее кольцо
    {
      points: [
        { x: -ring, z: -ring },
        { x: ring, z: -ring },
        { x: ring, z: ring },
        { x: -ring, z: ring },
      ],
    },
    // горизонтальная «восьмёрка» вдоль главной дороги
    {
      points: [
        { x: -HALF + 10, z: -2.4 },
        { x: HALF - 10, z: -2.4 },
        { x: HALF - 10, z: 2.4 },
        { x: -HALF + 10, z: 2.4 },
      ],
    },
    // вертикальная
    {
      points: [
        { x: -2.4, z: -HALF + 10 },
        { x: 2.4, z: -HALF + 10 },
        { x: 2.4, z: HALF - 10 },
        { x: -2.4, z: HALF - 10 },
      ],
    },
    // внутреннее кольцо
    {
      points: [
        { x: -40, z: -40 },
        { x: 40, z: -40 },
        { x: 40, z: 40 },
        { x: -40, z: 40 },
      ],
    },
  ];
}

// Расстояние от точки до отрезка (для отступа от дорог).
function distToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len2 = dx * dx + dz * dz;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.z - a.z);
  let t = ((p.x - a.x) * dx + (p.z - a.z) * dz) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.z - (a.z + t * dz));
}

function nearAnyRoad(p: Vec2, roads: RoadSegment[], margin: number): boolean {
  return roads.some((s) => distToSegment(p, s.a, s.b) < s.width / 2 + margin);
}

const HOUSE_COLORS = 6;

export function generateWorld(seed = 1337): WorldData {
  const rng = mulberry32(seed);
  const roads = buildRoads();
  const patrolLoops = buildPatrolLoops();

  const forestZones = [
    { center: { x: 66, z: 66 }, radius: 40 },
    { center: { x: -70, z: -66 }, radius: 34 },
    { center: { x: 72, z: -60 }, radius: 26 },
  ];
  const cemetery = { center: { x: -66, z: 58 }, radius: 17 };

  const buildings: Building[] = [];

  const overlaps = (p: Vec2, minDist: number): boolean =>
    buildings.some(
      (b) => Math.hypot(b.position.x - p.x, b.position.z - p.z) < minDist,
    );

  const inForest = (p: Vec2): boolean =>
    forestZones.some(
      (f) => Math.hypot(f.center.x - p.x, f.center.z - p.z) < f.radius,
    );
  const inCemetery = (p: Vec2): boolean =>
    Math.hypot(cemetery.center.x - p.x, cemetery.center.z - p.z) <
    cemetery.radius + 6;

  // ── Ключевые постройки (заданные вручную) ──
  buildings.push({
    id: 'church',
    type: 'church',
    position: { x: -60, z: 40 },
    rotation: -0.3,
    width: 9,
    depth: 13,
    height: 9,
    collideRadius: 7,
    hideRadius: 9,
    hideStrength: 0.55,
    colorVariant: 0,
  });
  buildings.push({
    id: 'shop',
    type: 'shop',
    position: { x: 14, z: -12 },
    rotation: Math.PI,
    width: 8,
    depth: 6,
    height: 4,
    collideRadius: 5,
    hideRadius: 7,
    hideStrength: 0.6,
    colorVariant: 1,
  });
  buildings.push({
    id: 'busstop',
    type: 'busstop',
    position: { x: -10, z: 9 },
    rotation: 0,
    width: 4,
    depth: 2,
    height: 2.6,
    collideRadius: 0,
    hideRadius: 3.5,
    hideStrength: 0.35,
    colorVariant: 0,
  });
  // Сарай — сквозной, лучшее укрытие.
  buildings.push({
    id: 'barn',
    type: 'barn',
    position: { x: 34, z: 26 },
    rotation: 0.5,
    width: 10,
    depth: 8,
    height: 5.5,
    collideRadius: 0,
    hideRadius: 6.5,
    hideStrength: 1.0,
    colorVariant: 0,
  });
  buildings.push({
    id: 'barn2',
    type: 'barn',
    position: { x: -34, z: -22 },
    rotation: -0.7,
    width: 9,
    depth: 7,
    height: 5,
    collideRadius: 0,
    hideRadius: 6,
    hideStrength: 1.0,
    colorVariant: 1,
  });
  // Колодцы
  for (const wp of [
    { x: 6, z: 16 },
    { x: -20, z: 30 },
    { x: 40, z: -36 },
  ]) {
    buildings.push({
      id: `well-${wp.x}-${wp.z}`,
      type: 'well',
      position: wp,
      rotation: rng() * Math.PI,
      width: 2,
      depth: 2,
      height: 2.2,
      collideRadius: 1.4,
      hideRadius: 0,
      hideStrength: 0,
      colorVariant: 0,
    });
  }

  // ── 22 жилых дома ──
  let attempts = 0;
  let houseCount = 0;
  while (houseCount < 22 && attempts < 4000) {
    attempts++;
    const p: Vec2 = {
      x: randRange(rng, -HALF + 12, HALF - 12),
      z: randRange(rng, -HALF + 12, HALF - 12),
    };
    if (Math.hypot(p.x, p.z) < 16) continue; // не на центральном перекрёстке
    if (nearAnyRoad(p, roads, 3.5)) continue; // дом стоит у дороги, но не на ней
    if (nearAnyRoad(p, roads, 26) === false) continue; // и всё же рядом с какой-то дорогой
    if (inForest(p)) continue;
    if (inCemetery(p)) continue;
    if (overlaps(p, 11)) continue;

    houseCount++;
    buildings.push({
      id: `house-${houseCount}`,
      type: 'house',
      position: p,
      rotation: randRange(rng, 0, Math.PI * 2),
      width: randRange(rng, 5, 7.5),
      depth: randRange(rng, 4.5, 6.5),
      height: randRange(rng, 3.2, 4.2),
      collideRadius: 4.2,
      hideRadius: 6.5,
      hideStrength: 0.6,
      colorVariant: Math.floor(rng() * HOUSE_COLORS),
    });
  }

  // ── Лес (инстансинг деревьев) ──
  const trees: TreeInstance[] = [];
  for (const zone of forestZones) {
    const count = Math.floor(zone.radius * zone.radius * 0.16);
    for (let i = 0; i < count; i++) {
      const ang = rng() * Math.PI * 2;
      const rad = Math.sqrt(rng()) * zone.radius;
      const p: Vec2 = {
        x: zone.center.x + Math.cos(ang) * rad,
        z: zone.center.z + Math.sin(ang) * rad,
      };
      if (Math.abs(p.x) > HALF || Math.abs(p.z) > HALF) continue;
      if (nearAnyRoad(p, roads, 2)) continue;
      trees.push({
        position: p,
        scale: randRange(rng, 0.8, 1.9),
        rotation: rng() * Math.PI * 2,
        kind: rng() > 0.45 ? 0 : 1,
      });
    }
  }
  // одиночные деревья по деревне
  for (let i = 0; i < 60; i++) {
    const p: Vec2 = {
      x: randRange(rng, -HALF + 5, HALF - 5),
      z: randRange(rng, -HALF + 5, HALF - 5),
    };
    if (nearAnyRoad(p, roads, 3)) continue;
    if (overlaps(p, 5)) continue;
    if (inCemetery(p)) continue;
    trees.push({
      position: p,
      scale: randRange(rng, 0.7, 1.4),
      rotation: rng() * Math.PI * 2,
      kind: rng() > 0.5 ? 0 : 1,
    });
  }

  // ── Поля / огороды ──
  const fields: FieldPlot[] = [];
  const fieldSpots: Vec2[] = [
    { x: 55, z: 8 },
    { x: -50, z: -50 },
    { x: 48, z: 50 },
    { x: -24, z: 60 },
    { x: 20, z: 58 },
  ];
  for (const c of fieldSpots) {
    fields.push({
      center: c,
      width: randRange(rng, 16, 26),
      depth: randRange(rng, 12, 20),
      rotation: randRange(rng, -0.3, 0.3),
      crop: Math.floor(rng() * 3),
    });
  }

  // ── Заборы (низкие, через них можно перелезать) ──
  const fences: FenceRun[] = [];
  for (let f = 0; f < 12; f++) {
    const start: Vec2 = {
      x: randRange(rng, -80, 80),
      z: randRange(rng, -80, 80),
    };
    if (nearAnyRoad(start, roads, 4)) continue;
    const pts: Vec2[] = [start];
    let cur = start;
    const segs = 3 + Math.floor(rng() * 3);
    const dir = rng() * Math.PI * 2;
    for (let s = 0; s < segs; s++) {
      const len = randRange(rng, 4, 8);
      const d = dir + (s % 2 === 0 ? 0 : Math.PI / 2);
      cur = { x: cur.x + Math.cos(d) * len, z: cur.z + Math.sin(d) * len };
      pts.push({ ...cur });
    }
    fences.push({ points: pts });
  }

  // ── Кладбище (кресты и плиты) ──
  const graves: GraveInstance[] = [];
  {
    const rows = 5;
    const cols = 6;
    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < cols; cc++) {
        const p: Vec2 = {
          x: cemetery.center.x - 12 + cc * 4.5 + randRange(rng, -0.6, 0.6),
          z: cemetery.center.z - 9 + rr * 4 + randRange(rng, -0.6, 0.6),
        };
        graves.push({
          position: p,
          rotation: randRange(rng, -0.2, 0.2),
          kind: rng() > 0.5 ? 0 : 1,
        });
      }
    }
  }

  // ── Река (полилиния сверху вниз с изгибом) ──
  const river: Vec2[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    river.push({
      x: 88 + Math.sin(t * Math.PI * 1.5) * 10,
      z: -HALF + t * (HALF * 2),
    });
  }

  // ── Точки спавна припасов и маршруты NPC ──
  const spawnPoints: Vec2[] = [];
  for (let i = 0; i < 40; i++) {
    let tries = 0;
    while (tries < 30) {
      tries++;
      const p: Vec2 = {
        x: randRange(rng, -HALF + 8, HALF - 8),
        z: randRange(rng, -HALF + 8, HALF - 8),
      };
      if (overlaps(p, 3)) continue;
      spawnPoints.push(p);
      break;
    }
  }

  const npcWaypoints: Vec2[] = [];
  for (let i = 0; i < 24; i++) {
    const base = pick(rng, buildings.filter((b) => b.type === 'house'));
    npcWaypoints.push({
      x: base.position.x + randRange(rng, -8, 8),
      z: base.position.z + randRange(rng, -8, 8),
    });
  }

  return {
    buildings,
    trees,
    fields,
    fences,
    graves,
    roads,
    patrolLoops,
    river,
    forestZones,
    cemetery,
    spawnPoints,
    npcWaypoints,
  };
}

// Единый экземпляр мира на всё приложение.
export const WORLD_DATA: WorldData = generateWorld(1337);
