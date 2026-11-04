// Les quartiers dotés d'une bibliothèque de matériaux locaux, décrits par des données (préparation, hors casque) : étendre
// à un autre quartier, c'est une entrée ici (tracé, matériaux CC0, familles), sa préparation, puis son activation
// (`app/src/city/material-library.ts`). Aucun code propre à un quartier.
import type { FamilyId } from "../src/city/facade-family.ts";

/** Le ton relevé sur les photos qui recolore un matériau : le plus clair, le médian ou le plus sombre. */
export type Tone = "clair" | "moyen" | "sombre";

export interface MaterialSource {
  id: string;
  label: string;
  /** L'identifiant ambientCG (CC0) de la texture source. */
  asset: string;
  /** Le côté réel couvert par une répétition de la texture, en mètres. */
  sizeM: number;
  tone: Tone;
}

export interface MaterialArea {
  /** Le tracé GeoJSON de l'itinéraire, relatif à `app/`. */
  loop: string;
  /** L'inventaire des photos (liens seulement), puis la bibliothèque écrite par la préparation. */
  photos: string;
  library: string;
  userAgent: string;
  materials: readonly MaterialSource[];
  /** Les matériaux possibles pour chaque famille de façades (APP-008), le premier le plus fréquent. */
  families: Record<FamilyId, readonly string[]>;
  /** Les couleurs de repli tant qu'aucune photo n'est relevée : la bibliothèque le dit (source « provisoire »). */
  provisional: { source: string; colours: readonly string[] };
}

export const MATERIAL_AREAS = {
  "doha-souq-waqif": {
    loop: "data/souq-waqif-boucle.json",
    photos: "assets/materials/doha-souq-waqif-photos.json",
    library: "assets/materials/doha-souq-waqif.json",
    userAgent: "drwil_walk/0.1 (inventaire des photos de rue du souk Waqif)",
    materials: [
      { id: "enduit", label: "Enduit", asset: "Plaster001", sizeM: 2.5, tone: "clair" },
      { id: "pierre", label: "Pierre", asset: "Bricks106A", sizeM: 2, tone: "moyen" },
      { id: "bois", label: "Bois", asset: "Planks037A", sizeM: 1.5, tone: "sombre" },
    ],
    families: { ancien: ["pierre", "enduit", "bois"], village: ["enduit", "bois"], recent: ["enduit", "pierre"], provencale: ["enduit"] },
    provisional: { source: "palette du souk (app/src/city/cities.ts), en attendant des photos", colours: ["#e3cfa5", "#d2b48c", "#c99a6b", "#efe0c0"] },
  },
} as const satisfies Record<string, MaterialArea>;

export type AreaId = keyof typeof MATERIAL_AREAS;

export function areaOf(id: string): MaterialArea {
  const area = (MATERIAL_AREAS as Record<string, MaterialArea>)[id];
  if (!area) throw new Error(`quartier « ${id} » : aucune bibliothèque de matériaux décrite`);
  return area;
}
