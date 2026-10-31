// Vitesse de marche réglée à la manette (MISSION.md, « Avancement ») : logique pure, sans rendu.
// La vitesse est gardée en km/h, l'unité affichée et réglée par l'utilisateur ; le déplacement
// dans la scène se calcule en m/s.

export const MIN_SPEED_KMH = 1;
export const MAX_SPEED_KMH = 8;
export const SPEED_STEP_KMH = 0.1;
export const DEFAULT_SPEED_KMH = 4;

/**
 * Ramène une vitesse quelconque dans la plage autorisée, au pas de 0,1 km/h.
 * Une valeur non finie (NaN, infini) donne la vitesse par défaut plutôt qu'une borne :
 * elle trahit une saisie invalide, pas une demande d'aller au plus vite ou au plus lent.
 */
export function clampSpeedKmh(kmh: number): number {
  if (!Number.isFinite(kmh)) return DEFAULT_SPEED_KMH;
  const bounded = Math.min(MAX_SPEED_KMH, Math.max(MIN_SPEED_KMH, kmh));
  // Arrondi en dixièmes entiers : 0,1 n'est pas représentable exactement en binaire.
  return Math.round(bounded * 10) / 10;
}

/** Vitesse après `steps` crans de joystick (+1 vers le haut, -1 vers le bas), bornée. */
export function stepSpeedKmh(currentKmh: number, steps: number): number {
  return clampSpeedKmh(clampSpeedKmh(currentKmh) + steps * SPEED_STEP_KMH);
}

/** Conversion km/h → m/s, l'unité du déplacement dans la scène three.js. */
export function kmhToMs(kmh: number): number {
  return kmh / 3.6;
}

/** Affichage français : « 4,0 km/h ». */
export function formatSpeedKmh(kmh: number): string {
  return `${clampSpeedKmh(kmh).toFixed(1).replace(".", ",")} km/h`;
}

const frenchNumber = (n: number): string => String(n).replace(".", ",");

/** La plage, lisible avant toute saisie. */
export const SPEED_RANGE_TEXT = `De ${frenchNumber(MIN_SPEED_KMH)} à ${frenchNumber(MAX_SPEED_KMH)} km/h, par sécurité sur le tapis.`;

/** Ce que l'écran dit quand une saisie est ramenée dans la plage (QUA-002) ; vide si elle est valide. */
export function speedLimitMessage(raw: number): string {
  if (!Number.isFinite(raw)) return `Vitesse illisible : ${formatSpeedKmh(DEFAULT_SPEED_KMH)} retenus.`;
  if (raw > MAX_SPEED_KMH) {
    return `${frenchNumber(raw)} km/h dépasse la limite : ${formatSpeedKmh(MAX_SPEED_KMH)} retenus, par sécurité sur le tapis.`;
  }
  if (raw < MIN_SPEED_KMH) {
    return `${frenchNumber(raw)} km/h est sous la limite : ${formatSpeedKmh(MIN_SPEED_KMH)} retenus, plage de ${frenchNumber(MIN_SPEED_KMH)} à ${frenchNumber(MAX_SPEED_KMH)} km/h.`;
  }
  return "";
}

/** Ce que le panneau dit quand la vitesse est à une borne, où le joystick ne peut plus aller plus loin. */
export function speedBoundMessage(kmh: number): string {
  if (kmh >= MAX_SPEED_KMH) return `Vitesse au maximum : ${frenchNumber(MAX_SPEED_KMH)} km/h, limite de sécurité sur le tapis.`;
  if (kmh <= MIN_SPEED_KMH) return `Vitesse au minimum : ${frenchNumber(MIN_SPEED_KMH)} km/h.`;
  return "";
}
