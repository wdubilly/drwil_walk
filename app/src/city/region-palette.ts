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
