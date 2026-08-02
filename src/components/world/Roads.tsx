import { useMemo } from 'react';
import { WORLD_DATA } from '../../game/worldConfig';
import { mulberry32 } from '../../game/rng';

// Разбитые грунтовые дороги: тёмные ленты вдоль сегментов + ямы.
export function Roads() {
  const segments = useMemo(() => {
    return WORLD_DATA.roads.map((s) => {
      const dx = s.b.x - s.a.x;
      const dz = s.b.z - s.a.z;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const cx = (s.a.x + s.b.x) / 2;
      const cz = (s.a.z + s.b.z) / 2;
      return { cx, cz, len, angle, width: s.width };
    });
  }, []);

  const potholes = useMemo(() => {
    const rng = mulberry32(7);
    const holes: { x: number; z: number; r: number }[] = [];
    for (const s of WORLD_DATA.roads) {
      const n = Math.floor(Math.hypot(s.b.x - s.a.x, s.b.z - s.a.z) / 14);
      for (let i = 0; i < n; i++) {
        const t = rng();
        holes.push({
          x: s.a.x + (s.b.x - s.a.x) * t + (rng() - 0.5) * 2,
          z: s.a.z + (s.b.z - s.a.z) * t + (rng() - 0.5) * 2,
          r: 0.5 + rng() * 1.1,
        });
      }
    }
    return holes;
  }, []);

  return (
    <group>
      {segments.map((s, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, s.angle]}
          position={[s.cx, 0.015, s.cz]}
          receiveShadow
        >
          <planeGeometry args={[s.width, s.len]} />
          <meshStandardMaterial color="#2b241c" roughness={1} />
        </mesh>
      ))}
      {potholes.map((h, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[h.x, 0.02, h.z]}>
          <circleGeometry args={[h.r, 8]} />
          <meshStandardMaterial color="#17120d" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
