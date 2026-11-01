// L'herbe, les parcs, les jardins, les bois et les haies de l'extrait OpenStreetMap (APP-003) : les surfaces sont posées à plat sur le
// sol, les haies sont des murets verts bas, le tout dans un seul maillage, les plus proches du parcours d'abord.
import { Color, ShapeUtils, Vector2, type BufferGeometry } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import { closest } from "./near-route.ts";
import { addQuad, addTriangle, newSoup, soupGeometry, type Soup, type V3 } from "./soup.ts";
import type { Area, Hedge } from "./souq-data.ts";

/** Plafonds par catégorie. */
export const MAX_AREAS = 150;
export const MAX_HEDGES = 200;

const AREA_COLOURS: Record<Area["kind"], Color> = {
  grass: new Color(0x7fb35a),
  park: new Color(0x5fa34a),
  garden: new Color(0x8cc063),
  wood: new Color(0x3f7f3a),
};
const HEDGE_COLOUR = new Color(0x2f6b2f);
const HEDGE_TOP_COLOUR = new Color(0x3f8a3a);
/** Au-dessus du sol (y = 0) et sous les voies (0,05) : l'herbe passe sous la route. */
const AREA_LIFT_M = 0.03;
const HEDGE_HEIGHT_M = 1;
const HEDGE_HALF_WIDTH_M = 0.3;
const UP: V3 = [0, 1, 0];

/** Le contour sans son dernier sommet, qui répète le premier. */
const open = (ring: readonly Vec2[]): Vec2[] => ring.slice(0, -1);

function addArea(soup: Soup, area: Area): void {
  const ring = open(area.ring);
  const triangles = ShapeUtils.triangulateShape(ring.map((p) => new Vector2(p.x, p.z)), []);
  const at = (i: number): V3 => [(ring[i] as Vec2).x, AREA_LIFT_M, (ring[i] as Vec2).z];
  for (const [a, b, c] of triangles) addTriangle(soup, at(a as number), at(b as number), at(c as number), AREA_COLOURS[area.kind], UP);
}

function addHedge(soup: Soup, hedge: Hedge): void {
  for (const [i, b] of hedge.points.slice(1).entries()) {
    const a = hedge.points[i] as Vec2;
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    if (length === 0) continue;
    const [nx, nz] = [(-(b.z - a.z) / length) * HEDGE_HALF_WIDTH_M, ((b.x - a.x) / length) * HEDGE_HALF_WIDTH_M];
    const corner = (p: Vec2, side: number, y: number): V3 => [p.x + nx * side, y, p.z + nz * side];
    addQuad(soup, corner(a, 1, HEDGE_HEIGHT_M), corner(b, 1, HEDGE_HEIGHT_M), corner(b, -1, HEDGE_HEIGHT_M), corner(a, -1, HEDGE_HEIGHT_M), HEDGE_TOP_COLOUR, UP);
    for (const side of [1, -1]) {
      addQuad(soup, corner(a, side, 0), corner(b, side, 0), corner(b, side, HEDGE_HEIGHT_M), corner(a, side, HEDGE_HEIGHT_M), HEDGE_COLOUR, [nx * side, 0, nz * side]);
    }
  }
}

/** Surfaces vertes et haies en un seul maillage coloré (vide s'il n'y en a pas). */
export function buildVegetation(areas: readonly Area[], hedges: readonly Hedge[], route: Path): BufferGeometry {
  const soup = newSoup();
  for (const area of closest(areas.filter((a) => a.ring.length >= 4), route, MAX_AREAS, (a) => a.ring[0] as Vec2)) addArea(soup, area);
  for (const hedge of closest(hedges.filter((h) => h.points.length >= 2), route, MAX_HEDGES, (h) => h.points[0] as Vec2)) addHedge(soup, hedge);
  return soupGeometry(soup);
}
