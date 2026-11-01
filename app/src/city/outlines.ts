// Les contours des bâtiments proches du parcours (option de l'accueil, désactivée par défaut tant que la cadence n'est pas
// mesurée au casque, QUA-020) : les arêtes vives du maillage, en traits, sans second maillage de bâtiments.
import { BufferGeometry, EdgesGeometry } from "three";
import { pointAt, type Path } from "../route/path.ts";
import type { Vec2 } from "../route/geo.ts";
import { buildBuildingsGeometry } from "./buildings.ts";
import type { Building } from "./souq-data.ts";

/** Seuls les bâtiments à moins de cette distance du parcours sont cernés : le dessin en plus reste borné. */
export const OUTLINE_RADIUS_M = 120;
const SAMPLE_STEP_M = 40;
/** Angle au-delà duquel une arête est tracée : les murs et les toits, pas les facettes à plat. */
const EDGE_ANGLE_DEG = 30;

/** Des points régulièrement posés le long du parcours. */
function samples(route: Path): Vec2[] {
  return Array.from({ length: Math.ceil(route.lengthM / SAMPLE_STEP_M) + 1 }, (_, i) => pointAt(route, i * SAMPLE_STEP_M));
}

export function nearRoute(buildings: readonly Building[], route: Path): Building[] {
  const points = samples(route);
  return buildings.filter((b) => {
    const first = b.footprint[0] as Vec2;
    return points.some((p) => Math.hypot(p.x - first.x, p.z - first.z) <= OUTLINE_RADIUS_M);
  });
}

export function buildOutlinesGeometry(buildings: readonly Building[], route: Path): BufferGeometry {
  const near = buildBuildingsGeometry(nearRoute(buildings, route), [0]);
  // Sans bâtiment proche, le maillage est vide et n'a pas de position à parcourir.
  return near.hasAttribute("position") ? new EdgesGeometry(near, EDGE_ANGLE_DEG) : near;
}
