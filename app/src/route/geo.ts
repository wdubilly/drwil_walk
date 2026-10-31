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

/** Distance à vol d'oiseau en mètres (haversine). */
export function distanceM(a: LonLat, b: LonLat): number {
  const [dLat, dLon] = [(b[1] - a[1]) * RAD, (b[0] - a[0]) * RAD];
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}
