// Arbres et mobilier urbain de l'extrait OpenStreetMap, en très peu de maillages (72 images par seconde sur le Quest 3) :
// les arbres sont les instances d'un seul modèle, plafonnées en nombre ; le mobilier (lampadaires, bancs, poubelles, panneaux)
// est produit par code (`furniture.ts`) et fusionné en un seul maillage, posé au sol et tourné dans l'axe de la rue (APP-009).
import { CylinderGeometry, Group, IcosahedronGeometry, InstancedMesh, Matrix4, Mesh, MeshLambertMaterial, type BufferGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import { closest } from "./near-route.ts";
import { colored, furnitureParts, mergeParts } from "./furniture.ts";
import type { Prop } from "./souq-data.ts";
import { buildPackTrees } from "./tree-instances.ts";
import { MAX_MODEL_TRIANGLES, type TreePack } from "./tree-pack.ts";

/** Plafond des arbres dessinés : les plus proches du parcours d'abord. */
export const MAX_TREES = 300;
/** Plafond de triangles de tous les arbres du pack ensemble : MAX_TREES arbres de la taille maximale d'un modèle. */
export const MAX_TREE_TRIANGLES = MAX_TREES * MAX_MODEL_TRIANGLES;
/** Plafond du mobilier (lampadaires, bancs, poubelles, panneaux) fusionné dans un maillage. */
export const MAX_FURNITURE = 400;
/** Plafond propre aux lampadaires produits par règle (APP-013) : le mobilier du relevé n'est jamais évincé par du mobilier inventé. */
export const MAX_GENERATED_LAMPS = 300;

/** Un lampadaire dessiné, à sa place et tourné comme son mât : ses lanternes s'allument la nuit (`street-lights.ts`). */
export interface PlacedLamp {
  at: Vec2;
  yaw: number;
}

/** Combien d'objets viennent d'OpenStreetMap, combien sont produits par règle. */
export interface Sources {
  osm: number;
  generated: number;
}

export const countSources = (props: readonly Prop[]): Sources => ({
  osm: props.filter((p) => p.source === "osm").length,
  generated: props.filter((p) => p.source === "generated").length,
});

/** Un arbre : tronc brun et couronne verte. */
export const treeModel = (): BufferGeometry =>
  mergeGeometries([colored(new CylinderGeometry(0.15, 0.2, 2.4, 6), 0x6b4a2b, 0, 1.2, 0), colored(new IcosahedronGeometry(1.7, 0), 0x3f7a3a, 0, 3.4, 0)]);

/** Les `max` éléments les plus proches du parcours (les autres ne se verront pas pendant la marche). */
export const nearest = (props: readonly Prop[], route: Path, max: number): Prop[] => closest(props, route, max, (p) => p.at);

/**
 * Les arbres, dans le plafond MAX_TREES : ceux du pack Quaternius s'il est chargé (instances par variante), sinon l'arbre
 * procédural, un seul maillage instancié.
 */
export function buildTrees(props: readonly Prop[], route: Path, pack?: TreePack, max = MAX_TREES, aligned: readonly Prop[] = []): InstancedMesh | Group {
  const real = nearest(props.filter((p) => p.kind === "tree"), route, Math.min(max, MAX_TREES));
  const trees = [...real, ...nearest(aligned, route, Math.min(max, MAX_TREES) - real.length)];
  if (pack) return buildPackTrees(trees, pack);
  const mesh = new InstancedMesh(treeModel(), new MeshLambertMaterial({ vertexColors: true }), trees.length);
  for (const [i, tree] of trees.entries()) mesh.setMatrixAt(i, new Matrix4().makeTranslation(tree.at.x, 0, tree.at.z));
  mesh.name = "arbres";
  return mesh;
}

/** Le cap de la rue à l'endroit du mobilier : celui du parcours au sommet le plus proche, pour que rien ne soit posé de travers. */
export function routeYaw(at: Vec2, route: Path): number {
  const points = route.points;
  const distances = points.map((p) => Math.hypot(p.x - at.x, p.z - at.z));
  const i = distances.indexOf(Math.min(...distances));
  // Un parcours a toujours au moins deux points (`createPath`) : le dernier sommet se lit sur le segment qui le précède.
  const j = i + 1 < points.length ? i + 1 : i - 1;
  const [from, to] = j > i ? [points[i] as Vec2, points[j] as Vec2] : [points[j] as Vec2, points[i] as Vec2];
  return Math.atan2(-(to.z - from.z), to.x - from.x);
}

/**
 * Le mobilier : un seul maillage fusionné, vide s'il n'y en a pas. Les objets du relevé et les lampadaires produits ont chacun
 * leur plafond ; `userData.sources` dit combien de chaque provenance sont dessinés.
 */
export function buildFurniture(props: readonly Prop[], route: Path, max = MAX_FURNITURE, generated: readonly Prop[] = [], maxGenerated = MAX_GENERATED_LAMPS): Mesh {
  const real = nearest(props.filter((p) => p.kind !== "tree"), route, Math.min(max, MAX_FURNITURE));
  const kept = [...real, ...nearest(generated, route, Math.min(maxGenerated, MAX_GENERATED_LAMPS))];
  const parts: BufferGeometry[] = kept.flatMap((prop) => furnitureParts(prop, prop.yaw ?? routeYaw(prop.at, route)));
  const mesh = new Mesh(mergeParts(parts), new MeshLambertMaterial({ vertexColors: true }));
  mesh.name = "mobilier";
  mesh.userData["sources"] = countSources(kept);
  mesh.userData["lamps"] = kept.filter((p) => p.kind === "lamp").map((p): PlacedLamp => ({ at: p.at, yaw: p.yaw ?? routeYaw(p.at, route) }));
  return mesh;
}
