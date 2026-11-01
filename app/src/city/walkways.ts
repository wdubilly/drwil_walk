// Le sol et la route : trottoirs (tracés à part ou portés par la voie), passages piétons en bandes blanches, et le chemin suivi
// en jaune bordé de sombre pour qu'il se distingue (APP-003). Tout se fond dans le maillage des voies : aucun maillage en plus.
import { Color } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import { closest } from "./near-route.ts";
import { newRibbons, pushStrip, widthOf, type Ribbons } from "./roads.ts";
import type { Road } from "./souq-data.ts";

/** Plafonds par catégorie : les plus proches du parcours d'abord. */
export const MAX_SIDEWALK_ROADS = 400;
export const MAX_CROSSINGS = 120;

const PAVEMENT = new Color(0xc9c3b6);
const STRIPE = new Color(0xffffff);
const ROUTE_EDGE = new Color(0x1a1a24);
const ROUTE_CORE = new Color(0xffd23f);
const SIDEWALK_WIDTH_M = 1.8;
const STRIPE_LENGTH_M = 0.5;
const STRIPE_PITCH_M = 1;
const CROSSING_WIDTH_M = 3;
const SIDEWALK_LIFT_M = 0.06;
const STRIPE_LIFT_M = 0.08;
const ROUTE_EDGE_LIFT_M = 0.1;
const ROUTE_CORE_LIFT_M = 0.11;
const ROUTE_EDGE_WIDTH_M = 2;
const ROUTE_CORE_WIDTH_M = 1.2;

const segments = (points: readonly Vec2[]): [Vec2, Vec2][] => points.slice(1).map((b, i) => [points[i] as Vec2, b]);

/** Des bandes blanches en travers du passage, une tous les mètres le long de son tracé. */
function zebra(out: Ribbons, points: readonly Vec2[]): void {
  for (const [a, b] of segments(points)) {
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    const [ux, uz] = [(b.x - a.x) / length, (b.z - a.z) / length];
    for (let s = STRIPE_PITCH_M / 2; s < length; s += STRIPE_PITCH_M) {
      const from = { x: a.x + ux * (s - STRIPE_LENGTH_M / 2), z: a.z + uz * (s - STRIPE_LENGTH_M / 2) };
      const to = { x: a.x + ux * (s + STRIPE_LENGTH_M / 2), z: a.z + uz * (s + STRIPE_LENGTH_M / 2) };
      pushStrip(out, from, to, -CROSSING_WIDTH_M / 2, CROSSING_WIDTH_M / 2, STRIPE_LIFT_M, STRIPE);
    }
  }
}

/** Les trottoirs d'une voie : un ruban de chaque côté demandé par sa balise `sidewalk`. */
function roadSidewalks(out: Ribbons, road: Road): void {
  const half = widthOf(road.highway) / 2;
  for (const [a, b] of segments(road.points)) {
    if (road.sidewalk !== "right") pushStrip(out, a, b, -half - SIDEWALK_WIDTH_M, -half, SIDEWALK_LIFT_M, PAVEMENT);
    if (road.sidewalk !== "left") pushStrip(out, a, b, half, half + SIDEWALK_WIDTH_M, SIDEWALK_LIFT_M, PAVEMENT);
  }
}

export function buildWalkways(roads: readonly Road[], route: Path): Ribbons {
  const out = newRibbons();
  const anchor = (road: Road): Vec2 => road.points[0] as Vec2;
  for (const road of closest(roads.filter((r) => r.footway === "sidewalk"), route, MAX_SIDEWALK_ROADS, anchor)) {
    for (const [a, b] of segments(road.points)) pushStrip(out, a, b, -SIDEWALK_WIDTH_M / 2, SIDEWALK_WIDTH_M / 2, SIDEWALK_LIFT_M, PAVEMENT);
  }
  for (const road of closest(roads.filter((r) => r.sidewalk !== undefined), route, MAX_SIDEWALK_ROADS, anchor)) roadSidewalks(out, road);
  for (const road of closest(roads.filter((r) => r.footway === "crossing"), route, MAX_CROSSINGS, anchor)) zebra(out, road.points);
  for (const [a, b] of segments(route.points)) {
    pushStrip(out, a, b, -ROUTE_EDGE_WIDTH_M / 2, ROUTE_EDGE_WIDTH_M / 2, ROUTE_EDGE_LIFT_M, ROUTE_EDGE);
    pushStrip(out, a, b, -ROUTE_CORE_WIDTH_M / 2, ROUTE_CORE_WIDTH_M / 2, ROUTE_CORE_LIFT_M, ROUTE_CORE);
  }
  return out;
}
