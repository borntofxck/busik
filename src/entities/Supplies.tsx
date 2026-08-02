import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, SUPPLY_EMOJI, type Supply } from '../store/gameStore';

const TYPE_COLOR: Record<Supply['type'], string> = {
  coffee: '#6f4a2a',
  energy: '#2aa0c0',
  noodle: '#d08a2a',
  cucumber: '#3f8a3f',
};

function SupplyItem({ item }: { item: Supply }) {
  const group = useRef<THREE.Group>(null);
  const t = useRef(Math.random() * 10);

  useFrame((_, dt) => {
    if (!group.current) return;
    t.current += dt;
    group.current.position.y = 1 + Math.sin(t.current * 2) * 0.18;
    group.current.rotation.y += dt * 1.2;
  });

  return (
    <group position={[item.x, 0, item.z]}>
      <group ref={group} position={[0, 1, 0]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color={TYPE_COLOR[item.type]}
            emissive={TYPE_COLOR[item.type]}
            emissiveIntensity={0.5}
            flatShading
          />
        </mesh>
        <Html center distanceFactor={12} position={[0, 0.75, 0]}>
          <div
            style={{
              fontSize: 34,
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.8))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {SUPPLY_EMOJI[item.type]}
          </div>
        </Html>
      </group>
      {/* световой ореол на земле */}
      <pointLight position={[0, 0.6, 0]} distance={4} intensity={4} color={TYPE_COLOR[item.type]} />
    </group>
  );
}

export function Supplies() {
  const items = useGameStore((s) => s.supplyItems);
  return (
    <group>
      {items.map((it) => (
        <SupplyItem key={it.id} item={it} />
      ))}
    </group>
  );
}
