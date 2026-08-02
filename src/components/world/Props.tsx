// Мелкий реквизит деревни: трактор, тюки сена, поленница.

function Tractor({ x, z, r }: { x: number; z: number; r: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, r, 0]}>
      {/* корпус */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.4, 0.9, 2.6]} />
        <meshStandardMaterial color="#7a3320" roughness={0.8} />
      </mesh>
      {/* капот */}
      <mesh position={[0, 0.8, 1.4]} castShadow>
        <boxGeometry args={[1.1, 0.7, 1]} />
        <meshStandardMaterial color="#8a3a24" roughness={0.8} />
      </mesh>
      {/* кабина */}
      <mesh position={[0, 1.9, -0.4]} castShadow>
        <boxGeometry args={[1.2, 1.1, 1.2]} />
        <meshStandardMaterial color="#2f3a40" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* труба */}
      <mesh position={[0.4, 1.9, 1.4]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* задние большие колёса */}
      {[0.85, -0.85].map((sx) => (
        <mesh key={sx} position={[sx, 0.8, -0.7]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.4, 12]} />
          <meshStandardMaterial color="#161616" roughness={1} />
        </mesh>
      ))}
      {/* передние маленькие колёса */}
      {[0.7, -0.7].map((sx) => (
        <mesh key={sx} position={[sx, 0.45, 1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 10]} />
          <meshStandardMaterial color="#161616" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function HayBale({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.7, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.7, 0.7, 1.4, 12]} />
      <meshStandardMaterial color="#9a8438" roughness={1} />
    </mesh>
  );
}

function WoodPile({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[(i % 4) * 0.28 - 0.4, 0.25 + Math.floor(i / 4) * 0.28, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.13, 0.13, 1.4, 6]} />
          <meshStandardMaterial color="#4a3826" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function Props() {
  return (
    <group>
      <Tractor x={58} z={2} r={0.6} />
      <Tractor x={-46} z={-42} r={-1.1} />
      <HayBale x={50} z={12} />
      <HayBale x={52.5} z={12.5} />
      <HayBale x={-24} z={62} />
      <WoodPile x={20} z={-8} />
      <WoodPile x={-14} z={-30} />
    </group>
  );
}
