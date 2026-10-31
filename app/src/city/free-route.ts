// La ville d'un trajet libre (APP-003) : pas d'extrait versionné, mais les bâtiments et voies OpenStreetMap proches du
// tracé, demandés à Overpass à l'accueil quand le trajet se prépare (jamais pendant la marche). Le trajet part au service
// de routage choisi (Valhalla par défaut) ; rien n'est enregistré. Les droits (ODbL) sont les mêmes que pour les extraits figés.
import { OVERPASS_URL, PROP_NODES, toGeoJsonText, type OverpassResponse } from "../../scripts/extract-souq.ts";
import { toLocalMetres, type LonLat } from "../route/geo.ts";
import { createPath } from "../route/path.ts";
import type { Place, Providers } from "../route/providers.ts";
import { formatKm } from "../route/walk.ts";
import { loadSouq, type Palette, type Souq } from "./souq-data.ts";

/** Sol gris, voies sombres, bâtiments clairs : une ville neutre, qui ne prétend à aucun quartier. */
export const FREE_PALETTE: Palette = { ground: 0x8f9296, road: 0x45484d, buildings: [0xd7d9dc, 0xbfc3c8, 0xe6e7e9, 0xa9aeb5] };
/** Largeur de la bande de ville de chaque côté du trajet. */
export const CORRIDOR_M = 150;
/** Overpass limite la taille d'une requête : le tracé est réduit à ce nombre de points au plus. */
export const MAX_QUERY_POINTS = 60;
const QUERY_TIMEOUT_MS = 90_000;

/** Le tracé réduit, en `lat,lon` à la suite, dernier point compris. */
function sample(points: readonly LonLat[]): string {
  const step = Math.ceil(points.length / MAX_QUERY_POINTS);
  const kept = points.filter((_, i) => i % step === 0 || i === points.length - 1);
  return kept.map((p) => `${String(p[1])},${String(p[0])}`).join(",");
}

export function corridorQuery(points: readonly LonLat[]): string {
  const around = `(around:${String(CORRIDOR_M)},${sample(points)})`;
  return `[out:json][timeout:60];(way["building"]${around};way["highway"]${around};${PROP_NODES.map((n) => `${n}${around};`).join("")});out geom;`;
}

/** Le trajet en mètres locaux, sans aucune ville : le sol seul, quand Overpass ne répond pas. */
export function bareSouq(points: readonly LonLat[]): Souq {
  const origin = points[0] as LonLat;
  const route = createPath(points.map((p) => toLocalMetres(origin, p)), false);
  return { origin, route, buildings: [], roads: [], props: [], palette: FREE_PALETTE };
}

export async function loadFreeCity(points: readonly LonLat[], fetchFn: typeof fetch): Promise<Souq> {
  const bare = bareSouq(points);
  const response = await fetchFn(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: corridorQuery(points) }),
    signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Overpass a répondu ${String(response.status)}`);
  const extract = JSON.parse(toGeoJsonText((await response.json()) as OverpassResponse)) as Parameters<typeof loadSouq>[0];
  const loaded = loadSouq(extract, { geometry: { coordinates: points.map((p) => [...p]) } }, FREE_PALETTE);
  return { ...loaded, route: bare.route };
}

export interface PlannedTrip {
  souq: Souq;
  /** Ce que l'utilisateur lit : longueur, et ce qui manque (QUA-002). */
  summary: string;
}

export interface TripPlanner {
  find(text: string): Promise<Place>;
  describe(point: LonLat): Promise<string>;
  plan(from: LonLat, to: LonLat): Promise<PlannedTrip>;
}

export function createTripPlanner({ router, geocoder, fetch: fetchFn }: Providers): TripPlanner {
  return {
    find: (text) => geocoder.find(text),
    describe: (point) => geocoder.describe(point),
    async plan(from, to) {
      const points = await router.walk(from, to);
      const length = `Trajet prêt : ${formatKm(bareSouq(points).route.lengthM)}.`;
      try {
        return { souq: await loadFreeCity(points, fetchFn), summary: length };
      } catch (error) {
        const why = error instanceof Error ? error.message : String(error);
        return { souq: bareSouq(points), summary: `${length} Bâtiments OpenStreetMap indisponibles (${why}) : marche sans bâtiments.` };
      }
    },
  };
}
