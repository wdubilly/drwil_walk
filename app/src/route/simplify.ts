// Réduit un tracé à un nombre de points plafonné, en gardant sa forme : la minicarte du casque ne dessine jamais plus (APP-002).
import type { Vec2 } from "./geo.ts";

/** Écart d'un point à la droite qui passe par a et b (à a seul quand ils sont confondus, comme aux deux bouts d'une boucle). */
function offset(a: Vec2, b: Vec2, p: Vec2): number {
  const length = Math.hypot(b.x - a.x, b.z - a.z);
  if (length === 0) return Math.hypot(p.x - a.x, p.z - a.z);
  return Math.abs((b.x - a.x) * (a.z - p.z) - (a.x - p.x) * (b.z - a.z)) / length;
}

/**
 * Garde au plus `maxPoints` points, bouts compris : on ajoute chaque fois le point le plus éloigné du tracé déjà gardé
 * (Douglas-Peucker borné par un nombre de points plutôt que par une tolérance).
 */
export function simplifyPath(points: readonly Vec2[], maxPoints: number): Vec2[] {
  if (points.length <= maxPoints) return [...points];
  const kept = [0, points.length - 1];
  while (kept.length < maxPoints) {
    let best = { index: -1, at: 0, gap: 0 };
    for (let k = 1; k < kept.length; k++) {
      const a = points[kept[k - 1] as number] as Vec2;
      const b = points[kept[k] as number] as Vec2;
      for (let i = (kept[k - 1] as number) + 1; i < (kept[k] as number); i++) {
        const gap = offset(a, b, points[i] as Vec2);
        if (gap > best.gap) best = { index: i, at: k, gap };
      }
    }
    // Tous les points restants sont sur le tracé gardé : rien à ajouter.
    if (best.index < 0) break;
    kept.splice(best.at, 0, best.index);
  }
  return kept.map((i) => points[i] as Vec2);
}
