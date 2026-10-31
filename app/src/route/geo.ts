// Conversion GPS → mètres locaux. Repère : x vers l'est, z vers le sud (comme l'axe Z de three.js,
// qui pointe vers l'utilisateur quand il regarde le nord). Projection plane, juste à l'échelle d'un quartier.
const EARTH_RADIUS_M = 6_371_000;
const RAD = Math.PI / 180;

/** [longitude, latitude] en degrés, l'ordre de GeoJSON. */
export type LonLat = readonly [number, number];
export interface Vec2 {
  x: number;
  z: number;
}

export function toLocalMetres(origin: LonLat, point: LonLat): Vec2 {
  return {
    x: (point[0] - origin[0]) * RAD * EARTH_RADIUS_M * Math.cos(origin[1] * RAD),
    z: -(point[1] - origin[1]) * RAD * EARTH_RADIUS_M,
  };
}
