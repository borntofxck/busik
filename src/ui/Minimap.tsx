import { useEffect, useRef } from 'react';
import { runtime } from '../game/runtime';
import { WORLD_DATA } from '../game/worldConfig';
import { WORLD } from '../game/constants';

const SIZE = 168;
const HALF = WORLD.HALF;
const SCALE = SIZE / (HALF * 2);

function tx(x: number): number {
  return SIZE / 2 + x * SCALE;
}
function ty(z: number): number {
  return SIZE / 2 + z * SCALE;
}

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, SIZE, SIZE);

      // фон
      ctx.fillStyle = 'rgba(10,16,13,0.82)';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // лес
      ctx.fillStyle = 'rgba(40,70,45,0.5)';
      for (const f of WORLD_DATA.forestZones) {
        ctx.beginPath();
        ctx.arc(tx(f.center.x), ty(f.center.z), f.radius * SCALE, 0, Math.PI * 2);
        ctx.fill();
      }

      // дороги
      ctx.strokeStyle = 'rgba(150,140,120,0.35)';
      ctx.lineWidth = 2;
      for (const r of WORLD_DATA.roads) {
        ctx.beginPath();
        ctx.moveTo(tx(r.a.x), ty(r.a.z));
        ctx.lineTo(tx(r.b.x), ty(r.b.z));
        ctx.stroke();
      }

      // постройки
      for (const b of WORLD_DATA.buildings) {
        if (b.type === 'well') continue;
        ctx.fillStyle =
          b.type === 'barn'
            ? 'rgba(120,90,50,0.9)'
            : b.type === 'church'
              ? 'rgba(180,170,120,0.8)'
              : 'rgba(120,110,95,0.7)';
        const s = b.type === 'house' ? 2 : 3;
        ctx.fillRect(tx(b.position.x) - s / 2, ty(b.position.z) - s / 2, s, s);
      }

      // NPC
      ctx.fillStyle = 'rgba(200,200,210,0.7)';
      runtime.npcs.forEach((n) => {
        ctx.beginPath();
        ctx.arc(tx(n.pos.x), ty(n.pos.z), 1.6, 0, Math.PI * 2);
        ctx.fill();
      });

      // бусики
      runtime.buses.forEach((b) => {
        const chase = b.mode === 'chase';
        const search = b.mode === 'search';
        ctx.fillStyle = chase
          ? '#ff3b3b'
          : search
            ? '#ff9b2b'
            : '#e8d24a';
        ctx.beginPath();
        ctx.arc(tx(b.pos.x), ty(b.pos.z), 3, 0, Math.PI * 2);
        ctx.fill();
        if (chase) {
          ctx.strokeStyle = 'rgba(255,60,60,0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(tx(b.pos.x), ty(b.pos.z), 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // игрок
      const p = runtime.player.pos;
      ctx.fillStyle = '#49e0d0';
      ctx.beginPath();
      ctx.arc(tx(p.x), ty(p.z), 3.2, 0, Math.PI * 2);
      ctx.fill();
      // направление взгляда
      ctx.strokeStyle = '#49e0d0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx(p.x), ty(p.z));
      ctx.lineTo(
        tx(p.x + Math.sin(runtime.player.heading) * 7),
        ty(p.z + Math.cos(runtime.player.heading) * 7),
      );
      ctx.stroke();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="absolute bottom-4 right-4 z-30 rounded-lg border border-white/15 overflow-hidden shadow-lg">
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="block" />
    </div>
  );
}
