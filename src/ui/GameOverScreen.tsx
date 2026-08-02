import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

function formatMinutes(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} сек`;
  return `${m} мин ${s.toString().padStart(2, '0')} сек`;
}

export function GameOverScreen() {
  const finalTime = useGameStore((s) => s.finalTime);
  const finalEscapes = useGameStore((s) => s.finalEscapes);
  const finalScore = useGameStore((s) => s.finalScore);
  const best = useGameStore((s) => s.best);
  const startGame = useGameStore((s) => s.startGame);

  const isRecord = finalScore >= best && finalScore > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm px-6 text-center"
    >
      <motion.h1
        initial={{ scale: 1.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="mb-6 text-4xl md:text-6xl font-extrabold tracking-widest text-red-500"
        style={{ textShadow: '0 4px 30px rgba(180,0,0,0.7)' }}
      >
        СЛАВЯН ПОЙМАН
      </motion.h1>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-8 grid grid-cols-1 gap-2 text-lg text-stone-200"
      >
        <div>
          Выжил: <span className="font-semibold text-white">{formatMinutes(finalTime)}</span>
        </div>
        <div>
          Побегов: <span className="font-semibold text-white">{finalEscapes}</span>
        </div>
        <div>
          Очков:{' '}
          <span className="font-semibold text-amber-300">
            {finalScore.toLocaleString('ru-RU')}
          </span>
        </div>
        {isRecord && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-2 text-amber-400 font-bold"
          >
            🏆 НОВЫЙ РЕКОРД!
          </motion.div>
        )}
        {!isRecord && best > 0 && (
          <div className="mt-1 text-xs text-stone-400">
            рекорд: {best.toLocaleString('ru-RU')}
          </div>
        )}
      </motion.div>

      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={startGame}
        className="pointer-events-auto rounded-lg border border-emerald-400/40 bg-emerald-700/70 px-10 py-3 text-lg font-semibold text-white shadow-xl transition-colors hover:bg-emerald-600/80"
      >
        Играть снова
      </motion.button>

      <div className="mt-6 text-xs text-stone-500/80 italic">
        «Да я просто мимо проходил…» — Славян
      </div>
    </motion.div>
  );
}
