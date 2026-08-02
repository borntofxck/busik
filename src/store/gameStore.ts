import { create } from 'zustand';
import { BEST_SCORE_KEY, PLAYER, SUPPLY } from '../game/constants';
import { runtime } from '../game/runtime';

export type Phase = 'menu' | 'playing' | 'over';

export type SupplyType = 'coffee' | 'energy' | 'noodle' | 'cucumber';

export interface Supply {
  id: number;
  type: SupplyType;
  x: number;
  z: number;
}

export type MessageKind = 'info' | 'warn' | 'danger' | 'fun';

export interface GameMessage {
  id: number;
  text: string;
  kind: MessageKind;
}

export const SUPPLY_EMOJI: Record<SupplyType, string> = {
  coffee: '☕',
  energy: '🥤',
  noodle: '🍜',
  cucumber: '🥒',
};

interface GameStore {
  phase: Phase;
  best: number;

  // Зеркало HUD (обновляется из игрового цикла ~10 Гц)
  health: number;
  stamina: number;
  speedMul: number;
  time: number;
  score: number;
  escapes: number;
  supplies: number;

  alarmActive: boolean;
  busCount: number;
  difficultyLevel: number;
  chaos: boolean;

  supplyItems: Supply[];
  messages: GameMessage[];

  // final snapshot
  finalTime: number;
  finalEscapes: number;
  finalScore: number;

  startGame: () => void;
  endGame: () => void;

  syncHud: (v: {
    health: number;
    stamina: number;
    speedMul: number;
    time: number;
    score: number;
    escapes: number;
    supplies: number;
  }) => void;
  setAlarm: (active: boolean) => void;
  setBusCount: (n: number) => void;
  setDifficulty: (level: number, chaos: boolean) => void;

  setSupplyItems: (items: Supply[]) => void;
  collectSupply: (id: number) => void;

  pushMessage: (text: string, kind?: MessageKind) => void;
  removeMessage: (id: number) => void;
}

function loadBest(): number {
  try {
    const v = localStorage.getItem(BEST_SCORE_KEY);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveBest(v: number): void {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(v));
  } catch {
    /* ignore */
  }
}

let messageId = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'menu',
  best: loadBest(),

  health: PLAYER.MAX_HEALTH,
  stamina: PLAYER.MAX_STAMINA,
  speedMul: 1,
  time: 0,
  score: 0,
  escapes: 0,
  supplies: 0,

  alarmActive: false,
  busCount: 0,
  difficultyLevel: 0,
  chaos: false,

  supplyItems: [],
  messages: [],

  finalTime: 0,
  finalEscapes: 0,
  finalScore: 0,

  startGame: () =>
    set({
      phase: 'playing',
      health: PLAYER.MAX_HEALTH,
      stamina: PLAYER.MAX_STAMINA,
      speedMul: 1,
      time: 0,
      score: 0,
      escapes: 0,
      supplies: 0,
      alarmActive: false,
      difficultyLevel: 0,
      chaos: false,
      supplyItems: [],
      messages: [],
    }),

  endGame: () => {
    const { score, best } = get();
    const nextBest = Math.max(best, score);
    if (nextBest > best) saveBest(nextBest);
    set({
      phase: 'over',
      best: nextBest,
      finalTime: get().time,
      finalEscapes: get().escapes,
      finalScore: score,
      alarmActive: false,
    });
  },

  syncHud: (v) => set(v),

  setAlarm: (active) => {
    if (get().alarmActive !== active) set({ alarmActive: active });
  },

  setBusCount: (n) => set({ busCount: n }),

  setDifficulty: (level, chaos) => {
    if (get().difficultyLevel !== level || get().chaos !== chaos) {
      set({ difficultyLevel: level, chaos });
    }
  },

  setSupplyItems: (items) => set({ supplyItems: items }),

  collectSupply: (id) => {
    const item = get().supplyItems.find((s) => s.id === id);
    if (!item) return;
    set({ supplyItems: get().supplyItems.filter((s) => s.id !== id) });

    const s = runtime.stats;
    s.supplies += 1;
    switch (item.type) {
      case 'coffee':
        s.boostMul = SUPPLY.COFFEE_BOOST;
        s.boostUntil = runtime.time + SUPPLY.BOOST_DURATION;
        get().pushMessage('Кофе! Теперь Славян бодрячком ☕', 'fun');
        break;
      case 'energy':
        s.boostMul = SUPPLY.ENERGY_BOOST;
        s.boostUntil = runtime.time + SUPPLY.BOOST_DURATION;
        get().pushMessage('Энергетик залпом! 🥤 Ноги сами несут', 'fun');
        break;
      case 'noodle':
        s.health = Math.min(PLAYER.MAX_HEALTH, s.health + SUPPLY.NOODLE_HEAL);
        get().pushMessage('Дошик восстановил силы 🍜', 'fun');
        break;
      case 'cucumber':
        get().pushMessage('Огурец. Просто огурец 🥒', 'fun');
        break;
    }
  },

  pushMessage: (text, kind = 'info') => {
    const id = ++messageId;
    set({ messages: [...get().messages.slice(-4), { id, text, kind }] });
    window.setTimeout(() => get().removeMessage(id), 4200);
  },

  removeMessage: (id) =>
    set({ messages: get().messages.filter((m) => m.id !== id) }),
}));
