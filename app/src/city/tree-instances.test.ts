import { InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import type { Prop } from "./souq-data.ts";
import { createPath } from "../route/path.ts";
import type { Building, Road } from "./souq-data.ts";
import { MAX_ALIGNED_TREES, alignedTrees, buildPackTrees, treeLook, treeSeed } from "./tree-instances.ts";
import { testPack } from "./tree-pack-double.ts";

const trees = (count: number): Prop[] => Array.from({ length: count }, (_, i) => ({ kind: "tree", source: "osm", at: { x: i * 7.3, z: -i * 3.1 } }));

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
    const group = buildPackTrees([{ kind: "tree", source: "osm", at: { x: 40, z: -12 } }], pack);
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

  it("APP-009: les arbres d'alignement suivent la voie, d'un espacement varié et toujours le même, marqués « generated »", () => {
    const route = createPath([{ x: 0, z: 0 }, { x: 300, z: 0 }]);
    const road: Road = { id: 5, highway: "residential", points: [{ x: 0, z: 0 }, { x: 300, z: 0 }] };
    const once = alignedTrees([road], [], [], route);
    expect(alignedTrees([road], [], [], route)).toEqual(once);
    expect(once.length).toBeGreaterThan(15);
    expect(once.every((t) => t.kind === "tree" && t.source === "generated" && Math.abs(t.at.z) > 2)).toBe(true);
    const xs = once.map((t) => t.at.x).sort((a, b) => a - b);
    const gaps = xs.slice(1).map((x, i) => x - (xs[i] as number));
    expect(new Set(gaps.map((g) => g.toFixed(2))).size).toBeGreaterThan(gaps.length / 2);
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(3);
  });

  it("APP-009: sans voie carrossable, aucun arbre inventé ; plafonné", () => {
    const route = createPath([{ x: 0, z: 0 }, { x: 9000, z: 0 }]);
    expect(alignedTrees([], [], [], route)).toEqual([]);
    expect(alignedTrees([{ highway: "steps", points: [{ x: 0, z: 0 }, { x: 50, z: 0 }] }, { highway: "residential", footway: "sidewalk", points: [{ x: 0, z: 0 }, { x: 50, z: 0 }] }], [], [], route)).toEqual([]);
    const long: Road[] = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, highway: "service", points: [{ x: 0, z: i * 20 }, { x: 300, z: i * 20 }] }));
    expect(alignedTrees(long, [], [], route).length).toBe(MAX_ALIGNED_TREES);
  });

  it("APP-009: aucun arbre sur un passage piéton, une autre chaussée, un mur, le parcours ou un objet du relevé", () => {
    const route = createPath([{ x: 0, z: 40 }, { x: 300, z: 40 }]);
    const road: Road = { id: 5, highway: "residential", points: [{ x: 0, z: 0 }, { x: 300, z: 0 }] };
    const base = alignedTrees([road], [], [], route);
    const target = base[3]?.at as { x: number; z: number };
    const crossing: Road = { highway: "footway", footway: "crossing", points: [{ x: target.x, z: target.z - 5 }, { x: target.x, z: target.z + 5 }] };
    const wall: Building = { footprint: [{ x: target.x - 1, z: target.z - 1 }, { x: target.x + 1, z: target.z - 1 }, { x: target.x + 1, z: target.z + 1 }, { x: target.x - 1, z: target.z + 1 }], heightM: 9 };
    const cross: Road = { id: 9, highway: "primary", points: [{ x: target.x, z: -30 }, { x: target.x, z: 30 }] };
    const near = (list: { at: { x: number; z: number } }[]): boolean => list.some((t) => Math.hypot(t.at.x - target.x, t.at.z - target.z) < 2.5);
    expect(near(alignedTrees([road, crossing], [], [], route))).toBe(false);
    const dot: Road = { highway: "footway", footway: "crossing", points: [target, target] };
    expect(near(alignedTrees([road, dot], [], [], route))).toBe(false);
    expect(near(alignedTrees([road], [wall] as Building[], [], route))).toBe(false);
    expect(near(alignedTrees([road, cross], [], [], route))).toBe(false);
    expect(near(alignedTrees([road], [], [{ kind: "bench", source: "osm", at: { x: target.x + 1, z: target.z } }], route))).toBe(false);
    const onRoute = createPath([{ x: 0, z: target.z }, { x: 300, z: target.z }]);
    expect(near(alignedTrees([road], [], [], onRoute))).toBe(false);
  });
});
