// Boutons de la manette droite (MISSION.md, « Contrôles ») : gâchette = pause, A = recalibrer, B = panneau d'infos.
// Logique pure : un appui compte une fois, jamais tant que le bouton reste tenu.

/** Index des boutons dans `Gamepad.buttons` (mapping « xr-standard » des manettes Touch). */
export const TRIGGER_BUTTON = 0;
export const A_BUTTON = 4;
export const B_BUTTON = 5;
/** Au-delà de cette valeur analogique (0 à 1), un bouton compte comme appuyé. */
export const PRESS_THRESHOLD = 0.5;

export interface ButtonsReading {
  trigger: boolean;
  a: boolean;
  b: boolean;
}

export const BUTTONS_RELEASED: ButtonsReading = { trigger: false, a: false, b: false };

export interface ButtonLike {
  pressed: boolean;
  value: number;
}

/** Ce que l'on lit d'une source d'entrée WebXR : sa main et, s'il y en a un, son gamepad. */
export interface ButtonSourceLike {
  handedness: string;
  gamepad?: { buttons?: readonly ButtonLike[] } | null | undefined;
}

const isDown = (button: ButtonLike | undefined): boolean =>
  button !== undefined && (button.pressed || button.value >= PRESS_THRESHOLD);

/** Boutons tenus sur la manette droite, tous relâchés sans manette droite. */
export function rightButtons(sources: Iterable<ButtonSourceLike>): ButtonsReading {
  for (const source of sources) {
    const buttons = source.gamepad?.buttons;
    if (source.handedness === "right" && buttons) {
      return { trigger: isDown(buttons[TRIGGER_BUTTON]), a: isDown(buttons[A_BUTTON]), b: isDown(buttons[B_BUTTON]) };
    }
  }
  return BUTTONS_RELEASED;
}

/** Les boutons qui viennent d'être appuyés : tenus maintenant et pas à l'image précédente. */
export function newPresses(now: ButtonsReading, before: ButtonsReading): ButtonsReading {
  return { trigger: now.trigger && !before.trigger, a: now.a && !before.a, b: now.b && !before.b };
}
