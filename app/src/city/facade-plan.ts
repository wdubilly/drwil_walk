// Le plan d'une façade (APP-008) : tout ce qui la distingue d'une autre, tiré d'une graine et des balises du bâtiment, avec des
// valeurs de repli cohérentes quand OpenStreetMap ne dit ni les étages, ni le type, ni la hauteur.
import { PALETTES, SHOP_KINDS, familyFor, paletteIndexOf, type DetailPalette, type FamilyId, type Region } from "./facade-family.ts";
import { buildingSeed, seededRandom } from "./facade-seed.ts";
import type { Building } from "./souq-data.ts";

/** Cinq choix à trois valeurs (fenêtres, volets, porte, balcons, corniche) : 243 façades différentes dans une famille. */
export const VARIANT_COUNT = 3 ** 5;
/** Hauteur d'un étage de repli, et bornes au-delà desquelles le nombre d'étages d'OpenStreetMap est jugé incohérent avec la hauteur. */
const FLOOR_M = 3.2;
const MIN_FLOOR_M = 2.2;
const MAX_FLOOR_M = 6;
export const MIN_DETAIL_HEIGHT_M = 2.5;
const MAX_FLOORS = 30;

export interface FacadePlan {
  family: FamilyId;
  palette: DetailPalette;
  paletteIndex: number;
  variant: number;
  floors: number;
  floorM: number;
  /** Largeur d'une travée (une fenêtre par travée), en mètres. */
  bayM: number;
  windowStyle: number;
  shutters: number | undefined;
  door: number;
  balcony: number;
  cornice: number;
  shop: boolean;
  chimney: boolean;
  /** Où tombe la porte sur le mur, de 0 à 1 : l'emplacement change d'un bâtiment à l'autre. */
  doorSlot: number;
}

/** Les étages : ceux d'OpenStreetMap s'ils tiennent dans la hauteur, sinon déduits de la hauteur (repli). */
export function resolveFloors(heightM: number, levels: number | undefined): { floors: number; floorM: number } {
  const fromHeight = Math.max(1, Math.min(MAX_FLOORS, Math.round(heightM / FLOOR_M)));
  const floors = levels !== undefined && heightM / levels >= MIN_FLOOR_M && heightM / levels <= MAX_FLOOR_M ? Math.min(levels, MAX_FLOORS) : fromHeight;
  return { floors, floorM: heightM / floors };
}

/** Le numéro de variante de départ d'un bâtiment, tiré de son identifiant. */
export const startVariant = (building: Building): number => Math.floor(seededRandom(buildingSeed(building))() * VARIANT_COUNT);

const BAY_M: Record<FamilyId, number> = { provencale: 3, village: 2.8, ancien: 3.4, recent: 3.2 };

export function planFacade(building: Building, region: Region, variant: number): FacadePlan {
  const { floors, floorM } = resolveFloors(building.heightM, building.levels);
  const family = familyFor(building, floors, region);
  const digit = (i: number): number => Math.floor(variant / 3 ** i) % 3;
  const [windowStyle, shutterDigit, doorDigit, balconyDigit, corniceDigit] = [0, 1, 2, 3, 4].map(digit) as [number, number, number, number, number];
  const paletteIndex = paletteIndexOf(building);
  const palette = (PALETTES[family])[paletteIndex] as DetailPalette;
  const hasShutters = family === "provencale" || family === "village" || (family === "ancien" && shutterDigit !== 2);
  const cornice = family === "provencale" ? Math.max(corniceDigit, 1) : family === "recent" ? (corniceDigit === 2 ? 1 : 0) : corniceDigit;
  return {
    family,
    palette,
    paletteIndex,
    variant,
    floors,
    floorM,
    bayM: BAY_M[family] + windowStyle * 0.2,
    windowStyle,
    shutters: hasShutters ? palette.shutters[shutterDigit] : undefined,
    door: palette.doors[doorDigit] as number,
    balcony: family === "village" ? 0 : balconyDigit,
    cornice,
    shop: SHOP_KINDS.has(building.kind ?? "") || (family === "recent" && doorDigit === 2),
    chimney: variant % 2 === 0,
    doorSlot: seededRandom(buildingSeed(building) ^ 0x51ed)(),
  };
}

/** Ce qui se voit d'une façade : deux voisines ne portent jamais la même signature (les choix sans effet dans la famille n'y comptent pas). */
export const signatureOf = (plan: FacadePlan): string =>
  [plan.family, plan.paletteIndex, plan.windowStyle, plan.shutters ?? "-", plan.door, plan.balcony, plan.cornice, plan.shop, plan.chimney].join(":");
