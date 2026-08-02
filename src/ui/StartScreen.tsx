import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const best = useGameStore((s) => s.best);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-6 text-center"
    >
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-3 max-w-2xl text-3xl md:text-5xl font-bold leading-tight text-stone-100 animate-flicker"
        style={{ textShadow: '0 4px 24px rgba(0,0,0,0.9)' }}
      >
        Славян решил переждать
        <br /> всё в деревне…
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="mb-8 max-w-xl text-sm md:text-base text-stone-300/90"
      >
        По разбитым дорогам катаются смешные бусики и ищут его.
        <br />
        Прячься за домами, в сарае и в лесу. Собирай припасы. Продержись
        как можно дольше.
      </motion.p>

      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={startGame}
        className="pointer-events-auto rounded-lg border border-emerald-400/40 bg-emerald-700/70 px-10 py-3 text-lg font-semibold text-white shadow-xl transition-colors hover:bg-emerald-600/80"
      >
        Играть
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="mt-8 text-xs text-stone-400/80 space-y-1"
      >
        <div>
          <span className="rounded bg-white/10 px-2 py-0.5">W A S D</span> — движение,{' '}
          <span className="rounded bg-white/10 px-2 py-0.5">Shift</span> — бежать
        </div>
        <div>На телефоне — джойстик слева и кнопка бега справа</div>
        {best > 0 && (
          <div className="pt-2 text-amber-300/80">
            🏆 твой рекорд: {best.toLocaleString('ru-RU')}
          </div>
        )}
      </motion.div>

      <div className="mt-6 max-w-md text-[10px] leading-relaxed text-stone-500/70">
        Это шуточная пародия для друзей. Без политики и всерьёз — просто
        Славян, деревня и настырные бусики.
      </div>
    </motion.div>
  );
}
