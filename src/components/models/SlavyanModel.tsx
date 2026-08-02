import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { runtime } from '../../game/runtime';

// Процедурная low-poly модель Славяна: худой, высокий,
// светлые короткие кудри, синий пиджак, белая рубашка, тёмные штаны.
export function SlavyanModel() {
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  const prev = useRef(new THREE.Vector3().copy(runtime.player.pos));
  const phase = useRef(0);
  const speedSmooth = useRef(0);

  useFrame((_, dt) => {
    const cur = runtime.player.pos;
    const moved = Math.hypot(cur.x - prev.current.x, cur.z - prev.current.z);
    prev.current.copy(cur);
    const speed = dt > 0 ? moved / dt : 0;
    speedSmooth.current += (speed - speedSmooth.current) * Math.min(1, dt * 10);

    const s = speedSmooth.current;
    phase.current += dt * (2.5 + s * 0.9);
    const swing = Math.sin(phase.current) * Math.min(0.9, s * 0.12);

    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.8;
    if (armR.current) armR.current.rotation.x = swing * 0.8;

    // лёгкое покачивание корпуса
    if (body.current) {
      body.current.position.y = 0.9 + Math.abs(Math.sin(phase.current)) * Math.min(0.06, s * 0.008);
    }
  });

  return (
    <group>
      <group ref={body}>
        {/* Ноги (тёмные штаны) */}
        <group ref={legL} position={[-0.16, 0.02, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <boxGeometry args={[0.19, 0.86, 0.22]} />
            <meshStandardMaterial color="#22242c" roughness={0.9} />
          </mesh>
          {/* туфля */}
          <mesh position={[0, -0.87, 0.05]} castShadow>
            <boxGeometry args={[0.2, 0.12, 0.34]} />
            <meshStandardMaterial color="#0b0b0d" roughness={0.4} metalness={0.1} />
          </mesh>
        </group>
        <group ref={legR} position={[0.16, 0.02, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <boxGeometry args={[0.19, 0.86, 0.22]} />
            <meshStandardMaterial color="#22242c" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.87, 0.05]} castShadow>
            <boxGeometry args={[0.2, 0.12, 0.34]} />
            <meshStandardMaterial color="#0b0b0d" roughness={0.4} metalness={0.1} />
          </mesh>
        </group>

        {/* Торс — синий пиджак */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.52, 0.86, 0.3]} />
          <meshStandardMaterial color="#1b3a63" roughness={0.75} />
        </mesh>
        {/* Белая рубашка (клин на груди) */}
        <mesh position={[0, 0.5, 0.16]} castShadow>
          <boxGeometry args={[0.16, 0.5, 0.04]} />
          <meshStandardMaterial color="#eef0f2" roughness={0.6} />
        </mesh>
        {/* лацканы (чуть темнее синего) */}
        <mesh position={[0, 0.62, 0.155]} rotation={[0, 0, 0.5]} castShadow>
          <boxGeometry args={[0.1, 0.28, 0.03]} />
          <meshStandardMaterial color="#142a4a" roughness={0.7} />
        </mesh>

        {/* Руки — рукава пиджака */}
        <group ref={armL} position={[-0.33, 0.72, 0]}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <boxGeometry args={[0.15, 0.72, 0.18]} />
            <meshStandardMaterial color="#1b3a63" roughness={0.75} />
          </mesh>
          {/* кисть */}
          <mesh position={[0, -0.72, 0]} castShadow>
            <boxGeometry args={[0.13, 0.14, 0.15]} />
            <meshStandardMaterial color="#e8bd9a" roughness={0.8} />
          </mesh>
        </group>
        <group ref={armR} position={[0.33, 0.72, 0]}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <boxGeometry args={[0.15, 0.72, 0.18]} />
            <meshStandardMaterial color="#1b3a63" roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.72, 0]} castShadow>
            <boxGeometry args={[0.13, 0.14, 0.15]} />
            <meshStandardMaterial color="#e8bd9a" roughness={0.8} />
          </mesh>
        </group>

        {/* Шея */}
        <mesh position={[0, 0.94, 0]} castShadow>
          <boxGeometry args={[0.14, 0.12, 0.14]} />
          <meshStandardMaterial color="#e8bd9a" roughness={0.8} />
        </mesh>

        {/* Голова */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.28, 0.32, 0.28]} />
          <meshStandardMaterial color="#eec3a1" roughness={0.85} />
        </mesh>
        {/* Светлые кудрявые волосы (несколько кубиков) */}
        <group position={[0, 1.28, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.14, 0.32]} />
            <meshStandardMaterial color="#c9a05a" roughness={1} />
          </mesh>
          <mesh position={[-0.1, 0.05, 0.1]} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.12]} />
            <meshStandardMaterial color="#d4ac66" roughness={1} />
          </mesh>
          <mesh position={[0.11, 0.06, -0.05]} castShadow>
            <boxGeometry args={[0.11, 0.09, 0.11]} />
            <meshStandardMaterial color="#c49a52" roughness={1} />
          </mesh>
          <mesh position={[0.02, 0.05, 0.12]} castShadow>
            <boxGeometry args={[0.1, 0.09, 0.1]} />
            <meshStandardMaterial color="#d4ac66" roughness={1} />
          </mesh>
        </group>
        {/* Глаза */}
        <mesh position={[-0.06, 1.12, 0.145]}>
          <boxGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.06, 1.12, 0.145]}>
          <boxGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>
    </group>
  );
}
