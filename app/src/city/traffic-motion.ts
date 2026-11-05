// Le mouvement des figurants (APP-014) : position et cap le long de leur trajet à l'instant donné, et la taille qui les
// retire de l'image au bout du trajet (ils rebouclent sans surgir) et près de l'utilisateur (aucun ne passe devant lui ni
// n'entre dans la zone tapis). Logique pure : la scène (traffic.ts) n'en fait que des matrices.
import type { Vec2 } from "../route/geo.ts";
import { headingAt, pointAt } from "../route/path.ts";
import type { Agent } from "./traffic-rule.ts";

/** À moins de KEEP_OUT_M de la position de marche, un figurant est retiré de l'image. */
export const KEEP_OUT_M = 10;
/** Il grandit ou rapetisse sur FADE_M : au bout de son trajet, et de KEEP_OUT_M + FADE_M à KEEP_OUT_M de l'utilisateur. */
export const FADE_M = 4;

export interface Pose {
  x: number;
  z: number;
  /** Rotation autour de la verticale qui tourne le nez du modèle (+Z) dans le sens de la marche. */
  yaw: number;
  /** Facteur de taille, de 0 (retiré de l'image) à 1. */
  grow: number;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** La pose d'un figurant `timeS` secondes après le chargement, l'utilisateur étant en `user` (repère de la ville). */
export function poseAt(agent: Agent, timeS: number, user: Vec2): Pose {
  const { path } = agent;
  const travelled = (((agent.startM + agent.speedMs * timeS) % path.lengthM) + path.lengthM) % path.lengthM;
  const along = agent.reverse ? path.lengthM - travelled : travelled;
  const at = pointAt(path, along);
  const heading = headingAt(path, along);
  const sign = agent.reverse ? -1 : 1;
  const nearUser = Math.hypot(at.x - user.x, at.z - user.z) - KEEP_OUT_M;
  return {
    x: at.x,
    z: at.z,
    yaw: Math.atan2(sign * heading.x, sign * heading.z),
    grow: clamp01(Math.min(travelled, path.lengthM - travelled, nearUser) / FADE_M),
  };
}
