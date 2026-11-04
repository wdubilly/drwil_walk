// Inventaire des photos de rue géolocalisées le long d'un itinéraire (préparation, hors casque ; SEC-007) : Panoramax
// d'abord, Mapillary en secours si Panoramax ne suffit pas et qu'un jeton est fourni (variable d'environnement, jamais
// dans le dépôt). Les photos ne sont que citées : identifiant, position, cap, date, auteur, licence et lien.
import { toLocalMetres, type LonLat, type Vec2 } from "../src/route/geo.ts";

export interface StreetPhoto {
  source: "panoramax" | "mapillary";
  id: string;
  lon: number;
  lat: number;
  /** Le cap de prise de vue en degrés, s'il est connu. */
  headingDeg: number | null;
  date: string;
  author: string;
  licence: string;
  url: string;
  /** La vignette, seule image lue par le relevé des couleurs. */
  thumb: string;
}

/** Une photo compte si elle est prise à moins de cette distance du tracé. */
export const MAX_DISTANCE_M = 30;
/** En dessous, Panoramax ne suffit pas : le relevé des couleurs demande quelques photos variées. */
export const MIN_PHOTOS = 20;
export const PANORAMAX_SEARCH = "https://api.panoramax.xyz/api/search";
export const MAPILLARY_IMAGES = "https://graph.mapillary.com/images";
const MAPILLARY_FIELDS = "id,geometry,compass_angle,captured_at,creator,thumb_1024_url";
const MAX_RESULTS = 1000;

/** L'emprise du tracé, élargie de la distance retenue : [ouest, sud, est, nord]. */
export function bboxAround(route: readonly LonLat[], marginM = MAX_DISTANCE_M): [number, number, number, number] {
  const lons = route.map((p) => p[0]);
  const lats = route.map((p) => p[1]);
  const dLat = marginM / 111_320;
  const dLon = dLat / Math.cos(((Math.min(...lats) + Math.max(...lats)) / 2) * (Math.PI / 180));
  return [Math.min(...lons) - dLon, Math.min(...lats) - dLat, Math.max(...lons) + dLon, Math.max(...lats) + dLat];
}

function segmentDistance(p: Vec2, a: Vec2, b: Vec2): number {
  const [dx, dz] = [b.x - a.x, b.z - a.z];
  const length2 = dx * dx + dz * dz;
  const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / length2));
  return Math.hypot(p.x - (a.x + t * dx), p.z - (a.z + t * dz));
}

/** La distance d'un point au tracé (segments compris, pas seulement les sommets), en mètres. */
export function distanceToLine(point: LonLat, route: readonly LonLat[]): number {
  const origin = route[0] as LonLat;
  const local = route.map((p) => toLocalMetres(origin, p));
  const p = toLocalMetres(origin, point);
  if (local.length === 1) return Math.hypot(p.x - (local[0] as Vec2).x, p.z - (local[0] as Vec2).z);
  return Math.min(...local.slice(1).map((b, i) => segmentDistance(p, local[i] as Vec2, b)));
}

type Json = Record<string, unknown>;
const record = (value: unknown): Json => (typeof value === "object" && value !== null ? (value as Json) : {});
const text = (value: unknown, fallback = ""): string => (typeof value === "string" ? value : fallback);
const number = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);
const point = (geometry: unknown): [number, number] => {
  const [lon, lat] = (record(geometry)["coordinates"] as unknown[] | undefined) ?? [];
  return [Number(lon), Number(lat)];
};

/** Les photos d'une réponse de recherche Panoramax (STAC, GeoJSON). */
export function parsePanoramax(json: unknown): StreetPhoto[] {
  const features = (record(json)["features"] as unknown[] | undefined) ?? [];
  return features.map((value) => {
    const f = record(value);
    const props = record(f["properties"]);
    const [lon, lat] = point(f["geometry"]);
    const self = ((f["links"] as unknown[] | undefined) ?? []).map(record).find((l) => l["rel"] === "self");
    return {
      source: "panoramax",
      id: text(f["id"]),
      lon,
      lat,
      headingDeg: number(props["view:azimuth"]),
      date: text(props["datetime"]),
      author: text(props["geovisio:producer"], "inconnu"),
      licence: text(props["license"], "inconnue"),
      url: text(self?.["href"], `https://api.panoramax.xyz/#focus=pic&pic=${text(f["id"])}`),
      thumb: text(props["geovisio:thumbnail"], text(record(record(f["assets"])["thumb"])["href"])),
    };
  });
}

/** Les photos d'une réponse de l'API Mapillary : toutes sous licence CC BY-SA 4.0. */
export function parseMapillary(json: unknown): StreetPhoto[] {
  const data = (record(json)["data"] as unknown[] | undefined) ?? [];
  return data.map((value) => {
    const image = record(value);
    const [lon, lat] = point(image["geometry"]);
    const captured = number(image["captured_at"]);
    return {
      source: "mapillary",
      id: text(image["id"]),
      lon,
      lat,
      headingDeg: number(image["compass_angle"]),
      date: captured === null ? "" : new Date(captured).toISOString(),
      author: text(record(image["creator"])["username"], "inconnu"),
      licence: "CC-BY-SA-4.0",
      url: `https://www.mapillary.com/app/?pKey=${text(image["id"])}`,
      thumb: text(image["thumb_1024_url"]),
    };
  });
}

export async function getJson(fetchFn: typeof fetch, url: string, init: RequestInit): Promise<unknown> {
  const response = await fetchFn(url, init);
  if (!response.ok) throw new Error(`${new URL(url).host} a répondu ${String(response.status)}`);
  return response.json() as Promise<unknown>;
}

export interface Inventory {
  panoramax: StreetPhoto[];
  /** Les photos Mapillary, ou la raison pour laquelle Mapillary n'a pas été interrogé. */
  mapillary: StreetPhoto[] | "non nécessaire" | "sans jeton";
  /** Les photos retenues, à moins de `MAX_DISTANCE_M` du tracé. */
  photos: StreetPhoto[];
}

/** Interroge Panoramax, puis Mapillary s'il le faut et qu'un jeton est fourni ; le jeton n'est jamais écrit nulle part. */
export async function inventory(fetchFn: typeof fetch, route: readonly LonLat[], userAgent: string, token?: string): Promise<Inventory> {
  const near = (photos: StreetPhoto[]): StreetPhoto[] => photos.filter((p) => distanceToLine([p.lon, p.lat], route) <= MAX_DISTANCE_M);
  const bbox = bboxAround(route).map((v) => v.toFixed(6)).join(",");
  const panoramax = near(parsePanoramax(await getJson(fetchFn, `${PANORAMAX_SEARCH}?bbox=${bbox}&limit=${String(MAX_RESULTS)}`, { headers: { "User-Agent": userAgent } })));
  if (panoramax.length >= MIN_PHOTOS) return { panoramax, mapillary: "non nécessaire", photos: panoramax };
  if (token === undefined || token === "") return { panoramax, mapillary: "sans jeton", photos: panoramax };
  const url = `${MAPILLARY_IMAGES}?fields=${MAPILLARY_FIELDS}&bbox=${bbox}&limit=${String(MAX_RESULTS)}`;
  const mapillary = near(parseMapillary(await getJson(fetchFn, url, { headers: { Authorization: `OAuth ${token}`, "User-Agent": userAgent } })));
  return { panoramax, mapillary, photos: [...panoramax, ...mapillary] };
}

const cell = (value: string): string => value.replaceAll("|", "\\|");

/** Le relevé publié dans la preuve du chantier : la couverture dite, puis une ligne par photo retenue. */
export function inventoryMarkdown(inv: Inventory): string {
  const mapillary = typeof inv.mapillary === "string" ? `non interrogé (${inv.mapillary})` : `${String(inv.mapillary.length)} photo(s)`;
  const lines = [
    `- Panoramax : ${String(inv.panoramax.length)} photo(s) à moins de ${String(MAX_DISTANCE_M)} m du tracé (seuil de suffisance : ${String(MIN_PHOTOS)}).`,
    `- Mapillary : ${mapillary}.`,
    `- Retenues : ${String(inv.photos.length)} photo(s).`,
  ];
  if (inv.photos.length === 0) return lines.join("\n");
  lines.push("", "| Source | Identifiant | Position | Cap | Date | Auteur | Licence | Lien |", "|---|---|---|---|---|---|---|---|");
  for (const p of inv.photos) {
    const heading = p.headingDeg === null ? "inconnu" : `${String(Math.round(p.headingDeg))}°`;
    lines.push(`| ${p.source} | ${cell(p.id)} | ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)} | ${heading} | ${cell(p.date)} | ${cell(p.author)} | ${cell(p.licence)} | ${cell(p.url)} |`);
  }
  return lines.join("\n");
}
