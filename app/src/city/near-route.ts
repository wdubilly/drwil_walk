// Les éléments les plus proches du parcours d'abord : pendant la marche, les autres ne se voient pas (budgets de la ville).
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";

/** Distance d'un point au sommet du parcours le plus proche, en mètres. */
export const distanceToRoute = (at: Vec2, route: Path): number => Math.min(...route.points.map((p) => Math.hypot(p.x - at.x, p.z - at.z)));

/** Les `max` éléments les plus proches du parcours, `anchor` donnant le point qui représente chacun. */
export function closest<T>(items: readonly T[], route: Path, max: number, anchor: (item: T) => Vec2): T[] {
  return items
    .map((item) => ({ item, d: distanceToRoute(anchor(item), route) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, max)
    .map((e) => e.item);
}
