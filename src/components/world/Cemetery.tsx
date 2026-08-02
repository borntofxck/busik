import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { WORLD_DATA } from '../../game/worldConfig';

const dummy = new THREE.Object3D();

export function Cemetery() {
  const crosses = useMemo(() => WORLD_DATA.graves.filter((g) => g.kind === 0), []);
  const plates = useMemo(() => WORLD_DATA.graves.filter((g) => g.kind === 1), []);

  const vRef = useRef<THREE.InstancedMesh>(null);
  const hRef = useRef<THREE.InstancedMesh>(null);
  const plateRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    crosses.forEach((g, i) => {
      dummy.position.set(g.position.x, 0.6, g.position.z);
      dummy.rotation.set(0, g.rotation, g.rotation * 0.4);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      vRef.current?.setMatrixAt(i, dummy.matrix);
      hRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (vRef.current) vRef.current.instanceMatrix.needsUpdate = true;
    if (hRef.current) hRef.current.instanceMatrix.needsUpdate = true;

    plates.forEach((g, i) => {
      dummy.position.set(g.position.x, 0.45, g.position.z);
      dummy.rotation.set(0.1, g.rotation, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      plateRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (plateRef.current) plateRef.current.instanceMatrix.needsUpdate = true;
  }, [crosses, plates]);

  return (
    <group>
      {/* вертикальные балки крестов */}
      <instancedMesh ref={vRef} args={[undefined, undefined, Math.max(1, crosses.length)]} castShadow>
        <boxGeometry args={[0.12, 1.2, 0.12]} />
        <meshStandardMaterial color="#3a3229" roughness={1} />
      </instancedMesh>
      {/* горизонтальные перекладины */}
      <instancedMesh ref={hRef} args={[undefined, undefined, Math.max(1, crosses.length)]} castShadow>
        <boxGeometry args={[0.6, 0.12, 0.12]} />
        <meshStandardMaterial color="#3a3229" roughness={1} />
      </instancedMesh>
      {/* плиты */}
      <instancedMesh ref={plateRef} args={[undefined, undefined, Math.max(1, plates.length)]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.16]} />
        <meshStandardMaterial color="#54514c" roughness={1} />
      </instancedMesh>
    </group>
  );
}
