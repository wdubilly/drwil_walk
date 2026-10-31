// Le chemin à pied entre deux points, calculé par l'API Google Routes (mode piéton). Elle a sa propre clé,
// `VITE_GOOGLE_ROUTES_API_KEY` de .env.local (SEC-007), distincte de celle des tuiles. Les points choisis ne partent
// qu'à ce service : rien n'est enregistré. Toute panne est dite avec sa raison (QUA-002), jamais la clé.
import { distanceM, type LonLat } from "./geo.ts";

export const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
/** Un trajet libre fait 5 km au plus, pour limiter les chargements de la ville. */
export const MAX_ROUTE_M = 5000;
export const NO_ROUTES_KEY_NOTICE =
  "Itinéraire libre indisponible : aucune clé Routes (VITE_GOOGLE_ROUTES_API_KEY dans app/.env.local). Les quatre itinéraires restent disponibles.";

export interface RoutesConfig {
  /** La clé de `.env.local`, ou rien. */
  apiKey: string | undefined;
  fetch: typeof fetch;
}

/** La clé Routes de l'environnement de build ; absente ou vide : pas de clé. */
export function readRoutesKey(env: Record<string, unknown> | undefined): string | undefined {
  const key = env?.["VITE_GOOGLE_ROUTES_API_KEY"];
  return typeof key === "string" && key.trim() !== "" ? key.trim() : undefined;
}

const tooLong = (km: number, what: string): Error =>
  new Error(`Trajet trop long : ${what} ${km.toFixed(1).replace(".", ",")} km, ${String(MAX_ROUTE_M / 1000)} km au plus.`);

const latLng = (p: LonLat) => ({ location: { latLng: { latitude: p[1], longitude: p[0] } } });

interface RoutesResponse {
  routes?: { distanceMeters?: number; polyline?: { geoJsonLinestring?: { coordinates?: number[][] } } }[];
}

/** Le tracé du chemin à pied, en longitude/latitude, du départ à l'arrivée. */
export async function computeWalkingRoute(from: LonLat, to: LonLat, config: RoutesConfig): Promise<LonLat[]> {
  const { apiKey } = config;
  if (apiKey === undefined) throw new Error(NO_ROUTES_KEY_NOTICE);
  // Refus avant tout appel : un trajet trop long ne coûte pas une requête.
  const crow = distanceM(from, to);
  if (crow > MAX_ROUTE_M) throw tooLong(crow / 1000, "à vol d'oiseau");
  const fail = (reason: string): Error => new Error(`Calcul du trajet impossible : ${reason.replaceAll(apiKey, "***")}`);
  let response: Response;
  try {
    response = await config.fetch(ROUTES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.polyline.geoJsonLinestring",
      },
      body: JSON.stringify({ origin: latLng(from), destination: latLng(to), travelMode: "WALK", polylineEncoding: "GEO_JSON_LINESTRING" }),
    });
  } catch (error) {
    throw fail(`service injoignable (${error instanceof Error ? error.message : String(error)})`);
  }
  if (!response.ok) {
    throw fail(`le service a répondu ${String(response.status)} (clé invalide, restreinte, ou API Routes non activée ?)`);
  }
  const route = ((await response.json()) as RoutesResponse).routes?.[0];
  const coordinates = route?.polyline?.geoJsonLinestring?.coordinates;
  if (!route || !coordinates || coordinates.length < 2) throw fail("aucun chemin à pied entre ces deux points");
  const meters = route.distanceMeters ?? 0;
  if (meters > MAX_ROUTE_M) throw tooLong(meters / 1000, "le chemin à pied fait");
  return coordinates.map((c) => [c[0] as number, c[1] as number] as const);
}
