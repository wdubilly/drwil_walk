// Les villes à extraire, décrites par des données : ajouter une ville, c'est ajouter une entrée ici (et son script npm).
// Relançable : `npm run extract:<ville>` réécrit le fichier de la ville. © contributeurs OpenStreetMap, licence ODbL.
import { BBOX, USER_AGENT, extract } from "./extract-souq.ts";

export interface CityExtract {
  bbox: { south: number; west: number; north: number; east: number };
  userAgent: string;
  /** Fichier de sortie, relatif à `app/`. */
  file: string;
}

export const CITIES = {
  souq: { bbox: BBOX, userAgent: USER_AGENT, file: "data/souq-waqif.json" },
  pune: {
    // Shaniwar Wada → temple Dagdusheth.
    bbox: { south: 18.5125, west: 73.852, north: 18.5215, east: 73.8615 },
    userAgent: "drwil_walk/0.1 (extraction OpenStreetMap de la Vieille ville de Pune)",
    file: "data/pune-vieille-ville.json",
  },
  corniche: {
    // Musée d'art islamique → West Bay.
    bbox: { south: 25.292, west: 51.515, north: 25.328, east: 51.545 },
    userAgent: "drwil_walk/0.1 (extraction OpenStreetMap de la Corniche de Doha)",
    file: "data/doha-corniche.json",
  },
  "fc-road": {
    // Fergusson College Road, du carrefour de Jangli Maharaj Road au nord de Ferguson College.
    bbox: { south: 18.513, west: 73.838, north: 18.531, east: 73.848 },
    userAgent: "drwil_walk/0.1 (extraction OpenStreetMap de FC Road à Pune)",
    file: "data/pune-fc-road.json",
  },
} as const satisfies Record<string, CityExtract>;

export type CityId = keyof typeof CITIES;

/** Interroge Overpass pour la ville donnée et rend le texte de son fichier d'extrait. */
export const extractCity = (fetchFn: typeof fetch, id: CityId): Promise<string> => extract(fetchFn, CITIES[id].bbox, CITIES[id].userAgent);
