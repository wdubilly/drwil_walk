import { describe, expect, it, vi } from "vitest";
import { BARK_TRIANGLES, LEAF_QUADS, RETAINED, prepare, prepareFiles, prepareTree } from "../../scripts/prepare-nature-pack.ts";
import type { Primitive } from "./gltf-read.ts";
import { makePackZip, treePrimitives } from "./gltf-double.ts";
import { openZip } from "./zip-read.ts";

interface Part {
  positions: number[];
  indices: number[];
  colors?: number[];
  uvs?: number[];
}
interface Tree {
  name: string;
  bark: Part;
  leaves: Part;
}

describe("préparation du pack Quaternius", () => {
  it("APP-003: retient les arbres demandés, écorce colorée et feuillage en cartes, dans les plafonds", () => {
    const { trees, licence } = prepare(makePackZip(RETAINED, treePrimitives(300)));
    const data = JSON.parse(trees) as { leafTexture: string; models: Tree[] };
    expect(data.models.map((m) => m.name)).toEqual(RETAINED);
    expect(data.leafTexture).toBe(`data:image/png;base64,${Buffer.from([137, 80, 78, 71]).toString("base64")}`);
    expect(licence).toContain("CC0 1.0");
    for (const model of data.models) {
      expect(model.bark.indices.length / 3).toBeLessThanOrEqual(BARK_TRIANGLES);
      expect(model.bark.colors?.length).toBe(model.bark.positions.length);
      expect(model.leaves.positions.length / 12).toBeLessThanOrEqual(LEAF_QUADS);
      expect(model.leaves.uvs?.length).toBe((model.leaves.positions.length / 3) * 2);
    }
  });

  it("APP-003: la couleur de l'écorce est celle du tronc fois l'ombrage du pack", () => {
    const tree = prepareTree(openZip(makePackZip(["CommonTree_1"])), "CommonTree_1") as Tree;
    const shade = new Set((tree.bark.colors ?? []).map((c) => c));
    // Deux ombrages dans le modèle d'essai (0,5 en bas, 1 ailleurs) : au moins deux valeurs de rouge distinctes.
    expect(shade.size).toBeGreaterThan(3);
    expect(Math.max(...(tree.bark.colors ?? []))).toBeCloseTo(0.26, 1);
  });

  it("APP-003: sans ombrage dans le modèle, l'écorce garde la couleur du tronc", () => {
    const [bark, leaves] = treePrimitives(2) as [Primitive, Primitive];
    const plain = makePackZip(["CommonTree_1"], [{ ...bark, colors: [] }, leaves]);
    const tree = prepareTree(openZip(plain), "CommonTree_1") as Tree;
    expect(Math.max(...(tree.bark.colors ?? []))).toBeCloseTo(0.26, 1);
  });

  it("refuse un arbre sans écorce ou sans feuillage", () => {
    const noBark = makePackZip(["CommonTree_1"], treePrimitives(2, "Autre"));
    expect(() => prepareTree(openZip(noBark), "CommonTree_1")).toThrow("CommonTree_1 : matériau « Bark… » absent");
    const noLeaves = makePackZip(["CommonTree_1"], treePrimitives(2, "Bark_NormalTree", "Autre"));
    expect(() => prepareTree(openZip(noLeaves), "CommonTree_1")).toThrow("matériau « Leaves… » absent");
  });

  it("écrit le modèle et la licence à l'endroit demandé", () => {
    const write = vi.fn();
    const read = vi.fn(() => Buffer.from(makePackZip(RETAINED)));
    prepareFiles("/hors-depot/pack.zip", "assets", read, write);
    expect(read).toHaveBeenCalledWith("/hors-depot/pack.zip");
    expect(write.mock.calls.map((call) => call[0] as string)).toEqual(["assets/quaternius-trees.json", "assets/quaternius-licence.txt"]);
  });
});
