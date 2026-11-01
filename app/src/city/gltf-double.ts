// Doublure de test : fabrique un modèle glTF (texte et tampon binaire) et une archive de pack d'arbres en mémoire.
// Aucun code de l'application ne l'importe.
import type { Primitive } from "./gltf-read.ts";
import { makeZip } from "./zip-double.ts";

/** Un modèle glTF : positions et couleurs en flottants, indices sur 16 bits (ou 32 bits si `wide`). */
export function makeGltf(primitives: Primitive[], wide = false): { gltf: string; bin: Buffer } {
  const chunks: Buffer[] = [];
  const bufferViews: object[] = [];
  const accessors: object[] = [];
  let offset = 0;
  const add = (values: number[], type: string, componentType: number): number => {
    const size = componentType === 5123 ? 2 : 4;
    const chunk = Buffer.alloc(values.length * size);
    values.forEach((v, i) => (componentType === 5126 ? chunk.writeFloatLE(v, i * 4) : componentType === 5123 ? chunk.writeUInt16LE(v, i * 2) : chunk.writeUInt32LE(v, i * 4)));
    bufferViews.push({ byteOffset: offset });
    chunks.push(chunk);
    offset += chunk.length;
    const width = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[type] as number;
    accessors.push({ bufferView: bufferViews.length - 1, componentType, count: values.length / width, type });
    return accessors.length - 1;
  };
  const meshes = primitives.map((p, material) => ({
    attributes: {
      POSITION: add(p.positions, "VEC3", 5126),
      ...(p.colors.length > 0 && { COLOR_0: add(p.colors, "VEC4", 5126) }),
      TEXCOORD_0: add(p.uvs, "VEC2", 5126),
    },
    indices: add(p.indices, "SCALAR", wide ? 5125 : 5123),
    material,
  }));
  const gltf = JSON.stringify({ accessors, bufferViews, materials: primitives.map((p) => ({ name: p.material })), meshes: [{ primitives: meshes }] });
  return { gltf, bin: Buffer.concat(chunks) };
}

/** Un tronc en prisme (écorce) et `quads` cartes de feuilles (quatre sommets chacune, deux triangles dans un ordre mêlé). */
export function treePrimitives(quads = 4, barkMaterial = "Bark_NormalTree", leavesMaterial = "Leaves_NormalTree"): Primitive[] {
  const ring = (y: number): number[] => [0.2, y, 0, 0, y, 0.2, -0.2, y, 0, 0, y, -0.2];
  const barkPositions = [...ring(0), ...ring(1), ...ring(2)];
  const sides = (base: number): number[] =>
    [0, 1, 2, 3].flatMap((a) => {
      const b = (a + 1) % 4;
      return [base + a, base + b, base + b + 4, base + a, base + b + 4, base + a + 4];
    });
  const barkIndices = [...sides(0), ...sides(4)];
  const barkColors = Array.from({ length: 12 }, (_, v) => [1, 1, 1, 1].map((c) => (v < 4 ? 0.5 : c))).flat();
  const bark: Primitive = { material: barkMaterial, positions: barkPositions, colors: barkColors, uvs: Array.from({ length: 24 }, () => 0.5), indices: barkIndices };
  const leafPositions = Array.from({ length: quads }, (_, q) => [0, 3, 0, 1, 3, 0, 1, 4, 0, 0, 4, 0].map((v, i) => v + (i % 3 === 2 ? q : 0))).flat();
  const leafUvs = Array.from({ length: quads }, () => [0, 0, 2, 0, 2, 2, 0, 2]).flat();
  const leafIndices = Array.from({ length: quads }, (_, q) => [3, 2, 1, 3, 1, 0].map((v) => v + q * 4)).flat().reverse();
  return [bark, { material: leavesMaterial, positions: leafPositions, colors: [], uvs: leafUvs, indices: leafIndices }];
}

/** Une archive de pack : `names` arbres, la texture des feuilles (octets de PNG factices) et la licence. */
export function makePackZip(names: string[], primitives: Primitive[] = treePrimitives()): Uint8Array {
  const files: Record<string, Uint8Array | string> = {
    "License_Standard.txt": "CC0 1.0 Universal (licence factice)",
    "glTF/Leaves_NormalTree_C.png": Uint8Array.from([137, 80, 78, 71]),
  };
  for (const name of names) {
    const { gltf, bin } = makeGltf(primitives);
    files[`glTF/${name}.gltf`] = gltf;
    files[`glTF/${name}.bin`] = bin;
  }
  return makeZip(files);
}
