// Le rayon de la manette droite et la rue qu'il pointe à l'approche d'un carrefour (APP-002) : logique pure.
// Pointer ne suffit pas à choisir : la prise droite confirme, un appui = un choix.
import { GRIP_BUTTON } from "./left-controller.ts";
import { isDown, type ButtonLike } from "./buttons.ts";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Ray {
  origin: Vec3;
  dir: Vec3;
}

/** Écart de cap toléré entre le rayon et le bout d'une flèche : assez large pour viser en marchant, assez étroit pour distinguer deux rues. */
export const POINT_TOLERANCE_DEG = 10;
/** En deçà de cette part horizontale, la manette pointe le ciel ou le sol : aucune rue n'est visée. */
const MIN_HORIZONTAL = 0.2;

export interface RaySourceLike {
  handedness: string;
  gamepad?: { buttons?: readonly ButtonLike[] } | null | undefined;
  targetRaySpace?: XRSpace | undefined;
}

/** La prise de la manette droite est tenue. */
export function rightGrip(sources: Iterable<RaySourceLike>): boolean {
  for (const source of sources) {
    if (source.handedness === "right") return isDown(source.gamepad?.buttons?.[GRIP_BUTTON]);
  }
  return false;
}

/** Le rayon de la manette droite dans l'espace de référence ; sans manette droite posée, aucun. */
export function rightRay(frame: Pick<XRFrame, "getPose">, space: XRSpace, sources: Iterable<RaySourceLike>): Ray | undefined {
  for (const source of sources) {
    if (source.handedness !== "right" || !source.targetRaySpace) continue;
    const pose = frame.getPose(source.targetRaySpace, space);
    if (!pose) return undefined;
    const { position: p, orientation: q } = pose.transform;
    // L'axe -Z de la manette, tourné par son orientation.
    return { origin: { x: p.x, y: p.y, z: p.z }, dir: { x: -2 * (q.x * q.z + q.w * q.y), y: 2 * (q.w * q.x - q.y * q.z), z: -(1 - 2 * (q.x * q.x + q.y * q.y)) } };
  }
  return undefined;
}

/** La rue dont le bout de flèche est le plus près du rayon, en cap, à `toleranceDeg` près ; aucune si le rayon ne vise rien. */
export function pointedStreet(ray: Ray, tips: readonly { to: number; tip: Vec3 }[], toleranceDeg: number): number | undefined {
  const aim = Math.hypot(ray.dir.x, ray.dir.z);
  if (aim < MIN_HORIZONTAL) return undefined;
  let best: { to: number; angle: number } | undefined;
  for (const { to, tip } of tips) {
    const [dx, dz] = [tip.x - ray.origin.x, tip.z - ray.origin.z];
    const angle = (Math.atan2(Math.abs(dx * ray.dir.z - dz * ray.dir.x), dx * ray.dir.x + dz * ray.dir.z) * 180) / Math.PI;
    if (angle <= toleranceDeg && (best === undefined || angle < best.angle)) best = { to, angle };
  }
  return best?.to;
}
