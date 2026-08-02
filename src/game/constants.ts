// Глобальные игровые константы и баланс.

export const WORLD = {
  /** Половина размера мира (мир: [-HALF, HALF] по X и Z). */
  HALF: 105,
  GROUND_Y: 0,
};

export const PLAYER = {
  HEIGHT: 1.85,
  RADIUS: 0.45,
  WALK_SPEED: 6.2,
  SPRINT_SPEED: 10.5,
  ACCEL: 22,
  TURN_LERP: 0.18,
  MAX_HEALTH: 100,
  MAX_STAMINA: 100,
  /** Расход выносливости в секунду при спринте. */
  STAMINA_DRAIN: 24,
  /** Восстановление выносливости в секунду. */
  STAMINA_REGEN: 16,
  /** Порог выносливости, ниже которого нельзя начать спринт. */
  STAMINA_MIN_SPRINT: 6,
};

export const BUS = {
  BASE_SPEED: 8.5,
  BASE_PATROL_SPEED: 6.0,
  /** Базовый радиус обнаружения (растёт со сложностью). */
  BASE_DETECT_RADIUS: 17,
  /** Полуугол поля зрения (радианы). */
  FOV_HALF: Math.PI * 0.42,
  /** Насколько быстро копится «тревога» при виде игрока. */
  AWARE_GAIN: 1.9,
  /** Насколько быстро тревога спадает без игрока. */
  AWARE_DECAY: 0.5,
  /** Дистанция поимки. */
  CATCH_RADIUS: 3.2,
  WIDTH: 2.1,
  LENGTH: 4.6,
  HEIGHT: 2.3,
};

export const DIFFICULTY = {
  /** Интервал усложнения (сек) — каждые 2 минуты. */
  STEP_SECONDS: 120,
  /** Момент «настоящего хаоса» (сек) — 15 минут. */
  CHAOS_SECONDS: 15 * 60,
  START_BUSES: 3,
  MAX_BUSES: 12,
  /** Прирост скорости патруля за шаг. */
  SPEED_PER_STEP: 0.9,
  /** Прирост радиуса обнаружения за шаг. */
  RADIUS_PER_STEP: 2.2,
};

export const CHASE = {
  /** Порог тревоги (0..1) для начала погони. */
  ALARM_THRESHOLD: 0.75,
  /** Сколько секунд без контакта нужно, чтобы оторваться. */
  ESCAPE_SECONDS: 7,
  /** Радиус, в котором бусик «держит контакт» во время погони. */
  CONTACT_RADIUS: 26,
};

export const SCORE = {
  /** Очки за секунду выживания. */
  PER_SECOND: 5,
  PER_ESCAPE: 250,
  PER_SUPPLY: 120,
};

export const SUPPLY = {
  MAX_ON_MAP: 7,
  SPAWN_INTERVAL: 6,
  PICKUP_RADIUS: 2.2,
  COFFEE_BOOST: 1.5,
  ENERGY_BOOST: 1.7,
  BOOST_DURATION: 6,
  NOODLE_HEAL: 22,
};

export const BEST_SCORE_KEY = 'slavyan_best_score_v1';
