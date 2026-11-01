// Champ de vision du casque simulé (APP-004) : un calcul de projection juge qu'un point ou un rectangle de la scène reste
// dans la vue d'une tête. Logique pure, sans navigateur : elle sert à Vitest et à l'e2e (masque d'IWER).
import type { HeadPose } from "./pose.ts";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Champ de vision total d'un casque, en degrés, horizontal et vertical, centré sur le regard. */
export interface FieldOfView {
  horizontalDeg: number;
  verticalDeg: number;
}

/**
 * Cible : le Meta Quest 3, environ 110° en horizontal et 96° en vertical (valeurs annoncées par Meta ; hypothèse de cadrage
 * du chantier champ-de-vision-casque : aucune page de Meta ni d'un tiers n'a pu être relue le 2026-11-01, le site de Meta
 * refusant la lecture automatisée, à vérifier). La page https://www.meta.com/quest/quest-3/ est la source à relire.
 * Un écran plat ne simule ni la distorsion des lentilles, ni la netteté des bords, ni l'ajustement du casque sur le visage.
 */
export const QUEST3_FOV: FieldOfView = { horizontalDeg: 110, verticalDeg: 96 };

/** Hypothèse de cadrage : seule cette part des demi-angles compte « dans la vue », le centre du champ étant le plus net. */
export const FOV_MARGIN = 0.8;

/** Un rectangle posé dans la scène : son centre, ses deux axes unitaires et ses dimensions (m). */
export interface SceneRect {
  center: Vec3;
  right: Vec3;
  up: Vec3;
  width: number;
  height: number;
}

/** Angles, en radians, depuis l'axe optique, au format du masque d'IWER (`XRVisibilityMask`). */
export interface EyeAngles {
  angleLeft: number;
  angleRight: number;
  angleUp: number;
  angleDown: number;
}

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Le point, exprimé dans le repère de la tête (regard le long de -Z, X à droite, Y en haut). */
function toHeadSpace(pose: HeadPose, p: Vec3): Vec3 {
  const { x: qx, y: qy, z: qz, w: qw } = pose.orientation;
  const v = { x: p.x - pose.position.x, y: p.y - pose.position.y, z: p.z - pose.position.z };
  // Rotation par l'inverse (le conjugué) du quaternion unitaire : v' = v + 2w(u×v) + 2u×(u×v) avec u = -q.
  const ux = -qx;
  const uy = -qy;
  const uz = -qz;
  const cx = uy * v.z - uz * v.y;
  const cy = uz * v.x - ux * v.z;
  const cz = ux * v.y - uy * v.x;
  return {
    x: v.x + 2 * (qw * cx + uy * cz - uz * cy),
    y: v.y + 2 * (qw * cy + uz * cx - ux * cz),
    z: v.z + 2 * (qw * cz + ux * cy - uy * cx),
  };
}

/** Le point est-il dans la vue ? Devant la tête, et dans la part `margin` des demi-angles horizontal et vertical. */
export function pointInView(pose: HeadPose, p: Vec3, fov: FieldOfView = QUEST3_FOV, margin: number = FOV_MARGIN): boolean {
  const h = toHeadSpace(pose, p);
  const depth = -h.z;
  if (depth <= 0) return false;
  const limitX = Math.tan(rad(fov.horizontalDeg / 2) * margin);
  const limitY = Math.tan(rad(fov.verticalDeg / 2) * margin);
  return Math.abs(h.x) / depth <= limitX && Math.abs(h.y) / depth <= limitY;
}

const SIGNS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

/** Les quatre coins du rectangle. */
export function rectCorners(r: SceneRect): Vec3[] {
  const hw = r.width / 2;
  const hh = r.height / 2;
  return SIGNS.map(([sx, sy]) => ({
    x: r.center.x + sx * hw * r.right.x + sy * hh * r.up.x,
    y: r.center.y + sx * hw * r.right.y + sy * hh * r.up.y,
    z: r.center.z + sx * hw * r.right.z + sy * hh * r.up.z,
  }));
}

/** Le rectangle est dans la vue quand ses quatre coins le sont : tout son texte est alors visible. */
export function rectInView(pose: HeadPose, r: SceneRect, fov: FieldOfView = QUEST3_FOV, margin: number = FOV_MARGIN): boolean {
  return rectCorners(r).every((c) => pointInView(pose, c, fov, margin));
}

/** Le masque du champ de vision pour l'écran d'IWER, par œil : les demi-angles de la cible (marge 1 : le champ entier). */
export function visibilityMask(fov: FieldOfView = QUEST3_FOV): { left: EyeAngles; right: EyeAngles } {
  const eye: EyeAngles = {
    angleLeft: rad(fov.horizontalDeg / 2),
    angleRight: rad(fov.horizontalDeg / 2),
    angleUp: rad(fov.verticalDeg / 2),
    angleDown: rad(fov.verticalDeg / 2),
  };
  return { left: { ...eye }, right: { ...eye } };
}
