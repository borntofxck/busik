import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Смешной low-poly микроавтобус («бусик»).
export function BusModel({ alert = false }: { alert?: boolean }) {
  const light = useRef<THREE.MeshStandardMaterial>(null);
  const blink = useRef(0);

  useFrame((_, dt) => {
    if (!light.current) return;
    if (alert) {
      blink.current += dt * 8;
      light.current.emissiveIntensity = 1.2 + Math.sin(blink.current) * 1.2;
    } else {
      light.current.emissiveIntensity = 0;
    }
  });

  return (
    <group>
      {/* корпус */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[2.1, 1.5, 4.4]} />
        <meshStandardMaterial color="#d8d5cc" roughness={0.7} />
      </mesh>
      {/* «морда» пониже */}
      <mesh position={[0, 0.75, 2.15]} castShadow>
        <boxGeometry args={[2.05, 0.9, 0.5]} />
        <meshStandardMaterial color="#c8c4ba" roughness={0.7} />
      </mesh>
      {/* крыша со скосом */}
      <mesh position={[0, 1.95, -0.1]} castShadow>
        <boxGeometry args={[1.95, 0.35, 3.9]} />
        <meshStandardMaterial color="#b9b6ac" roughness={0.8} />
      </mesh>

      {/* лобовое стекло */}
      <mesh position={[0, 1.45, 2.28]}>
        <boxGeometry args={[1.7, 0.7, 0.08]} />
        <meshStandardMaterial color="#20323c" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* боковые окна */}
      <mesh position={[1.06, 1.5, -0.2]}>
        <boxGeometry args={[0.06, 0.6, 2.6]} />
        <meshStandardMaterial color="#20323c" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh position={[-1.06, 1.5, -0.2]}>
        <boxGeometry args={[0.06, 0.6, 2.6]} />
        <meshStandardMaterial color="#20323c" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* фары */}
      <mesh position={[0.7, 0.7, 2.42]}>
        <boxGeometry args={[0.3, 0.2, 0.08]} />
        <meshStandardMaterial color="#fff3c0" emissive="#ffe89a" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.7, 0.7, 2.42]}>
        <boxGeometry args={[0.3, 0.2, 0.08]} />
        <meshStandardMaterial color="#fff3c0" emissive="#ffe89a" emissiveIntensity={0.8} />
      </mesh>

      {/* мигалка на крыше (загорается в погоне) */}
      <mesh position={[0, 2.25, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshStandardMaterial
          ref={light}
          color="#7a1616"
          emissive="#ff2a2a"
          emissiveIntensity={0}
        />
      </mesh>

      {/* колёса */}
      {(
        [
          [0.95, 0.45, 1.5],
          [-0.95, 0.45, 1.5],
          [0.95, 0.45, -1.5],
          [-0.95, 0.45, -1.5],
        ] as const
      ).map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 10]} />
          <meshStandardMaterial color="#141414" roughness={0.9} />
        </mesh>
      ))}

      {/* бампер */}
      <mesh position={[0, 0.4, 2.35]}>
        <boxGeometry args={[2.0, 0.25, 0.2]} />
        <meshStandardMaterial color="#5a5750" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}
