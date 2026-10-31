// Extraction de FC Road à Pune (Fergusson College Road, du carrefour de Jangli Maharaj Road au nord de Ferguson College) : même méthode que le souk.
// Relançable : `npm run extract:fc-road` réécrit data/pune-fc-road.json. © contributeurs OpenStreetMap, licence ODbL.
import { extract } from "./extract-souq.ts";

export const FC_ROAD_BBOX = { south: 18.513, west: 73.838, north: 18.531, east: 73.848 };
export const FC_ROAD_USER_AGENT = "drwil_walk/0.1 (extraction OpenStreetMap de FC Road à Pune)";

export const extractFcRoad = (fetchFn: typeof fetch): Promise<string> => extract(fetchFn, FC_ROAD_BBOX, FC_ROAD_USER_AGENT);
