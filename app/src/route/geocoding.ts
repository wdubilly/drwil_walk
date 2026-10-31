// Recherche d'adresse : un nom de lieu devient un point (API Google Geocoding), et un point touché sur la carte devient
// une adresse. Même clé que le routage (`VITE_GOOGLE_ROUTES_API_KEY`) : l'API Geocoding doit être activée et autorisée
// dans sa restriction. Les adresses ne sont ni enregistrées ni envoyées ailleurs qu'à Google (aucune donnée personnelle conservée).
import type { LonLat } from "./geo.ts";
import { NO_ROUTES_KEY_NOTICE, type RoutesConfig } from "./routes-api.ts";

export const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

export interface Place {
  point: LonLat;
  /** L'adresse trouvée, montrée dans le champ pour que l'utilisateur voie ce qui a été retenu. */
  label: string;
}

interface GeocodeResponse {
  status?: string;
  error_message?: string;
  results?: { formatted_address?: string; geometry?: { location?: { lat: number; lng: number } } }[];
}

/** Les coordonnées arrondies (environ 10 m), quand aucune adresse n'est connue. */
export const roundedCoordinates = (point: LonLat): string => `${point[1].toFixed(4)}, ${point[0].toFixed(4)}`;

async function query(params: Record<string, string>, config: RoutesConfig): Promise<NonNullable<GeocodeResponse["results"]>> {
  const { apiKey } = config;
  if (apiKey === undefined) throw new Error(NO_ROUTES_KEY_NOTICE);
  const fail = (reason: string): Error => new Error(`Recherche d'adresse impossible : ${reason.replaceAll(apiKey, "***")}`);
  let response: Response;
  try {
    response = await config.fetch(`${GEOCODE_URL}?${new URLSearchParams({ ...params, key: apiKey }).toString()}`);
  } catch (error) {
    throw fail(`service injoignable (${error instanceof Error ? error.message : String(error)})`);
  }
  if (!response.ok) throw fail(`le service a répondu ${String(response.status)}`);
  const body = (await response.json()) as GeocodeResponse;
  if (body.status === "ZERO_RESULTS") return [];
  if (body.status !== "OK") {
    const why = body.error_message ?? "clé invalide, restreinte, ou API Geocoding non activée ?";
    throw fail(`${body.status ?? "réponse inattendue"} (${why})`);
  }
  return body.results ?? [];
}

/** L'adresse tapée devient un point : le premier résultat est retenu, et son libellé revient pour être affiché. */
export async function geocode(text: string, config: RoutesConfig): Promise<Place> {
  const address = text.trim();
  if (address === "") throw new Error("Recherche d'adresse : tapez un lieu ou une adresse.");
  const first = (await query({ address }, config))[0];
  const location = first?.geometry?.location;
  if (!location) throw new Error(`Adresse introuvable : « ${address} ». Précisez le lieu, ou touchez la carte.`);
  return { point: [location.lng, location.lat], label: first.formatted_address ?? address };
}

/** Le point touché sur la carte devient une adresse ; à défaut, ses coordonnées arrondies (le trajet n'en dépend pas). */
export async function reverseGeocode(point: LonLat, config: RoutesConfig): Promise<string> {
  try {
    const first = (await query({ latlng: `${String(point[1])},${String(point[0])}` }, config))[0];
    return first?.formatted_address ?? roundedCoordinates(point);
  } catch {
    return roundedCoordinates(point);
  }
}
