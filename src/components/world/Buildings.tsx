import { useMemo } from 'react';
import type { Building } from '../../game/worldConfig';
import { WORLD_DATA } from '../../game/worldConfig';

const WOOD_COLORS = [
  '#6b5138',
  '#5a4632',
  '#7a5d40',
  '#4f3f2c',
  '#6a5a44',
  '#584a38',
];
const ROOF_COLORS = ['#3a2c22', '#2f2620', '#43342a', '#332a24'];

function House({ b }: { b: Building }) {
  const wood = WOOD_COLORS[b.colorVariant % WOOD_COLORS.length];
  const roof = ROOF_COLORS[b.colorVariant % ROOF_COLORS.length];
  const roofR = Math.max(b.width, b.depth) * 0.75;
  return (
    <group position={[b.position.x, 0, b.position.z]} rotation={[0, b.rotation, 0]}>
      {/* сруб */}
      <mesh position={[0, b.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[b.width, b.height, b.depth]} />
        <meshStandardMaterial color={wood} roughness={0.95} />
      </mesh>
      {/* брёвна-акцент */}
      <mesh position={[0, b.height * 0.32, 0]} castShadow>
        <boxGeometry args={[b.width + 0.06, 0.12, b.depth + 0.06]} />
        <meshStandardMaterial color="#3d3024" roughness={1} />
      </mesh>
      {/* двускатная крыша (пирамида) */}
      <mesh position={[0, b.height + b.height * 0.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[roofR, b.height * 0.9, 4]} />
        <meshStandardMaterial color={roof} roughness={1} flatShading />
      </mesh>
      {/* дверь */}
      <mesh position={[0, 0.9, b.depth / 2 + 0.02]}>
        <boxGeometry args={[0.9, 1.8, 0.1]} />
        <meshStandardMaterial color="#241a12" roughness={1} />
      </mesh>
      {/* окно с тусклым светом */}
      <mesh position={[b.width / 2 + 0.02, b.height * 0.55, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.7]} />
        <meshStandardMaterial
          color="#2a2a1a"
          emissive="#c98b2a"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* труба */}
      <mesh position={[b.width * 0.25, b.height + b.height * 0.7, 0]} castShadow>
        <boxGeometry args={[0.4, 0.7, 0.4]} />
        <meshStandardMaterial color="#3a3330" roughness={1} />
      </mesh>
    </group>
  );
}

function Church({ b }: { b: Building }) {
  return (
    <group position={[b.position.x, 0, b.position.z]} rotation={[0, b.rotation, 0]}>
      <mesh position={[0, b.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[b.width, b.height, b.depth]} />
        <meshStandardMaterial color="#4a3a2c" roughness={0.95} />
      </mesh>
      <mesh position={[0, b.height + 1.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[b.width * 0.8, 3, 4]} />
        <meshStandardMaterial color="#2c2320" roughness={1} flatShading />
      </mesh>
      {/* колокольня */}
      <mesh position={[0, b.height + 2.6, b.depth * 0.28]} castShadow>
        <boxGeometry args={[2.6, 5, 2.6]} />
        <meshStandardMaterial color="#42342a" roughness={0.95} />
      </mesh>
      {/* луковичный купол */}
      <mesh position={[0, b.height + 6.4, b.depth * 0.28]} castShadow>
        <sphereGeometry args={[1.7, 10, 10]} />
        <meshStandardMaterial color="#5a5240" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, b.height + 7.9, b.depth * 0.28]} castShadow>
        <coneGeometry args={[0.9, 1.6, 8]} />
        <meshStandardMaterial color="#5a5240" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* крест */}
      <mesh position={[0, b.height + 9.4, b.depth * 0.28]}>
        <boxGeometry args={[0.1, 1.2, 0.1]} />
        <meshStandardMaterial color="#c9b978" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, b.height + 9.5, b.depth * 0.28]}>
        <boxGeometry args={[0.6, 0.1, 0.1]} />
        <meshStandardMaterial color="#c9b978" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Shop({ b }: { b: Building }) {
  return (
    <group position={[b.position.x, 0, b.position.z]} rotation={[0, b.rotation, 0]}>
      <mesh position={[0, b.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[b.width, b.height, b.depth]} />
        <meshStandardMaterial color="#6a5a3a" roughness={0.9} />
      </mesh>
      {/* плоская крыша с козырьком */}
      <mesh position={[0, b.height + 0.15, 0]} castShadow>
        <boxGeometry args={[b.width + 0.4, 0.3, b.depth + 0.4]} />
        <meshStandardMaterial color="#2f2620" roughness={1} />
      </mesh>
      {/* вывеска */}
      <mesh position={[0, b.height * 0.78, b.depth / 2 + 0.1]}>
        <boxGeometry args={[b.width * 0.9, 0.8, 0.12]} />
        <meshStandardMaterial color="#7a1e1e" emissive="#b03a2a" emissiveIntensity={0.35} />
      </mesh>
      {/* полосы «вывески» */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 1.4, b.height * 0.78, b.depth / 2 + 0.17]}>
          <boxGeometry args={[0.9, 0.28, 0.04]} />
          <meshStandardMaterial color="#e8d9a8" emissive="#e8d9a8" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* витрина */}
      <mesh position={[0, 1.1, b.depth / 2 + 0.02]}>
        <boxGeometry args={[b.width * 0.7, 1.6, 0.08]} />
        <meshStandardMaterial color="#1b2226" emissive="#2a3a44" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function BusStop({ b }: { b: Building }) {
  return (
    <group position={[b.position.x, 0, b.position.z]} rotation={[0, b.rotation, 0]}>
      {/* крыша */}
      <mesh position={[0, b.height, 0]} castShadow>
        <boxGeometry args={[b.width, 0.15, b.depth + 0.6]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.9} />
      </mesh>
      {/* задняя стенка */}
      <mesh position={[0, b.height / 2, -b.depth / 2]}>
        <boxGeometry args={[b.width, b.height, 0.1]} />
        <meshStandardMaterial color="#44464c" roughness={0.9} />
      </mesh>
      {/* столбы */}
      {[-b.width / 2 + 0.15, b.width / 2 - 0.15].map((x) => (
        <mesh key={x} position={[x, b.height / 2, b.depth / 2]}>
          <boxGeometry args={[0.12, b.height, 0.12]} />
          <meshStandardMaterial color="#2f3034" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
      {/* скамейка */}
      <mesh position={[0, 0.5, -b.depth / 2 + 0.4]}>
        <boxGeometry args={[b.width - 0.4, 0.12, 0.4]} />
        <meshStandardMaterial color="#5a4632" roughness={1} />
      </mesh>
      {/* знак «остановка» */}
      <mesh position={[b.width / 2 + 0.5, 2.4, b.depth / 2]}>
        <boxGeometry args={[0.7, 0.5, 0.08]} />
        <meshStandardMaterial color="#1f5aa0" emissive="#2a6ac0" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[b.width / 2 + 0.5, 1.3, b.depth / 2]}>
        <boxGeometry args={[0.08, 2.2, 0.08]} />
        <meshStandardMaterial color="#333" metalness={0.4} />
      </mesh>
    </group>
  );
}

function Barn({ b }: { b: Building }) {
  const roofR = Math.max(b.width, b.depth) * 0.72;
  return (
    <group position={[b.position.x, 0, b.position.z]} rotation={[0, b.rotation, 0]}>
      {/* три стены (передняя открыта — можно зайти) */}
      <mesh position={[0, b.height / 2, -b.depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[b.width, b.height, 0.25]} />
        <meshStandardMaterial color="#4a3524" roughness={1} />
      </mesh>
      <mesh position={[-b.width / 2, b.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.25, b.height, b.depth]} />
        <meshStandardMaterial color="#4a3524" roughness={1} />
      </mesh>
      <mesh position={[b.width / 2, b.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.25, b.height, b.depth]} />
        <meshStandardMaterial color="#4a3524" roughness={1} />
      </mesh>
      {/* верх передней стены (перемычка над входом) */}
      <mesh position={[0, b.height - 0.6, b.depth / 2]} castShadow>
        <boxGeometry args={[b.width, 1.2, 0.25]} />
        <meshStandardMaterial color="#43301f" roughness={1} />
      </mesh>
      {/* крыша */}
      <mesh position={[0, b.height + 0.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[roofR, 2.4, 4]} />
        <meshStandardMaterial color="#2a2018" roughness={1} flatShading />
      </mesh>
      {/* пол/сено внутри */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[b.width - 0.4, 0.1, b.depth - 0.4]} />
        <meshStandardMaterial color="#5a4a2a" roughness={1} />
      </mesh>
      {/* стожок сена */}
      <mesh position={[b.width * 0.25, 0.6, -b.depth * 0.2]} castShadow>
        <cylinderGeometry args={[0.8, 1, 1.2, 8]} />
        <meshStandardMaterial color="#a58b3a" roughness={1} />
      </mesh>
    </group>
  );
}

function Well({ b }: { b: Building }) {
  return (
    <group position={[b.position.x, 0, b.position.z]} rotation={[0, b.rotation, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.75, 1, 10]} />
        <meshStandardMaterial color="#4a4038" roughness={1} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.15, 10]} />
        <meshStandardMaterial color="#12100e" roughness={1} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 1.4, 0]} castShadow>
          <boxGeometry args={[0.12, 1.6, 0.12]} />
          <meshStandardMaterial color="#3a2f24" roughness={1} />
        </mesh>
      ))}
      {/* крыша */}
      <mesh position={[0, 2.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1, 0.7, 4]} />
        <meshStandardMaterial color="#2c231b" roughness={1} flatShading />
      </mesh>
      {/* ведро */}
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

export function Buildings() {
  const buildings = useMemo(() => WORLD_DATA.buildings, []);
  return (
    <group>
      {buildings.map((b) => {
        switch (b.type) {
          case 'house':
            return <House key={b.id} b={b} />;
          case 'church':
            return <Church key={b.id} b={b} />;
          case 'shop':
            return <Shop key={b.id} b={b} />;
          case 'busstop':
            return <BusStop key={b.id} b={b} />;
          case 'barn':
            return <Barn key={b.id} b={b} />;
          case 'well':
            return <Well key={b.id} b={b} />;
          default:
            return null;
        }
      })}
    </group>
  );
}
