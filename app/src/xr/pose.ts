// Pose de la tête dans l'espace de référence : cap du regard, recalage du parcours et place du panneau d'infos.
// Logique pure, sans three.js. Le regard est l'axe -Z du repère WebXR, le cap est une rotation autour de Y.
import type { Orientation } from "../safety/visibility.ts";
import type { Zone } from "../safety/zone.ts";
import type { PanelSide } from "../ui/panel-side.ts";

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

/**
 * Le panneau d'infos : un rectangle de 0,5 m sur 0,25 m, posé à 1,1 m, à 28° du regard côté choisi et 0,3 m sous les
 * yeux (en bas du champ de vision, à l'horizontale). Loin du centre, mais tout entier dans le champ de vision du casque (APP-005) :
 * à 40° son bord extérieur sortait de la vue, et l'heure avec lui.
 */
export const PANEL_WIDTH_M = 0.5;
export const PANEL_HEIGHT_M = PANEL_WIDTH_M / 2;
export const PANEL_DISTANCE_M = 1.1;
export const PANEL_DROP_M = 0.31;
export const PANEL_SIDE_RAD = (28 * Math.PI) / 180;
/** Le panneau s'écarte de la zone tapis d'au moins cette marge, et ne s'éloigne jamais au-delà de MAX : il se cache alors. */
const ZONE_MARGIN_M = 0.05;
const PUSH_STEP_M = 0.02;
const MAX_DISTANCE_M = 5;
const EDGE_SAMPLES = 17;

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

/** Un point au sol est dans la zone tapis, élargie de la marge. */
function inZoneFootprint(zone: Zone, x: number, z: number): boolean {
  const cos = Math.cos(zone.yawRad);
  const sin = Math.sin(zone.yawRad);
  const dx = x - zone.x;
  const dz = z - zone.z;
  return (
    Math.abs(dx * cos - dz * sin) <= zone.width / 2 + ZONE_MARGIN_M && Math.abs(dx * sin + dz * cos) <= zone.depth / 2 + ZONE_MARGIN_M
  );
}

export interface PanelPlace {
  x: number;
  y: number;
  z: number;
  yawRad: number;
  /** Agrandissement du panneau : il grandit avec son éloignement pour garder la même taille dans le champ de vision. */
  scale: number;
}

/**
 * Place du panneau d'infos : en bas du champ de vision, décalé du côté choisi, à l'horizontale, tourné vers la tête.
 * Il reste tout entier hors de la zone tapis (APP-001) : si la boîte le recouvre, il s'éloigne sur son axe jusqu'à
 * en sortir ; sans place trouvée à moins de 5 m, il n'est pas posé (rien), plutôt que posé sur le tapis.
 */
export function panelPlacement(pose: HeadPose, side: PanelSide, zone: Zone): PanelPlace | undefined {
  const yawRad = gazeYawRad(pose.orientation) + (side === "left" ? PANEL_SIDE_RAD : -PANEL_SIDE_RAD);
  const y = pose.position.y - PANEL_DROP_M;
  for (let distance = PANEL_DISTANCE_M; distance <= MAX_DISTANCE_M; distance += PUSH_STEP_M) {
    const scale = distance / PANEL_DISTANCE_M;
    const x = pose.position.x - Math.sin(yawRad) * distance;
    const z = pose.position.z - Math.cos(yawRad) * distance;
    const above = y - (PANEL_HEIGHT_M * scale) / 2 >= zone.height + ZONE_MARGIN_M;
    const half = (PANEL_WIDTH_M * scale) / 2;
    const clear =
      above ||
      Array.from({ length: EDGE_SAMPLES }, (_, i) => (i / (EDGE_SAMPLES - 1) - 0.5) * 2 * half).every(
        (along) => !inZoneFootprint(zone, x + Math.cos(yawRad) * along, z - Math.sin(yawRad) * along),
      );
    if (clear) return { x, y, z, yawRad, scale };
  }
  return undefined;
}
