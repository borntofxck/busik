import { useMemo } from 'react';
import { WORLD_DATA } from '../../game/worldConfig';

interface Post {
  x: number;
  z: number;
}
interface Rail {
  cx: number;
  cz: number;
  len: number;
  angle: number;
}

// Низкие деревянные заборы (через них можно «перелезать» — коллизии нет).
export function Fences() {
  const { posts, rails } = useMemo(() => {
    const posts: Post[] = [];
    const rails: Rail[] = [];
    for (const run of WORLD_DATA.fences) {
      for (let i = 0; i < run.points.length; i++) {
        posts.push({ x: run.points[i].x, z: run.points[i].z });
        if (i < run.points.length - 1) {
          const a = run.points[i];
          const b = run.points[i + 1];
          const dx = b.x - a.x;
          const dz = b.z - a.z;
          rails.push({
            cx: (a.x + b.x) / 2,
            cz: (a.z + b.z) / 2,
            len: Math.hypot(dx, dz),
            angle: Math.atan2(dx, dz),
          });
        }
      }
    }
    return { posts, rails };
  }, []);

  return (
    <group>
      {posts.map((p, i) => (
        <mesh key={`p${i}`} position={[p.x, 0.5, p.z]} castShadow>
          <boxGeometry args={[0.14, 1, 0.14]} />
          <meshStandardMaterial color="#4a3a2a" roughness={1} />
        </mesh>
      ))}
      {rails.map((r, i) => (
        <group key={`r${i}`} position={[r.cx, 0, r.cz]} rotation={[0, r.angle, 0]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.06, 0.12, r.len]} />
            <meshStandardMaterial color="#5a4632" roughness={1} />
          </mesh>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.06, 0.12, r.len]} />
            <meshStandardMaterial color="#5a4632" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
