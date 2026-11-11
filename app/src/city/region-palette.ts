// La palette du sol, des voies et des bâtiments d'une ville, déduite de sa région (APP-008) : aucune n'est écrite par ville,
// une ville créée par la commande en reçoit une sans code. Une région sans jeu propre prend celui d'« ailleurs ».
import type { LonLat } from "../route/geo.ts";
import { regionOf, type Region } from "./facade-family.ts";
import type { Palette } from "./souq-data.ts";

/** Voies sombres sur un sol plus clair, bâtiments dans quatre tons de la même famille. */
const ELSEWHERE: Palette = { ground: 0x8a8a84, road: 0x484848, buildings: [0xcfc8bc, 0xbdb4a4, 0xddd6c8, 0xa9a092] };

const PER_REGION: Partial<Record<Region, Palette>> = {
  golfe: { ground: 0xa8916b, road: 0x5e5446, buildings: [0xe3cfa5, 0xd2b48c, 0xc99a6b, 0xefe0c0] },
  inde: { ground: 0x9a8a78, road: 0x4f4a45, buildings: [0xb5543c, 0xc8785a, 0xd9a27a, 0xa04632] },
};

export const paletteOf = (origin: LonLat): Palette => PER_REGION[regionOf(origin)] ?? ELSEWHERE;

// Le schéma de la recette d'un quartier, en données (APP-008, gen-02) : une entrée par région, une surcharge possible par
// quartier, un repli champ par champ (quartier → région → « ailleurs ») et, pour chaque élément, son origine.

/** Relevé (OSM, photo) ou ajouté par règle : une preuve refuse un élément ajouté présenté comme relevé (APP-013). */
export type Origin = "releve" | "regle";

export interface RecipeElement<T> { value: T; origin: Origin }

/** Les champs d'une entrée ; tous facultatifs sauf dans « ailleurs », qui les porte tous. */
export interface RecipeEntry {
  palette?: RecipeElement<Palette>;
  facadeSet?: RecipeElement<string>;
}

export interface RecipeFile {
  regions: Record<string, RecipeEntry> & { ailleurs: Required<RecipeEntry> };
  districts: Record<string, RecipeEntry & { region?: string }>;
}

export interface Recipe { palette: RecipeElement<Palette>; facadeSet: RecipeElement<string> }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isColour = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 0xffffff;

function readElement<T>(raw: unknown, where: string, readValue: (v: unknown) => T | undefined): RecipeElement<T> {
  if (!isObject(raw)) throw new Error(`${where} : élément attendu`);
  if (raw.origin !== "releve" && raw.origin !== "regle") throw new Error(`${where} : origine absente ou inconnue`);
  const value = readValue(raw.value);
  if (value === undefined) throw new Error(`${where} : valeur invalide`);
  return { value, origin: raw.origin };
}

const readPalette = (v: unknown): Palette | undefined =>
  isObject(v) && isColour(v.ground) && isColour(v.road) && Array.isArray(v.buildings) && v.buildings.length > 0 && v.buildings.every(isColour)
    ? { ground: v.ground, road: v.road, buildings: v.buildings }
    : undefined;
const readName = (v: unknown): string | undefined => (typeof v === "string" && v !== "" ? v : undefined);

function readEntry(raw: unknown, where: string): RecipeEntry {
  if (!isObject(raw)) throw new Error(`${where} : entrée attendue`);
  const entry: RecipeEntry = {};
  if (raw.palette !== undefined) entry.palette = readElement(raw.palette, `${where}.palette`, readPalette);
  if (raw.facadeSet !== undefined) entry.facadeSet = readElement(raw.facadeSet, `${where}.facadeSet`, readName);
  return entry;
}

/** Lit et valide une recette : refuse un champ mal formé, une origine inconnue ou une région « ailleurs » incomplète. */
export function readRecipe(raw: unknown): RecipeFile {
  if (!isObject(raw) || !isObject(raw.regions)) throw new Error("recette : regions attendu");
  const regions: Record<string, RecipeEntry> = {};
  for (const [name, entry] of Object.entries(raw.regions)) regions[name] = readEntry(entry, `regions.${name}`);
  const fallback = regions.ailleurs;
  if (!fallback?.palette || !fallback.facadeSet) throw new Error("recette : « ailleurs » doit porter tous les champs");
  const districts: RecipeFile["districts"] = {};
  for (const [name, entry] of Object.entries(isObject(raw.districts) ? raw.districts : {})) {
    const region = isObject(entry) ? entry.region : undefined;
    if (region !== undefined && typeof region !== "string") throw new Error(`districts.${name} : région invalide`);
    districts[name] = { ...readEntry(entry, `districts.${name}`), ...(region === undefined ? {} : { region }) };
  }
  return { regions: regions as RecipeFile["regions"], districts };
}

/** La recette d'un lieu : chaque champ vient du quartier s'il le porte, sinon de sa région, sinon d'« ailleurs » (sans erreur). */
export function recipeFor(file: RecipeFile, region: string, district?: string): Recipe {
  const hood = district === undefined ? undefined : file.districts[district];
  const own = file.regions[hood?.region ?? region];
  const pick = <K extends keyof Recipe>(key: K): Recipe[K] => (hood?.[key] ?? own?.[key] ?? file.regions.ailleurs[key]) as Recipe[K];
  return { palette: pick("palette"), facadeSet: pick("facadeSet") };
}
