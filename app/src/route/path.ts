// Un parcours en mètres locaux : position et direction de marche à une distance donnée (APP-002).
// Une boucle reprend au départ au-delà de sa longueur ; un trajet libre (aller simple) s'arrête à l'arrivée.
import type { Vec2 } from "./geo.ts";

export interface Path {
  points: readonly Vec2[];
  /** Distance depuis le départ à chaque point ; le dernier est la longueur totale. */
  cumulativeM: readonly number[];
  lengthM: number;
  /** Vrai pour les itinéraires figés : la marche reprend au départ. Faux pour un trajet libre : elle s'arrête à l'arrivée. */
  loop: boolean;
}

/** Demi-fenêtre qui lisse la direction : le monde tourne autour de l'utilisateur, jamais d'un coup sec. */
export const HEADING_WINDOW_M = 4;

export function createPath(points: readonly Vec2[], loop = true): Path {
  if (points.length < 2) throw new Error("Un parcours demande au moins deux points.");
  const cumulativeM = [0];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1] as Vec2;
    const b = points[i] as Vec2;
    cumulativeM.push((cumulativeM[i - 1] as number) + Math.hypot(b.x - a.x, b.z - a.z));
  }
  const lengthM = cumulativeM[cumulativeM.length - 1] as number;
  if (lengthM === 0) throw new Error("Un parcours demande des points distincts.");
  return { points, cumulativeM, lengthM, loop };
}

/** Position après `distanceM` de marche ; la boucle reprend au départ, un aller simple reste à ses extrémités. */
export function pointAt(path: Path, distanceM: number): Vec2 {
  if (!path.loop && distanceM >= path.lengthM) return path.points[path.points.length - 1] as Vec2;
  const d = path.loop ? ((distanceM % path.lengthM) + path.lengthM) % path.lengthM : Math.max(0, distanceM);
  // Premier point plus loin que d : le segment qui le précède est de longueur non nulle.
  const next = path.cumulativeM.findIndex((c) => c > d);
  const a = path.points[next - 1] as Vec2;
  const b = path.points[next] as Vec2;
  const start = path.cumulativeM[next - 1] as number;
  const t = (d - start) / ((path.cumulativeM[next] as number) - start);
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
}

/** Direction de marche (vecteur unitaire), lissée sur une fenêtre de part et d'autre. */
export function headingAt(path: Path, distanceM: number): Vec2 {
  const before = pointAt(path, distanceM - HEADING_WINDOW_M);
  const after = pointAt(path, distanceM + HEADING_WINDOW_M);
  const length = Math.hypot(after.x - before.x, after.z - before.z);
  // Demi-tour exact (aller-retour) : pas de direction, on garde le nord.
  if (length === 0) return { x: 0, z: -1 };
  return { x: (after.x - before.x) / length, z: (after.z - before.z) / length };
}
