import { Window } from "happy-dom";
import { Group, InstancedMesh, Mesh, type Material } from "three";
import { describe, expect, it } from "vitest";
import { withCanvasContext } from "./canvas-double.ts";
import { createPath } from "../route/path.ts";
import { DEFAULT_ZONE } from "../safety/zone.ts";
import { MAX_TREES } from "./props.ts";
import { createSouqScene, setCityOpacity } from "./souq.ts";
import type { Souq } from "./souq-data.ts";
import { testPack } from "./tree-pack-double.ts";
import { createZoneClip } from "./zone-clip.ts";

const souq: Souq = {
  origin: [51.5, 25.3],
  route: createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]),
  palette: { ground: 0x808080, road: 0x202020, buildings: [0xff0000] },
  roads: [],
  areas: [],
  hedges: [],
  props: Array.from({ length: MAX_TREES + 40 }, (_, i) => ({ kind: "tree", at: { x: 3 + i, z: -(i % 90) } })),
  buildings: [],
};

async function scene() {
  const doc = withCanvasContext(new Window().document as unknown as Document);
  return createSouqScene(doc, souq, { trees: await testPack() });
}

describe("ville avec les arbres du pack", () => {
  it("APP-003: les arbres du pack remplacent l'arbre procédural, dans le plafond d'arbres", async () => {
    const { osm } = await scene();
    const trees = osm.getObjectByName("arbres") as Group;
    expect(trees).toBeInstanceOf(Group);
    const bark = trees.children.filter((m) => m.name.startsWith("arbres-ecorce")) as InstancedMesh[];
    expect(bark.reduce((sum, m) => sum + m.count, 0)).toBe(MAX_TREES);
  });

  it("APP-001: le fondu de sécurité efface les arbres du pack et la zone tapis les découpe", async () => {
    const { world, osm } = await scene();
    const planes = createZoneClip(DEFAULT_ZONE).planes;
    setCityOpacity(world, 0.3, planes);
    const meshes = (osm.getObjectByName("arbres") as Group).children as Mesh[];
    expect(meshes.length).toBeGreaterThan(0);
    for (const mesh of meshes) {
      const material = mesh.material as Material;
      expect([mesh.name, material.transparent, material.opacity, material.clippingPlanes === planes, material.clipIntersection]).toEqual([mesh.name, true, 0.3, true, true]);
    }
    setCityOpacity(world, 0, planes);
    expect(world.visible).toBe(false);
  });
});
