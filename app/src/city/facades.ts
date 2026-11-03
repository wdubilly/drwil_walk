// Les façades procédurales des bâtiments proches du parcours (APP-008) : des triangles colorés ajoutés au maillage des bâtiments,
// sans texture ni matériau de plus. La graine est l'identifiant OSM ; deux voisins ne portent jamais la même façade.
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import type { Region } from "./facade-family.ts";
import { addRoofBox, addWall, type Draw, type Wall } from "./facade-parts.ts";
import { MIN_DETAIL_HEIGHT_M, VARIANT_COUNT, planFacade, signatureOf, startVariant, type FacadePlan } from "./facade-plan.ts";
import { closest, distanceToRoute } from "./near-route.ts";
import type { Soup } from "./soup.ts";
import type { Building } from "./souq-data.ts";

/** Le détail des façades : le profil graphique le règle (APP-006) ; « off » garde le repli sans détail (fenêtres du shader). */
export type FacadeDetail = "off" | "reduced" | "full";

/** Plafonds : bâtiments détaillés (les plus proches du parcours d'abord) et triangles par bâtiment. */
export const FACADE_BUDGETS: Record<FacadeDetail, { maxBuildings: number; trianglesPerBuilding: number }> = {
  off: { maxBuildings: 0, trianglesPerBuilding: 0 },
  reduced: { maxBuildings: 40, trianglesPerBuilding: 160 },
  full: { maxBuildings: 120, trianglesPerBuilding: 500 },
};
/** Au-delà, un bâtiment est trop loin du parcours pour qu'on y distingue un détail. */
export const FACADE_MAX_DISTANCE_M = 80;
const MIN_WALL_M = 2.5;
const NEIGHBOUR_CELL_M = 40;
const CHIMNEY_INSET_M = 1.2;

export interface FacadeContext {
  detail: FacadeDetail;
  region: Region;
  route: Path;
  /** Part de lumière au pied d'un mur : les détails suivent l'ombrage des murs. */
  footLight: number;
}

const cellKey = (p: Vec2): string => `${String(Math.floor(p.x / NEIGHBOUR_CELL_M))},${String(Math.floor(p.z / NEIGHBOUR_CELL_M))}`;

/** Les murs d'un contour fermé, normales vers l'extérieur (le sens du contour se lit à son aire signée), le plus proche du parcours d'abord. */
export function wallsOf(footprint: readonly Vec2[], route: Path): Wall[] {
  const ring = footprint.slice(0, -1);
  const area = ring.reduce((sum, p, i) => sum + p.x * (ring[(i + 1) % ring.length] as Vec2).z - (ring[(i + 1) % ring.length] as Vec2).x * p.z, 0);
  const side = area >= 0 ? 1 : -1;
  return ring
    .map((from, i) => {
      const to = ring[(i + 1) % ring.length] as Vec2;
      const length = Math.hypot(to.x - from.x, to.z - from.z);
      const [ux, uz] = [(to.x - from.x) / length, (to.z - from.z) / length];
      return { from, length, ux, uz, nx: uz * side, nz: -ux * side, d: distanceToRoute({ x: (from.x + to.x) / 2, z: (from.z + to.z) / 2 }, route) };
    })
    .filter((w) => w.length >= MIN_WALL_M)
    .sort((a, b) => a.d - b.d);
}

/** Le plan de chaque bâtiment détaillé : la variante tirée de l'identifiant, décalée tant qu'un voisin porte déjà la même façade. */
export function planAll(chosen: readonly Building[], region: Region): Map<Building, FacadePlan> {
  const seen = new Map<string, Set<string>>();
  const plans = new Map<Building, FacadePlan>();
  for (const b of chosen) {
    const p = b.footprint[0] as Vec2;
    const [cx, cz] = [Math.floor(p.x / NEIGHBOUR_CELL_M), Math.floor(p.z / NEIGHBOUR_CELL_M)];
    const near = new Set<string>();
    for (const dx of [-1, 0, 1]) for (const dz of [-1, 0, 1]) for (const s of seen.get(`${String(cx + dx)},${String(cz + dz)}`) ?? []) near.add(s);
    const start = startVariant(b);
    let plan = planFacade(b, region, start);
    for (let k = 1; near.has(signatureOf(plan)) && k < VARIANT_COUNT; k++) plan = planFacade(b, region, (start + k) % VARIANT_COUNT);
    plans.set(b, plan);
    seen.set(cellKey(p), (seen.get(cellKey(p)) ?? new Set()).add(signatureOf(plan)));
  }
  return plans;
}

const anchor = (b: Building): Vec2 => b.footprint[0] as Vec2;

/** Les bâtiments détaillés (les plus proches du parcours, dans le plafond du profil) et leur plan : les matériaux locaux s'y posent aussi. */
export function detailedPlans(solid: readonly Building[], ctx: Omit<FacadeContext, "footLight">): Map<Building, FacadePlan> {
  const candidates = solid.filter((b) => b.heightM >= MIN_DETAIL_HEIGHT_M && distanceToRoute(anchor(b), ctx.route) <= FACADE_MAX_DISTANCE_M);
  return planAll(closest(candidates, ctx.route, FACADE_BUDGETS[ctx.detail].maxBuildings, anchor), ctx.region);
}

/** Ajoute les façades des bâtiments les plus proches du parcours et rend ceux qui en ont reçu (leurs murs n'ont plus besoin du motif de repli). */
export function addFacades(soup: Soup, solid: readonly Building[], ctx: FacadeContext): Set<Building> {
  const { trianglesPerBuilding } = FACADE_BUDGETS[ctx.detail];
  const detailed = new Set<Building>();
  for (const [b, plan] of detailedPlans(solid, ctx)) {
    const draw: Draw = { soup, plan, heightM: b.heightM, left: trianglesPerBuilding, light: (y) => ctx.footLight + (1 - ctx.footLight) * Math.min(y / b.heightM, 1) };
    wallsOf(b.footprint, ctx.route).forEach((wall, i) => { addWall(draw, wall, i === 0); });
    const ring = b.footprint.slice(0, -1);
    const centre = { x: ring.reduce((s, q) => s + q.x, 0) / ring.length, z: ring.reduce((s, q) => s + q.z, 0) / ring.length };
    const corner = anchor(b);
    const gap = Math.hypot(centre.x - corner.x, centre.z - corner.z);
    if (plan.chimney && b.roofShape !== "gabled" && gap > 2 * CHIMNEY_INSET_M) {
      const t = CHIMNEY_INSET_M / gap;
      const recent = plan.family === "recent";
      addRoofBox(draw, { x: corner.x + (centre.x - corner.x) * t, z: corner.z + (centre.z - corner.z) * t }, recent ? 1.6 : 0.8, recent ? 1.2 : 1.4, plan.palette.accent);
    }
    if (draw.left < trianglesPerBuilding) detailed.add(b);
  }
  return detailed;
}
