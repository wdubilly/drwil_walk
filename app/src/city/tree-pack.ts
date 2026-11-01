// Les arbres du pack Quaternius embarqué (APP-003) : lecture et validation du modèle allégé par le script de préparation
// (`scripts/prepare-nature-pack.ts`), géométries et matériaux toon partagés. Aucun appel réseau : le modèle et la texture
// des feuilles (une image en base64) sont dans le dépôt. Une donnée invalide est une erreur dite, jamais un arbre cassé (QUA-002).
import { BufferAttribute, BufferGeometry, DoubleSide, Float32BufferAttribute, RepeatWrapping, SRGBColorSpace, type MeshToonMaterial, type Texture } from "three";
import { toonMaterial } from "./toon.ts";

/** Plafond de triangles d'un arbre du pack : 300 arbres au plus (MAX_TREES) tiennent alors sous le plafond global de `props.ts`. */
export const MAX_MODEL_TRIANGLES = 500;
/** Seuil de transparence du feuillage (celui du pack) : une carte de feuilles est découpée, jamais fondue. */
export const LEAF_ALPHA_CUTOFF = 0.2;

export interface TreeVariant {
  name: string;
  bark: BufferGeometry;
  leaves: BufferGeometry;
  /** Triangles de l'arbre, écorce et feuillage ensemble. */
  triangles: number;
}

export interface TreePack {
  variants: TreeVariant[];
  barkMaterial: MeshToonMaterial;
  leavesMaterial: MeshToonMaterial;
}

/** Charge une image en texture : la vraie (TextureLoader) est branchée par `tree-assets.ts`, les tests donnent la leur. */
export type TextureLoad = (url: string) => Promise<Texture>;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

function numbers(raw: unknown, multiple: number, label: string): number[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length % multiple !== 0 || !raw.every((v) => typeof v === "number" && Number.isFinite(v))) {
    throw new Error(`${label} : ${String(multiple)} nombres par élément attendus`);
  }
  return raw as number[];
}

function geometry(raw: unknown, attribute: "colors" | "uvs", label: string): BufferGeometry {
  const part = isRecord(raw) ? raw : {};
  const size = attribute === "colors" ? 3 : 2;
  const positions = numbers(part["positions"], 3, `${label}, positions`);
  const values = numbers(part[attribute], size, `${label}, ${attribute}`);
  const indices = numbers(part["indices"], 3, `${label}, indices`);
  const vertices = positions.length / 3;
  if (values.length / size !== vertices) throw new Error(`${label} : ${attribute} et positions ne correspondent pas`);
  if (!indices.every((i) => Number.isInteger(i) && i >= 0 && i < vertices)) throw new Error(`${label} : indice hors des sommets`);
  const out = new BufferGeometry();
  out.setAttribute("position", new Float32BufferAttribute(positions, 3));
  out.setAttribute(attribute === "colors" ? "color" : "uv", new Float32BufferAttribute(values, size));
  out.setIndex(indices);
  out.computeVertexNormals();
  return out;
}

function variant(raw: unknown): TreeVariant {
  const model = isRecord(raw) ? raw : {};
  const name = typeof model["name"] === "string" ? model["name"] : "";
  if (name === "") throw new Error("arbre sans nom");
  const bark = geometry(model["bark"], "colors", `${name}, écorce`);
  const leaves = geometry(model["leaves"], "uvs", `${name}, feuillage`);
  const triangles = ((bark.index as BufferAttribute).count + (leaves.index as BufferAttribute).count) / 3;
  if (triangles > MAX_MODEL_TRIANGLES) throw new Error(`${name} : ${String(triangles)} triangles, plafond ${String(MAX_MODEL_TRIANGLES)}`);
  return { name, bark, leaves, triangles };
}

/** Lit le modèle embarqué et charge la texture des feuilles ; toute anomalie lève une erreur qui dit laquelle. */
export async function loadTreePack(data: unknown, loadTexture: TextureLoad): Promise<TreePack> {
  try {
    const pack = isRecord(data) ? data : {};
    const models: unknown = pack["models"];
    if (!Array.isArray(models) || models.length === 0) throw new Error("aucun arbre dans le modèle");
    const variants = models.map(variant);
    if (typeof pack["leafTexture"] !== "string") throw new Error("texture des feuilles absente");
    const texture = await loadTexture(pack["leafTexture"]);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    return {
      variants,
      barkMaterial: toonMaterial({ vertexColors: true }),
      leavesMaterial: toonMaterial({ map: texture, alphaTest: LEAF_ALPHA_CUTOFF, side: DoubleSide }),
    };
  } catch (error) {
    throw new Error(`arbres du pack Quaternius : ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
