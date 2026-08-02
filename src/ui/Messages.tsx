import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore, type MessageKind } from '../store/gameStore';

const KIND_STYLE: Record<MessageKind, string> = {
  info: 'bg-black/55 border-white/15 text-stone-100',
  warn: 'bg-amber-900/55 border-amber-500/40 text-amber-100',
  danger: 'bg-red-900/60 border-red-500/50 text-red-100',
  fun: 'bg-emerald-900/45 border-emerald-500/35 text-emerald-50',
};

export function Messages() {
  const messages = useGameStore((s) => s.messages);
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className={`rounded-lg border px-4 py-2 text-center text-sm shadow-lg backdrop-blur-sm ${KIND_STYLE[m.kind]}`}
          >
            {m.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
