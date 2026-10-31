// Extraction du quartier de Souq Waqif (et, via `extract`, de tout autre quartier : voir extract-pune.ts) depuis OpenStreetMap (Overpass) : bâtiments et voies, en GeoJSON.
// Relançable : `npm run extract` réécrit data/souq-waqif.json. Le casque, lui, ne fait aucun appel réseau :
// il ne lit que ce fichier versionné. Données © contributeurs OpenStreetMap, licence ODbL.
export const BBOX = { south: 25.284, west: 51.529, north: 25.29, east: 51.538 };
export const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
/** Overpass refuse (406) les requêtes sans identification. */
export const USER_AGENT = "drwil_walk/0.1 (extraction OpenStreetMap du quartier de Souq Waqif)";
/** Hauteur d'un bâtiment sans `height` ni `building:levels` : une maison de souk de deux niveaux. */
export const DEFAULT_HEIGHT_M = 7;
export const LEVEL_HEIGHT_M = 3;

export interface OverpassWay {
  type: string;
  id: number;
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
}
export interface OverpassResponse {
  osm3s?: { timestamp_osm_base?: string };
  elements: OverpassWay[];
}
export interface ExtractFeature {
  type: "Feature";
  id: number;
  properties: { kind: "building"; heightM: number } | { kind: "highway"; highway: string };
  geometry: { type: "Polygon"; coordinates: number[][][] } | { type: "LineString"; coordinates: number[][] };
}

export function buildQuery(bbox = BBOX): string {
  const area = `(${String(bbox.south)},${String(bbox.west)},${String(bbox.north)},${String(bbox.east)})`;
  return `[out:json][timeout:90];(way["building"]${area};way["highway"]${area};);out geom;`;
}

/** Hauteur en mètres : `height` si lisible, sinon les niveaux, sinon la valeur par défaut. */
export function buildingHeightM(tags: Record<string, string>): number {
  const height = parseFloat(tags["height"] ?? "");
  if (height > 0) return height;
  const levels = parseFloat(tags["building:levels"] ?? "");
  if (levels > 0) return levels * LEVEL_HEIGHT_M;
  return DEFAULT_HEIGHT_M;
}

const round6 = (n: number): number => Math.round(n * 1e6) / 1e6;

function feature(way: OverpassWay): ExtractFeature | undefined {
  const tags = way.tags ?? {};
  const line = (way.geometry ?? []).map((p) => [round6(p.lon), round6(p.lat)]);
  if (tags["building"] !== undefined) {
    // Un bâtiment est un anneau fermé d'au moins trois sommets.
    if (line.length < 4) return undefined;
    return {
      type: "Feature",
      id: way.id,
      properties: { kind: "building", heightM: buildingHeightM(tags) },
      geometry: { type: "Polygon", coordinates: [line] },
    };
  }
  if (line.length < 2) return undefined;
  return {
    type: "Feature",
    id: way.id,
    properties: { kind: "highway", highway: tags["highway"] ?? "" },
    geometry: { type: "LineString", coordinates: line },
  };
}

/** Le fichier : une entité par ligne, pour que les diffs de Git restent lisibles. */
export function toGeoJsonText(osm: OverpassResponse): string {
  const features = osm.elements.map(feature).filter((f): f is ExtractFeature => f !== undefined);
  const head = JSON.stringify({
    type: "FeatureCollection",
    attribution: "© contributeurs OpenStreetMap, licence ODbL",
    extractedFrom: osm.osm3s?.timestamp_osm_base ?? "",
  });
  return `${head.slice(0, -1)},"features":[\n${features.map((f) => JSON.stringify(f)).join(",\n")}\n]}\n`;
}

/** Interroge Overpass et rend le texte du fichier d'extrait. */
export async function extract(fetchFn: typeof fetch, bbox = BBOX, userAgent = USER_AGENT): Promise<string> {
  const response = await fetchFn(OVERPASS_URL, {
    method: "POST",
    headers: { "User-Agent": userAgent, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: buildQuery(bbox) }),
  });
  if (!response.ok) throw new Error(`Overpass a répondu ${String(response.status)} : extraction impossible.`);
  return toGeoJsonText((await response.json()) as OverpassResponse);
}
