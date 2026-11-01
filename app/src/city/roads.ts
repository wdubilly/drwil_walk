// Les voies OpenStreetMap, posées à plat sur le sol et fusionnées en un seul maillage (peu d'appels de dessin) : un ruban
// par tronçon, sa bordure plus claire sur les deux rives et, pour les voies assez larges, une ligne centrale (APP-003).
import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { Road } from "./souq-data.ts";

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

/** Les voies, puis les rubans de `marks` (trottoirs, passages piétons, chemin suivi) posés par-dessus. */
export function buildRoadsGeometry(roads: readonly Road[], base = 0x808080, marks: Ribbons = newRibbons()): BufferGeometry {
  const out: Ribbons = newRibbons();
  for (const road of roads) {
    const half = widthOf(road.highway) / 2;
    const body = roadColor(road.highway, base);
    const border = body.clone().lerp(new Color(1, 1, 1), BORDER_WHITENING);
    const line = body.clone().lerp(new Color(1, 1, 1), LINE_WHITENING);
    for (const [i, b] of road.points.slice(1).entries()) {
      const a = road.points[i] as Vec2;
      pushStrip(out, a, b, -half, half, LIFT_M, body);
      pushStrip(out, a, b, -half, -half + BORDER_WIDTH_M, BORDER_LIFT_M, border);
      pushStrip(out, a, b, half - BORDER_WIDTH_M, half, BORDER_LIFT_M, border);
      if (half * 2 >= CENTRE_LINE_MIN_WIDTH_M) pushStrip(out, a, b, -LINE_WIDTH_M / 2, LINE_WIDTH_M / 2, LINE_LIFT_M, line);
    }
  }
  return ribbonsGeometry({ positions: out.positions.concat(marks.positions), colors: out.colors.concat(marks.colors) });
}
