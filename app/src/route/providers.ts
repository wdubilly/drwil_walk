// Les services d'un trajet libre derrière deux interfaces (APP-002) : un routeur (point de départ, point d'arrivée, chemin à pied)
// et un géocodeur (adresse vers point, point vers adresse). Par défaut Valhalla et Photon, instances publiques d'OpenStreetMap, sans
// clé ni abonnement ; leurs adresses se règlent par des variables non secrètes pour viser une instance auto-hébergée. Google
// (Routes, Geocoding) reste possible, voir `create-providers.ts`. Les points et adresses ne partent
// qu'à ces services : rien n'est enregistré. Toute panne est dite avec sa raison (QUA-002).
import { distanceM, type LonLat } from "./geo.ts";
/** Un trajet libre fait 5 km au plus, pour limiter les chargements de la ville. */
export const MAX_ROUTE_M = 5000;

export interface Place {
  point: LonLat;
  /** L'adresse trouvée, montrée dans le champ pour que l'utilisateur voie ce qui a été retenu. */
  label: string;
}

export interface Router {
  /** Le tracé du chemin à pied, en longitude/latitude, du départ à l'arrivée. */
  walk(from: LonLat, to: LonLat): Promise<LonLat[]>;
}

export interface Geocoder {
  /** L'adresse tapée devient un point : le premier résultat est retenu. */
  find(text: string): Promise<Place>;
  /** Le point touché devient une adresse ; à défaut, ses coordonnées arrondies. */
  describe(point: LonLat): Promise<string>;
}

export interface Providers {
  router: Router;
  geocoder: Geocoder;
  /** Le réseau, aussi pour la ville (Overpass) : injecté, les tests n'appellent jamais un service réel. */
  fetch: typeof fetch;
}

/** Les coordonnées arrondies (environ 10 m), quand aucune adresse n'est connue. */
export const roundedCoordinates = (point: LonLat): string => `${point[1].toFixed(4)}, ${point[0].toFixed(4)}`;

const tooLong = (km: number, what: string): Error =>
  new Error(`Trajet trop long : ${what} ${km.toFixed(1).replace(".", ",")} km, ${String(MAX_ROUTE_M / 1000)} km au plus.`);

/** Refus avant tout appel : un trajet trop long ne coûte pas une requête. */
export function assertCrowFlies(from: LonLat, to: LonLat): void {
  const crow = distanceM(from, to);
  if (crow > MAX_ROUTE_M) throw tooLong(crow / 1000, "à vol d'oiseau");
}

/** Refus du chemin calculé, s'il dépasse la limite. */
export function assertRouteLength(meters: number): void {
  if (meters > MAX_ROUTE_M) throw tooLong(meters / 1000, "le chemin à pied fait");
}

export const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));
