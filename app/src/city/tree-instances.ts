// Les arbres du pack posés dans la ville : chaque arbre de l'extrait OpenStreetMap prend, de façon déterministe, une variante,
// un cap et une taille ; chaque variante est un maillage instancié (écorce, feuillage), avec des matériaux partagés.
import { Group, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import type { Prop } from "./souq-data.ts";
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
