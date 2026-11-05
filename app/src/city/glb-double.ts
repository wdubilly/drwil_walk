// Doublure de test : fabrique en mémoire un modèle glTF binaire (.glb) et une image PNG, pour les packs de figurants.
// Aucun code de l'application ne l'importe.
import { deflateSync } from "node:zlib";

const SIZE: Record<number, number> = { 5126: 4, 5125: 4, 5123: 2, 5121: 1 };
const WIDTH: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

/** Accumule les accesseurs d'un .glb ; `build` assemble le fichier autour du JSON donné. */
export function glbBuilder() {
  const chunks: Buffer[] = [];
  const bufferViews: { byteOffset: number; byteStride?: number }[] = [];
  const accessors: object[] = [];
  let offset = 0;
  const add = (values: number[], type: string, componentType = 5126, extra: { normalized?: boolean; stride?: number } = {}): number => {
    const size = SIZE[componentType] as number;
    const width = WIDTH[type] as number;
    const stride = extra.stride ?? size * width;
    const count = values.length / width;
    const data = Buffer.alloc(Math.ceil((count * stride) / 4) * 4);
    values.forEach((v, i) => {
      const at = Math.floor(i / width) * stride + (i % width) * size;
      if (componentType === 5126) data.writeFloatLE(v, at);
      else if (componentType === 5125) data.writeUInt32LE(v, at);
      else if (componentType === 5123) data.writeUInt16LE(v, at);
      else data.writeUInt8(v, at);
    });
    bufferViews.push({ byteOffset: offset, ...(extra.stride === undefined ? {} : { byteStride: extra.stride }) });
    accessors.push({ bufferView: bufferViews.length - 1, componentType, count, type, ...(extra.normalized ? { normalized: true } : {}) });
    chunks.push(data);
    offset += data.length;
    return accessors.length - 1;
  };
  const build = (json: Record<string, unknown>): Uint8Array => makeGlb({ ...json, accessors, bufferViews }, Buffer.concat(chunks));
  return { add, build };
}

/** Un .glb : en-tête, bloc JSON (complété d'espaces), bloc binaire. */
export function makeGlb(json: object, bin: Buffer): Uint8Array {
  const text = Buffer.from(JSON.stringify(json));
  const jsonChunk = Buffer.concat([text, Buffer.alloc((4 - (text.length % 4)) % 4, 0x20)]);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + bin.length, 8);
  const chunk = (type: number, body: Buffer): Buffer => {
    const head = Buffer.alloc(8);
    head.writeUInt32LE(body.length, 0);
    head.writeUInt32LE(type, 4);
    return Buffer.concat([head, body]);
  };
  return new Uint8Array(Buffer.concat([header, chunk(0x4e4f534a, jsonChunk), chunk(0x004e4942, bin)]));
}

/** Un triangle coloré en un seul nœud, avec ou sans texture : le plus petit modèle d'un pack. */
export function triangleGlb(options: { texture?: boolean; color?: number[] } = {}): Uint8Array {
  const glb = glbBuilder();
  const position = glb.add([0, 0, 0, 1, 0, 0, 0, 1, 1], "VEC3");
  const uv = glb.add([0, 0, 0.9, 0, 0, 0.9], "VEC2");
  const indices = glb.add([0, 1, 2], "SCALAR", 5123);
  const pbr = { baseColorFactor: options.color ?? [1, 1, 1, 1], ...(options.texture ? { baseColorTexture: { index: 0 } } : {}) };
  return glb.build({
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, translation: [2, 0, 0] }],
    meshes: [{ primitives: [{ attributes: { POSITION: position, TEXCOORD_0: uv }, indices, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: pbr }],
    textures: [{ source: 0 }],
  });
}

/** Une image PNG : `rows` lignes d'octets déjà filtrées (filtre en tête de ligne), type de couleur et palette au choix. */
export function makePng(width: number, height: number, colour: number, rows: number[][], options: { palette?: number[]; depth?: number; interlace?: number } = {}): Uint8Array {
  const chunk = (type: string, body: Buffer): Buffer => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(body.length, 0);
    head.write(type, 4, "latin1");
    return Buffer.concat([head, body, Buffer.alloc(4)]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([options.depth ?? 8, colour, 0, 0, options.interlace ?? 0], 8);
  const parts = [chunk("IHDR", header)];
  if (options.palette) parts.push(chunk("PLTE", Buffer.from(options.palette)));
  parts.push(chunk("IDAT", deflateSync(Buffer.from(rows.flat()))), chunk("IEND", Buffer.alloc(0)));
  return new Uint8Array(Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...parts]));
}
