// Arbres, lampadaires et bancs de l'extrait OpenStreetMap, en très peu de maillages (72 images par seconde sur le Quest 3) :
// les arbres sont les instances d'un seul modèle, plafonnées en nombre ; le mobilier est fusionné en un seul maillage.
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import type { Prop } from "./souq-data.ts";

/** Plafond des arbres dessinés : les plus proches du parcours d'abord. */
export const MAX_TREES = 300;
/** Plafond du mobilier (lampadaires et bancs) fusionné dans un maillage. */
export const MAX_FURNITURE = 400;

/** Un modèle coloré : le matériau reste blanc, la teinte vient des sommets. */
function colored(geometry: BufferGeometry, hex: number, x = 0, y = 0, z = 0): BufferGeometry {
  const solid = geometry.index ? geometry.toNonIndexed() : geometry;
  solid.translate(x, y, z);
  solid.deleteAttribute("uv");
  const c = new Color(hex);
  solid.setAttribute("color", new Float32BufferAttribute(Array.from({ length: solid.getAttribute("position").count }, () => [c.r, c.g, c.b]).flat(), 3));
  return solid;
}

/** Un arbre : tronc brun et couronne verte. */
export const treeModel = (): BufferGeometry =>
  mergeGeometries([colored(new CylinderGeometry(0.15, 0.2, 2.4, 6), 0x6b4a2b, 0, 1.2, 0), colored(new IcosahedronGeometry(1.7, 0), 0x3f7a3a, 0, 3.4, 0)]);

/** Les `max` éléments les plus proches du parcours (les autres ne se verront pas pendant la marche). */
export function nearest(props: readonly Prop[], route: Path, max: number): Prop[] {
  const distance = (at: Vec2): number => Math.min(...route.points.map((p) => Math.hypot(p.x - at.x, p.z - at.z)));
  return props.map((p) => ({ p, d: distance(p.at) })).sort((a, b) => a.d - b.d).slice(0, max).map((e) => e.p);
}

/** Les arbres : un seul maillage instancié. */
export function buildTrees(props: readonly Prop[], route: Path): InstancedMesh {
  const trees = nearest(props.filter((p) => p.kind === "tree"), route, MAX_TREES);
  const mesh = new InstancedMesh(treeModel(), new MeshLambertMaterial({ vertexColors: true }), trees.length);
  for (const [i, tree] of trees.entries()) mesh.setMatrixAt(i, new Matrix4().makeTranslation(tree.at.x, 0, tree.at.z));
  mesh.name = "arbres";
  return mesh;
}

/** Lampadaire (mât gris, tête claire) ou banc (assise en bois) posé en (x, z). */
function furniture(prop: Prop): BufferGeometry[] {
  const { x, z } = prop.at;
  if (prop.kind === "lamp") {
    return [colored(new CylinderGeometry(0.06, 0.08, 5, 5), 0x4d5156, x, 2.5, z), colored(new BoxGeometry(0.5, 0.15, 0.5), 0xf2e6a8, x, 5.1, z)];
  }
  return [colored(new BoxGeometry(1.6, 0.45, 0.5), 0x7a5a38, x, 0.4, z)];
}

/** Le mobilier : un seul maillage fusionné, vide s'il n'y en a pas. */
export function buildFurniture(props: readonly Prop[], route: Path): Mesh {
  const kept = nearest(props.filter((p) => p.kind !== "tree"), route, MAX_FURNITURE);
  const parts = kept.flatMap(furniture);
  const geometry = (parts.length > 0 ? mergeGeometries(parts) : null) ?? new BufferGeometry();
  const mesh = new Mesh(geometry, new MeshLambertMaterial({ vertexColors: true }));
  mesh.name = "mobilier";
  return mesh;
}
