// Le brouillard (APP-011, APP-001). Décision du demandeur du 2026-11-03 : au casque, son voile ne dépasse jamais
// 0,15 d'opacité, il est désactivable entièrement, il ne masque jamais un obstacle et ne gêne jamais la lecture du
// cheminement. Fonctions pures : le plafond se mesure sans rendu.

/** Plafond du voile au casque : le réel et la ville gardent au moins 85 % de leurs couleurs. */
export const HEADSET_FOG_MAX = 0.15;
/** Sur un écran sans passthrough (PC, tablette), il n'y a pas de réel à voir : le brouillard peut aller plus loin. */
export const SCREEN_FOG_MAX = 0.9;
/** Rien n'est voilé en deçà : la zone tapis, le panneau du casque et tout obstacle à portée de pas gardent leurs couleurs. */
export const FOG_START_M = 8;
/** La portée de vue de la caméra : au-delà, rien n'est rendu, donc le plafond vaut pour toute la scène. */
export const VIEW_RANGE_M = 1000;

export type FogTarget = "casque" | "ecran";

export interface FogSettings {
  color: number;
  near: number;
  far: number;
}

export const FOG_MAX: Record<FogTarget, number> = { casque: HEADSET_FOG_MAX, ecran: SCREEN_FOG_MAX };

/** La distance de brouillard total qui plafonne le voile à `cap` sur toute la portée visible. */
export function fogFar(nearM: number, rangeM: number, cap: number): number {
  return nearM + (rangeM - nearM) / cap;
}

/** Le voile appliqué à un objet (0 : couleurs intactes, 1 : couleur du brouillard), comme le brouillard linéaire de three.js. */
export function fogFactorAt(distanceM: number, fog: FogSettings): number {
  return Math.min(1, Math.max(0, (distanceM - fog.near) / (fog.far - fog.near)));
}

/** Le brouillard d'une cible : au casque, son voile ne peut pas dépasser le plafond, quelle que soit la distance. */
export function fogFor(target: FogTarget, color: number): FogSettings {
  return { color, near: FOG_START_M, far: fogFar(FOG_START_M, VIEW_RANGE_M, FOG_MAX[target]) };
}

/** Le voile le plus fort que la cible puisse appliquer, en pour cent : lu sur la page par l'e2e. */
export function fogSummary(fog: FogSettings | null): string {
  if (!fog) return "brouillard éteint";
  return `brouillard ${String(Math.round(fogFactorAt(VIEW_RANGE_M, fog) * 100))} %`;
}
