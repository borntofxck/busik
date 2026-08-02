import { AnimatePresence } from 'framer-motion';
import { Experience } from './components/game/Experience';
import { HUD } from './ui/HUD';
import { Messages } from './ui/Messages';
import { Minimap } from './ui/Minimap';
import { StartScreen } from './ui/StartScreen';
import { GameOverScreen } from './ui/GameOverScreen';
import { MobileControls } from './ui/MobileControls';
import { useGameStore } from './store/gameStore';

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 3D-мир (рендерится всегда, атмосфера видна и в меню) */}
      <Experience />

      {/* атмосферные оверлеи */}
      <div className="vignette" />
      <div className="grain" />

      {/* игровой интерфейс */}
      {phase === 'playing' && (
        <>
          <HUD />
          <Minimap />
          <MobileControls />
        </>
      )}

      <Messages />

      {/* экраны меню / поражения */}
      <AnimatePresence mode="wait">
        {phase === 'menu' && <StartScreen key="start" />}
        {phase === 'over' && <GameOverScreen key="over" />}
      </AnimatePresence>
    </div>
  );
}
