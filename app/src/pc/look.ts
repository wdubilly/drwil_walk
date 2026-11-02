// Le regard à la souris de la version PC : cap et inclinaison, bornés. Logique pure, sans three.js.
import type { Orientation } from "../safety/visibility.ts";

export interface Look {
  /** Rotation autour de Y (positive vers la gauche). */
  yawRad: number;
  /** Inclinaison (positive vers le haut). */
  pitchRad: number;
}

export const NO_LOOK: Look = { yawRad: 0, pitchRad: 0 };
/** Radians par pixel de souris déplacé. */
export const SENSITIVITY = 0.004;
/** On ne retourne jamais la caméra : le regard s'arrête avant la verticale. */
export const MAX_PITCH_RAD = (85 * Math.PI) / 180;
/** Hauteur des yeux, celle d'un adulte debout. */
export const EYE_HEIGHT_M = 1.6;

/** Le regard après un déplacement de souris de (dx, dy) pixels : à droite on tourne à droite, vers le bas on regarde en bas. */
export function turn(look: Look, dx: number, dy: number): Look {
  return {
    yawRad: look.yawRad - dx * SENSITIVITY,
    pitchRad: Math.min(MAX_PITCH_RAD, Math.max(-MAX_PITCH_RAD, look.pitchRad - dy * SENSITIVITY)),
  };
}

/** L'orientation du regard, comme WebXR la donne : le cap d'abord, puis l'inclinaison. */
export function lookOrientation(look: Look): Orientation {
  const y = look.yawRad / 2;
  const p = look.pitchRad / 2;
  return { x: Math.cos(y) * Math.sin(p), y: Math.sin(y) * Math.cos(p), z: -Math.sin(y) * Math.sin(p), w: Math.cos(y) * Math.cos(p) };
}
