// Les voies OpenStreetMap, posées à plat sur le sol et fusionnées en un seul maillage (peu d'appels de dessin).
import { BufferGeometry, Float32BufferAttribute } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { Road } from "./souq-data.ts";

/** Largeur en mètres selon la classe de la voie : les grands axes sont plus larges, les sentiers étroits. */
const WIDTH_M: Record<string, number> = {
  trunk: 10, primary: 9, secondary: 8, tertiary: 7, unclassified: 5, residential: 5, living_street: 4, service: 3,
  pedestrian: 4,
};
const TRACK_WIDTH_M = 2;
/** Au-dessus du sol (y = 0) pour ne pas se confondre avec lui ; assez peu pour rester sous les pieds. */
const LIFT_M = 0.05;

/** Une voie « _link » (bretelle) se dessine comme sa voie mère. */
export const widthOf = (highway: string): number => WIDTH_M[highway.replace(/_link$/, "")] ?? TRACK_WIDTH_M;

export function buildRoadsGeometry(roads: readonly Road[]): BufferGeometry {
  const positions: number[] = [];
  for (const road of roads) {
    const half = widthOf(road.highway) / 2;
    for (const [i, b] of road.points.slice(1).entries()) {
      const a = road.points[i] as Vec2;
      const length = Math.hypot(b.x - a.x, b.z - a.z);
      if (length === 0) continue;
      const nx = (-(b.z - a.z) / length) * half;
      const nz = ((b.x - a.x) / length) * half;
      const [p, q, r, s] = [
        [a.x + nx, a.z + nz],
        [a.x - nx, a.z - nz],
        [b.x - nx, b.z - nz],
        [b.x + nx, b.z + nz],
      ] as const;
      for (const [x, z] of [p, q, r, p, r, s]) positions.push(x, LIFT_M, z);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(positions.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return geometry;
}
