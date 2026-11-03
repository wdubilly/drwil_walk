// La variation des matériaux locaux d'un bâtiment à l'autre (déterministe, comme les façades : APP-008) : le matériau suit la
// famille de la façade, puis la teinte, l'échelle, le décalage et l'usure du pied sont tirés de l'identifiant OSM ; deux voisins
// ne portent jamais le même matériau dans la même teinte quand la bibliothèque permet de les distinguer.
import type { Vec2 } from "../route/geo.ts";
import type { FacadePlan } from "./facade-plan.ts";
import { buildingSeed, hash32, seededRandom } from "./facade-seed.ts";
import type { LocalMaterial, MaterialLibrary } from "./material-library.ts";
import type { Building } from "./souq-data.ts";

export interface MaterialPick {
  material: LocalMaterial;
  tint: number;
  /** Le côté d'une répétition de la texture sur ce bâtiment, en mètres. */
  sizeM: number;
  /** Le décalage de la texture, en part d'une répétition. */
  offset: readonly [number, number];
  /** L'assombrissement du pied du mur (salissures, remontées), de 0 à 1. */
  wear: number;
}

/** Part des bâtiments d'une famille qui portent son premier matériau, le plus fréquent du quartier. */
export const MAIN_MATERIAL_SHARE = 0.6;
export const SCALE_RANGE = [0.85, 1.15] as const;
export const WEAR_RANGE = [0.08, 0.22] as const;
const NEIGHBOUR_CELL_M = 40;
/** Les matériaux ont leur propre suite : changer les matériaux ne change pas les façades. */
const MATERIAL_SALT = 0x4d415445;

const between = (range: readonly [number, number], r: number): number => range[0] + (range[1] - range[0]) * r;

/** Le tirage d'un bâtiment ; `shift` décale le matériau et la teinte (un voisin porte déjà ce tirage). */
export function pickMaterial(building: Building, plan: Pick<FacadePlan, "family">, library: MaterialLibrary, shift = 0): MaterialPick {
  const random = seededRandom(hash32(buildingSeed(building) ^ MATERIAL_SALT));
  const ids = library.families[plan.family];
  const first = random() < MAIN_MATERIAL_SHARE || ids.length === 1 ? 0 : 1 + Math.floor(random() * (ids.length - 1));
  const tintDraw = Math.floor(random() * 1024);
  const tintSteps = Math.floor(shift / ids.length);
  const material = library.materials.find((m) => m.id === ids[(first + shift) % ids.length]) as LocalMaterial;
  return {
    material,
    tint: material.tints[(tintDraw + tintSteps) % material.tints.length] as number,
    sizeM: material.sizeM * between(SCALE_RANGE, random()),
    offset: [random(), random()],
    wear: between(WEAR_RANGE, random()),
  };
}

const cellOf = (p: Vec2): [number, number] => [Math.floor(p.x / NEIGHBOUR_CELL_M), Math.floor(p.z / NEIGHBOUR_CELL_M)];
const signature = (pick: MaterialPick): string => `${pick.material.id}:${String(pick.tint)}`;

/** Le matériau de chaque bâtiment détaillé, dans l'ordre des plans (le plus proche du parcours d'abord). */
export function pickAll(plans: ReadonlyMap<Building, Pick<FacadePlan, "family">>, library: MaterialLibrary): Map<Building, MaterialPick> {
  const seen = new Map<string, Set<string>>();
  const picks = new Map<Building, MaterialPick>();
  for (const [b, plan] of plans) {
    const [cx, cz] = cellOf(b.footprint[0] as Vec2);
    const near = new Set<string>();
    for (const dx of [-1, 0, 1]) for (const dz of [-1, 0, 1]) for (const s of seen.get(`${String(cx + dx)},${String(cz + dz)}`) ?? []) near.add(s);
    const options = library.families[plan.family].length * Math.max(...library.materials.map((m) => m.tints.length));
    let pick = pickMaterial(b, plan, library);
    for (let shift = 1; near.has(signature(pick)) && shift < options; shift++) pick = pickMaterial(b, plan, library, shift);
    picks.set(b, pick);
    const key = `${String(cx)},${String(cz)}`;
    seen.set(key, (seen.get(key) ?? new Set()).add(signature(pick)));
  }
  return picks;
}
