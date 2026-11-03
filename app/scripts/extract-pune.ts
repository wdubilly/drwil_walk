// Alias de la Vieille ville de Pune : les paramètres vivent dans cities.ts.
import { CITIES, extractCity } from "./cities.ts";

export const PUNE_BBOX = CITIES.pune.bbox;
export const PUNE_USER_AGENT = CITIES.pune.userAgent;

export const extractPune = (fetchFn: typeof fetch): Promise<string> => extractCity(fetchFn, "pune");
