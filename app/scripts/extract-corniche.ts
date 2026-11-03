// Alias de la Corniche de Doha : les paramètres vivent dans cities.ts.
import { CITIES, extractCity } from "./cities.ts";

export const CORNICHE_BBOX = CITIES.corniche.bbox;
export const CORNICHE_USER_AGENT = CITIES.corniche.userAgent;

export const extractCorniche = (fetchFn: typeof fetch): Promise<string> => extractCity(fetchFn, "corniche");
