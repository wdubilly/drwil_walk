// La graine déterministe des façades (APP-008) : l'identifiant OpenStreetMap du bâtiment, jamais le hasard du chargement.
import type { Building } from "./souq-data.ts";

/** Un mélange d'entiers 32 bits (finaliseur de MurmurHash3) : deux graines voisines donnent des suites très différentes. */
export function hash32(n: number): number {
  let h = n | 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Un générateur pseudo-aléatoire (mulberry32) dans [0, 1[, entièrement fixé par sa graine. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** La graine d'un bâtiment : son identifiant OSM ; sans identifiant (données anciennes), la position de son premier sommet. */
export function buildingSeed(building: Building): number {
  if (building.id !== undefined) return hash32(building.id % 0x100000000) ^ hash32(Math.floor(building.id / 0x100000000) + 0x9e3779b9);
  const p = building.footprint[0] as { x: number; z: number };
  return hash32(Math.round(p.x * 100)) ^ hash32(Math.round(p.z * 100) + 0x7f4a7c15);
}
