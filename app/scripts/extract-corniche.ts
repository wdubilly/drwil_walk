// Extraction de la Corniche de Doha (Musée d'art islamique → West Bay) : même méthode que le souk.
// Relançable : `npm run extract:corniche` réécrit data/doha-corniche.json. © contributeurs OpenStreetMap, licence ODbL.
import { extract } from "./extract-souq.ts";

export const CORNICHE_BBOX = { south: 25.292, west: 51.515, north: 25.328, east: 51.545 };
export const CORNICHE_USER_AGENT = "drwil_walk/0.1 (extraction OpenStreetMap de la Corniche de Doha)";

export const extractCorniche = (fetchFn: typeof fetch): Promise<string> => extract(fetchFn, CORNICHE_BBOX, CORNICHE_USER_AGENT);
