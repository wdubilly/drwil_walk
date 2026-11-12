// Les voies OpenStreetMap, posées à plat sur le sol et fusionnées en un seul maillage (peu d'appels de dessin) : un ruban
// par tronçon, sa bordure plus claire sur les deux rives et, pour les voies assez larges, une ligne centrale (APP-003).
import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { Road } from "./souq-data.ts";
import type { Surface } from "../../scripts/osm-tags.ts";
import { RECIPE, recipeFor } from "./region-palette.ts";
import { NO_GRAIN, SURFACE_ID } from "./road-surface.ts";

/** Largeur en mètres selon la classe de la voie : les grands axes sont plus larges, les sentiers étroits. */
const WIDTH_M: Record<string, number> = {
  trunk: 10, primary: 9, secondary: 8, tertiary: 7, unclassified: 5, residential: 5, living_street: 4, service: 3,
  pedestrian: 4,
};
const TRACK_WIDTH_M = 2;
/** Clarté de chaque classe par rapport à la teinte de l'itinéraire : au-delà de 1 elle s'éclaircit vers le blanc. */
const LIGHTNESS: Record<string, number> = {
  trunk: 1.3, primary: 1.2, secondary: 1.1, tertiary: 1, unclassified: 0.95, residential: 0.9, living_street: 0.85, service: 0.8,
  pedestrian: 1.15,
};
const TRACK_LIGHTNESS = 0.7;
/** Au-dessus du sol (y = 0) pour ne pas se confondre avec lui ; assez peu pour rester sous les pieds. */
const LIFT_M = 0.05;
const BORDER_LIFT_M = 0.07;
const LINE_LIFT_M = 0.09;
const BORDER_WIDTH_M = 0.3;
const LINE_WIDTH_M = 0.2;
/** Largeur à partir de laquelle une voie reçoit sa ligne centrale. */
export const CENTRE_LINE_MIN_WIDTH_M = 7;
const BORDER_WHITENING = 0.45;
const LINE_WHITENING = 0.85;

/** Une voie « _link » (bretelle) se dessine comme sa voie mère. */
const baseOf = (highway: string): string => highway.replace(/_link$/, "");
export const widthOf = (highway: string): number => WIDTH_M[baseOf(highway)] ?? TRACK_WIDTH_M;

/** La couleur du corps d'une voie : la teinte de l'itinéraire, assombrie ou éclaircie selon la classe. */
export function roadColor(highway: string, base: number): Color {
  const lightness = LIGHTNESS[baseOf(highway)] ?? TRACK_LIGHTNESS;
  const color = new Color(base);
  return lightness <= 1 ? color.multiplyScalar(lightness) : color.lerp(new Color(1, 1, 1), lightness - 1);
}

/** Des rubans à plat, position et couleur par sommet, que les voies et leurs marquages remplissent ensemble. */
export interface Ribbons {
  positions: number[];
  colors: number[];
}

export const newRibbons = (): Ribbons => ({ positions: [], colors: [] });

/** Une bande plate le long de a→b, entre deux distances à l'axe (négatif : à gauche du sens a→b), à une hauteur et d'une couleur. */
export function pushStrip(out: Ribbons, a: Vec2, b: Vec2, from: number, to: number, lift: number, color: Color): void {
  const length = Math.hypot(b.x - a.x, b.z - a.z);
  if (length === 0) return;
  const nx = -(b.z - a.z) / length;
  const nz = (b.x - a.x) / length;
  const [p, q, r, s] = [
    [a.x + nx * to, a.z + nz * to],
    [a.x + nx * from, a.z + nz * from],
    [b.x + nx * from, b.z + nz * from],
    [b.x + nx * to, b.z + nz * to],
  ] as const;
  for (const [x, z] of [p, q, r, p, r, s]) {
    out.positions.push(x, lift, z);
    out.colors.push(color.r, color.g, color.b);
  }
}

export function ribbonsGeometry(ribbons: Ribbons): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(ribbons.positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(ribbons.colors, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(ribbons.positions.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return geometry;
}

/** Les classes de voie réservées aux piétons : leur revêtement de repli est celui de « pieton », les autres celui de « chaussee ». */
const PEDESTRIAN = new Set(["pedestrian", "living_street", "footway", "path", "steps", "track"]);
const DEFAULT_SOLS: Record<string, Surface> = { chaussee: "asphalt", pieton: "pave" };

/** Un revêtement et son origine : relevé OSM (`surface`) ou ajouté par la règle de la région (APP-009, APP-013). */
export interface RoadSurface { kind: Surface; origin: "releve" | "regle" }

/** Le revêtement d'une voie : la balise relevée si elle existe, sinon la valeur de repli de la recette (quartier, région, « ailleurs »). */
export function surfaceFor(highway: string, tagged: Surface | undefined, sols: Record<string, Surface> = DEFAULT_SOLS): RoadSurface {
  if (tagged !== undefined) return { kind: tagged, origin: "releve" };
  const family = PEDESTRIAN.has(baseOf(highway)) ? "pieton" : "chaussee";
  return { kind: sols[family] ?? DEFAULT_SOLS[family] as Surface, origin: "regle" };
}

/** Le ton du revêtement posé sur la couleur de la voie : l'asphalte la garde, les pavés l'éclaircissent et la réchauffent, la terre la brunit. */
const SURFACE_TINT: Record<Surface, { color: number; amount: number } | undefined> = {
  asphalt: undefined,
  pave: { color: 0xb09c80, amount: 0.4 },
  terre: { color: 0x8a6e4b, amount: 0.55 },
};

/** Écart maximal de clarté dû à l'usure : assez faible pour que la voie reste lisible, assez net pour casser l'aplat. */
const WEAR_SPREAD = 0.08;

/** L'usure d'une voie, entre -1 (très foncée, huilée) et 1 (très claire, poussiéreuse), déterministe d'après son identifiant OSM (APP-013) ; 0 sans identifiant. */
export function wearOf(id: number | undefined): number {
  if (id === undefined) return 0;
  let h = Math.imul(id | 0, 0x9e3779b1) ^ 0x85ebca6b;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = (h ^ (h >>> 12)) >>> 0;
  return (h / 0xffffffff) * 2 - 1;
}

/** La couleur du corps d'une voie selon son revêtement. */
export function surfaceColor(highway: string, base: number, surface: RoadSurface, wear = 0): Color {
  const body = roadColor(highway, base);
  const tint = SURFACE_TINT[surface.kind];
  const toned = tint ? body.lerp(new Color(tint.color), tint.amount) : body;
  return wear >= 0 ? toned.lerp(new Color(1, 1, 1), wear * WEAR_SPREAD) : toned.multiplyScalar(1 + wear * WEAR_SPREAD);
}

/** Les voies, puis les rubans de `marks` (trottoirs, passages piétons, chemin suivi) posés par-dessus ; `surfaceKind` dit le grain de chaque sommet. */
export function buildRoadsGeometry(roads: readonly Road[], base = 0x808080, marks: Ribbons = newRibbons(), place?: { region: string; district?: string }): BufferGeometry {
  const out: Ribbons = newRibbons();
  const kinds: number[] = [];
  const sols = place ? recipeFor(RECIPE, place.region, place.district).sols?.value : undefined;
  const strip = (a: Vec2, b: Vec2, from: number, to: number, lift: number, color: Color, kind: number): void => {
    const before = out.positions.length;
    pushStrip(out, a, b, from, to, lift, color);
    for (let i = before; i < out.positions.length; i += 3) kinds.push(kind);
  };
  for (const road of roads) {
    const half = widthOf(road.highway) / 2;
    const surface = surfaceFor(road.highway, road.surface, sols);
    const body = surfaceColor(road.highway, base, surface, wearOf(road.id));
    const border = body.clone().lerp(new Color(1, 1, 1), BORDER_WHITENING);
    const line = body.clone().lerp(new Color(1, 1, 1), LINE_WHITENING);
    for (const [i, b] of road.points.slice(1).entries()) {
      const a = road.points[i] as Vec2;
      strip(a, b, -half, half, LIFT_M, body, SURFACE_ID[surface.kind]);
      strip(a, b, -half, -half + BORDER_WIDTH_M, BORDER_LIFT_M, border, NO_GRAIN);
      strip(a, b, half - BORDER_WIDTH_M, half, BORDER_LIFT_M, border, NO_GRAIN);
      if (half * 2 >= CENTRE_LINE_MIN_WIDTH_M) strip(a, b, -LINE_WIDTH_M / 2, LINE_WIDTH_M / 2, LINE_LIFT_M, line, NO_GRAIN);
    }
  }
  const geometry = ribbonsGeometry({ positions: out.positions.concat(marks.positions), colors: out.colors.concat(marks.colors) });
  const marksKinds = Array.from({ length: marks.positions.length / 3 }, () => NO_GRAIN);
  geometry.setAttribute("surfaceKind", new Float32BufferAttribute(kinds.concat(marksKinds), 1));
  return geometry;
}
