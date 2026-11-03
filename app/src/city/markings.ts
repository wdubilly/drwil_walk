// Les marquages au sol lus des balises de voie (APP-009) : la bordure des trottoirs (balises `sidewalk` et `footway=sidewalk`)
// et la ligne d'arrêt de part et d'autre d'un passage piéton (`footway=crossing`). Une balise absente ne produit rien, et tout
// se fond dans le maillage des voies : aucun maillage, aucun matériau en plus (APP-001 s'y applique comme au reste de la ville).
import { Color } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import { closest } from "./near-route.ts";
import { pushStrip, widthOf, type Ribbons } from "./roads.ts";
import type { Road } from "./souq-data.ts";

/** Plafonds par catégorie : les voies les plus proches du parcours d'abord. */
export const MAX_KERB_ROADS = 400;
export const MAX_STOP_LINES = 120;

const KERB = new Color(0xe3ded2);
const STOP = new Color(0xf4f4f0);
/** Largeur du trottoir tracé à part (`walkways.ts`) : la bordure se pose sur sa rive. */
const SIDEWALK_WIDTH_M = 1.8;
const KERB_WIDTH_M = 0.25;
const KERB_LIFT_M = 0.09;
/** La ligne d'arrêt : une barre en travers de la chaussée, à 1,5 m du passage, large de 35 cm. */
const STOP_OFFSET_M = 1.5;
const STOP_WIDTH_M = 0.35;
const STOP_LIFT_M = 0.09;

const segments = (points: readonly Vec2[]): [Vec2, Vec2][] => points.slice(1).map((b, i) => [points[i] as Vec2, b]);
const anchor = (road: Road): Vec2 => road.points[0] as Vec2;

/** La bordure d'un trottoir tracé à part : un liseré sur chacune de ses deux rives. */
function pathKerbs(out: Ribbons, road: Road): void {
  const half = SIDEWALK_WIDTH_M / 2;
  for (const [a, b] of segments(road.points)) {
    pushStrip(out, a, b, -half, -half + KERB_WIDTH_M, KERB_LIFT_M, KERB);
    pushStrip(out, a, b, half - KERB_WIDTH_M, half, KERB_LIFT_M, KERB);
  }
}

/** La bordure d'un trottoir porté par la voie : un liseré entre la chaussée et le trottoir, du côté demandé par la balise. */
function roadKerbs(out: Ribbons, road: Road): void {
  const half = widthOf(road.highway) / 2;
  for (const [a, b] of segments(road.points)) {
    if (road.sidewalk !== "right") pushStrip(out, a, b, -half - KERB_WIDTH_M, -half, KERB_LIFT_M, KERB);
    if (road.sidewalk !== "left") pushStrip(out, a, b, half, half + KERB_WIDTH_M, KERB_LIFT_M, KERB);
  }
}

/** Les deux lignes d'arrêt d'un passage piéton : parallèles à lui, une de chaque côté, sur toute sa longueur. */
function stopLines(out: Ribbons, points: readonly Vec2[]): void {
  const [first, last] = [points[0] as Vec2, points[points.length - 1] as Vec2];
  pushStrip(out, first, last, STOP_OFFSET_M, STOP_OFFSET_M + STOP_WIDTH_M, STOP_LIFT_M, STOP);
  pushStrip(out, first, last, -STOP_OFFSET_M - STOP_WIDTH_M, -STOP_OFFSET_M, STOP_LIFT_M, STOP);
}

/** Ajoute aux rubans des voies les bordures et les lignes d'arrêt que portent les balises des voies de l'extrait. */
export function pushMarkings(out: Ribbons, roads: readonly Road[], route: Path): void {
  const kerbed = roads.filter((r) => r.footway === "sidewalk" || r.sidewalk !== undefined);
  for (const road of closest(kerbed, route, MAX_KERB_ROADS, anchor)) {
    if (road.footway === "sidewalk") pathKerbs(out, road);
    else roadKerbs(out, road);
  }
  for (const road of closest(roads.filter((r) => r.footway === "crossing"), route, MAX_STOP_LINES, anchor)) stopLines(out, road.points);
}
