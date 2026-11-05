// Les modèles des figurants (APP-014), allégés par `scripts/prepare-traffic-pack.ts` dans `app/assets/figurants.json` :
// lecture et validation, une géométrie à couleurs par sommet par modèle. Un fichier illisible ou hors plafond est refusé
// avec sa raison, jamais un figurant cassé (QUA-002).
import { BufferGeometry, Float32BufferAttribute } from "three";

/** Plafond de triangles d'un modèle : 30 véhicules et 60 piétons au plus (profil « qualité ») restent sous 200 000 triangles. */
export const MAX_MODEL_TRIANGLES = 3000;

/** Plafond de modèles : un appel de rendu chacun, compté dans le budget de maillages de la ville (APP-006). */
export const MAX_TRAFFIC_MODELS = 16;

export interface PackModel {
  geometry: BufferGeometry;
  /** Dimensions du modèle (largeur x, hauteur y, longueur z), pour l'amener à son gabarit. */
  size: { x: number; y: number; z: number };
  triangles: number;
}

export type TrafficPack = Map<string, PackModel>;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function numbers(raw: unknown, multiple: number, label: string): number[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length % multiple !== 0 || !raw.every((v) => typeof v === "number" && Number.isFinite(v))) {
    throw new Error(`${label} : ${String(multiple)} nombres par élément attendus`);
  }
  return raw as number[];
}

const indexIn = (count: number) => (i: number): boolean => Number.isInteger(i) && i >= 0 && i < count;

function model(raw: unknown): [string, PackModel] {
  const m = isRecord(raw) ? raw : {};
  const name = typeof m["name"] === "string" ? m["name"] : "";
  if (name === "") throw new Error("modèle sans nom");
  const positions = numbers(m["positions"], 3, `${name}, positions`);
  const palette = numbers(m["palette"], 3, `${name}, palette`);
  const shades = numbers(m["shades"], 1, `${name}, teintes`);
  const indices = numbers(m["indices"], 3, `${name}, indices`);
  const vertices = positions.length / 3;
  if (shades.length !== vertices || !shades.every(indexIn(palette.length / 3))) throw new Error(`${name} : teintes et sommets ne correspondent pas`);
  if (!indices.every(indexIn(vertices))) throw new Error(`${name} : indice hors des sommets`);
  const triangles = indices.length / 3;
  if (triangles > MAX_MODEL_TRIANGLES) throw new Error(`${name} : ${String(triangles)} triangles, plafond ${String(MAX_MODEL_TRIANGLES)}`);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(shades.flatMap((s) => palette.slice(s * 3, s * 3 + 3)), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const box = geometry.boundingBox as NonNullable<BufferGeometry["boundingBox"]>;
  const size = { x: box.max.x - box.min.x, y: box.max.y - box.min.y, z: box.max.z - box.min.z };
  if (!(size.x > 0 && size.y > 0 && size.z > 0)) throw new Error(`${name} : modèle plat`);
  return [name, { geometry, size, triangles }];
}

/** Lit le fichier des modèles ; toute anomalie lève une erreur qui dit laquelle. */
export function readTrafficPack(data: unknown): TrafficPack {
  const models = isRecord(data) ? data["models"] : undefined;
  if (!Array.isArray(models) || models.length === 0) throw new Error("aucun modèle de figurant");
  if (models.length > MAX_TRAFFIC_MODELS) throw new Error(`${String(models.length)} modèles, plafond ${String(MAX_TRAFFIC_MODELS)}`);
  return new Map(models.map(model));
}
