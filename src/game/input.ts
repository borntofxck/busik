// Общий стейт ввода (клавиатура + мобильный джойстик), читается игровым циклом.

export interface InputState {
  forward: number; // -1..1 (вперёд/назад)
  strafe: number; // -1..1 (влево/вправо)
  sprint: boolean;
}

export const input: InputState = {
  forward: 0,
  strafe: 0,
  sprint: false,
};

const keys = new Set<string>();

function recompute(): void {
  let f = 0;
  let s = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) f += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) f -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) s += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) s -= 1;
  input.forward = f;
  input.strafe = s;
  input.sprint = keys.has('ShiftLeft') || keys.has('ShiftRight');
}

function onKeyDown(e: KeyboardEvent): void {
  keys.add(e.code);
  if (
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)
  ) {
    e.preventDefault();
  }
  recompute();
}

function onKeyUp(e: KeyboardEvent): void {
  keys.delete(e.code);
  recompute();
}

let bound = false;

export function bindKeyboard(): () => void {
  if (bound) return () => undefined;
  bound = true;
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  const clear = () => {
    keys.clear();
    recompute();
  };
  window.addEventListener('blur', clear);
  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', clear);
    keys.clear();
    bound = false;
  };
}

// Мобильный джойстик пишет сюда напрямую.
export function setJoystick(forward: number, strafe: number): void {
  input.forward = forward;
  input.strafe = strafe;
}

export function setSprint(v: boolean): void {
  input.sprint = v;
}
