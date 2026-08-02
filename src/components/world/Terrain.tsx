import { useMemo } from 'react';
import * as THREE from 'three';
import { WORLD_DATA } from '../../game/worldConfig';
import { WORLD } from '../../game/constants';
import { mulberry32 } from '../../game/rng';

const FIELD_COLORS = ['#4a4326', '#3f4a2a', '#524628'];

export function Terrain() {
  const size = WORLD.HALF * 2 + 40;

  const mudPatches = useMemo(() => {
    const rng = mulberry32(99);
    const patches: { x: number; z: number; r: number }[] = [];
    for (let i = 0; i < 40; i++) {
      patches.push({
        x: (rng() - 0.5) * WORLD.HALF * 2,
        z: (rng() - 0.5) * WORLD.HALF * 2,
        r: 2 + rng() * 5,
      });
    }
    return patches;
  }, []);

  return (
    <group>
      {/* земля */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size, 1, 1]} />
        <meshStandardMaterial color="#39432c" roughness={1} />
      </mesh>

      {/* грязевые пятна */}
      {mudPatches.map((p, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[p.x, 0.012, p.z]}
          receiveShadow
        >
          <circleGeometry args={[p.r, 12]} />
          <meshStandardMaterial color="#2c2118" roughness={1} />
        </mesh>
      ))}

      {/* поля / огороды */}
      {WORLD_DATA.fields.map((f, i) => (
        <group key={i} position={[f.center.x, 0, f.center.z]} rotation={[0, f.rotation, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
            <planeGeometry args={[f.width, f.depth]} />
            <meshStandardMaterial color={FIELD_COLORS[f.crop % FIELD_COLORS.length]} roughness={1} />
          </mesh>
          {/* борозды */}
          {Array.from({ length: Math.floor(f.width / 1.5) }).map((_, r) => (
            <mesh
              key={r}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[-f.width / 2 + r * 1.5 + 0.75, 0.03, 0]}
            >
              <planeGeometry args={[0.35, f.depth - 1]} />
              <meshStandardMaterial color="#2e2716" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* река */}
      <River />
    </group>
  );
}

function River() {
  const geometry = useMemo(() => {
    const pts = WORLD_DATA.river;
    const shape = new THREE.Shape();
    const width = 6;
    // строим ленту по обе стороны от полилинии
    const left: THREE.Vector2[] = [];
    const right: THREE.Vector2[] = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const next = pts[Math.min(i + 1, pts.length - 1)];
      const prev = pts[Math.max(i - 1, 0)];
      const dx = next.x - prev.x;
      const dz = next.z - prev.z;
      const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len;
      const nz = dx / len;
      left.push(new THREE.Vector2(p.x + nx * width, p.z + nz * width));
      right.push(new THREE.Vector2(p.x - nx * width, p.z - nz * width));
    }
    shape.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < left.length; i++) shape.lineTo(left[i].x, left[i].y);
    for (let i = right.length - 1; i >= 0; i--) shape.lineTo(right[i].x, right[i].y);
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0.04, 0]} receiveShadow>
      <meshStandardMaterial color="#243642" roughness={0.25} metalness={0.35} />
    </mesh>
  );
}
