// Les palettes de détails des façades (APP-008), un jeu par région lu de la recette en données (`app/assets/recette-regions.json`) :
// les familles décrivent des types de bâtiment valables partout, la palette porte la couleur locale. Une région sans jeu
// propre (Provence, région inconnue) garde le jeu de base.
import { PALETTES_PER_FAMILY, type FamilyId, type Region } from "./facade-family.ts";
import { FACADE_SETS } from "./recipe-data.ts";
import { RECIPE, recipeFor } from "./region-palette.ts";

/** Une palette de détails : liserés, volets, portes et rambardes ; les murs gardent la teinte d'OpenStreetMap ou de la ville. */
export interface DetailPalette {
  trim: number;
  glass: number;
  shutters: readonly number[];
  doors: readonly number[];
  accent: number;
}

export type PaletteSet = Record<FamilyId, readonly DetailPalette[]>;

export { PALETTES_PER_FAMILY };

/** Le jeu de base : celui de la Provence et le repli d'une région inconnue (les teintes d'avant les régions). */
export const PALETTES: PaletteSet = FACADE_SETS["base"] as PaletteSet;

/** Le jeu de palettes d'une région ; repli sur le jeu de base quand la recette ne la décrit pas. */
export const palettesOf = (region: Region): PaletteSet => FACADE_SETS[recipeFor(RECIPE, region).facadeSet.value] as PaletteSet;
