// Lecture d'un modèle glTF (fichier .gltf et son .bin) en tableaux de nombres : positions, couleurs, coordonnées de texture
// et indices de chaque primitive. Utilisée par le script de préparation du pack d'arbres ; ne lit que ce que les arbres du pack portent.

export interface Primitive {
  /** Le nom du matériau de la primitive : il distingue l'écorce du feuillage. */
  material: string;
  positions: number[];
  /** Quatre composantes par sommet (rouge, vert, bleu, alpha), vide si le modèle n'en a pas. */
  colors: number[];
  uvs: number[];
  indices: number[];
}

interface Accessor {
  bufferView: number;
  componentType: number;
  count: number;
  type: string;
}

interface GltfJson {
  accessors: Accessor[];
  bufferViews: { byteOffset: number }[];
  materials: { name: string }[];
  meshes: { primitives: { attributes: Record<string, number>; indices: number; material: number }[] }[];
}

const COMPONENTS: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const READERS: Record<number, [number, (view: DataView, at: number) => number]> = {
  5126: [4, (view, at) => view.getFloat32(at, true)],
  5123: [2, (view, at) => view.getUint16(at, true)],
  5125: [4, (view, at) => view.getUint32(at, true)],
};

function readAccessor(json: GltfJson, bin: Uint8Array, index: number): number[] {
  const accessor = json.accessors[index];
  const view = json.bufferViews[accessor?.bufferView ?? -1];
  const reader = READERS[accessor?.componentType ?? 0];
  const width = COMPONENTS[accessor?.type ?? ""];
  if (!accessor || !view || !reader || !width) throw new Error(`glTF : accesseur ${String(index)} illisible`);
  const [size, read] = reader;
  const data = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
  const out: number[] = [];
  for (let i = 0; i < accessor.count * width; i += 1) out.push(read(data, view.byteOffset + i * size));
  return out;
}

/** Les primitives du premier maillage du modèle. */
export function readGltf(gltfText: string, bin: Uint8Array): Primitive[] {
  const json = JSON.parse(gltfText) as GltfJson;
  const mesh = json.meshes[0];
  if (!mesh) throw new Error("glTF : aucun maillage");
  return mesh.primitives.map((primitive) => ({
    material: json.materials[primitive.material]?.name ?? "",
    positions: readAccessor(json, bin, primitive.attributes["POSITION"] ?? -1),
    colors: primitive.attributes["COLOR_0"] === undefined ? [] : readAccessor(json, bin, primitive.attributes["COLOR_0"]),
    uvs: readAccessor(json, bin, primitive.attributes["TEXCOORD_0"] ?? -1),
    indices: readAccessor(json, bin, primitive.indices),
  }));
}
