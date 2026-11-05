import { describe, expect, it, vi } from "vitest";
import { readGlbScene, splitGlb } from "../../scripts/glb-scene.ts";
import { SOURCES, flatten, prepareFiles, prepareSource } from "../../scripts/prepare-traffic-pack.ts";
import { glbBuilder, makeGlb, makePng, triangleGlb } from "./glb-double.ts";
import { makeZip } from "./zip-double.ts";

/** Un personnage d'essai : deux os, un triangle surtout lié à l'os 1, une animation « idle » qui lève cet os d'un mètre. */
function riggedGlb(): Uint8Array {
  const glb = glbBuilder();
  const position = glb.add([0, 0, 0, 1, 0, 0, 0, 1, 0], "VEC3");
  const indices = glb.add([0, 1, 2], "SCALAR", 5125);
  const joints = glb.add([1, 0, 0, 0, 1, 0, 0, 0, 1, 9, 0, 0], "VEC4", 5121);
  const weights = glb.add([255, 0, 0, 0, 255, 0, 0, 0, 128, 128, 0, 0], "VEC4", 5121, { normalized: true });
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const inverse = glb.add([...identity, ...identity, ...identity], "MAT4");
  const lift = glb.add([0, 1, 0], "VEC3");
  const turn = glb.add([0, 0, 0, 1], "VEC4");
  const grow = glb.add([1, 1, 1], "VEC3");
  return glb.build({
    scene: 0,
    scenes: [{ nodes: [0, 1, 2] }],
    nodes: [{ mesh: 0, skin: 0 }, { matrix: identity }, {}, { mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: position, JOINTS_0: joints, WEIGHTS_0: weights }, indices }] }],
    // L'os 3 n'est pas dans la scène : il garde sa pose de liaison.
    skins: [{ joints: [1, 2, 3], inverseBindMatrices: inverse }],
    animations: [
      { name: "walk", channels: [], samplers: [] },
      {
        name: "idle",
        channels: [
          { sampler: 0, target: { node: 2, path: "translation" } },
          { sampler: 1, target: { node: 2, path: "rotation" } },
          { sampler: 2, target: { node: 2, path: "scale" } },
          { sampler: 0, target: { node: 2, path: "weights" } },
          { sampler: 0, target: { node: 7, path: "translation" } },
          { sampler: 5, target: { node: 2, path: "translation" } },
        ],
        samplers: [{ output: lift }, { output: turn }, { output: grow }],
      },
    ],
  });
}

describe("préparation des modèles de figurants", () => {
  it("APP-014: un modèle glb est lu en mémoire, nœuds transformés, matériau et texture repérés", () => {
    const [part] = readGlbScene(triangleGlb({ texture: true, color: [0.5, 1, 1, 1] }));
    expect(part?.positions).toEqual([2, 0, 0, 3, 0, 0, 2, 1, 1]);
    expect(part?.uvs.map((v) => Math.round(v * 10) / 10)).toEqual([0, 0, 0.9, 0, 0, 0.9]);
    expect(part?.indices).toEqual([0, 1, 2]);
    expect(part?.material).toEqual({ color: [0.5, 1, 1], image: 0 });
  });

  it("APP-014: la peau d'un personnage est posée à la première image de l'animation choisie, os pondérés", () => {
    const [still] = readGlbScene(riggedGlb());
    const round = (values: number[] | undefined) => values?.map((v) => Math.round(v * 100) / 100);
    // Le troisième sommet : à moitié sur l'os 1, l'autre moitié sur un os absent (ignoré).
    expect(round(still?.positions)).toEqual([0, 0, 0, 1, 0, 0, 0, 0.5, 0]);
    const [posed] = readGlbScene(riggedGlb(), "idle");
    expect(round(posed?.positions)).toEqual([0, 1, 0, 1, 1, 0, 0, 1, 0]);
    expect(posed?.material).toEqual({ color: [1, 1, 1] });
    expect(posed?.uvs).toEqual([]);
  });

  it("APP-014: un glb illisible est refusé avec sa raison, jamais exécuté", () => {
    expect(() => splitGlb(Uint8Array.from([1, 2, 3]))).toThrow("en-tête attendu");
    const good = triangleGlb();
    const wrongMagic = good.slice();
    wrongMagic[0] = 0;
    expect(() => splitGlb(wrongMagic)).toThrow("en-tête attendu");
    expect(() => splitGlb(good.slice(0, 20 + new DataView(good.buffer).getUint32(12, true)))).toThrow("bloc binaire absent");
    const glb = glbBuilder();
    const position = glb.add([0, 0, 0], "VEC3");
    const bad = (json: Record<string, unknown>) => () => readGlbScene(glb.build({ scenes: [{ nodes: [0] }], meshes: [{ primitives: [{ attributes: { POSITION: position }, indices: 9 }] }], ...json }));
    expect(bad({ nodes: [{ mesh: 0 }] })).toThrow("accesseur 9 illisible");
    expect(bad({ nodes: [{ children: [0] }] })).toThrow("nœud 0 absent ou repris");
    expect(bad({ nodes: [], scene: 3 })).not.toThrow();
    expect(() => readGlbScene(glb.build({ scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }], meshes: [{ primitives: [{ attributes: {}, indices: 0 }] }] }))).toThrow("accesseur undefined illisible");
    expect(() => readGlbScene(makeGlb({ scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [{ bufferView: 0, componentType: 1, count: 1, type: "VEC3" }], bufferViews: [{}] }, Buffer.alloc(4)))).not.toThrow();
  });

  it("APP-014: les accesseurs entrelacés et les entiers 16 bits sont lus ; un nœud hors de la scène est ignoré", () => {
    const glb = glbBuilder();
    const position = glb.add([0, 0, 0, 1, 0, 0, 0, 1, 0], "VEC3", 5126, { stride: 16 });
    const indices = glb.add([0, 1, 2], "SCALAR", 5123);
    const parts = readGlbScene(glb.build({ scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }, { mesh: 0 }], meshes: [{ primitives: [{ attributes: { POSITION: position }, indices }] }, {}] }));
    expect(parts).toHaveLength(1);
    expect(parts[0]?.positions).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const empty = readGlbScene(glb.build({ scenes: [{ nodes: [0] }], nodes: [{ mesh: 1 }], meshes: [{ primitives: [] }, {}] }));
    expect(empty).toEqual([]);
    // Vue sans décalage, accesseur décalé, matériau sans couleur : blanc.
    const raw = Buffer.alloc(40);
    [0, 0, 0, 1, 0, 0, 0, 1, 0].forEach((v, i) => raw.writeFloatLE(v, 4 + i * 4));
    const [shifted] = readGlbScene(makeGlb({
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }, { attributes: { POSITION: 0 }, indices: 1 }] }],
      materials: [{}],
      accessors: [{ bufferView: 0, byteOffset: 4, componentType: 5126, count: 3, type: "VEC3" }, { bufferView: 0, componentType: 5121, count: 3, type: "SCALAR" }],
      bufferViews: [{}],
    }, raw));
    expect(shifted?.positions).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    expect(shifted?.material).toEqual({ color: [1, 1, 1] });
  });

  it("APP-014: un modèle aplati porte une couleur par sommet (texture fois matériau), posé au sol et centré, sommets fusionnés", () => {
    const texture = { width: 1, height: 1, rgba: Uint8Array.from([255, 0, 0, 255]) };
    const part = { positions: [0, 1, 0, 2, 1, 0, 0, 1, 2, 0, 1, 0], uvs: [0, 0], indices: [0, 1, 2, 3, 1, 2], material: { color: [1, 0.5, 1] as [number, number, number], image: 0 } };
    const model = flatten("essai", [part], texture);
    expect(model.positions).toEqual([-1, 0, -1, 1, 0, -1, -1, 0, 1]);
    expect(model.indices).toEqual([0, 1, 2, 0, 1, 2]);
    expect(model.palette).toEqual([1, 0, 0]);
    expect(model.shades).toEqual([0, 0, 0]);
    const plain = flatten("essai", [{ ...part, uvs: [] }], undefined);
    expect(plain.palette).toEqual([1, 0.5, 1]);
    expect(flatten("essai", [{ ...part, material: { color: [0.25, 0.25, 0.25] } }], texture).palette).toEqual([0.25, 0.25, 0.25]);
  });

  it("APP-014: les sources du catalogue sont lues hors du dépôt ; modèles et licences des archives écrits dans app/assets", () => {
    const png = makePng(1, 1, 2, [[0, 200, 100, 50]]);
    const archive = (source: (typeof SOURCES)[number]): Uint8Array => {
      if (!source.file.endsWith(".zip")) return triangleGlb();
      const files: Record<string, Uint8Array | string> = { [source.licence?.entry ?? "License.txt"]: "CC0 (licence factice)", ...(source.texture ? { [source.texture]: png } : {}) };
      for (const entry of Object.values(source.models)) files[entry] = triangleGlb({ texture: true });
      return makeZip(files);
    };
    const read = vi.fn((path: string) => archive(SOURCES.find((s) => path.endsWith(s.file)) as (typeof SOURCES)[number]));
    const write = vi.fn();
    prepareFiles("/hors-depot/packs", "assets", read, write);
    expect(read).toHaveBeenCalledWith("/hors-depot/packs/kenney_car-kit.zip");
    expect(write.mock.calls.map((c) => c[0] as string)).toEqual(["assets/figurants.json", "assets/kenney-car-kit-licence.txt", "assets/kenney-mini-characters-licence.txt"]);
    const models = (JSON.parse(write.mock.calls[0]?.[1] as string) as { models: { name: string }[] }).models.map((m) => m.name);
    expect(models).toEqual(expect.arrayContaining(["sedan", "character-male-a", "motorcycle"]));
    const bare = prepareSource({ file: "nu.zip", models: { a: "a.glb" } }, () => makeZip({ "a.glb": triangleGlb() }));
    expect(bare.licence).toBeUndefined();
    expect(bare.models[0]?.palette).toEqual([1, 1, 1]);
  });
});
