// Option Google : le chemin à pied par l'API Google Routes (mode piéton), derrière l'interface `Router`. Elle a sa propre clé,
// `VITE_GOOGLE_ROUTES_API_KEY` de .env.local (SEC-007), distincte de celle des tuiles ; sans elle, le routage est celui
// d'OpenStreetMap (voir `create-providers.ts`). Toute panne est dite avec sa raison (QUA-002), jamais la clé.
import type { LonLat } from "./geo.ts";
import { assertCrowFlies, assertRouteLength, errorMessage, type Router } from "./providers.ts";

export const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

export interface GoogleConfig {
  apiKey: string;
  fetch: typeof fetch;
}

/** La clé Routes de l'environnement de build ; absente ou vide : pas de clé. */
export function readRoutesKey(env: Record<string, unknown> | undefined): string | undefined {
  const key = env?.["VITE_GOOGLE_ROUTES_API_KEY"];
  return typeof key === "string" && key.trim() !== "" ? key.trim() : undefined;
}

const latLng = (p: LonLat) => ({ location: { latLng: { latitude: p[1], longitude: p[0] } } });

interface RoutesResponse {
  routes?: { distanceMeters?: number; polyline?: { geoJsonLinestring?: { coordinates?: number[][] } } }[];
}

export function createGoogleRouter({ apiKey, fetch: fetchFn }: GoogleConfig): Router {
  return {
    async walk(from, to) {
      assertCrowFlies(from, to);
      const fail = (reason: string): Error => new Error(`Calcul du trajet impossible : ${reason.replaceAll(apiKey, "***")}`);
      let response: Response;
      try {
        response = await fetchFn(ROUTES_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.distanceMeters,routes.polyline.geoJsonLinestring",
          },
          body: JSON.stringify({ origin: latLng(from), destination: latLng(to), travelMode: "WALK", polylineEncoding: "GEO_JSON_LINESTRING" }),
        });
      } catch (error) {
        throw fail(`service injoignable (${errorMessage(error)})`);
      }
      if (!response.ok) {
        throw fail(`le service a répondu ${String(response.status)} (clé invalide, restreinte, ou API Routes non activée ?)`);
      }
      const route = ((await response.json()) as RoutesResponse).routes?.[0];
      const coordinates = route?.polyline?.geoJsonLinestring?.coordinates;
      if (!route || !coordinates || coordinates.length < 2) throw fail("aucun chemin à pied entre ces deux points");
      assertRouteLength(route.distanceMeters ?? 0);
      return coordinates.map((c) => [c[0] as number, c[1] as number] as const);
    },
  };
}
