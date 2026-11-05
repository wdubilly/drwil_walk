// Les lampadaires produits par règle le long des rues (APP-013) : OpenStreetMap n'en contient aucun sur ces quartiers, une rue
// sans mât paraît vide. Ils sont posés après tout ce que le relevé donne (qui n'est jamais écarté), marqués « generated », et
// refaits à l'identique à chaque chargement : la graine vient de l'identifiant OpenStreetMap de la voie, jamais du hasard.
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import { hash32, seededRandom } from "./facade-seed.ts";
import { closest } from "./near-route.ts";
import { MAX_GENERATED_LAMPS } from "./props.ts";
import { widthOf } from "./roads.ts";
import type { Building, Prop, Road } from "./souq-data.ts";

/** Les voies traitées : les plus proches du parcours d'abord (les autres ne se verront pas pendant la marche). */
export const MAX_LAMP_ROADS = 400;
/** Distance minimale entre deux objets, en mètres. */
export const MIN_OBJECT_GAP_M = 2;
/** Largeur libre minimale entre le bord de la chaussée et la façade : en deçà, le trottoir est trop étroit pour un mât. */
export const MIN_SIDEWALK_M = 1.2;
/** Le mât est posé juste au-delà de la bordure. */
const KERB_OFFSET_M = 0.6;
/** Part de l'intervalle dont l'écart tiré de la graine le fait varier, dans les deux sens. */
export const SPACING_JITTER = 0.2;

/** Intervalle moyen entre deux mâts selon la classe de voie : voie passante, rue de quartier, ruelle ; les autres classes n'en ont pas. */
const SPACING_M: Record<string, number> = {
  trunk: 27.5, primary: 27.5, secondary: 27.5, tertiary: 27.5,
  residential: 37.5, unclassified: 37.5, living_street: 37.5,
  service: 17.5, pedestrian: 17.5,
};
export const spacingOf = (highway: string): number | undefined => SPACING_M[highway.replace(/_link$/, "")];

/** La graine d'une voie : son identifiant OpenStreetMap ; sans identifiant (données anciennes), la position de son premier sommet. */
export function roadSeed(road: Road): number {
  if (road.id !== undefined) return hash32(road.id % 0x100000000) ^ hash32(Math.floor(road.id / 0x100000000) + 0x51ed270b);
  const p = road.points[0] as Vec2;
  return hash32(Math.round(p.x * 100)) ^ hash32(Math.round(p.z * 100) + 0x2c1b3c6d);
}

interface Candidate {
  at: Vec2;
  kerb: Vec2;
  yaw: number;
}

/** Les emplacements d'une voie, un mât tous les `spacing` ± l'écart tiré de la graine ; le côté se choisit une fois par tronçon. */
function candidates(road: Road, spacing: number): Candidate[] {
  const seed = roadSeed(road);
  const random = seededRandom(seed);
  const gap = (): number => spacing * (1 + SPACING_JITTER * (2 * random() - 1));
  const half = widthOf(road.highway) / 2;
  const out: Candidate[] = [];
  let next = random() * spacing;
  let walked = 0;
  for (const [i, b] of road.points.slice(1).entries()) {
    const a = road.points[i] as Vec2;
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    const [nx, nz] = [-(b.z - a.z) / length, (b.x - a.x) / length];
    // `sidewalk` ne dit qu'un seul côté : le mât y va ; sinon la graine du tronçon choisit.
    const side = road.sidewalk === "left" ? -1 : road.sidewalk === "right" ? 1 : hash32(seed + i * 0x9e3779b1) % 2 === 0 ? 1 : -1;
    for (; next < walked + length; next += gap()) {
      const t = (next - walked) / length;
      const on = { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
      const at = (offset: number): Vec2 => ({ x: on.x + nx * side * offset, z: on.z + nz * side * offset });
      // Le bras du mât (axe Z du modèle) se tend vers la chaussée.
      out.push({ at: at(half + KERB_OFFSET_M), kerb: at(half), yaw: Math.atan2(-nx * side, -nz * side) });
    }
    walked += length;
  }
  return out;
}

/** Un bâtiment et son rectangle englobant, calculé une fois : l'essentiel du coût est d'écarter les bâtiments éloignés. */
export interface Footprint {
  ring: readonly Vec2[];
  box: [number, number, number, number];
}
export const footprintOf = ({ footprint }: Building): Footprint => {
  const xs = footprint.map((q) => q.x);
  const zs = footprint.map((q) => q.z);
  return { ring: footprint, box: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)] };
};

/** Vrai si le point est dans l'emprise d'un bâtiment ou à moins de `r` mètres de l'un de ses murs. */
export function nearBuilding(p: Vec2, buildings: readonly Footprint[], r: number): boolean {
  return buildings.some(({ ring, box: [x0, z0, x1, z1] }) => {
    if (p.x < x0 - r || p.x > x1 + r || p.z < z0 - r || p.z > z1 + r) return false;
    let inside = false;
    for (const [i, a] of ring.entries()) {
      const b = ring[(i + 1) % ring.length] as Vec2;
      if (a.z > p.z !== b.z > p.z && p.x < ((b.x - a.x) * (p.z - a.z)) / (b.z - a.z) + a.x) inside = !inside;
      const [dx, dz] = [b.x - a.x, b.z - a.z];
      const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz)));
      if (Math.hypot(a.x + dx * t - p.x, a.z + dz * t - p.z) < r) return true;
    }
    return inside;
  });
}

/**
 * Les lampadaires produits. Trois refus : l'emplacement tombe dans un bâtiment, ou le trottoir (de la bordure au mur) est trop
 * étroit — un mât à 0,6 m de la bordure dans une emprise a sa bordure à moins de MIN_SIDEWALK_M du mur, un seul test couvre les deux —,
 * ou un autre objet est à moins de MIN_OBJECT_GAP_M. Les objets du relevé occupent la place d'abord ; ils ne sont jamais écartés. Au plus MAX_GENERATED_LAMPS, les plus proches du parcours.
 */
export function generateLamps(roads: readonly Road[], buildings: readonly Building[], real: readonly Prop[], route: Path): Prop[] {
  const walls = buildings.map(footprintOf);
  const taken: Vec2[] = real.map((p) => p.at);
  const lamps: Prop[] = [];
  const streets = roads.filter((r) => r.footway === undefined && spacingOf(r.highway) !== undefined);
  const wanted = closest(streets, route, MAX_LAMP_ROADS, (r) => r.points[0] as Vec2).flatMap((road) => candidates(road, spacingOf(road.highway) as number));
  // Les plus proches du parcours d'abord, et on s'arrête au plafond : les autres ne seraient jamais dessinés (coût au chargement).
  for (const { at, kerb, yaw } of closest(wanted, route, wanted.length, (c) => c.at)) {
    if (lamps.length === MAX_GENERATED_LAMPS) break;
    if (nearBuilding(kerb, walls, MIN_SIDEWALK_M)) continue;
    if (taken.some((o) => Math.hypot(o.x - at.x, o.z - at.z) < MIN_OBJECT_GAP_M)) continue;
    taken.push(at);
    lamps.push({ kind: "lamp", at, source: "generated", yaw });
  }
  return lamps;
}
