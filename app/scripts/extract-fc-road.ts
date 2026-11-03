// Alias de FC Road à Pune : les paramètres vivent dans cities.ts.
import { CITIES, extractCity } from "./cities.ts";

export const FC_ROAD_BBOX = CITIES["fc-road"].bbox;
export const FC_ROAD_USER_AGENT = CITIES["fc-road"].userAgent;

export const extractFcRoad = (fetchFn: typeof fetch): Promise<string> => extractCity(fetchFn, "fc-road");
