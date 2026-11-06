// Les bibliothèques de matériaux locaux (prototype : le souk seul) : préparées hors casque (`app/scripts/materials-run.ts`),
// embarquées dans le dépôt comme du JSON (donc dans le paquet de la page : aucun appel réseau dans le casque), textures en base64
// décodées par three.js. Un quartier sans bibliothèque n'a pas l'option à l'accueil.
import { RepeatWrapping, SRGBColorSpace, TextureLoader, Texture } from "three";
import souqWaqif from "../../assets/materials/doha-souq-waqif.json" with { type: "json" };
import type { FamilyId } from "./facade-family.ts";

export interface LocalMaterial {
  id: string;
  label: string;
  /** La texture CC0 d'origine (ambientCG), citée dans `app/assets/PROVENANCE.md`. */
  asset: string;
  /** Le côté réel d'une répétition de la texture, en mètres. */
  sizeM: number;
  /** La couleur relevée qui recolore la texture, puis ses teintes voisines (une par bâtiment). */
  colour: number;
  tints: readonly number[];
  albedo: string;
  normal: string;
}

export interface MaterialLibrary {
  itinerary: string;
  /** Vrai tant que les couleurs ne viennent pas des photos de rue : elles sont dites provisoires. */
  provisional: boolean;
  textureSizePx: number;
  materials: readonly LocalMaterial[];
  families: Record<FamilyId, readonly string[]>;
}

/** Un matériau = un maillage de plus dans la ville : le plafond reste petit (budget de maillages de la scène). */
export const MAX_LOCAL_MATERIALS = 3;
/** Le budget de mémoire GPU des textures d'une bibliothèque (couleur et normale, mipmaps comprises), en octets. */
export const MAX_TEXTURE_BYTES = 4 * 1024 * 1024;
const FAMILIES: readonly FamilyId[] = ["provencale", "village", "ancien", "recent"];
const JPEG = "data:image/jpeg;base64,";

/** La mémoire GPU des textures d'une bibliothèque : RGBA 8 bits, plus un tiers pour les mipmaps. */
export const textureBytes = (library: Pick<MaterialLibrary, "materials" | "textureSizePx">): number =>
  Math.ceil((library.materials.length * 2 * library.textureSizePx ** 2 * 4 * 4) / 3);

type Json = Record<string, unknown>;
const fail = (why: string): never => {
  throw new Error(`bibliothèque de matériaux illisible : ${why}`);
};
const hex = (value: unknown): number => (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? Number.parseInt(value.slice(1), 16) : fail(`couleur ${String(value)}`));
const image = (value: unknown): string => (typeof value === "string" && value.startsWith(JPEG) ? value : fail("texture hors du dépôt"));

function material(value: Json): LocalMaterial {
  const sizeM = value["sizeM"];
  if (typeof sizeM !== "number" || sizeM <= 0) fail(`taille de ${String(value["id"])}`);
  return {
    id: String(value["id"]),
    label: String(value["label"]),
    asset: String(value["asset"]),
    sizeM: sizeM as number,
    colour: hex(value["colour"]),
    tints: (value["tints"] as unknown[]).map(hex),
    albedo: image(value["albedo"]),
    normal: image(value["normal"]),
  };
}

/** Lit et vérifie une bibliothèque : textures embarquées seulement, familles qui citent des matériaux connus, budgets tenus. */
export function parseLibrary(json: unknown): MaterialLibrary {
  const root = json as Json;
  if (root["schema"] !== 1) fail("schéma inconnu");
  const materials = (root["materials"] as Json[]).map(material);
  if (materials.length === 0 || materials.length > MAX_LOCAL_MATERIALS) fail(`${String(materials.length)} matériau(x)`);
  const known = new Set(materials.map((m) => m.id));
  const families = {} as Record<FamilyId, readonly string[]>;
  for (const f of FAMILIES) {
    const list = ((root["families"] as Json)[f] ?? []) as string[];
    if (list.length === 0 || list.some((id) => !known.has(id))) fail(`famille ${f}`);
    families[f] = list;
  }
  const library = { itinerary: String(root["itinerary"]), provisional: (root["colours"] as Json)["source"] !== "photos", textureSizePx: Number(root["textureSizePx"]), materials, families };
  if (textureBytes(library) > MAX_TEXTURE_BYTES) fail("budget de mémoire des textures dépassé");
  return library;
}

/** Les bibliothèques embarquées, par itinéraire. */
export const LIBRARIES: Readonly<Record<string, unknown>> = { "doha-souq-waqif": souqWaqif };

export const hasLocalMaterials = (itineraryId: string): boolean => Object.hasOwn(LIBRARIES, itineraryId);

/** Une bibliothèque prête pour la scène : ses textures se créent à la demande, une seule fois par image. */
export interface LocalMaterials {
  library: MaterialLibrary;
  texture(url: string, colour: boolean): Texture;
}

/** Le document injecté possède les images : aucun DOM global n'est requis par la scène. */
export function documentTexture(doc: Document, url: string): Texture {
  const image = doc.createElement("img");
  const texture = new Texture(image);
  image.addEventListener("load", () => { texture.needsUpdate = true; });
  image.src = url;
  return texture;
}

export function localMaterialsFor(itineraryId: string, load: (url: string) => Texture = (url) => new TextureLoader().load(url)): LocalMaterials | undefined {
  if (!hasLocalMaterials(itineraryId)) return undefined;
  const library = parseLibrary(LIBRARIES[itineraryId]);
  const cache = new Map<string, Texture>();
  return {
    library,
    texture: (url, colour) => {
      const known = cache.get(url);
      if (known) return known;
      const texture = load(url);
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      if (colour) texture.colorSpace = SRGBColorSpace;
      cache.set(url, texture);
      return texture;
    },
  };
}
