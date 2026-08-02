import { Npc } from './Npc';

const NPC_COUNT = 7;

export function NpcCrowd() {
  return (
    <group>
      {Array.from({ length: NPC_COUNT }).map((_, i) => (
        <Npc key={i} index={i} />
      ))}
    </group>
  );
}
