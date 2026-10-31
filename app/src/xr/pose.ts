// Pose de la tête dans l'espace de référence : cap du regard, recalage du parcours et place du panneau d'infos.
// Logique pure, sans three.js. Le regard est l'axe -Z du repère WebXR, le cap est une rotation autour de Y.
import type { Orientation } from "../safety/visibility.ts";

export interface HeadPose {
  position: { x: number; y: number; z: number };
  orientation: Orientation;
}

/** Où et vers où le parcours est posé : le point courant sous les pieds, le sens de marche devant soi. */
export interface Calibration {
  x: number;
  z: number;
  yawRad: number;
}

export const NO_CALIBRATION: Calibration = { x: 0, z: 0, yawRad: 0 };

/** Distance du panneau devant soi, et sa descente sous le regard : lisible sans cacher le tapis. */
export const PANEL_DISTANCE_M = 1.2;
export const PANEL_DROP_M = 0.2;

/** Cap du regard (rad, rotation autour de Y), indépendant de l'inclinaison de la tête. */
export function gazeYawRad(q: Orientation): number {
  const forwardX = -2 * (q.x * q.z + q.w * q.y);
  const forwardZ = -(1 - 2 * (q.x * q.x + q.y * q.y));
  return Math.atan2(-forwardX, -forwardZ);
}

/** Recalage « je suis face au tapis » : le parcours repart d'ici, dans le sens où l'on regarde. */
export function calibrationFrom(pose: HeadPose): Calibration {
  return { x: pose.position.x, z: pose.position.z, yawRad: gazeYawRad(pose.orientation) };
}

/** Place du panneau d'infos : devant le regard à l'horizontale, un peu sous les yeux, tourné vers soi. */
export function panelPlacement(pose: HeadPose): { x: number; y: number; z: number; yawRad: number } {
  const yawRad = gazeYawRad(pose.orientation);
  return {
    x: pose.position.x - Math.sin(yawRad) * PANEL_DISTANCE_M,
    y: pose.position.y - PANEL_DROP_M,
    z: pose.position.z - Math.cos(yawRad) * PANEL_DISTANCE_M,
    yawRad,
  };
}
