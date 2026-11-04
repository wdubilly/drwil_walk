// La recherche des photos de rue pour les couleurs d'une ville (hors casque, SEC-007) : à moins de 30 m du tracé d'abord,
// puis, faute de photo, dans les quartiers voisins jusqu'à 1 km. Panoramax d'abord ; Mapillary en secours si Panoramax
// ne suffit pas et qu'un jeton est fourni (variable d'environnement, jamais dans le dépôt, la sortie ni les journaux).
import type { LonLat } from "../src/route/geo.ts";
import {
  MAPILLARY_IMAGES, MIN_PHOTOS, PANORAMAX_SEARCH, bboxAround, distanceToLine, getJson, parseMapillary, parsePanoramax, type StreetPhoto,
} from "./panoramax.ts";

/** Les rayons essayés, du plus proche du tracé au plus large (APP-012). */
export const WIDENING_M = [30, 100, 300, 1000] as const;
/** Les photos lues au plus : les plus proches du tracé, pour borner les téléchargements. */
export const MAX_USED_PHOTOS = 60;
const MAPILLARY_FIELDS = "id,geometry,compass_angle,captured_at,creator,thumb_1024_url";
const MAX_RESULTS = 1000;

export interface FoundPhoto extends StreetPhoto { distanceM: number }

export interface PhotoSearch {
  photos: FoundPhoto[];
  /** Le rayon où des photos ont été trouvées, ou `null` si aucune ne l'a été même au plus large. */
  radiusM: number | null;
  /** Une ligne par rayon essayé : ce que chaque source a rendu, et pourquoi Mapillary n'a pas été interrogé. */
  notes: string[];
}

const nearest = (photos: StreetPhoto[], route: readonly LonLat[], radiusM: number): FoundPhoto[] =>
  photos
    .map((p) => ({ ...p, distanceM: distanceToLine([p.lon, p.lat], route) }))
    .filter((p) => p.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);

/** Interroge Panoramax, puis Mapillary s'il le faut, en élargissant le rayon tant qu'aucune photo n'est trouvée. */
export async function searchPhotos(
  fetchFn: typeof fetch,
  route: readonly LonLat[],
  userAgent: string,
  token: string | undefined,
  pause: () => Promise<void> = () => Promise.resolve(),
): Promise<PhotoSearch> {
  const notes: string[] = [];
  for (const radiusM of WIDENING_M) {
    const bbox = bboxAround(route, radiusM).map((v) => v.toFixed(6)).join(",");
    const panoramax = nearest(parsePanoramax(await getJson(fetchFn, `${PANORAMAX_SEARCH}?bbox=${bbox}&limit=${String(MAX_RESULTS)}`, { headers: { "User-Agent": userAgent } })), route, radiusM);
    let photos = panoramax;
    let mapillary = "non nécessaire";
    if (panoramax.length < MIN_PHOTOS && (token === undefined || token === "")) mapillary = "non interrogé (sans jeton)";
    if (panoramax.length < MIN_PHOTOS && token !== undefined && token !== "") {
      const url = `${MAPILLARY_IMAGES}?fields=${MAPILLARY_FIELDS}&bbox=${bbox}&limit=${String(MAX_RESULTS)}`;
      const found = nearest(parseMapillary(await getJson(fetchFn, url, { headers: { Authorization: `OAuth ${token}`, "User-Agent": userAgent } })), route, radiusM);
      photos = [...panoramax, ...found].sort((a, b) => a.distanceM - b.distanceM);
      mapillary = `${String(found.length)} photo(s)`;
    }
    notes.push(`à moins de ${String(radiusM)} m : Panoramax ${String(panoramax.length)} photo(s), Mapillary ${mapillary}`);
    if (photos.length > 0) return { photos: photos.slice(0, MAX_USED_PHOTOS), radiusM, notes };
    await pause();
  }
  return { photos: [], radiusM: null, notes };
}
