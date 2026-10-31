// Carte de l'accueil, calculs purs : projection « Web Mercator » des tuiles OpenStreetMap (tuiles de 256 px).
import type { LonLat } from "../route/geo.ts";

export const TILE_PX = 256;
export const MIN_ZOOM = 2;
export const MAX_ZOOM = 18;
/** Au-delà, la projection diverge : la carte s'arrête à cette latitude. */
const MAX_LAT = 85.0511;

export interface Pixel {
  x: number;
  y: number;
}

/** Pixel du monde entier (à ce zoom) où tombe le point. */
export function lonLatToWorld(point: LonLat, zoom: number): Pixel {
  const size = TILE_PX * 2 ** zoom;
  const lat = (Math.max(-MAX_LAT, Math.min(MAX_LAT, point[1])) * Math.PI) / 180;
  return {
    x: ((point[0] + 180) / 360) * size,
    y: ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * size,
  };
}

export function worldToLonLat(pixel: Pixel, zoom: number): LonLat {
  const size = TILE_PX * 2 ** zoom;
  const lon = (pixel.x / size) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * pixel.y) / size))) * 180) / Math.PI;
  return [lon, lat];
}

export const clampZoom = (zoom: number): number => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

/** Les tuiles qui couvrent une vue de `width` × `height` pixels centrée sur `center`, avec leur position dans la vue. */
export function visibleTiles(center: LonLat, zoom: number, width: number, height: number) {
  const c = lonLatToWorld(center, zoom);
  const [left, top] = [c.x - width / 2, c.y - height / 2];
  const count = 2 ** zoom;
  const tiles: { url: string; left: number; top: number }[] = [];
  for (let ty = Math.floor(top / TILE_PX); ty <= Math.floor((top + height) / TILE_PX); ty++) {
    // Hors du monde en hauteur : rien à montrer ; en largeur, le monde se répète.
    if (ty < 0 || ty >= count) continue;
    for (let tx = Math.floor(left / TILE_PX); tx <= Math.floor((left + width) / TILE_PX); tx++) {
      const wrapped = ((tx % count) + count) % count;
      tiles.push({
        url: `https://tile.openstreetmap.org/${String(zoom)}/${String(wrapped)}/${String(ty)}.png`,
        left: tx * TILE_PX - left,
        top: ty * TILE_PX - top,
      });
    }
  }
  return tiles;
}
