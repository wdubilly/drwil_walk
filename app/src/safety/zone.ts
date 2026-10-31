// Zone tapis (APP-001, point 2) : un volume autour du tapis que la ville ne recouvre jamais, pour que le tapis, la rampe
// et la console réels restent visibles. Logique pure : la boîte, sa validation, son enregistrement et ses six plans.
// La zone ne peut que réduire ce qui est rendu ; une zone illisible est remplacée par la boîte par défaut, jamais par rien.

/** Une boîte posée au sol : centre (x, z) en mètres dans l'espace de référence, cap, dimensions. */
export interface Zone {
  x: number;
  z: number;
  /** Rotation autour de Y (rad), comme le cap du regard au moment de la pose. */
  yawRad: number;
  /** Largeur (axe local X), profondeur (axe local Z) et hauteur au-dessus du sol, en mètres. */
  width: number;
  depth: number;
  height: number;
}

/** Un tapis de course fait environ 0,9 m sur 1,8 m : la boîte par défaut garde une marge tout autour. */
export const DEFAULT_ZONE: Zone = { x: 0, z: 0, yawRad: 0, width: 1.2, depth: 2.4, height: 1.2 };

export const MIN_SIZE_M = 0.4;
export const MAX_WIDTH_M = 3;
export const MAX_DEPTH_M = 4;
/** Un peu sous le sol : le sol de la ville est à 0, la zone doit aussi le couvrir. */
export const ZONE_FLOOR_M = -0.1;
const MIN_HEIGHT_M = 0.5;
const MAX_HEIGHT_M = 2.5;
export const MAX_OFFSET_M = 5;

export const ZONE_STORAGE_KEY = "drwil_walk.zone-tapis";

const within = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

/** La zone lue, ou la boîte par défaut si elle est incomplète, hors bornes ou de mauvais type. */
export function parseZone(raw: unknown): Zone {
  if (typeof raw !== "object" || raw === null) return DEFAULT_ZONE;
  const { x, z, yawRad, width, depth, height } = raw as Record<string, unknown>;
  const valid =
    within(x, -MAX_OFFSET_M, MAX_OFFSET_M) &&
    within(z, -MAX_OFFSET_M, MAX_OFFSET_M) &&
    within(yawRad, -2 * Math.PI, 2 * Math.PI) &&
    within(width, MIN_SIZE_M, MAX_WIDTH_M) &&
    within(depth, MIN_SIZE_M, MAX_DEPTH_M) &&
    within(height, MIN_HEIGHT_M, MAX_HEIGHT_M);
  return valid ? { x, z, yawRad, width, depth, height } : DEFAULT_ZONE;
}

/** Ce que l'on utilise d'un `localStorage`. */
export type ZoneStorage = Pick<Storage, "getItem" | "setItem">;

/** La zone enregistrée ; sans stockage, sans valeur ou avec une valeur illisible : la boîte par défaut. */
export function loadZone(storage: ZoneStorage | undefined): Zone {
  try {
    const text = storage?.getItem(ZONE_STORAGE_KEY);
    return text ? parseZone(JSON.parse(text)) : DEFAULT_ZONE;
  } catch {
    return DEFAULT_ZONE;
  }
}

/** Enregistre la zone ; faux si le navigateur refuse (stockage plein ou interdit), à dire à l'utilisateur. */
export function saveZone(storage: ZoneStorage | undefined, zone: Zone): boolean {
  try {
    if (!storage) return false;
    storage.setItem(ZONE_STORAGE_KEY, JSON.stringify(zone));
    return true;
  } catch {
    return false;
  }
}

/** Un plan : un point p est dessus à la distance normal·p + constant. */
export interface PlaneSpec {
  normal: { x: number; y: number; z: number };
  constant: number;
}

/**
 * Les six plans de la boîte, normales vers l'extérieur : un point est dans la zone si sa distance est négative pour
 * les six. C'est exactement la découpe `clipIntersection` de three.js : un fragment est écarté s'il est « coupé » par
 * tous les plans à la fois, donc rien n'est rendu dans la boîte et tout le reste l'est.
 */
export function zonePlanes(zone: Zone): PlaneSpec[] {
  const cos = Math.cos(zone.yawRad);
  const sin = Math.sin(zone.yawRad);
  const right = { x: cos, y: 0, z: -sin };
  const back = { x: sin, y: 0, z: cos };
  const flip = (n: PlaneSpec["normal"]): PlaneSpec["normal"] => ({ x: -n.x, y: 0, z: -n.z });
  const side = (n: PlaneSpec["normal"], half: number): PlaneSpec => ({
    normal: n,
    constant: -(n.x * zone.x + n.z * zone.z) - half,
  });
  return [
    side(right, zone.width / 2),
    side(flip(right), zone.width / 2),
    side(back, zone.depth / 2),
    side(flip(back), zone.depth / 2),
    { normal: { x: 0, y: 1, z: 0 }, constant: -zone.height },
    { normal: { x: 0, y: -1, z: 0 }, constant: ZONE_FLOOR_M },
  ];
}
