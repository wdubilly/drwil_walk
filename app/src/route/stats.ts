// Chiffres du tableau de bord du casque (APP-002) : calories estimées, poids gardé en local, cap de la boussole, heure.
// Logique pure : le rendu (xr/hud-panel.ts) ne fait que les afficher.
import type { Vec2 } from "./geo.ts";
import { clampSpeedKmh } from "./speed.ts";

/** Poids moyen utilisé tant que l'utilisateur n'en a pas saisi un. */
export const DEFAULT_WEIGHT_KG = 70;
export const MIN_WEIGHT_KG = 30;
export const MAX_WEIGHT_KG = 250;

/** Le poids est la seule donnée personnelle du projet : gardée dans le navigateur du Quest, jamais envoyée (SEC-007). */
export const WEIGHT_STORAGE_KEY = "drwil_walk.poids";

/** Ce que l'on utilise d'un `localStorage` pour garder, lire et effacer le poids. */
export type WeightStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Le poids lu (en kg) s'il est un nombre entre 30 et 250 ; sinon rien : la valeur moyenne s'applique. */
export function parseWeightKg(raw: unknown): number | undefined {
  const kg = typeof raw === "string" ? Number(raw.replace(",", ".")) : raw;
  return typeof kg === "number" && Number.isFinite(kg) && kg >= MIN_WEIGHT_KG && kg <= MAX_WEIGHT_KG ? kg : undefined;
}

/** Le poids gardé, ou rien (rien de gardé, valeur illisible, stockage interdit). */
export function loadWeightKg(storage: WeightStorage | undefined): number | undefined {
  try {
    return parseWeightKg(storage?.getItem(WEIGHT_STORAGE_KEY) ?? undefined);
  } catch {
    return undefined;
  }
}

/** Garde le poids ; faux si le navigateur refuse, à dire à l'utilisateur. */
export function saveWeightKg(storage: WeightStorage | undefined, kg: number): boolean {
  try {
    if (!storage) return false;
    storage.setItem(WEIGHT_STORAGE_KEY, String(kg));
    return true;
  } catch {
    return false;
  }
}

/** Efface le poids gardé ; faux si le navigateur refuse. */
export function clearWeightKg(storage: WeightStorage | undefined): boolean {
  try {
    if (!storage) return false;
    storage.removeItem(WEIGHT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calories après `dtS` secondes de marche à plat à la vitesse réglée (formule de marche de l'ACSM :
 * VO2 = 0,1 × vitesse en m/min + 3,5 ml/kg/min, soit VO2 × poids / 200 kcal par minute). C'est une estimation.
 * Un pas de temps négatif ou non fini n'ajoute rien.
 */
export function advanceKcal(kcal: number, speedKmh: number, dtS: number, weightKg: number): number {
  if (!Number.isFinite(dtS) || dtS <= 0) return kcal;
  const metresPerMin = (clampSpeedKmh(speedKmh) * 1000) / 60;
  return kcal + (((0.1 * metresPerMin + 3.5) * weightKg) / 200) * (dtS / 60);
}

/** Affichage français d'une estimation : « environ 12 kcal ». */
export const formatKcal = (kcal: number): string => `environ ${String(Math.round(kcal))} kcal`;

const POINTS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] as const;

/**
 * Cap de la boussole pour une direction de marche en mètres locaux (x est, z sud) : « NE 45° », au multiple de 5° le
 * plus proche pour que le texte ne change pas à chaque image.
 */
export function compassText(heading: Vec2): string {
  const deg = ((Math.atan2(heading.x, -heading.z) * 180) / Math.PI + 360) % 360;
  const rounded = (Math.round(deg / 5) * 5) % 360;
  return `${POINTS[Math.round(rounded / 45) % 8] as string} ${String(rounded)}°`;
}

/** L'heure locale : « 09:05 ». */
export function formatClock(now: Date): string {
  const two = (n: number): string => String(n).padStart(2, "0");
  return `${two(now.getHours())}:${two(now.getMinutes())}`;
}
