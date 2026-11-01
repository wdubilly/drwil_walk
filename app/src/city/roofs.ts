// Toits à deux pans (balise `roof:shape`) et auvents des bâtiments (APP-003) : des triangles ajoutés au maillage des bâtiments,
// jamais un maillage de plus. Les toits à deux pans suivent la couleur de toit du bâtiment ; les auvents, les plus proches du parcours d'abord.
import { Color } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import { distanceToRoute } from "./near-route.ts";
import { addQuad, addTriangle, type Soup, type V3 } from "./soup.ts";
import type { Building } from "./souq-data.ts";

/** Plafonds par catégorie : les plus proches du parcours d'abord. */
export const MAX_GABLED_ROOFS = 300;
export const MAX_AWNINGS = 80;

/** Hauteur du faîtage par rapport à la largeur du bâtiment, plafonnée. */
const RIDGE_RATIO = 0.3;
const MAX_RIDGE_M = 4;
const GABLE_SHADE = 0.85;
const AWNING_COLOURS = [0xc0392b, 0x2e86c1, 0xd4a017, 0x2e8b57].map((hex) => new Color(hex));
export const AWNING_COLOUR_COUNT = AWNING_COLOURS.length;
const AWNING_UNDERSIDE_SHADE = 0.7;
const AWNING_DEPTH_M = 1.3;
const AWNING_MAX_WIDTH_M = 8;
const AWNING_MIN_EDGE_M = 4;
const AWNING_WALL_Y_M = 3;
const AWNING_OUTER_Y_M = 2.6;
/** Au-delà, un mur est trop loin du parcours pour qu'on y voie un auvent. */
const AWNING_MAX_DISTANCE_M = 30;
const MIN_AWNING_BUILDING_M = 4;
const UP: V3 = [0, 1, 0];
const DOWN: V3 = [0, -1, 0];

const lift = (p: Vec2, y: number): V3 => [p.x, y, p.z];
const mid = (a: Vec2, b: Vec2): Vec2 => ({ x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 });

/** Un toit à deux pans sur un bâtiment à quatre murs : le faîtage suit le plus long côté. Les autres contours gardent le toit plat. */
export function addGabledRoof(soup: Soup, building: Building, roof: Color, wall: Color): void {
  if (building.footprint.length !== 5) return;
  const p = building.footprint.slice(0, 4);
  const length = (i: number): number => Math.hypot((p[(i + 1) % 4] as Vec2).x - (p[i] as Vec2).x, (p[(i + 1) % 4] as Vec2).z - (p[i] as Vec2).z);
  // Le plus long côté part de k ; les deux petits côtés portent les extrémités du faîtage.
  const k = length(0) + length(2) >= length(1) + length(3) ? 0 : 1;
  const [a, b, c, d] = [0, 1, 2, 3].map((i) => p[(k + i) % 4] as Vec2) as [Vec2, Vec2, Vec2, Vec2];
  const rise = Math.min(RIDGE_RATIO * Math.hypot(c.x - b.x, c.z - b.z), MAX_RIDGE_M);
  const [top, ridge1, ridge2] = [building.heightM, mid(b, c), mid(d, a)];
  const [r1, r2] = [lift(ridge1, top + rise), lift(ridge2, top + rise)];
  addQuad(soup, lift(a, top), lift(b, top), r1, r2, roof, UP);
  addQuad(soup, lift(c, top), lift(d, top), r2, r1, roof, UP);
  const shade = wall.clone().multiplyScalar(GABLE_SHADE);
  addTriangle(soup, lift(b, top), lift(c, top), r1, shade, [ridge1.x - ridge2.x, 0, ridge1.z - ridge2.z]);
  addTriangle(soup, lift(d, top), lift(a, top), r2, shade, [ridge2.x - ridge1.x, 0, ridge2.z - ridge1.z]);
}

/** Un auvent sur le mur le plus proche du parcours, s'il est assez long, assez proche et sous un mur assez haut. */
export function addAwning(soup: Soup, building: Building, route: Path, colourIndex: number): void {
  if (building.heightM < MIN_AWNING_BUILDING_M) return;
  const ring = building.footprint.slice(0, -1);
  const edges = ring.map((from, i) => ({ from, to: ring[(i + 1) % ring.length] as Vec2 }));
  const wall = edges
    .filter((e) => Math.hypot(e.to.x - e.from.x, e.to.z - e.from.z) >= AWNING_MIN_EDGE_M)
    .map((e) => ({ ...e, d: distanceToRoute(mid(e.from, e.to), route) }))
    .sort((x, y) => x.d - y.d)[0];
  if (wall === undefined || wall.d > AWNING_MAX_DISTANCE_M) return;
  const length = Math.hypot(wall.to.x - wall.from.x, wall.to.z - wall.from.z);
  const [ux, uz] = [(wall.to.x - wall.from.x) / length, (wall.to.z - wall.from.z) / length];
  const centre = mid(wall.from, wall.to);
  const inside = { x: ring.reduce((sum, q) => sum + q.x, 0) / ring.length, z: ring.reduce((sum, q) => sum + q.z, 0) / ring.length };
  // Le mur est tourné vers l'extérieur : la normale qui s'éloigne du centre du bâtiment.
  const away = uz * (centre.x - inside.x) - ux * (centre.z - inside.z) >= 0 ? 1 : -1;
  const [nx, nz] = [uz * away, -ux * away];
  const half = Math.min(length, AWNING_MAX_WIDTH_M) / 2;
  const corner = (along: number, out: number, y: number): V3 => [centre.x + ux * along + nx * out, y, centre.z + uz * along + nz * out];
  const colour = AWNING_COLOURS[colourIndex] as Color;
  const quad = [corner(-half, 0, AWNING_WALL_Y_M), corner(half, 0, AWNING_WALL_Y_M), corner(half, AWNING_DEPTH_M, AWNING_OUTER_Y_M), corner(-half, AWNING_DEPTH_M, AWNING_OUTER_Y_M)] as const;
  addQuad(soup, ...quad, colour, UP);
  addQuad(soup, ...quad, colour.clone().multiplyScalar(AWNING_UNDERSIDE_SHADE), DOWN);
}
