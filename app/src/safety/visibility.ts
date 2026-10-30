// Sécurité-visibilité (APP-001) : logique pure qui décide de l'opacité de la ville.
// Le passthrough du Quest 3 n'est visible que là où rien n'est rendu : moins la ville est opaque,
// plus le tapis, la rampe et la console réels se voient.

/** Inclinaison sous l'horizontale à partir de laquelle la ville commence à s'effacer. */
export const HEAD_DOWN_START_DEG = 25;
/** Inclinaison à laquelle la ville a entièrement disparu : on voit ses pieds et le tapis. */
export const HEAD_DOWN_END_DEG = 40;

export const MIN_GLOBAL_OPACITY_PCT = 30;
export const MAX_GLOBAL_OPACITY_PCT = 100;
export const DEFAULT_GLOBAL_OPACITY_PCT = 100;

/** Orientation de la tête, telle que WebXR la donne (`XRRigidTransform.orientation`). */
export interface Orientation {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Inclinaison de la tête sous l'horizontale, en degrés (positive tête baissée).
 * Le regard est l'axe -Z du repère WebXR : sa composante verticale après rotation vaut
 * 2(wx - yz), indépendamment du cap (lacet) de l'utilisateur.
 */
export function headPitchDownDeg(q: Orientation): number {
  const up = Math.min(1, Math.max(-1, 2 * (q.w * q.x - q.y * q.z)));
  return (-Math.asin(up) * 180) / Math.PI;
}

/** Facteur de visibilité de la ville selon l'inclinaison : 1 tête droite, 0 tête baissée. */
export function headDownFactor(pitchDownDeg: number): number {
  // Une pose illisible ne doit jamais rendre la ville opaque par défaut : on montre le réel.
  if (!Number.isFinite(pitchDownDeg)) return 0;
  if (pitchDownDeg <= HEAD_DOWN_START_DEG) return 1;
  if (pitchDownDeg >= HEAD_DOWN_END_DEG) return 0;
  return (HEAD_DOWN_END_DEG - pitchDownDeg) / (HEAD_DOWN_END_DEG - HEAD_DOWN_START_DEG);
}

/** Opacité globale réglée par l'utilisateur, bornée entre 30 et 100 %. */
export function clampGlobalOpacityPct(pct: number): number {
  if (!Number.isFinite(pct)) return DEFAULT_GLOBAL_OPACITY_PCT;
  return Math.round(Math.min(MAX_GLOBAL_OPACITY_PCT, Math.max(MIN_GLOBAL_OPACITY_PCT, pct)));
}

/** Opacité finale de la ville (0 à 1) : réglage global, atténué tête baissée. */
export function cityOpacity(pitchDownDeg: number, globalPct: number): number {
  return (clampGlobalOpacityPct(globalPct) / 100) * headDownFactor(pitchDownDeg);
}

/** Affichage français : « 75 % ». */
export function formatOpacity(opacity: number): string {
  return `${String(Math.round(opacity * 100))} %`;
}
