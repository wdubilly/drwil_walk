// Marche le long de la rue : logique pure du déplacement à la vitesse réglée.
// L'utilisateur reste sur place (il est sur le tapis) : c'est la rue qui recule vers lui.
import { clampSpeedKmh, kmhToMs } from "./speed.ts";

/** Longueur de la rue simple avant qu'elle reprenne à son début (pas encore d'itinéraire GPS). */
export const STREET_LENGTH_M = 240;

/**
 * Distance après `dtS` secondes à la vitesse réglée.
 * Un pas de temps négatif ou non fini (horloge qui recule, première image) n'avance pas.
 */
export function advanceDistanceM(distanceM: number, speedKmh: number, dtS: number): number {
  if (!Number.isFinite(dtS) || dtS <= 0) return distanceM;
  return distanceM + kmhToMs(clampSpeedKmh(speedKmh)) * dtS;
}

/** Décalage de la rue pour une distance parcourue : la rue boucle sur elle-même. */
export function streetOffsetM(distanceM: number): number {
  return distanceM % STREET_LENGTH_M;
}

/** Affichage français : « 12,3 m ». */
export function formatDistanceM(distanceM: number): string {
  return `${distanceM.toFixed(1).replace(".", ",")} m`;
}

/** Affichage français du temps de marche : « 1 min 05 s ». */
export function formatDurationS(timeS: number): string {
  const total = Math.floor(timeS);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${String(minutes)} min ${seconds} s`;
}
