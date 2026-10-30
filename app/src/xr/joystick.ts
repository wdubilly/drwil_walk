// Joystick droit (MISSION.md, « Contrôles ») : un cran de vitesse par poussée, logique pure.
// Pousser le joystick vers le haut donne un axe Y négatif (gamepad « xr-standard »).

/** Au-delà de cette amplitude, la poussée compte comme un cran. */
export const PUSH_THRESHOLD = 0.6;
/** En deçà, le joystick est revenu au centre et peut compter un nouveau cran. */
export const RELEASE_THRESHOLD = 0.2;
/** Index de l'axe vertical du joystick dans `Gamepad.axes` (mapping « xr-standard »). */
export const THUMBSTICK_Y_AXIS = 3;

export interface JoystickState {
  /** Vrai tant qu'une poussée déjà comptée n'est pas relâchée. */
  held: boolean;
}

export const JOYSTICK_RELEASED: JoystickState = { held: false };

/** Crans de vitesse (+1, -1 ou 0) pour une lecture de l'axe Y, et le nouvel état. */
export function readSpeedSteps(axisY: number, state: JoystickState): { steps: number; state: JoystickState } {
  const amplitude = Math.abs(axisY);
  if (state.held) return { steps: 0, state: { held: amplitude > RELEASE_THRESHOLD } };
  if (amplitude < PUSH_THRESHOLD) return { steps: 0, state: JOYSTICK_RELEASED };
  return { steps: axisY < 0 ? 1 : -1, state: { held: true } };
}

/** Ce que l'on lit d'une source d'entrée WebXR : sa main et, s'il y en a un, son gamepad. */
export interface InputSourceLike {
  handedness: string;
  gamepad?: { axes: readonly number[] } | null | undefined;
}

/** Axe Y du joystick de la manette droite, 0 sans manette droite. */
export function rightThumbstickY(sources: Iterable<InputSourceLike>): number {
  for (const source of sources) {
    if (source.handedness === "right" && source.gamepad) return source.gamepad.axes[THUMBSTICK_Y_AXIS] ?? 0;
  }
  return 0;
}
