import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { WORLD_DATA } from '../../game/worldConfig';

const dummy = new THREE.Object3D();
const color = new THREE.Color();

// Инстансинг деревьев: одна отрисовка на стволы и на каждый тип кроны.
export function Trees() {
  const { trunks, spruces, leafies } = useMemo(() => {
    const trunks = WORLD_DATA.trees;
    return {
      trunks,
      spruces: WORLD_DATA.trees.filter((t) => t.kind === 0),
      leafies: WORLD_DATA.trees.filter((t) => t.kind === 1),
    };
  }, []);

  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const spruceRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (trunkRef.current) {
      trunks.forEach((t, i) => {
        dummy.position.set(t.position.x, (1.2 * t.scale) / 2, t.position.z);
        dummy.rotation.set(0, t.rotation, 0);
        dummy.scale.set(t.scale, t.scale, t.scale);
        dummy.updateMatrix();
        trunkRef.current!.setMatrixAt(i, dummy.matrix);
      });
      trunkRef.current.instanceMatrix.needsUpdate = true;
    }

    if (spruceRef.current) {
      spruces.forEach((t, i) => {
        dummy.position.set(t.position.x, 1.2 * t.scale + 1.4 * t.scale, t.position.z);
        dummy.rotation.set(0, t.rotation, 0);
        dummy.scale.set(t.scale, t.scale, t.scale);
        dummy.updateMatrix();
        spruceRef.current!.setMatrixAt(i, dummy.matrix);
        color.setHSL(0.28, 0.35, 0.16 + (i % 5) * 0.012);
        spruceRef.current!.setColorAt(i, color);
      });
      spruceRef.current.instanceMatrix.needsUpdate = true;
      if (spruceRef.current.instanceColor) spruceRef.current.instanceColor.needsUpdate = true;
    }

    if (leafRef.current) {
      leafies.forEach((t, i) => {
        dummy.position.set(t.position.x, 1.2 * t.scale + 1.1 * t.scale, t.position.z);
        dummy.rotation.set(0, t.rotation, 0);
        dummy.scale.set(t.scale * 1.2, t.scale * 1.1, t.scale * 1.2);
        dummy.updateMatrix();
        leafRef.current!.setMatrixAt(i, dummy.matrix);
        color.setHSL(0.22, 0.3, 0.18 + (i % 5) * 0.012);
        leafRef.current!.setColorAt(i, color);
      });
      leafRef.current.instanceMatrix.needsUpdate = true;
      if (leafRef.current.instanceColor) leafRef.current.instanceColor.needsUpdate = true;
    }
  }, [trunks, spruces, leafies]);

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, trunks.length]}
        castShadow
        receiveShadow
        frustumCulled
      >
        <cylinderGeometry args={[0.12, 0.2, 1.2, 5]} />
        <meshStandardMaterial color="#3a2b1e" roughness={1} />
      </instancedMesh>

      <instancedMesh
        ref={spruceRef}
        args={[undefined, undefined, Math.max(1, spruces.length)]}
        castShadow
        frustumCulled
      >
        <coneGeometry args={[1.1, 3.2, 6]} />
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </instancedMesh>

      <instancedMesh
        ref={leafRef}
        args={[undefined, undefined, Math.max(1, leafies.length)]}
        castShadow
        frustumCulled
      >
        <icosahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </instancedMesh>
    </group>
  );
}
