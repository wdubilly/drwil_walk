// Réglage de la zone tapis à la manette (APP-001, point 2) : logique pure, une image à la fois.
// Joystick gauche : déplace la boîte ; avec la prise (grip) gauche tenue : la redimensionne.
// X pose la boîte sous soi dans le sens du regard, Y rend la boîte par défaut. L'enregistrement n'a lieu que
// quand le geste est fini (joystick revenu au centre), pas à chaque image.
import {
  DEFAULT_ZONE,
  MAX_DEPTH_M,
  MAX_OFFSET_M,
  MAX_WIDTH_M,
  MIN_SIZE_M,
  type Zone,
} from "./zone.ts";

/** En deçà, le joystick est considéré au centre. */
export const STICK_DEADZONE = 0.2;
export const MOVE_SPEED_MPS = 0.6;
export const RESIZE_SPEED_MPS = 0.5;

export interface ZoneEdit {
  zone: Zone;
  /** Vrai tant qu'un changement n'est pas enregistré. */
  dirty: boolean;
}

export interface ZoneInput {
  dtS: number;
  /** Joystick gauche (haut = Y négatif). */
  stickX: number;
  stickY: number;
  resize: boolean;
  /** Appui sur X : où poser la boîte (sous la tête, cap du regard), `null` si la pose est inconnue. */
  place: { x: number; z: number; yawRad: number } | null;
  /** Appui sur Y. */
  reset: boolean;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const live = (axis: number): number => (Math.abs(axis) < STICK_DEADZONE ? 0 : axis);

export function initialZoneEdit(zone: Zone): ZoneEdit {
  return { zone, dirty: false };
}

/** La zone après cette image, et `save` quand un geste vient de finir. */
export function nextZoneEdit(edit: ZoneEdit, input: ZoneInput): { edit: ZoneEdit; save: boolean } {
  const sx = live(input.stickX);
  const sy = live(input.stickY);
  let zone = edit.zone;
  let changed = false;
  if (input.reset) {
    zone = DEFAULT_ZONE;
    changed = true;
  } else if (input.place) {
    zone = { ...zone, ...input.place };
    changed = true;
  }
  if (sx !== 0 || sy !== 0) {
    changed = true;
    if (input.resize) {
      zone = {
        ...zone,
        width: clamp(zone.width + sx * RESIZE_SPEED_MPS * input.dtS, MIN_SIZE_M, MAX_WIDTH_M),
        depth: clamp(zone.depth - sy * RESIZE_SPEED_MPS * input.dtS, MIN_SIZE_M, MAX_DEPTH_M),
      };
    } else {
      // Haut = vers l'avant de la boîte (-Z local) ; la boîte tournée de yaw a ses axes (cos, -sin) et (sin, cos).
      const step = MOVE_SPEED_MPS * input.dtS;
      const cos = Math.cos(zone.yawRad);
      const sin = Math.sin(zone.yawRad);
      zone = {
        ...zone,
        x: clamp(zone.x + (sx * cos + sy * sin) * step, -MAX_OFFSET_M, MAX_OFFSET_M),
        z: clamp(zone.z + (-sx * sin + sy * cos) * step, -MAX_OFFSET_M, MAX_OFFSET_M),
      };
    }
  }
  const active = changed;
  return {
    edit: { zone, dirty: edit.dirty || active },
    save: edit.dirty && !active,
  };
}
