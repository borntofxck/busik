import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { runtime, resetRuntime, resolveBuildingCollision, computeConcealment, busSeesPlayer } from '../game/runtime';
import { input, bindKeyboard } from '../game/input';
import { WORLD_DATA } from '../game/worldConfig';
import { useGameStore, type SupplyType } from '../store/gameStore';
import { BUS, CHASE, DIFFICULTY, PLAYER, SCORE, SUPPLY } from '../game/constants';

const AMBIENT_LINES: string[] = [
  'Деревенская бабушка сказала, что никого не видела. 👵',
  'Не паникуй. Ты же просто гуляешь.',
  'Где-то вдалеке лает собака…',
  'Пахнет дождём и картошкой.',
  'Кажется, тихо. Пока что.',
  'Славян: «Может, обойдётся…»',
  'Туман сгущается над полем.',
  'Петух прокукарекал не вовремя.',
];

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * Math.min(1, t);
}

function chooseSupplyType(): SupplyType {
  const r = Math.random();
  if (r < 0.3) return 'coffee';
  if (r < 0.55) return 'energy';
  if (r < 0.8) return 'noodle';
  return 'cucumber';
}

let supplyId = 1;

export function GameLoop() {
  const camera = useThree((s) => s.camera);

  const camYaw = useRef(0);
  const desiredCamYaw = useRef(0);
  const camInit = useRef(false);

  const prevPhase = useRef<string>('menu');
  const prevLevel = useRef(-1);
  const prevBusTarget = useRef(0);
  const prevInBarn = useRef(false);

  const hudTimer = useRef(0);
  const ambientTimer = useRef(20);
  const nearMissTimer = useRef(0);
  const supplyTimer = useRef(3);

  useEffect(() => bindKeyboard(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const store = useGameStore.getState();

    // ── смена фазы: старт новой игры ──
    if (prevPhase.current !== 'playing' && store.phase === 'playing') {
      resetRuntime();
      supplyId = 1;
      prevLevel.current = -1;
      prevBusTarget.current = 0;
      prevInBarn.current = false;
      hudTimer.current = 0;
      ambientTimer.current = 20;
      nearMissTimer.current = 0;
      supplyTimer.current = 3;
      camYaw.current = 0;
      desiredCamYaw.current = 0;
      camInit.current = false;
      store.setBusCount(0);
      store.setSupplyItems([]);
    }
    prevPhase.current = store.phase;

    if (store.phase !== 'playing') return;

    runtime.time += dt;
    const time = runtime.time;
    const s = runtime.stats;
    const p = runtime.player;

    // ── сложность ──
    const level = Math.floor(time / DIFFICULTY.STEP_SECONDS);
    const chaos = time >= DIFFICULTY.CHAOS_SECONDS;
    runtime.detectRadius = BUS.BASE_DETECT_RADIUS + level * DIFFICULTY.RADIUS_PER_STEP;
    runtime.patrolSpeed = BUS.BASE_PATROL_SPEED + level * DIFFICULTY.SPEED_PER_STEP;
    const chaseSpeed = Math.min(13.5, BUS.BASE_SPEED + level * DIFFICULTY.SPEED_PER_STEP);

    const busTarget = Math.min(
      DIFFICULTY.MAX_BUSES,
      DIFFICULTY.START_BUSES + level + (chaos ? 2 : 0),
    );
    if (busTarget !== prevBusTarget.current) {
      prevBusTarget.current = busTarget;
      store.setBusCount(busTarget);
    }
    if (level !== prevLevel.current) {
      if (prevLevel.current >= 0) {
        store.pushMessage('Стало опаснее… патрули злее и зорче. 😨', 'warn');
      }
      prevLevel.current = level;
      store.setDifficulty(level, chaos);
    }
    if (chaos && !store.chaos) {
      store.setDifficulty(level, true);
      store.pushMessage('НАСТОЯЩИЙ ХАОС! Бусики повсюду! 🚐🚐🚐', 'danger');
    }

    // ── скрытность игрока ──
    const conc = computeConcealment(p.pos);
    p.concealment = conc.concealment;
    p.inBarn = conc.inBarn;
    p.inForest = conc.inForest;
    if (p.inBarn && !prevInBarn.current) {
      store.pushMessage('Лучше переждать в сарае. 🚜', 'info');
    }
    prevInBarn.current = p.inBarn;

    // ── скорость / выносливость / буст ──
    const moving = input.forward !== 0 || input.strafe !== 0;
    const canSprint = input.sprint && moving && s.stamina > PLAYER.STAMINA_MIN_SPRINT;
    s.sprinting = canSprint;
    let speed = PLAYER.WALK_SPEED;
    if (canSprint) {
      speed = PLAYER.SPRINT_SPEED;
      s.stamina = Math.max(0, s.stamina - PLAYER.STAMINA_DRAIN * dt);
    } else {
      s.stamina = Math.min(PLAYER.MAX_STAMINA, s.stamina + PLAYER.STAMINA_REGEN * dt);
    }
    const boostActive = time < s.boostUntil;
    if (boostActive) speed *= s.boostMul;
    s.speedMul = speed / PLAYER.WALK_SPEED;

    // ── движение игрока (в системе координат камеры) ──
    if (moving) {
      const mag = Math.min(1, Math.hypot(input.forward, input.strafe));
      const fx = Math.sin(camYaw.current);
      const fz = Math.cos(camYaw.current);
      const rx = Math.cos(camYaw.current);
      const rz = -Math.sin(camYaw.current);
      let mx = fx * input.forward + rx * input.strafe;
      let mz = fz * input.forward + rz * input.strafe;
      const ml = Math.hypot(mx, mz) || 1;
      mx /= ml;
      mz /= ml;
      p.pos.x += mx * speed * mag * dt;
      p.pos.z += mz * speed * mag * dt;
      p.heading = Math.atan2(mx, mz);
      desiredCamYaw.current = p.heading;
    }
    resolveBuildingCollision(p.pos, PLAYER.RADIUS);

    // ── камера (третье лицо, плавно) ──
    camYaw.current = lerpAngle(camYaw.current, desiredCamYaw.current, dt * 2.4);
    const camDist = 9.5;
    const camH = 5.2;
    const cfx = Math.sin(camYaw.current);
    const cfz = Math.cos(camYaw.current);
    const targetPos = new THREE.Vector3(
      p.pos.x - cfx * camDist,
      camH,
      p.pos.z - cfz * camDist,
    );
    if (!camInit.current) {
      camera.position.copy(targetPos);
      camInit.current = true;
    } else {
      camera.position.lerp(targetPos, Math.min(1, dt * 4));
    }
    camera.lookAt(p.pos.x, 1.5, p.pos.z);

    // ── детекция бусиками ──
    let maxAware = 0;
    runtime.buses.forEach((b) => {
      b.detectRadius = runtime.detectRadius;
      const det = busSeesPlayer(b);
      b.seesPlayer = det.sees;
      if (det.sees) b.awareness = Math.min(1, b.awareness + BUS.AWARE_GAIN * dt);
      else b.awareness = Math.max(0, b.awareness - BUS.AWARE_DECAY * dt);
      if (b.awareness > maxAware) maxAware = b.awareness;
    });

    // ── тревога / погоня ──
    const alarm = runtime.alarm;
    if (!alarm.active && maxAware >= CHASE.ALARM_THRESHOLD) {
      alarm.active = true;
      alarm.since = time;
      alarm.lastContact = time;
      alarm.lastKnownPos.copy(p.pos);
      store.pushMessage('ПОГОНЯ! Тебя заметили! 🚨', 'danger');
    }
    if (alarm.active) {
      let contact = false;
      runtime.buses.forEach((b) => {
        const d = Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
        if (b.seesPlayer || d < CHASE.CONTACT_RADIUS) contact = true;
      });
      if (contact) {
        alarm.lastContact = time;
        alarm.lastKnownPos.copy(p.pos);
      }
      if (time - alarm.lastContact > CHASE.ESCAPE_SECONDS) {
        alarm.active = false;
        s.escapes += 1;
        store.pushMessage('Оторвался! Погоня прекращена. 😮‍💨', 'info');
        runtime.buses.forEach((b) => {
          b.awareness = 0.15;
          b.markUntil = 0;
        });
      }
    }
    store.setAlarm(alarm.active);

    // ── движение и режимы бусиков ──
    runtime.buses.forEach((b) => {
      let targetX: number;
      let targetZ: number;
      let spd: number;

      const distToPlayer = Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
      const marked = time < b.markUntil;
      const chasingThis =
        alarm.active && (b.seesPlayer || distToPlayer < CHASE.CONTACT_RADIUS || marked);

      if (alarm.active && chasingThis) {
        b.mode = 'chase';
        targetX = p.pos.x;
        targetZ = p.pos.z;
        spd = chaseSpeed;
      } else if (alarm.active) {
        b.mode = 'search';
        if (Math.hypot(b.searchX - b.pos.x, b.searchZ - b.pos.z) < 3 || time > b.searchUntil) {
          const ang = Math.random() * Math.PI * 2;
          const rad = 4 + Math.random() * 12;
          b.searchX = alarm.lastKnownPos.x + Math.cos(ang) * rad;
          b.searchZ = alarm.lastKnownPos.z + Math.sin(ang) * rad;
          b.searchUntil = time + 2.5;
        }
        targetX = b.searchX;
        targetZ = b.searchZ;
        spd = chaseSpeed * 0.8;
      } else if (marked) {
        // NPC сдал — едет к метке, даже без общей тревоги
        b.mode = 'chase';
        targetX = alarm.lastKnownPos.x;
        targetZ = alarm.lastKnownPos.z;
        spd = chaseSpeed;
      } else {
        b.mode = 'patrol';
        spd = runtime.patrolSpeed;
        const loop = WORLD_DATA.patrolLoops[b.loopIndex];
        const wp = loop.points[b.segIndex];
        if (Math.hypot(wp.x - b.pos.x, wp.z - b.pos.z) < 3.5) {
          b.segIndex = (b.segIndex + 1) % loop.points.length;
        }
        targetX = loop.points[b.segIndex].x;
        targetZ = loop.points[b.segIndex].z;
      }

      const dx = targetX - b.pos.x;
      const dz = targetZ - b.pos.z;
      const desired = Math.atan2(dx, dz);
      const turnRate = b.mode === 'patrol' ? dt * 2.2 : dt * 3.5;
      b.heading = lerpAngle(b.heading, desired, turnRate);
      const hx = Math.sin(b.heading);
      const hz = Math.cos(b.heading);
      b.pos.x += hx * spd * dt;
      b.pos.z += hz * spd * dt;
      resolveBuildingCollision(b.pos, 1.9);
    });

    // ── разведение бусиков, чтобы не наезжали друг на друга ──
    const busArr = Array.from(runtime.buses.values());
    for (let i = 0; i < busArr.length; i++) {
      for (let j = i + 1; j < busArr.length; j++) {
        const a = busArr[i];
        const b = busArr[j];
        const dx = b.pos.x - a.pos.x;
        const dz = b.pos.z - a.pos.z;
        const d = Math.hypot(dx, dz);
        const min = 4;
        if (d < min && d > 1e-3) {
          const push = ((min - d) / d) * 0.5;
          a.pos.x -= dx * push;
          a.pos.z -= dz * push;
          b.pos.x += dx * push;
          b.pos.z += dz * push;
        }
      }
    }

    // ── поимка и здоровье ──
    let minChaseDist = Infinity;
    runtime.buses.forEach((b) => {
      if (b.mode === 'chase') {
        const d = Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
        if (d < minChaseDist) minChaseDist = d;
      }
    });
    if (minChaseDist < 8) {
      s.health = Math.max(0, s.health - (8 - minChaseDist) * 3.5 * dt);
    } else if (!alarm.active) {
      s.health = Math.min(PLAYER.MAX_HEALTH, s.health + 4 * dt);
    }

    // ── очки ──
    s.score = Math.floor(
      time * SCORE.PER_SECOND + s.escapes * SCORE.PER_ESCAPE + s.supplies * SCORE.PER_SUPPLY,
    );

    // ── near-miss сообщение ──
    nearMissTimer.current -= dt;
    if (!alarm.active && maxAware > 0.4 && maxAware < CHASE.ALARM_THRESHOLD && nearMissTimer.current <= 0) {
      store.pushMessage('Тебя почти заметили! 😳', 'warn');
      nearMissTimer.current = 7;
    }

    // ── эмбиент-реплики ──
    ambientTimer.current -= dt;
    if (ambientTimer.current <= 0) {
      ambientTimer.current = 26 + Math.random() * 16;
      if (!alarm.active) {
        store.pushMessage(
          AMBIENT_LINES[Math.floor(Math.random() * AMBIENT_LINES.length)],
          'fun',
        );
      }
    }

    // ── припасы: спавн ──
    supplyTimer.current -= dt;
    if (supplyTimer.current <= 0) {
      supplyTimer.current = SUPPLY.SPAWN_INTERVAL;
      const items = useGameStore.getState().supplyItems;
      if (items.length < SUPPLY.MAX_ON_MAP) {
        for (let attempt = 0; attempt < 12; attempt++) {
          const sp = WORLD_DATA.spawnPoints[Math.floor(Math.random() * WORLD_DATA.spawnPoints.length)];
          const dp = Math.hypot(sp.x - p.pos.x, sp.z - p.pos.z);
          if (dp < 14 || dp > 70) continue;
          store.setSupplyItems([
            ...items,
            { id: supplyId++, type: chooseSupplyType(), x: sp.x, z: sp.z },
          ]);
          break;
        }
      }
    }

    // ── припасы: подбор ──
    const cur = useGameStore.getState().supplyItems;
    for (const item of cur) {
      if (Math.hypot(item.x - p.pos.x, item.z - p.pos.z) < SUPPLY.PICKUP_RADIUS) {
        store.collectSupply(item.id);
        break;
      }
    }

    // ── синхронизация HUD ──
    hudTimer.current -= dt;
    if (hudTimer.current <= 0) {
      hudTimer.current = 0.1;
      store.syncHud({
        health: Math.round(s.health),
        stamina: Math.round(s.stamina),
        speedMul: Math.round(s.speedMul * 100) / 100,
        time: Math.floor(time),
        score: s.score,
        escapes: s.escapes,
        supplies: s.supplies,
      });
    }

    // ── проверка Game Over ──
    if (minChaseDist < BUS.CATCH_RADIUS || s.health <= 0) {
      p.alive = false;
      store.syncHud({
        health: 0,
        stamina: Math.round(s.stamina),
        speedMul: s.speedMul,
        time: Math.floor(time),
        score: s.score,
        escapes: s.escapes,
        supplies: s.supplies,
      });
      store.endGame();
    }
  });

  return null;
}
