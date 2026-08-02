import { useGameStore } from '../store/gameStore';
import { Bus } from './Bus';

// Рендерит столько бусиков, сколько задаёт текущая сложность.
export function BusFleet() {
  const busCount = useGameStore((s) => s.busCount);
  return (
    <group>
      {Array.from({ length: busCount }).map((_, i) => (
        <Bus key={i} index={i} />
      ))}
    </group>
  );
}
