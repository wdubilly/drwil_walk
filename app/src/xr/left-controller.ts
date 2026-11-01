// Manette gauche : réglage de la zone tapis (joystick, prise, X, Y). Logique pure, comme buttons.ts pour la droite.
import { newPresses, type ButtonLike } from "./buttons.ts";

/** Index « xr-standard » : prise (squeeze) 1, X 4, Y 5 ; axes du joystick 2 (X) et 3 (Y). */
export const GRIP_BUTTON = 1;
export const X_BUTTON = 4;
export const Y_BUTTON = 5;

export interface LeftReading {
  stickX: number;
  stickY: number;
  grip: boolean;
  x: boolean;
  y: boolean;
}

export const LEFT_RELEASED: LeftReading = { stickX: 0, stickY: 0, grip: false, x: false, y: false };

export interface LeftSourceLike {
  handedness: string;
  gamepad?: { axes: readonly number[]; buttons?: readonly ButtonLike[] } | null | undefined;
}

const down = (button: ButtonLike | undefined): boolean => button !== undefined && (button.pressed || button.value >= 0.5);

export function leftReading(sources: Iterable<LeftSourceLike>): LeftReading {
  for (const source of sources) {
    const pad = source.gamepad;
    if (source.handedness === "left" && pad) {
      const b = pad.buttons ?? [];
      return {
        stickX: pad.axes[2] ?? 0,
        stickY: pad.axes[3] ?? 0,
        grip: down(b[GRIP_BUTTON]),
        x: down(b[X_BUTTON]),
        y: down(b[Y_BUTTON]),
      };
    }
  }
  return LEFT_RELEASED;
}

/** Appuis nouveaux de X et Y (front montant). */
export function leftPresses(now: LeftReading, before: LeftReading): { x: boolean; y: boolean } {
  const p = newPresses({ trigger: false, a: now.x, b: now.y }, { trigger: false, a: before.x, b: before.y });
  return { x: p.a, y: p.b };
}
