// La lumière de la ville suit l'heure réelle de l'utilisateur (APP-011) : fonctions pures, sans three.js, pour que
// les tests mesurent la courbe du jour sans rendu. Une heure illisible retombe sur midi : jamais une ville noire.
export const FALLBACK_HOUR = 12;
const DAY_START_H = 6;
const DAY_END_H = 18;
/** Hauteur minimale du soleil : la nuit, la lumière reste au-dessus de la ville, jamais sous le sol. */
const MIN_SUN_Y = 0.2;

const NIGHT_SKY = 0x101a2c;
const DAY_SKY = 0xbfd9ef;
const LOW_SUN = 0xffb07a;
const HIGH_SUN = 0xffffff;

export interface Daylight {
  /** Direction du soleil dans la scène (y vers le haut). */
  sun: { x: number; y: number; z: number };
  sunIntensity: number;
  sunColor: number;
  hemiIntensity: number;
  /** Le ciel des écrans sans passthrough (PC, tablette) : au casque, le ciel reste le réel (APP-001). */
  skyColor: number;
  fogColor: number;
  /** La nuit : le soleil est sous l'horizon, les lanternes des lampadaires s'allument. */
  night: boolean;
}

/** Heure décimale locale (0 à 24) ; une date illisible retombe sur l'heure de repli. */
export function hourOfDay(date: Date): number {
  if (!Number.isFinite(date.getTime())) return FALLBACK_HOUR;
  return date.getHours() + date.getMinutes() / 60;
}

/** Hauteur du soleil : 1 à midi, 0 au lever et au coucher, négative la nuit. */
export function sunElevation(hour: number): number {
  return Math.sin((Math.PI * (hour - DAY_START_H)) / (DAY_END_H - DAY_START_H));
}

/** Mélange deux couleurs hexadécimales, canal par canal (`t` de 0 à 1). */
function mix(from: number, to: number, t: number): number {
  const channel = (shift: number): number => {
    const a = (from >> shift) & 0xff;
    return Math.round(a + (((to >> shift) & 0xff) - a) * t);
  };
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

/** La lumière à une heure donnée : le soleil monte du lever au zénith, la nuit garde une lueur froide. */
export function daylightAt(hour: number): Daylight {
  const elevation = sunElevation(hour);
  const day = Math.min(1, Math.max(0, elevation));
  const azimuth = (Math.PI * (hour - DAY_START_H)) / (DAY_END_H - DAY_START_H);
  const sky = mix(NIGHT_SKY, DAY_SKY, day);
  return {
    sun: { x: Math.cos(azimuth), y: Math.max(MIN_SUN_Y, elevation), z: 0.3 },
    sunIntensity: 0.25 + 1.35 * day,
    sunColor: mix(LOW_SUN, HIGH_SUN, day),
    hemiIntensity: 0.35 + 0.85 * day,
    skyColor: sky,
    fogColor: sky,
    night: elevation < 0,
  };
}

/** La lumière de l'heure réelle ; l'horloge est injectée pour que les tests fixent l'heure. */
export function daylightNow(now: () => Date): Daylight {
  return daylightAt(hourOfDay(now()));
}
