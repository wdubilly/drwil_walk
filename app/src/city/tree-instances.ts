// Les arbres du pack posés dans la ville : chaque arbre de l'extrait OpenStreetMap prend, de façon déterministe, une variante,
// un cap et une taille ; chaque variante est un maillage instancié (écorce, feuillage), avec des matériaux partagés.
import { Group, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import { hash32, seededRandom } from "./facade-seed.ts";
import { MIN_SIDEWALK_M, footprintOf, nearBuilding, onOtherRoad, roadSeed } from "./lamp-rule.ts";
import { closest } from "./near-route.ts";
import { widthOf } from "./roads.ts";
import type { Building, Prop, Road } from "./souq-data.ts";
import type { TreePack, TreeVariant } from "./tree-pack.ts";

/** Une graine stable tirée de la position (au décimètre) : le même extrait donne toujours la même forêt. */
export function treeSeed(x: number, z: number): number {
  const mixed = Math.imul(Math.round(x * 10), 73856093) ^ Math.imul(Math.round(z * 10), 19349663);
  // Le mélange final (murmur3) répartit aussi les bits de poids faible, dont dépendent la variante et le cap.
  const a = Math.imul(mixed ^ (mixed >>> 16), 0x85ebca6b);
  const b = Math.imul(a ^ (a >>> 13), 0xc2b2ae35);
  return (b ^ (b >>> 16)) >>> 0;
}

/** La variante, le cap (degrés) et l'échelle (de 0,85 à 1,20) d'un arbre posé en (x, z). */
export function treeLook(x: number, z: number, variants: number): { variant: number; headingDeg: number; scale: number } {
  const seed = treeSeed(x, z);
  return { variant: seed % variants, headingDeg: (seed >>> 8) % 360, scale: 0.85 + ((seed >>> 20) % 36) / 100 };
}

/** Les arbres du pack : un maillage instancié par variante et par partie (écorce, feuillage). */
export function buildPackTrees(trees: readonly Prop[], pack: TreePack): Group {
  const matrices = pack.variants.map(() => [] as Matrix4[]);
  for (const tree of trees) {
    const look = treeLook(tree.at.x, tree.at.z, pack.variants.length);
    const turn = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), (look.headingDeg * Math.PI) / 180);
    matrices[look.variant]?.push(new Matrix4().compose(new Vector3(tree.at.x, 0, tree.at.z), turn, new Vector3(look.scale, look.scale, look.scale)));
  }
  const group = new Group();
  group.name = "arbres";
  for (const [index, placed] of matrices.entries()) {
    const variant = pack.variants[index] as TreeVariant;
    if (placed.length === 0) continue;
    for (const [part, geometry, material] of [["ecorce", variant.bark, pack.barkMaterial], ["feuillage", variant.leaves, pack.leavesMaterial]] as const) {
      const mesh = new InstancedMesh(geometry, material, placed.length);
      placed.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
      mesh.name = `arbres-${part}-${variant.name}`;
      group.add(mesh);
    }
  }
  return group;
}

/** Plafond des arbres d'alignement produits par règle : ceux du relevé ne sont jamais évincés par des arbres inventés (APP-009). */
export const MAX_ALIGNED_TREES = 200;
/** Intervalle moyen entre deux arbres selon la classe de voie (données de repli, sans code propre à une ville) ; les autres classes n'en ont pas. */
const TREE_SPACING_M: Record<string, number> = { primary: 14, secondary: 14, tertiary: 12, residential: 10, unclassified: 10, living_street: 9, pedestrian: 9, service: 12 };
/** Part de l'intervalle dont l'écart tiré de la graine fait varier l'espacement, dans les deux sens. */
const TREE_JITTER = 0.3;
/** Le tronc est planté à cette distance au-delà de la bordure. */
const TREE_OFFSET_M = 1.6;
/** Dégagement minimal autour d'un autre objet, et d'un passage piéton ou d'une entrée (le pied d'un mur). */
const TREE_GAP_M = 3;
const CROSSING_CLEAR_M = 3;
/** Rien n'est planté dans la zone du tapis : le parcours reste libre de part et d'autre. */
const ROUTE_CLEAR_M = 1.5;

const distanceToLine = (p: Vec2, line: readonly Vec2[]): number =>
  Math.min(...line.slice(1).map((b, i) => {
    const a = line[i] as Vec2;
    const [dx, dz] = [b.x - a.x, b.z - a.z];
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(a.x + dx * t - p.x, a.z + dz * t - p.z);
  }));

/**
 * Les arbres d'alignement : le long de chaque voie carrossable, d'un seul côté par tronçon, avec un espacement tiré de la graine de la
 * voie (déterministe), marqués « generated ». Refusés : sur la chaussée d'une autre voie, sur un passage piéton ou dans une entrée
 * (à moins de TREE_GAP_M d'un passage ou d'un mur), sur le parcours, ou trop près d'un autre objet. Sans voie, aucun arbre : le relevé seul.
 */
export function alignedTrees(roads: readonly Road[], buildings: readonly Building[], real: readonly Prop[], route: Path): Prop[] {
  const walls = buildings.map(footprintOf);
  const streets = roads.filter((r) => r.footway === undefined && TREE_SPACING_M[r.highway.replace(/_link$/, "")] !== undefined);
  const crossings = roads.filter((r) => r.footway === "crossing");
  const taken: Vec2[] = real.map((p) => p.at);
  const wanted: Vec2[] = [];
  for (const road of streets) {
    const spacing = TREE_SPACING_M[road.highway.replace(/_link$/, "")] as number;
    const seed = roadSeed(road) ^ 0x7ee5;
    const random = seededRandom(seed);
    const half = widthOf(road.highway) / 2 + TREE_OFFSET_M;
    let next = random() * spacing;
    let walked = 0;
    for (const [i, b] of road.points.slice(1).entries()) {
      const a = road.points[i] as Vec2;
      const length = Math.hypot(b.x - a.x, b.z - a.z);
      const side = hash32(seed + i * 0x9e3779b1) % 2 === 0 ? 1 : -1;
      for (; next < walked + length; next += spacing * (1 + TREE_JITTER * (2 * random() - 1))) {
        const t = (next - walked) / length;
        wanted.push({ x: a.x + (b.x - a.x) * t - ((b.z - a.z) / length) * side * half, z: a.z + (b.z - a.z) * t + ((b.x - a.x) / length) * side * half });
      }
      walked += length;
    }
  }
  const trees: Prop[] = [];
  for (const at of closest(wanted, route, wanted.length, (p) => p)) {
    if (trees.length === MAX_ALIGNED_TREES) break;
    if (onOtherRoad(at, { highway: "", points: [] }, streets)) continue;
    if (crossings.some((c) => distanceToLine(at, c.points) < CROSSING_CLEAR_M)) continue;
    if (nearBuilding(at, walls, Math.max(MIN_SIDEWALK_M, TREE_GAP_M))) continue;
    if (distanceToLine(at, route.points) < ROUTE_CLEAR_M) continue;
    if (taken.some((o) => Math.hypot(o.x - at.x, o.z - at.z) < TREE_GAP_M)) continue;
    taken.push(at);
    trees.push({ kind: "tree", at, source: "generated" });
  }
  return trees;
}
