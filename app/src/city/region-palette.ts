// La palette du sol, des voies et des bâtiments d'une ville, déduite de sa région (APP-008) : aucune n'est écrite par ville,
// une ville créée par la commande en reçoit une sans code. Une région sans jeu propre prend celui d'« ailleurs ».
import type { LonLat } from "../route/geo.ts";
import { regionOf, type Region } from "./facade-family.ts";
import data from "../../assets/recette-regions.json" with { type: "json" };
import type { Palette } from "./souq-data.ts";
import type { Surface } from "../../scripts/osm-tags.ts";

// Le schéma de la recette d'un quartier, en données (APP-008, gen-02) : une entrée par région, une surcharge possible par
// quartier, un repli champ par champ (quartier → région → « ailleurs ») et, pour chaque élément, son origine.

/** Relevé (OSM, photo) ou ajouté par règle : une preuve refuse un élément ajouté présenté comme relevé (APP-013). */
export type Origin = "releve" | "regle";

/** `source` dit d'où vient un élément relevé (photo, identifiant OSM) : sans elle, un élément ne peut pas se dire relevé. */
export interface RecipeElement<T> { value: T; origin: Origin; source?: string }

/** L'emprise d'un quartier, en degrés : un lieu qui y tombe prend la surcharge du quartier. */
export interface Bounds { south: number; west: number; north: number; east: number }

/** Les champs d'une entrée ; tous facultatifs sauf dans « ailleurs », qui les porte tous. */
export interface RecipeEntry {
  palette?: RecipeElement<Palette>;
  facadeSet?: RecipeElement<string>;
  /** Le réglage des figurants (APP-014) : le moteur du catalogue (`traffic-catalog.ts`) en valide le détail. */
  figurants?: RecipeElement<Record<string, unknown>>;
  /** Le revêtement de repli des voies, par famille (`chaussee`, `pieton`), quand la balise `surface` manque (APP-009). */
  sols?: RecipeElement<Record<string, Surface>>;
}

export interface RecipeFile {
  regions: Record<string, RecipeEntry> & { ailleurs: Required<Omit<RecipeEntry, "sols">> & Pick<RecipeEntry, "sols"> };
  districts: Record<string, RecipeEntry & { region?: string; bounds?: Bounds }>;
}

export interface Recipe { palette: RecipeElement<Palette>; facadeSet: RecipeElement<string>; figurants: RecipeElement<Record<string, unknown>>; sols?: RecipeElement<Record<string, Surface>> }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isColour = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 0xffffff;

function readElement<T>(raw: unknown, where: string, readValue: (v: unknown) => T | undefined): RecipeElement<T> {
  if (!isObject(raw)) throw new Error(`${where} : élément attendu`);
  if (raw.origin !== "releve" && raw.origin !== "regle") throw new Error(`${where} : origine absente ou inconnue`);
  const value = readValue(raw.value);
  if (value === undefined) throw new Error(`${where} : valeur invalide`);
  const source = typeof raw.source === "string" && raw.source !== "" ? raw.source : undefined;
  if (raw.origin === "releve" && source === undefined) throw new Error(`${where} : un élément relevé nomme sa source`);
  return source === undefined ? { value, origin: raw.origin } : { value, origin: raw.origin, source };
}

const readPalette = (v: unknown): Palette | undefined =>
  isObject(v) && isColour(v.ground) && isColour(v.road) && Array.isArray(v.buildings) && v.buildings.length > 0 && v.buildings.every(isColour)
    ? { ground: v.ground, road: v.road, buildings: v.buildings }
    : undefined;
const readSetting = (v: unknown): Record<string, unknown> | undefined => (isObject(v) && (v.conduite === "droite" || v.conduite === "gauche") ? v : undefined);
const SURFACES = new Set(["asphalt", "pave", "terre"]);
const readSols = (v: unknown): Record<string, Surface> | undefined =>
  isObject(v) && Object.values(v).length > 0 && Object.values(v).every((s) => typeof s === "string" && SURFACES.has(s)) ? (v as Record<string, Surface>) : undefined;
const readName = (v: unknown): string | undefined => (typeof v === "string" && v !== "" ? v : undefined);

function readBounds(raw: unknown, where: string): Bounds {
  if (!isObject(raw) || ![raw.south, raw.west, raw.north, raw.east].every((n) => typeof n === "number" && Number.isFinite(n))) throw new Error(`${where} : emprise invalide`);
  const b = raw as unknown as Bounds;
  if (b.south > b.north || b.west > b.east) throw new Error(`${where} : emprise invalide`);
  return { south: b.south, west: b.west, north: b.north, east: b.east };
}

function readEntry(raw: unknown, where: string): RecipeEntry {
  if (!isObject(raw)) throw new Error(`${where} : entrée attendue`);
  const entry: RecipeEntry = {};
  if (raw.palette !== undefined) entry.palette = readElement(raw.palette, `${where}.palette`, readPalette);
  if (raw.facadeSet !== undefined) entry.facadeSet = readElement(raw.facadeSet, `${where}.facadeSet`, readName);
  if (raw.figurants !== undefined) entry.figurants = readElement(raw.figurants, `${where}.figurants`, readSetting);
  if (raw.sols !== undefined) entry.sols = readElement(raw.sols, `${where}.sols`, readSols);
  return entry;
}

/** Lit et valide une recette : refuse un champ mal formé, une origine inconnue ou une région « ailleurs » incomplète. */
export function readRecipe(raw: unknown): RecipeFile {
  if (!isObject(raw) || !isObject(raw.regions)) throw new Error("recette : regions attendu");
  const regions: Record<string, RecipeEntry> = {};
  for (const [name, entry] of Object.entries(raw.regions)) regions[name] = readEntry(entry, `regions.${name}`);
  const fallback = regions.ailleurs;
  if (!fallback?.palette || !fallback.facadeSet || !fallback.figurants) throw new Error("recette : « ailleurs » doit porter tous les champs");
  const districts: RecipeFile["districts"] = {};
  for (const [name, entry] of Object.entries(isObject(raw.districts) ? raw.districts : {})) {
    const region = isObject(entry) ? entry.region : undefined;
    if (region !== undefined && typeof region !== "string") throw new Error(`districts.${name} : région invalide`);
    const bounds = isObject(entry) && entry.bounds !== undefined ? readBounds(entry.bounds, `districts.${name}.bounds`) : undefined;
    districts[name] = { ...readEntry(entry, `districts.${name}`), ...(region === undefined ? {} : { region }), ...(bounds === undefined ? {} : { bounds }) };
  }
  return { regions: regions as RecipeFile["regions"], districts };
}

/** La recette d'un lieu : chaque champ vient du quartier s'il le porte, sinon de sa région, sinon d'« ailleurs » (sans erreur). */
export function recipeFor(file: RecipeFile, region: string, district?: string): Recipe {
  const hood = district === undefined ? undefined : file.districts[district];
  const own = file.regions[hood?.region ?? region];
  const pick = <K extends keyof Recipe>(key: K): Recipe[K] => (hood?.[key] ?? own?.[key] ?? file.regions.ailleurs[key]) as Recipe[K];
  const sols = hood?.sols ?? own?.sols ?? file.regions.ailleurs.sols;
  return { palette: pick("palette"), facadeSet: pick("facadeSet"), figurants: pick("figurants"), ...(sols ? { sols } : {}) };
}

/** Le quartier dont l'emprise contient l'origine (le premier du fichier), s'il y en a un : aucun nom de quartier n'est dans le code. */
export function districtAt(file: RecipeFile, origin: LonLat): string | undefined {
  const [lon, lat] = origin;
  return Object.entries(file.districts).find(([, d]) => d.bounds && lat >= d.bounds.south && lat <= d.bounds.north && lon >= d.bounds.west && lon <= d.bounds.east)?.[0];
}

const works = (read: () => unknown): boolean => {
  try { read(); return true; } catch { return false; }
};

/**
 * Lecture tolérante de la recette embarquée : un champ, une emprise ou une entrée de région ou de quartier illisible est écarté et
 * la ville retombe sur le niveau au-dessus, jusqu'à « ailleurs » (APP-012) ; « ailleurs » reste exigé, son absence fait échouer.
 */
export function loadRecipe(raw: unknown): RecipeFile {
  if (!isObject(raw) || !isObject(raw.regions)) return readRecipe(raw);
  const clean = (entries: unknown, where: string): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [name, entry] of Object.entries(isObject(entries) ? entries : {})) {
      if (name === "ailleurs" && where === "regions") { out[name] = entry; continue; }
      if (!isObject(entry)) continue;
      const kept: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(entry)) {
        const ok = key === "region" ? typeof value === "string" : key === "bounds" ? works(() => readBounds(value, key)) : works(() => readEntry({ [key]: value }, key));
        if (ok) kept[key] = value;
      }
      out[name] = kept;
    }
    return out;
  };
  return readRecipe({ regions: clean(raw.regions, "regions"), districts: clean(raw.districts, "districts") });
}

/** La recette des régions, lue une fois de `app/assets/recette-regions.json`, avec écart des éléments illisibles (`loadRecipe`). */
export const RECIPE: RecipeFile = loadRecipe(data);

/** La palette du sol, des voies et des bâtiments du quartier de l'origine, sinon de sa région, lue de la recette ; « ailleurs » en repli. */
export const paletteOf = (origin: LonLat): Palette => recipeFor(RECIPE, regionOf(origin), districtAt(RECIPE, origin)).palette.value;

/** La région d'un lieu et, s'il tombe dans l'emprise d'un quartier de la recette, ce quartier : façades et matériaux en lisent la surcharge. */
export function placeOf(origin: LonLat): { region: Region; district?: string } {
  const district = districtAt(RECIPE, origin);
  return district === undefined ? { region: regionOf(origin) } : { region: regionOf(origin), district };
}

/** La clé du réglage des figurants d'un lieu : son quartier s'il en a un, sinon sa région (la table ci-dessous porte les deux). */
export const figurantsKeyOf = (origin: LonLat): string => districtAt(RECIPE, origin) ?? regionOf(origin);

/** La table des figurants lue de la recette, une entrée par région et par quartier, repli de champ comme pour les palettes. */
export function figurantsTable(file: RecipeFile): Record<string, unknown> {
  const table: Record<string, unknown> = {};
  for (const name of Object.keys(file.regions)) table[name] = recipeFor(file, name).figurants.value;
  for (const [name, d] of Object.entries(file.districts)) table[name] = recipeFor(file, d.region ?? "ailleurs", name).figurants.value;
  return table;
}
