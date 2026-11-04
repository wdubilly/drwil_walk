// Le quartier d'une ville décrite dans `data/villes.json`, pour la préparation de sa bibliothèque de matériaux locaux (hors
// casque) : tracé, photos, bibliothèque et matériaux CC0 se déduisent de la ville, sans entrée ni code propre à un quartier ;
// son activation dans l'application reste à part (`app/src/city/material-library.ts`).
import type { FamilyId } from "../src/city/facade-family.ts";
import type { LonLat } from "../src/route/geo.ts";
import { CITIES, loopFileOf, type CityDescription } from "./cities.ts";

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
  /** Le départ de l'itinéraire : il décide de la région dont la palette sert de repli. */
  start: LonLat;
  materials: readonly MaterialSource[];
  /** Les matériaux possibles pour chaque famille de façades (APP-008), le premier le plus fréquent. */
  families: Record<FamilyId, readonly string[]>;
}

const MATERIALS: readonly MaterialSource[] = [
  { id: "enduit", label: "Enduit", asset: "Plaster001", sizeM: 2.5, tone: "clair" },
  { id: "pierre", label: "Pierre", asset: "Bricks106A", sizeM: 2, tone: "moyen" },
  { id: "bois", label: "Bois", asset: "Planks037A", sizeM: 1.5, tone: "sombre" },
];
const FAMILIES = { ancien: ["pierre", "enduit", "bois"], village: ["enduit", "bois"], recent: ["enduit", "pierre"], provencale: ["enduit"] } as const;

export function areaFor(city: CityDescription): MaterialArea {
  const [lat, lon] = city.route.points[0] as number[];
  return {
    loop: loopFileOf(city),
    photos: `assets/materials/${city.itinerary}-photos.json`,
    library: `assets/materials/${city.itinerary}.json`,
    userAgent: city.userAgent,
    start: [lon as number, lat as number],
    materials: MATERIALS,
    families: FAMILIES,
  };
}

export function areaOf(id: string): MaterialArea {
  const city = Object.values(CITIES).find((c) => c.itinerary === id);
  if (!city) throw new Error(`quartier « ${id} » : aucune ville décrite dans data/villes.json`);
  return areaFor(city);
}
