// Les services d'un trajet libre derrière deux interfaces (APP-002) : un routeur (point de départ, point d'arrivée, chemin à pied)
// et un géocodeur (adresse vers point, point vers adresse). Par défaut Valhalla et Photon, instances publiques d'OpenStreetMap, sans
// clé ni abonnement ; leurs adresses se règlent par des variables non secrètes pour viser une instance auto-hébergée. Google
// (Routes, Geocoding) reste possible, voir `create-providers.ts`. Les points et adresses ne partent
// qu'à ces services : rien n'est enregistré. Toute panne est dite avec sa raison (QUA-002).
import { type LonLat } from "./geo.ts";

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

// Un trajet libre n'a aucune limite de longueur : ces deux gardes restent appelées par les routeurs mais ne refusent plus rien.
export const assertCrowFlies: (from: LonLat, to: LonLat) => void = () => undefined;

export const assertRouteLength: (meters: number) => void = () => undefined;

export const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));
