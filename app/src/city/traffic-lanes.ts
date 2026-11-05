// Les trajets des figurants (APP-014), lus des voies de l'extrait : chaussée dans le sens de la voie (`oneway`) et du côté de
// conduite de la région, trottoirs (`sidewalk`, `footway=sidewalk`) et voies piétonnes ; tout tronçon dans l'emprise d'un
// bâtiment est retiré. Logique pure : aucune scène, aucun hasard.
import type { Vec2 } from "../route/geo.ts";
import { footprintOf, nearBuilding, roadSeed, type Footprint } from "./lamp-rule.ts";
import { widthOf } from "./roads.ts";
import type { Building, Road } from "./souq-data.ts";
import type { Catalogue, Lieu, RegionSetting } from "./traffic-catalog.ts";

export interface Lane {
  lieu: Lieu;
  points: Vec2[];
  /** La graine de la voie (son identifiant OpenStreetMap), mêlée au rang du trajet. */
  seed: number;
  /** Vrai si l'on y circule dans les deux sens (piétons) ; faux : dans le sens des points seulement. */
  bothWays: boolean;
  /** Le nombre de voies de circulation que ce trajet représente (`lanes`), au moins 1. */
  factor: number;
}

/** Pas d'échantillonnage du test des bâtiments, longueur minimale d'un tronçon gardé, marge aux murs. */
export const SAMPLE_M = 2;
export const MIN_RUN_M = 12;
export const WALL_MARGIN_M = 0.3;
/** Écart du trottoir au bord de la chaussée, demi-largeur d'une voie de circulation au plus. */
export const SIDEWALK_OFFSET_M = 1;
export const MAX_HALF_LANE_M = 1.75;

/** La polyligne décalée de `offset` mètres sur sa droite (sens des points). */
export function offsetLine(points: readonly Vec2[], offset: number): Vec2[] {
  return points.map((p, i) => {
    const a = points[Math.max(0, i - 1)] as Vec2;
    const b = points[Math.min(points.length - 1, i + 1)] as Vec2;
    const len = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    // Repère local : x vers l'est, z vers le sud ; la droite d'une direction (dx, dz) est (-dz, dx).
    return { x: p.x - ((b.z - a.z) / len) * offset, z: p.z + ((b.x - a.x) / len) * offset };
  });
}

/** Les trajets bruts d'une voie, avant le retrait des bâtiments. */
export function roadLanes(road: Road, catalogue: Catalogue, region: RegionSetting): Lane[] {
  const seed = roadSeed(road);
  const half = widthOf(road.highway) / 2;
  const lanes: Lane[] = [];
  const add = (lieu: Lieu, points: Vec2[], bothWays: boolean, factor = 1): void => {
    lanes.push({ lieu, points, seed: (seed + lanes.length * 0x9e3779b9) >>> 0, bothWays, factor });
  };
  if (road.footway === "crossing") return lanes;
  if (road.footway === "sidewalk") {
    add("trottoir", [...road.points], true);
    return lanes;
  }
  if (catalogue.lieux.chaussee.includes(road.highway)) {
    const reversed = [...road.points].reverse();
    if (road.oneway) add("chaussee", road.oneway === "forward" ? [...road.points] : reversed, false, road.lanes ?? 1);
    else {
      // Double sens : chaque sens roule du côté de conduite de la région.
      const side = (region.conduite === "droite" ? 1 : -1) * Math.min(half / 2, MAX_HALF_LANE_M);
      const perWay = Math.max(1, Math.round((road.lanes ?? 2) / 2));
      add("chaussee", offsetLine(road.points, side), false, perWay);
      add("chaussee", offsetLine(reversed, side), false, perWay);
    }
  }
  if (road.sidewalk === "both" || road.sidewalk === "right") add("trottoir", offsetLine(road.points, half + SIDEWALK_OFFSET_M), true);
  if (road.sidewalk === "both" || road.sidewalk === "left") add("trottoir", offsetLine(road.points, -(half + SIDEWALK_OFFSET_M)), true);
  if (catalogue.lieux["voie-pietonne"].includes(road.highway)) add("voie-pietonne", [...road.points], true);
  return lanes;
}

/** Points de la polyligne tous les `SAMPLE_M` mètres (extrémités comprises). */
export function resample(points: readonly Vec2[]): Vec2[] {
  const out: Vec2[] = [points[0] as Vec2];
  let carried = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1] as Vec2;
    const b = points[i] as Vec2;
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    let at = SAMPLE_M - carried;
    for (; at < len; at += SAMPLE_M) out.push({ x: a.x + ((b.x - a.x) * at) / len, z: a.z + ((b.z - a.z) * at) / len });
    carried = len - (at - SAMPLE_M);
  }
  const last = points[points.length - 1] as Vec2;
  const end = out[out.length - 1] as Vec2;
  if (end.x !== last.x || end.z !== last.z) out.push(last);
  return out;
}

const lengthOf = (points: readonly Vec2[]): number => points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - (points[i] as Vec2).x, p.z - (points[i] as Vec2).z), 0);

/** Le trajet coupé aux bâtiments : les tronçons hors de toute emprise, d'au moins MIN_RUN_M. */
export function clearRuns(lane: Lane, buildings: readonly Footprint[]): Lane[] {
  const runs: Vec2[][] = [[]];
  for (const p of resample(lane.points)) {
    if (nearBuilding(p, buildings, WALL_MARGIN_M)) runs.push([]);
    else (runs[runs.length - 1] as Vec2[]).push(p);
  }
  return runs
    .filter((run) => run.length >= 2 && lengthOf(run) >= MIN_RUN_M)
    .map((points, i) => ({ ...lane, points, seed: (lane.seed + i * 0x85ebca6b) >>> 0 }));
}

/** Tous les trajets de la ville, coupés aux bâtiments. */
export function trafficLanes(roads: readonly Road[], buildings: readonly Building[], catalogue: Catalogue, region: RegionSetting): Lane[] {
  const footprints = buildings.map(footprintOf);
  return roads.flatMap((road) => roadLanes(road, catalogue, region)).flatMap((lane) => clearRuns(lane, footprints));
}

export { lengthOf as laneLengthOf };
