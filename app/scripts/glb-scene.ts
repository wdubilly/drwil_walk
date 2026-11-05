// Lecture d'un modèle glTF binaire (.glb) d'un pack de figurants, en mémoire et sans rien exécuter : le fichier est une
// donnée non fiable. Chaque maillage de la scène est rendu dans le repère du modèle (transformations des nœuds appliquées,
// peau posée à la première image d'une animation choisie) ; on n'en garde que positions, coordonnées de texture et matériau.
import { Matrix4, Quaternion, Vector3 } from "three";

export interface GlbMaterial {
  /** Couleur de base, linéaire (rouge, vert, bleu) ; blanc si le modèle n'en donne pas. */
  color: [number, number, number];
  /** Indice de l'image de la texture de base, s'il y en a une. */
  image?: number;
}

export interface GlbPart {
  positions: number[];
  uvs: number[];
  indices: number[];
  material: GlbMaterial;
}

interface Accessor { bufferView: number; byteOffset?: number; componentType: number; count: number; type: string; normalized?: boolean }
interface Node { mesh?: number; skin?: number; children?: number[]; matrix?: number[]; translation?: number[]; rotation?: number[]; scale?: number[] }
interface Primitive { attributes: Record<string, number>; indices: number; material?: number }
interface Channel { sampler: number; target: { node: number; path: string } }
interface Json {
  scene?: number;
  scenes: { nodes: number[] }[];
  nodes: Node[];
  meshes: { primitives: Primitive[] }[];
  accessors: Accessor[];
  bufferViews: { byteOffset?: number; byteStride?: number }[];
  materials?: { pbrMetallicRoughness?: { baseColorFactor?: number[]; baseColorTexture?: { index: number } } }[];
  textures?: { source: number }[];
  skins?: { joints: number[]; inverseBindMatrices: number }[];
  animations?: { name?: string; channels: Channel[]; samplers: { output: number }[] }[];
}

const GLTF_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const WIDTH: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const READ: Record<number, [number, number, (v: DataView, at: number) => number]> = {
  5126: [4, 1, (v, at) => v.getFloat32(at, true)],
  5125: [4, 1, (v, at) => v.getUint32(at, true)],
  5123: [2, 65535, (v, at) => v.getUint16(at, true)],
  5121: [1, 255, (v, at) => v.getUint8(at)],
};

/** Le JSON et le tampon binaire d'un .glb ; tout écart au format lève une erreur qui dit lequel. */
export function splitGlb(bytes: Uint8Array): { json: Json; bin: DataView } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 28 || view.getUint32(0, true) !== GLTF_MAGIC || view.getUint32(12 + 4, true) !== JSON_CHUNK) throw new Error("glb illisible : en-tête attendu");
  const jsonLength = view.getUint32(12, true);
  const binAt = 20 + jsonLength;
  if (binAt + 8 > bytes.byteLength || view.getUint32(binAt + 4, true) !== BIN_CHUNK) throw new Error("glb illisible : bloc binaire absent");
  const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, binAt))) as Json;
  return { json, bin: new DataView(bytes.buffer, bytes.byteOffset + binAt + 8, view.getUint32(binAt, true)) };
}

function accessor(json: Json, bin: DataView, index: number): number[] {
  const a = json.accessors[index];
  const view = json.bufferViews[a?.bufferView ?? -1];
  const reader = READ[a?.componentType ?? 0];
  const width = WIDTH[a?.type ?? ""];
  if (!a || !view || !reader || !width) throw new Error(`glb : accesseur ${String(index)} illisible`);
  const [size, max, read] = reader;
  const stride = view.byteStride ?? size * width;
  const start = (view.byteOffset ?? 0) + (a.byteOffset ?? 0);
  const out: number[] = [];
  for (let i = 0; i < a.count; i += 1) {
    for (let c = 0; c < width; c += 1) out.push(read(bin, start + i * stride + c * size) / (a.normalized === true ? max : 1));
  }
  return out;
}

/** Les transformations locales des nœuds, à la première image de l'animation `pose` si elle existe. */
function localMatrices(json: Json, bin: DataView, pose: string | undefined): Matrix4[] {
  const trs = json.nodes.map((n) => ({ t: n.translation ?? [0, 0, 0], r: n.rotation ?? [0, 0, 0, 1], s: n.scale ?? [1, 1, 1] }));
  const animation = json.animations?.find((a) => a.name === pose);
  const keys: Record<string, "t" | "r" | "s"> = { translation: "t", rotation: "r", scale: "s" };
  for (const channel of animation?.channels ?? []) {
    const target = trs[channel.target.node];
    const output = animation?.samplers[channel.sampler];
    const key = keys[channel.target.path];
    // Une cible inconnue ou une déformation (`weights`) est ignorée : la pose ne prend que translation, rotation et échelle.
    if (!target || !output || !key) continue;
    target[key] = accessor(json, bin, output.output).slice(0, key === "r" ? 4 : 3);
  }
  return json.nodes.map((n, i) => {
    if (n.matrix) return new Matrix4().fromArray(n.matrix);
    const { t, r, s } = trs[i] as { t: number[]; r: number[]; s: number[] };
    return new Matrix4().compose(new Vector3(...t), new Quaternion(...r), new Vector3(...s));
  });
}

function material(json: Json, index: number | undefined): GlbMaterial {
  const pbr = json.materials?.[index ?? -1]?.pbrMetallicRoughness;
  const [r = 1, g = 1, b = 1] = pbr?.baseColorFactor ?? [];
  const image = pbr?.baseColorTexture ? json.textures?.[pbr.baseColorTexture.index]?.source : undefined;
  return { color: [r, g, b], ...(image === undefined ? {} : { image }) };
}

/** Les parties du modèle dans son repère, la peau éventuelle posée à la première image de l'animation `pose`. */
export function readGlbScene(bytes: Uint8Array, pose?: string): GlbPart[] {
  const { json, bin } = splitGlb(bytes);
  const local = localMatrices(json, bin, pose);
  const world: Matrix4[] = [];
  const parts: GlbPart[] = [];
  const visit = (index: number, parent: Matrix4): void => {
    const node = json.nodes[index];
    if (!node || world[index]) throw new Error(`glb : nœud ${String(index)} absent ou repris`);
    world[index] = parent.clone().multiply(local[index] as Matrix4);
    for (const child of node.children ?? []) visit(child, world[index]);
  };
  const roots = json.scenes[json.scene ?? 0]?.nodes ?? [];
  for (const root of roots) visit(root, new Matrix4());
  json.nodes.forEach((node, index) => {
    if (node.mesh === undefined || !world[index]) return;
    for (const primitive of json.meshes[node.mesh]?.primitives ?? []) {
      const positions = accessor(json, bin, primitive.attributes["POSITION"] as number);
      const skin = node.skin === undefined ? undefined : json.skins?.[node.skin];
      const placed = skin ? skinned(json, bin, primitive, skin, world, positions) : transformed(positions, world[index]);
      const uvs = primitive.attributes["TEXCOORD_0"] === undefined ? [] : accessor(json, bin, primitive.attributes["TEXCOORD_0"]);
      parts.push({ positions: placed, uvs, indices: accessor(json, bin, primitive.indices), material: material(json, primitive.material) });
    }
  });
  return parts;
}

const transformed = (positions: number[], matrix: Matrix4): number[] => {
  const out: number[] = [];
  for (let i = 0; i < positions.length; i += 3) out.push(...new Vector3(positions[i], positions[i + 1], positions[i + 2]).applyMatrix4(matrix).toArray());
  return out;
};

/** La peau posée : chaque sommet suit ses os, pondérés (la matrice d'un os : sa pose fois l'inverse de sa pose de liaison). */
function skinned(json: Json, bin: DataView, primitive: Primitive, skin: { joints: number[]; inverseBindMatrices: number }, world: Matrix4[], positions: number[]): number[] {
  const inverse = accessor(json, bin, skin.inverseBindMatrices);
  const bones = skin.joints.map((joint, j) => (world[joint] ?? new Matrix4()).clone().multiply(new Matrix4().fromArray(inverse.slice(j * 16, j * 16 + 16))));
  const joints = accessor(json, bin, primitive.attributes["JOINTS_0"] as number);
  const weights = accessor(json, bin, primitive.attributes["WEIGHTS_0"] as number);
  const out: number[] = [];
  for (let v = 0; v < positions.length / 3; v += 1) {
    const at = new Vector3(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
    const sum = new Vector3();
    for (let k = 0; k < 4; k += 1) {
      // Un poids ou un os absent (données tronquées, os hors de la peau) ne compte pas.
      const weight = weights[v * 4 + k] as number;
      const bone = bones[joints[v * 4 + k] as number];
      if (weight > 0 && bone) sum.addScaledVector(at.clone().applyMatrix4(bone), weight);
    }
    out.push(sum.x, sum.y, sum.z);
  }
  return out;
}
