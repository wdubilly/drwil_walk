import { describe, expect, it } from "vitest";
import { makeGltf, treePrimitives } from "./gltf-double.ts";
import { readGltf } from "./gltf-read.ts";

describe("lecture d'un modèle glTF", () => {
  it("APP-003: rend, pour chaque primitive, matériau, positions, couleurs, coordonnées de texture et indices", () => {
    const primitives = treePrimitives(2);
    const { gltf, bin } = makeGltf(primitives);
    const read = readGltf(gltf, bin);
    expect(read.map((p) => p.material)).toEqual(["Bark_NormalTree", "Leaves_NormalTree"]);
    expect(read[0]?.positions).toEqual(primitives[0]?.positions.map(Math.fround));
    expect(read[0]?.colors).toEqual(primitives[0]?.colors.map(Math.fround));
    expect(read[1]?.colors).toEqual([]);
    expect(read[1]?.uvs).toEqual(primitives[1]?.uvs.map(Math.fround));
    expect(read[1]?.indices).toEqual(primitives[1]?.indices);
  });

  it("APP-003: lit aussi des indices sur 32 bits", () => {
    const primitives = treePrimitives(1);
    const { gltf, bin } = makeGltf(primitives, true);
    expect(readGltf(gltf, bin)[1]?.indices).toEqual(primitives[1]?.indices);
  });

  it("APP-003: refuse un modèle sans maillage ou dont un accesseur est illisible", () => {
    expect(() => readGltf(JSON.stringify({ meshes: [] }), new Uint8Array())).toThrow("aucun maillage");
    const { gltf, bin } = makeGltf(treePrimitives(1));
    const json = JSON.parse(gltf) as { accessors: { componentType: number }[] };
    (json.accessors[0] as { componentType: number }).componentType = 1;
    expect(() => readGltf(JSON.stringify(json), bin)).toThrow("accesseur 0 illisible");
    const lost = JSON.parse(gltf) as { meshes: { primitives: { attributes: Record<string, number> }[] }[] };
    delete (lost.meshes[0]?.primitives[0] as { attributes: Record<string, number> }).attributes["POSITION"];
    expect(() => readGltf(JSON.stringify(lost), bin)).toThrow("accesseur -1 illisible");
  });

  it("APP-003: garde un nom de matériau vide quand le matériau est inconnu", () => {
    const { gltf, bin } = makeGltf(treePrimitives(1));
    const json = JSON.parse(gltf) as { materials: unknown[] };
    json.materials = [];
    expect(readGltf(JSON.stringify(json), bin)[0]?.material).toBe("");
  });

  it("APP-003: refuse une primitive sans coordonnées de texture", () => {
    const { gltf, bin } = makeGltf(treePrimitives(1));
    const json = JSON.parse(gltf) as { meshes: { primitives: { attributes: Record<string, number> }[] }[] };
    delete (json.meshes[0]?.primitives[0] as { attributes: Record<string, number> }).attributes["TEXCOORD_0"];
    expect(() => readGltf(JSON.stringify(json), bin)).toThrow("accesseur -1 illisible");
  });
});
