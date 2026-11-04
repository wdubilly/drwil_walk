// Les quatre familles architecturales des façades (APP-008) et leur choix : selon la région de l'itinéraire, la balise
// `building`, la hauteur et le quartier (deux bâtiments voisins partagent une famille et une palette). Les palettes de
// chaque région sont dans `facade-palettes.ts`.
import type { LonLat } from "../route/geo.ts";
import { PALETTES_PER_FAMILY } from "./facade-palettes.ts";
import { hash32 } from "./facade-seed.ts";
import type { Building } from "./souq-data.ts";

export type FamilyId = "provencale" | "village" | "ancien" | "recent";
export type Region = "provence" | "italie" | "caucase" | "france-nord" | "inde" | "golfe" | "ailleurs";

interface RegionWindow { region: Region; south: number; north: number; west: number; east: number }

/**
 * Les régions, en fenêtres de latitude et de longitude volontairement larges : la première qui contient l'origine l'emporte
 * (la Provence avant l'Italie, qui la borde). Hors de toute fenêtre, « ailleurs » garde les palettes de base.
 */
const REGION_WINDOWS: readonly RegionWindow[] = [
  // De la Camargue aux Alpes-Maritimes : seule région où la famille provençale existe.
  { region: "provence", south: 43, north: 44.4, west: 4.2, east: 7.7 },
  { region: "france-nord", south: 46, north: 51.2, west: -5.2, east: 8.3 },
  { region: "italie", south: 36.5, north: 46.6, west: 6.6, east: 18.6 },
  { region: "caucase", south: 38.8, north: 43.6, west: 40, east: 50.9 },
  { region: "inde", south: 6.5, north: 35.7, west: 68, east: 97.5 },
  { region: "golfe", south: 16, north: 30.5, west: 46, east: 60 },
];

export function regionOf(origin: LonLat): Region {
  const [lon, lat] = origin;
  return REGION_WINDOWS.find((w) => lat >= w.south && lat <= w.north && lon >= w.west && lon <= w.east)?.region ?? "ailleurs";
}

const OLD_KINDS = new Set(["church", "cathedral", "chapel", "mosque", "temple", "shrine", "monastery", "castle", "palace", "ruins", "historic", "synagogue"]);
const HOUSE_KINDS = new Set(["house", "detached", "semidetached_house", "terrace", "residential", "farm", "cabin", "bungalow", "hut"]);
const MODERN_KINDS = new Set(["apartments", "commercial", "retail", "office", "industrial", "hotel", "supermarket", "warehouse", "university", "school", "hospital", "public", "civic", "dormitory", "kindergarten"]);
export const SHOP_KINDS = new Set(["commercial", "retail", "supermarket", "kiosk", "shop"]);
/** Au-delà, un immeuble est une construction récente, quelle que soit sa balise. */
const TALL_FLOORS = 6;

/** Le côté d'un quartier, en mètres : les bâtiments d'une même case partagent famille (balise inconnue) et palette. */
export const NEIGHBOURHOOD_M = 60;

export function neighbourhoodOf(building: Building): number {
  const p = building.footprint[0] as { x: number; z: number };
  return hash32(Math.floor(p.x / NEIGHBOURHOOD_M) * 73856093) ^ hash32(Math.floor(p.z / NEIGHBOURHOOD_M) * 19349663 + 1);
}

/** La famille : la balise la décide quand elle est claire, sinon le quartier ; la provençale n'existe qu'en Provence. */
export function familyFor(building: Building, floors: number, region: Region): FamilyId {
  const kind = building.kind ?? "";
  const hood = neighbourhoodOf(building) % 100;
  const village: FamilyId = region === "provence" && hood % 2 === 0 ? "provencale" : "village";
  if (floors >= TALL_FLOORS || MODERN_KINDS.has(kind)) return "recent";
  if (OLD_KINDS.has(kind)) return "ancien";
  if (HOUSE_KINDS.has(kind)) return village;
  if (hood < 40) return "ancien";
  return hood < 75 ? village : "recent";
}

/** Le numéro de la palette du quartier ; il entre dans la signature d'une façade (voisins jamais identiques). */
export const paletteIndexOf = (building: Building): number => (neighbourhoodOf(building) >>> 8) % PALETTES_PER_FAMILY;
