// Les deux gestes de préparation d'un quartier (hors casque, réseau permis ici seulement) : l'inventaire des photos de rue,
// puis la bibliothèque de matériaux (couleurs relevées, textures CC0 recolorées). Appelés en ligne par les commandes npm :
//   npm run materials:inventory -- <itinéraire>   (MAPILLARY_TOKEN facultatif, dans l'environnement, jamais dans le dépôt)
//   npm run materials:library -- <itinéraire>
import { readFileSync, writeFileSync } from "node:fs";
import { decode } from "jpeg-js";
import type { LonLat } from "../src/route/geo.ts";
import { areaOf, type MaterialArea, type Tone } from "./materials-areas.ts";
import { dominantColours, fromHex, luma, type DominantColour, type Rgba } from "./materials-colours.ts";
import { TEXTURE_PX, ambientCgUrl, prepareMaterial } from "./materials-textures.ts";
import { inventory, inventoryMarkdown, type StreetPhoto } from "./panoramax.ts";

export interface Files {
  read(path: string): string;
  write(path: string, text: string): void;
}

export const DISK: Files = { read: (path) => readFileSync(path, "utf8"), write: writeFileSync };

const loopOf = (area: MaterialArea, files: Files): LonLat[] =>
  (JSON.parse(files.read(area.loop)) as { geometry: { coordinates: LonLat[] } }).geometry.coordinates;

/** L'inventaire : écrit la liste des photos retenues (liens seulement) et rend le relevé pour la preuve. */
export async function runInventory(fetchFn: typeof fetch, id: string, token: string | undefined, files: Files): Promise<string> {
  const area = areaOf(id);
  const found = await inventory(fetchFn, loopOf(area, files), area.userAgent, token);
  files.write(area.photos, `${JSON.stringify(found.photos, null, 1)}\n`);
  return inventoryMarkdown(found);
}

/** La couleur qui recolore un matériau, et ses teintes voisines (variation d'un bâtiment à l'autre). */
export function toneOf(colours: readonly string[], tone: Tone): { colour: string; tints: string[] } {
  const byLuma = [...colours].sort((a, b) => luma(fromHex(a)) - luma(fromHex(b)));
  const index = { sombre: 0, moyen: Math.floor((byLuma.length - 1) / 2), clair: byLuma.length - 1 }[tone];
  const colour = byLuma[index] as string;
  const tints = [...byLuma].sort((a, b) => Math.abs(luma(fromHex(a)) - luma(fromHex(colour))) - Math.abs(luma(fromHex(b)) - luma(fromHex(colour)))).slice(0, 3);
  return { colour, tints };
}

async function download(fetchFn: typeof fetch, url: string, userAgent: string): Promise<Uint8Array> {
  const response = await fetchFn(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`${url} : réponse ${String(response.status)}`);
  return new Uint8Array(await response.arrayBuffer());
}

const readPhoto = (bytes: Uint8Array): Rgba => decode(bytes, { useTArray: true, formatAsRGBA: true, maxMemoryUsageInMB: 256 });

/** Les couleurs relevées sur les photos de l'inventaire, ou les couleurs provisoires du quartier s'il n'y en a aucune. */
export async function coloursOf(fetchFn: typeof fetch, area: MaterialArea, photos: readonly StreetPhoto[]) {
  if (photos.length === 0) {
    const list: DominantColour[] = area.provisional.colours.map((hex) => ({ hex, share: 1 / area.provisional.colours.length }));
    return { source: "provisoire" as const, note: area.provisional.source, list };
  }
  const images = await Promise.all(photos.map(async (p) => readPhoto(await download(fetchFn, p.thumb, area.userAgent))));
  return { source: "photos" as const, note: `${String(photos.length)} photo(s) de l'inventaire`, list: dominantColours(images) };
}

/** La bibliothèque du quartier : couleurs, matériaux (textures embarquées) et familles ; écrite dans `app/assets/materials/`. */
export async function runLibrary(fetchFn: typeof fetch, id: string, files: Files): Promise<string> {
  const area = areaOf(id);
  const colours = await coloursOf(fetchFn, area, JSON.parse(files.read(area.photos)) as StreetPhoto[]);
  const hexes = colours.list.map((c) => c.hex);
  const materials = [];
  for (const source of area.materials) {
    const { colour, tints } = toneOf(hexes, source.tone);
    const textures = prepareMaterial(await download(fetchFn, ambientCgUrl(source.asset), area.userAgent), source.asset, fromHex(colour));
    materials.push({ id: source.id, label: source.label, asset: source.asset, sizeM: source.sizeM, colour, tints, ...textures });
  }
  const library = { schema: 1, itinerary: id, colours, textureSizePx: TEXTURE_PX, materials, families: area.families };
  files.write(area.library, `${JSON.stringify(library)}\n`);
  return `${colours.source} : ${hexes.join(", ")}`;
}
