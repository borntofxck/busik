import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COATS = ['#5b4636', '#3f4a3a', '#5a5148', '#6b3f3f', '#40484f'];
const KERCHIEF = ['#8a3a3a', '#7a6a3a', '#5a5a6a', '#7a4a5a'];

// Деревенский NPC (бабушка/мужик) — низкополигональный.
export function NpcModel({ variant = 0 }: { variant?: number }) {
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const phase = useRef(Math.random() * 10);
  const prev = useRef<THREE.Vector3 | null>(null);
  const root = useRef<THREE.Group>(null);

  const coat = COATS[variant % COATS.length];
  const scarf = KERCHIEF[variant % KERCHIEF.length];

  useFrame((_, dt) => {
    if (!root.current) return;
    const wp = root.current.getWorldPosition(new THREE.Vector3());
    if (!prev.current) prev.current = wp.clone();
    const moved = wp.distanceTo(prev.current);
    prev.current.copy(wp);
    const speed = dt > 0 ? moved / dt : 0;
    phase.current += dt * (3 + speed);
    const swing = Math.sin(phase.current) * Math.min(0.6, speed * 0.2);
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
  });

  return (
    <group ref={root}>
      {/* пальто/тело */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.34]} />
        <meshStandardMaterial color={coat} roughness={0.95} />
      </mesh>
      {/* ноги */}
      <mesh ref={legL} position={[-0.13, 0.32, 0]} castShadow>
        <boxGeometry args={[0.16, 0.66, 0.18]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.9} />
      </mesh>
      <mesh ref={legR} position={[0.13, 0.32, 0]} castShadow>
        <boxGeometry args={[0.16, 0.66, 0.18]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.9} />
      </mesh>
      {/* руки */}
      <mesh position={[-0.32, 0.78, 0]} castShadow>
        <boxGeometry args={[0.13, 0.6, 0.16]} />
        <meshStandardMaterial color={coat} roughness={0.95} />
      </mesh>
      <mesh position={[0.32, 0.78, 0]} castShadow>
        <boxGeometry args={[0.13, 0.6, 0.16]} />
        <meshStandardMaterial color={coat} roughness={0.95} />
      </mesh>
      {/* голова */}
      <mesh position={[0, 1.34, 0]} castShadow>
        <boxGeometry args={[0.26, 0.28, 0.26]} />
        <meshStandardMaterial color="#e2b48c" roughness={0.9} />
      </mesh>
      {/* платок/шапка */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.3, 0.16, 0.3]} />
        <meshStandardMaterial color={scarf} roughness={1} />
      </mesh>
    </group>
  );
}
