import { useGameStore } from '../store/gameStore';
import { PLAYER } from '../game/constants';

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function Stat({
  icon,
  value,
  max,
  color,
}: {
  icon: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg w-6 text-center">{icon}</span>
      <div className="hud-bar w-40">
        <span style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function HUD() {
  const health = useGameStore((s) => s.health);
  const stamina = useGameStore((s) => s.stamina);
  const speedMul = useGameStore((s) => s.speedMul);
  const time = useGameStore((s) => s.time);
  const score = useGameStore((s) => s.score);
  const best = useGameStore((s) => s.best);
  const alarm = useGameStore((s) => s.alarmActive);
  const chaos = useGameStore((s) => s.chaos);
  const busCount = useGameStore((s) => s.busCount);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none">
      {/* слева сверху */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 text-stroke">
        <Stat icon="❤️" value={health} max={PLAYER.MAX_HEALTH} color="#d64545" />
        <Stat icon="⚡" value={stamina} max={PLAYER.MAX_STAMINA} color="#3aa0e0" />
        <div className="flex items-center gap-2">
          <span className="text-lg w-6 text-center">🏃</span>
          <span className="text-sm tabular-nums opacity-90">
            x{speedMul.toFixed(2)}
          </span>
        </div>
      </div>

      {/* справа сверху */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1 text-stroke tabular-nums">
        <div className="text-2xl font-semibold">⏱ {formatTime(time)}</div>
        <div className="text-lg">🏆 {score.toLocaleString('ru-RU')}</div>
        <div className="text-xs opacity-70">рекорд: {best.toLocaleString('ru-RU')}</div>
        <div className="text-xs opacity-70">🚐 патрулей: {busCount}</div>
      </div>

      {/* индикатор погони */}
      {alarm && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/90 text-4xl font-bold tracking-widest animate-pulse text-stroke">
          ПОГОНЯ!
        </div>
      )}
      {chaos && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-amber-400/80 text-sm tracking-wider text-stroke">
          РЕЖИМ ХАОСА
        </div>
      )}

      {/* красная рамка при тревоге */}
      {alarm && (
        <div
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 140px rgba(200,20,20,0.55)',
          }}
        />
      )}
    </div>
  );
}
