// La commande unique de création d'un itinéraire (hors casque, réseau permis ici seulement : Overpass, Panoramax, Mapillary,
// ambientCG) : extrait OpenStreetMap, tracé de boucle, puis couleurs relevées sur des photos de rue et bibliothèque de
// matériaux, sans code propre à la ville. Lancée par `npm run city -- <identifiant> [options]` (options : city-args.ts) ;
// MAPILLARY_TOKEN, facultatif, se lit dans l'environnement et n'est jamais écrit ni affiché (SEC-007).
import { readFileSync, readdirSync } from "node:fs";
import { basename } from "node:path";
import { extractCity, loopFileOf, type CityDescription } from "./cities.ts";
import { catalogText, parseCityArgs } from "./city-args.ts";
import { labelOf, providedLabel, regionColours, sourcedColours, type PhotoImage } from "./city-colours.ts";
import { areaFor } from "./materials-areas.ts";
import { DISK, download, readPhoto, writeLibrary, type Colours, type Files } from "./materials-run.ts";
import { searchPhotos, type PhotoSearch } from "./photo-search.ts";
import { loopOf, loopText } from "./route-loop.ts";

export interface Disk extends Files {
  readBytes(path: string): Uint8Array;
  list(dir: string): string[];
}

export const REAL_DISK: Disk = { ...DISK, readBytes: (path) => readFileSync(path), list: (dir) => readdirSync(dir) };

export interface Deps {
  fetchFn: typeof fetch;
  disk: Disk;
  token: string | undefined;
  /** L'attente entre deux requêtes de photos : les services publics ne se martèlent pas. */
  pause: () => Promise<void>;
}

const CATALOG = "data/villes.json";
const PAUSE_MS = 1500;

const providedPhotos = (disk: Disk, dir: string): PhotoImage[] =>
  disk.list(dir).filter((f) => /\.jpe?g$/i.test(f)).sort().map((f) => ({ label: providedLabel(basename(f)), image: readPhoto(disk.readBytes(`${dir}/${f}`)) }));

async function coloursFor(deps: Deps, city: CityDescription, search: PhotoSearch, photosDir: string | undefined): Promise<Colours> {
  const images = photosDir === undefined ? [] : providedPhotos(deps.disk, photosDir);
  for (const photo of search.photos) images.push({ label: labelOf(photo), image: readPhoto(await download(deps.fetchFn, photo.thumb, city.userAgent)) });
  if (images.length > 0) return { source: "photos", note: `${String(images.length)} photo(s) dont ${String(images.length - search.photos.length)} fournie(s) par le demandeur`, list: sourcedColours(images) };
  const [lat, lon] = city.route.points[0] as number[];
  const { region, list } = regionColours([lon as number, lat as number]);
  return { source: "provisoire", note: `aucune photo, même à 1 km du tracé : palette de la région « ${region} » (APP-008)`, list };
}

/** Le rapport : ce que la commande a écrit, la recherche de photos par rayon, et pour chaque couleur d'où elle vient. */
export function reportOf(city: CityDescription, search: PhotoSearch, colours: Colours, written: readonly string[]): string {
  const lines = [`# ${city.name} (${city.itinerary})`, "", "Fichiers écrits :", ...written.map((f) => `- ${f}`), "", "Recherche de photos de rue :", ...search.notes.map((n) => `- ${n}`)];
  lines.push(search.radiusM === null ? "- aucune photo retrouvée, même à 1 km du tracé" : `- retenues à moins de ${String(search.radiusM)} m du tracé`, "", `Couleurs (${colours.source} : ${colours.note}) :`);
  for (const c of colours.list) lines.push(`- ${c.hex} (${String(Math.round(c.share * 100))} %) — ${c.from ?? "origine non dite"}`);
  return lines.join("\n");
}

/** Crée la ville : extrait, boucle, photos, couleurs, textures et bibliothèque ; rend le rapport. */
export async function createCity(deps: Deps, city: CityDescription, photosDir?: string): Promise<string> {
  const { disk } = deps;
  const text = await extractCity(deps.fetchFn, city);
  disk.write(city.file, text);
  const { points, return: back } = city.route;
  const loop = loopOf(JSON.parse(text) as Parameters<typeof loopOf>[0], points, back);
  disk.write(loopFileOf(city), loopText(city.name, points, back, city.file, loop));
  const area = areaFor(city);
  const search = await searchPhotos(deps.fetchFn, loop, city.userAgent, deps.token, deps.pause);
  disk.write(area.photos, `${JSON.stringify(search.photos, null, 1)}\n`);
  const colours = await coloursFor(deps, city, search, photosDir);
  await writeLibrary(deps.fetchFn, city.itinerary, area, colours, disk);
  return reportOf(city, search, colours, [city.file, loopFileOf(city), area.photos, area.library]);
}

/** Les moyens réels de la commande : le réseau, le disque et le jeton Mapillary de l'environnement (facultatif). */
export const realDeps = (env: Record<string, string | undefined>): Deps => ({
  fetchFn: fetch, disk: REAL_DISK, token: env["MAPILLARY_TOKEN"], pause: () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS)),
});

/** Le point d'entrée de `npm run city` : lit les options, écrit l'entrée du catalogue si elle change, crée la ville. */
export async function main(argv: readonly string[], deps: Deps): Promise<string> {
  const catalog = JSON.parse(deps.disk.read(CATALOG)) as Record<string, CityDescription>;
  const request = parseCityArgs(argv, catalog);
  if (request.described) deps.disk.write(CATALOG, catalogText({ ...catalog, [request.key]: request.city }));
  return createCity(deps, request.city, request.photosDir);
}
