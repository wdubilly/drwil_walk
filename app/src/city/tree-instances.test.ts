import { InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import type { Prop } from "./souq-data.ts";
import { buildPackTrees, treeLook, treeSeed } from "./tree-instances.ts";
import { testPack } from "./tree-pack-double.ts";

const trees = (count: number): Prop[] => Array.from({ length: count }, (_, i) => ({ kind: "tree", at: { x: i * 7.3, z: -i * 3.1 } }));

describe("arbres du pack posés dans la ville", () => {
  it("APP-003: le même endroit donne toujours la même variante, le même cap et la même taille", () => {
    expect(treeSeed(12.34, -5.6)).toBe(treeSeed(12.34, -5.6));
    expect(treeLook(12.34, -5.6, 4)).toEqual(treeLook(12.34, -5.6, 4));
    const looks = Array.from({ length: 200 }, (_, i) => treeLook(i * 1.7, i * -2.3, 4));
    expect(new Set(looks.map((l) => l.variant))).toEqual(new Set([0, 1, 2, 3]));
    expect(looks.every((l) => l.headingDeg >= 0 && l.headingDeg < 360 && l.scale >= 0.85 && l.scale <= 1.2)).toBe(true);
    expect(new Set(looks.map((l) => l.scale)).size).toBeGreaterThan(5);
  });

  it("APP-003: un maillage instancié par variante et par partie, partageant les mêmes matériaux", async () => {
    const pack = await testPack();
    const group = buildPackTrees(trees(60), pack);
    expect(group.name).toBe("arbres");
    const meshes = group.children as InstancedMesh[];
    expect(meshes.every((m) => m instanceof InstancedMesh)).toBe(true);
    expect(meshes.map((m) => m.name)).toEqual(["A", "B", "C"].flatMap((v) => [`arbres-ecorce-${v}`, `arbres-feuillage-${v}`]));
    expect(meshes.filter((m) => m.name.startsWith("arbres-ecorce")).reduce((sum, m) => sum + m.count, 0)).toBe(60);
    expect(meshes.filter((m) => m.name.startsWith("arbres-feuillage")).reduce((sum, m) => sum + m.count, 0)).toBe(60);
    expect(new Set(meshes.map((m) => m.material)).size).toBe(2);
  });

  it("APP-003: chaque arbre est posé sur son point, au sol, tourné et mis à l'échelle", async () => {
    const pack = await testPack();
    const [tree] = trees(1);
    const group = buildPackTrees([{ kind: "tree", at: { x: 40, z: -12 } }], pack);
    const mesh = group.children[0] as InstancedMesh;
    const matrix = new Matrix4();
    mesh.getMatrixAt(0, matrix);
    const position = new Vector3();
    const scale = new Vector3();
    matrix.decompose(position, new Quaternion(), scale);
    const look = treeLook(40, -12, 3);
    expect([position.x, position.y, position.z]).toEqual([40, 0, -12]);
    expect(scale.x).toBeCloseTo(look.scale);
    expect(group.children.length).toBe(2);
    expect(tree?.kind).toBe("tree");
  });

  it("APP-003: sans arbre, le groupe est vide", async () => {
    expect(buildPackTrees([], await testPack()).children).toEqual([]);
  });
});
