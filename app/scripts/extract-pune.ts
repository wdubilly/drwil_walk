// Extraction de la Vieille ville de Pune (Shaniwar Wada → temple Dagdusheth) : même méthode que le souk.
// Relançable : `npm run extract:pune` réécrit data/pune-vieille-ville.json. © contributeurs OpenStreetMap, licence ODbL.
import { extract } from "./extract-souq.ts";

export const PUNE_BBOX = { south: 18.5125, west: 73.852, north: 18.5215, east: 73.8615 };
export const PUNE_USER_AGENT = "drwil_walk/0.1 (extraction OpenStreetMap de la Vieille ville de Pune)";

export const extractPune = (fetchFn: typeof fetch): Promise<string> => extract(fetchFn, PUNE_BBOX, PUNE_USER_AGENT);
