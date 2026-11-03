// Les quatre familles architecturales des façades (APP-008) et leur choix : selon la région de l'itinéraire, la balise
// `building`, la hauteur et le quartier (deux bâtiments voisins partagent une famille et une palette).
import type { LonLat } from "../route/geo.ts";
import { hash32 } from "./facade-seed.ts";
import type { Building } from "./souq-data.ts";

export type FamilyId = "provencale" | "village" | "ancien" | "recent";
export type Region = "provence" | "ailleurs";

/** La Provence au sens large (de la Camargue aux Alpes-Maritimes) : seule région où la famille provençale existe. */
const PROVENCE = { south: 43, north: 44.4, west: 4.2, east: 7.7 };

export function regionOf(origin: LonLat): Region {
  const [lon, lat] = origin;
  return lat >= PROVENCE.south && lat <= PROVENCE.north && lon >= PROVENCE.west && lon <= PROVENCE.east ? "provence" : "ailleurs";
}

/** Une palette de détails : liserés, volets, portes et rambardes ; les murs gardent la teinte d'OpenStreetMap ou de la ville. */
export interface DetailPalette {
  trim: number;
  glass: number;
  shutters: readonly number[];
  doors: readonly number[];
  accent: number;
}

/** Trois palettes par famille : le quartier en choisit une, ses voisins la partagent. */
export const PALETTES: Record<FamilyId, readonly DetailPalette[]> = {
  provencale: [
    { trim: 0xf1e8d4, glass: 0x35434d, shutters: [0x6f8f9a, 0x8a9a6a, 0x5d7f8f], doors: [0x7a5a3a, 0x4f6f7a, 0x6a4a2a], accent: 0x3b3b3b },
    { trim: 0xe9dcc0, glass: 0x33414b, shutters: [0x7d9a8c, 0xa08b5c, 0x6b8a98], doors: [0x5a4630, 0x6d7f5a, 0x7a3b2a], accent: 0x2f3a34 },
    { trim: 0xf4ecdc, glass: 0x384650, shutters: [0x8aa0b0, 0x9b7a5a, 0x7b9a7a], doors: [0x4a5a6a, 0x7a5a3a, 0x5a3a2a], accent: 0x404040 },
  ],
  village: [
    { trim: 0xeee6d6, glass: 0x34424c, shutters: [0x8b4a3a, 0x3f5f7a, 0x5a6a4a], doors: [0x5a3a22, 0x3a4a5a, 0x7a2f26], accent: 0x444444 },
    { trim: 0xd9d0bd, glass: 0x303e48, shutters: [0x4a6a5a, 0x7a5a3a, 0x6a3f3f], doors: [0x3a2a1a, 0x5a6a3a, 0x6a4a2a], accent: 0x3a3a3a },
    { trim: 0xf2ede0, glass: 0x384650, shutters: [0x5a5f7a, 0x8a6a3a, 0x4a5f5a], doors: [0x6a2f2a, 0x4a3a2a, 0x2f4a5a], accent: 0x4a4a4a },
  ],
  ancien: [
    { trim: 0xc9b99a, glass: 0x2f3a42, shutters: [0x5a3a2a, 0x4a4a3a, 0x6a4a3a], doors: [0x3a2616, 0x4a3020, 0x2e2418], accent: 0x6a5a4a },
    { trim: 0xb8a888, glass: 0x2c363e, shutters: [0x4a2f22, 0x5a4a3a, 0x3f3a2f], doors: [0x2e1c10, 0x45301c, 0x3a2a1c], accent: 0x5a4a3a },
    { trim: 0xd2c2a2, glass: 0x303a42, shutters: [0x6a3a2a, 0x3a3a2a, 0x5a3f2a], doors: [0x3a2412, 0x2a1c12, 0x4a3422], accent: 0x6f5f4f },
  ],
  recent: [
    { trim: 0xdfe3e6, glass: 0x4a6a80, shutters: [0x8a9aa6, 0x6a7a86, 0x9aa6ae], doors: [0x3a4a56, 0x5a6a76, 0x2f3a44], accent: 0x55636e },
    { trim: 0xc9ced2, glass: 0x3f5f78, shutters: [0x7a8a96, 0x5a6a76, 0x8a96a0], doors: [0x2f3f4a, 0x4a5a66, 0x3a464f], accent: 0x4a5760 },
    { trim: 0xe8e2d6, glass: 0x466c82, shutters: [0x9a9a8a, 0x7a7a6a, 0x8a8a7a], doors: [0x6a3f2a, 0x3f4f5a, 0x4a3a2a], accent: 0x5f6a70 },
  ],
};

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
export const paletteIndexOf = (building: Building): number => (neighbourhoodOf(building) >>> 8) % PALETTES.recent.length;
