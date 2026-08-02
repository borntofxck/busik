import { useEffect, useRef, useState } from 'react';
import { setJoystick, setSprint } from '../game/input';

// Экранный джойстик и кнопка бега для тач-устройств.
export function MobileControls() {
  const [isTouch, setIsTouch] = useState(false);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<number | null>(null);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window || navigator.maxTouchPoints > 0,
    );
  }, []);

  if (!isTouch) return null;

  const RADIUS = 55;

  const updateFromTouch = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    // forward: вверх = вперёд; strafe: вправо = вправо
    setJoystick(-dy / RADIUS, dx / RADIUS);
  };

  const reset = () => {
    activeId.current = null;
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)';
    setJoystick(0, 0);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none md:hidden">
      {/* джойстик слева снизу */}
      <div
        ref={baseRef}
        className="pointer-events-auto absolute bottom-8 left-8 h-32 w-32 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
        onTouchStart={(e) => {
          const t = e.changedTouches[0];
          activeId.current = t.identifier;
          updateFromTouch(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          for (const t of Array.from(e.changedTouches)) {
            if (t.identifier === activeId.current) {
              updateFromTouch(t.clientX, t.clientY);
            }
          }
        }}
        onTouchEnd={reset}
        onTouchCancel={reset}
      >
        <div
          ref={knobRef}
          className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25"
          style={{ willChange: 'transform' }}
        />
      </div>

      {/* кнопка бега справа снизу */}
      <button
        className="pointer-events-auto absolute bottom-12 right-10 h-24 w-24 rounded-full border border-emerald-300/30 bg-emerald-600/40 text-3xl active:bg-emerald-500/60"
        onTouchStart={(e) => {
          e.preventDefault();
          setSprint(true);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          setSprint(false);
        }}
        onTouchCancel={() => setSprint(false)}
      >
        🏃
      </button>
    </div>
  );
}
