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

/** Le message d'une erreur réseau, avec le code de sa cause (`fetch failed` seul ne dit rien). */
export const causeOf = (error: unknown): string => {
  const { message, cause } = error as Error & { cause?: { code?: string } };
  return cause?.code === undefined ? message : `${message} (${cause.code})`;
};

const providedPhotos = (disk: Disk, dir: string): PhotoImage[] =>
  disk.list(dir).filter((f) => /\.jpe?g$/i.test(f)).sort().map((f) => ({ label: providedLabel(basename(f)), image: readPhoto(disk.readBytes(`${dir}/${f}`)) }));

/** Une vignette illisible (service lent ou en échec) ne perd pas la ville : elle est écartée et comptée dans `lost`. */
async function coloursFor(deps: Deps, city: CityDescription, search: PhotoSearch, photosDir: string | undefined, lost: string[]): Promise<Colours> {
  const images = photosDir === undefined ? [] : providedPhotos(deps.disk, photosDir);
  const provided = images.length;
  for (const photo of search.photos) {
    try {
      images.push({ label: labelOf(photo), image: readPhoto(await download(deps.fetchFn, photo.thumb, city.userAgent)) });
    } catch (error) {
      lost.push(`vignette ${photo.source} ${photo.id} écartée : ${causeOf(error)}`);
    }
  }
  if (images.length > 0) return { source: "photos", note: `${String(images.length)} photo(s) dont ${String(provided)} fournie(s) par le demandeur`, list: sourcedColours(images) };
  const [lat, lon] = city.route.points[0] as number[];
  const { region, list } = regionColours([lon as number, lat as number]);
  return { source: "provisoire", note: `aucune photo, même à 1 km du tracé : palette de la région « ${region} » (APP-008)`, list };
}

/** Le rapport : ce que la commande a écrit, la recherche de photos par rayon, et pour chaque couleur d'où elle vient. */
export function reportOf(city: CityDescription, search: PhotoSearch, colours: Colours, written: readonly string[], lost: readonly string[] = []): string {
  const lines = [`# ${city.name} (${city.itinerary})`, "", "Fichiers écrits :", ...written.map((f) => `- ${f}`), "", "Recherche de photos de rue :", ...search.notes.map((n) => `- ${n}`)];
  if (lost.length > 0) lines.push(`- ${String(lost.length)} vignette(s) non lue(s) :`, ...lost.map((l) => `  - ${l}`));
  lines.push(search.radiusM === null ? "- aucune photo retrouvée, même à 1 km du tracé" : `- retenues à moins de ${String(search.radiusM)} m du tracé`, "", `Couleurs (${colours.source} : ${colours.note}) :`);
  for (const c of colours.list) lines.push(`- ${c.hex} (${String(Math.round(c.share * 100))} %) — ${c.from ?? "origine non dite"}`);
  return lines.join("\n");
}

/** Crée la ville : extrait, boucle, photos, couleurs, textures et bibliothèque ; rend le rapport. Rien n'est écrit tant que tout n'est pas prêt. */
export async function createCity(deps: Deps, city: CityDescription, photosDir?: string, extra: Record<string, string> = {}): Promise<string> {
  const { disk } = deps;
  const staged: Record<string, string> = {};
  const text = await extractCity(deps.fetchFn, city);
  staged[city.file] = text;
  const { points, return: back } = city.route;
  const loop = loopOf(JSON.parse(text) as Parameters<typeof loopOf>[0], points, back);
  staged[loopFileOf(city)] = loopText(city.name, points, back, city.file, loop);
  const area = areaFor(city);
  const search = await searchPhotos(deps.fetchFn, loop, city.userAgent, deps.token, deps.pause);
  staged[area.photos] = `${JSON.stringify(search.photos, null, 1)}\n`;
  const lost: string[] = [];
  const colours = await coloursFor(deps, city, search, photosDir, lost);
  await writeLibrary(deps.fetchFn, city.itinerary, area, colours, { ...disk, write: (path, content) => { staged[path] = content; } });
  const all = { ...extra, ...staged };
  for (const [path, content] of Object.entries(all)) disk.write(path, content);
  const written = Object.entries(all).map(([path, content]) => `${path} (${String(Math.round(Buffer.byteLength(content) / 1024))} Ko)`);
  return reportOf(city, search, colours, written, lost);
}

/** Les moyens réels de la commande : le réseau, le disque et le jeton Mapillary de l'environnement (facultatif). */
export const realDeps = (env: Record<string, string | undefined>): Deps => ({
  fetchFn: fetch, disk: REAL_DISK, token: env["MAPILLARY_TOKEN"], pause: () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS)),
});

/** Le point d'entrée de `npm run city` : lit les options, crée la ville, puis écrit l'entrée du catalogue si elle change ; sur échec, rien n'est écrit. */
export async function main(argv: readonly string[], deps: Deps): Promise<string> {
  const catalog = JSON.parse(deps.disk.read(CATALOG)) as Record<string, CityDescription>;
  const request = parseCityArgs(argv, catalog);
  const extra = request.described ? { [CATALOG]: catalogText({ ...catalog, [request.key]: request.city }) } : {};
  const started = Date.now();
  try {
    const report = await createCity(deps, request.city, request.photosDir, extra);
    return `${report}\n\nDurée : ${String(Math.round((Date.now() - started) / 1000))} s`;
  } catch (error) {
    throw new Error(`création de ville interrompue, rien n'a été écrit : ${causeOf(error)}`, { cause: error });
  }
}
