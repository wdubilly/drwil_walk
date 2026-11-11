// Les jeux de palettes de détails des façades (APP-008), lus de la recette en données (`app/assets/recette-regions.json`,
// clé `jeuxFacades`) ; chaque entrée de la recette nomme le jeu qu'elle utilise.
import data from "../../assets/recette-regions.json" with { type: "json" };
import type { DetailPalette, PaletteSet } from "./facade-palettes.ts";
import { PALETTES_PER_FAMILY } from "./facade-family.ts";
import { RECIPE, type RecipeFile } from "./region-palette.ts";

const FAMILIES = ["provencale", "village", "ancien", "recent"] as const;
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isColour = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 0xffffff;
const isColours = (v: unknown): v is number[] => Array.isArray(v) && v.length > 0 && v.every(isColour);

function readDetail(raw: unknown, where: string): DetailPalette {
  if (!isObject(raw) || ![raw.trim, raw.glass, raw.accent].every(isColour) || !isColours(raw.shutters) || !isColours(raw.doors)) {
    throw new Error(`${where} : palette de détails illisible`);
  }
  return { trim: raw.trim as number, glass: raw.glass as number, accent: raw.accent as number, shutters: raw.shutters, doors: raw.doors };
}

/** Lit les jeux de façade et refuse un jeu sans ses quatre familles ou un jeu que la recette nomme sans qu'il existe. */
export function readFacadeSets(raw: unknown, used: readonly string[]): Record<string, PaletteSet> {
  if (!isObject(raw) || !isObject(raw.base)) throw new Error("recette : jeu de façade « base » absent");
  const sets: Record<string, PaletteSet> = {};
  for (const [name, set] of Object.entries(raw)) {
    const families = {} as Record<(typeof FAMILIES)[number], DetailPalette[]>;
    for (const family of FAMILIES) {
      const list = isObject(set) ? set[family] : undefined;
      if (!Array.isArray(list) || list.length !== PALETTES_PER_FAMILY) throw new Error(`jeu ${name}.${family} : ${String(PALETTES_PER_FAMILY)} palettes attendues`);
      families[family] = list.map((p, i) => readDetail(p, `jeu ${name}.${family}[${String(i)}]`));
    }
    sets[name] = families;
  }
  const missing = used.find((name) => !(name in sets));
  if (missing !== undefined) throw new Error(`recette : jeu de façade « ${missing} » inconnu`);
  return sets;
}

/** Les noms de jeux que la recette utilise (une entrée peut n'en porter aucun : elle prend alors celui de sa région). */
export const usedSetsOf = (file: RecipeFile): string[] =>
  [...Object.values(file.regions), ...Object.values(file.districts)].flatMap((e) => (e.facadeSet ? [e.facadeSet.value] : []));

export const FACADE_SETS: Record<string, PaletteSet> = readFacadeSets(data.jeuxFacades, usedSetsOf(RECIPE));
