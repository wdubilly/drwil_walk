// Le chemin à pied par Valhalla (profil piéton), instance publique d'OpenStreetMap par défaut. Une seule requête par calcul,
// en GET (pas de pré-requête CORS). Le navigateur ne laisse pas fixer l'identification (User-Agent) : l'instance voit l'origine
// de la page. Les points choisis ne partent qu'à ce service.
import type { LonLat } from "./geo.ts";
import { assertCrowFlies, assertRouteLength, errorMessage, type Router } from "./providers.ts";

interface ValhallaResponse {
  error?: string;
  trip?: { summary?: { length?: number }; legs?: { shape?: string }[] };
}

/** Le tracé encodé (polyligne à 6 décimales, format de Valhalla) en longitude/latitude. */
export function decodePolyline6(shape: string): LonLat[] {
  const points: LonLat[] = [];
  let [index, lat, lon] = [0, 0, 0];
  const next = (): number => {
    let [result, shift, byte] = [0, 0, 0x20];
    while (byte >= 0x20) {
      byte = shape.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    }
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (index < shape.length) {
    lat += next();
    lon += next();
    points.push([lon / 1e6, lat / 1e6]);
  }
  return points;
}

export function createValhallaRouter(baseUrl: string, fetchFn: typeof fetch): Router {
  return {
    async walk(from, to) {
      assertCrowFlies(from, to);
      const request = { locations: [{ lat: from[1], lon: from[0] }, { lat: to[1], lon: to[0] }], costing: "pedestrian" };
      const fail = (reason: string): Error => new Error(`Calcul du trajet impossible : ${reason}`);
      let response: Response;
      try {
        response = await fetchFn(`${baseUrl}/route?${new URLSearchParams({ json: JSON.stringify(request) }).toString()}`);
      } catch (error) {
        throw fail(`service de routage injoignable (${errorMessage(error)})`);
      }
      const body = (await response.json().catch(() => ({}))) as ValhallaResponse;
      if (response.status === 429) throw fail("le service de routage public limite les demandes, réessayez dans un instant");
      if (!response.ok) throw fail(`le service de routage a répondu ${String(response.status)}${body.error ? ` (${body.error})` : ""}`);
      const shape = body.trip?.legs?.[0]?.shape;
      const points = shape ? decodePolyline6(shape) : [];
      if (points.length < 2) throw fail("aucun chemin à pied entre ces deux points");
      assertRouteLength((body.trip?.summary?.length ?? 0) * 1000);
      return points;
    },
  };
}
