// Le guide de marche (APP-002) : suit le tracé d'origine de l'itinéraire tant qu'aucune autre rue n'est choisie, propose les
// rues à l'approche d'un carrefour, puis suit le réseau de voies de l'extrait une fois le tracé quitté. La distance parcourue
// reste celle de la marche : un choix ne la touche pas.
import type { Vec2 } from "../route/geo.ts";
import {
  APPROACH_M,
  LOOKAHEAD_M,
  advanceOnNetwork,
  directionOf,
  nextCrossing,
  nodeAt,
  positionOf,
  straightest,
  streetsAt,
  turnToward,
  unit,
  type NetPosition,
  type Network,
  type Street,
} from "../route/network.ts";
import { HEADING_WINDOW_M, headingAt, pointAt, type Path } from "../route/path.ts";

/** Où l'on pose la flèche d'une rue, depuis le carrefour. */
export const ARROW_AT_M = 8;

export interface Candidate {
  to: number;
  dir: Vec2;
  /** Le bout de la flèche, en mètres locaux de la ville. */
  tip: Vec2;
  /** La rue que prendrait la marche sans choix. */
  isDefault: boolean;
}

export interface GuideView {
  at: Vec2;
  heading: Vec2;
  /** Les rues proposées au carrefour qui approche ; vide hors approche. */
  candidates: Candidate[];
  /** Distance au carrefour qui approche. */
  crossingM: number | undefined;
  /** La rue choisie pour ce carrefour. */
  chosen: number | undefined;
  /** Vrai une fois le tracé d'origine quitté. */
  offRoute: boolean;
}

export interface Guide {
  advance(distanceM: number): GuideView;
  /** Choisit une rue du carrefour qui approche ; sans effet si elle n'en fait pas partie. */
  choose(to: number): void;
}

interface RouteCrossing {
  atM: number;
  node: number;
  streets: Street[];
  /** La rue que le tracé prend ; absente si elle n'est pas proposée (demi-tour du tracé, voie écartée). */
  routeTo: number | undefined;
}

/** Les carrefours que le tracé d'origine traverse : un trajet libre (aller simple) n'en a aucun. */
function routeCrossings(route: Path, net: Network): RouteCrossing[] {
  if (!route.loop) return [];
  const crossings: RouteCrossing[] = [];
  route.points.forEach((p, i) => {
    const node = nodeAt(net, p);
    const before = route.points[i - 1];
    if (node === undefined || before === undefined) return;
    const incoming = unit(before, p);
    const atM = route.cumulativeM[i] as number;
    const streets = streetsAt(net, node, nodeAt(net, before)).filter((s) => s.dir.x * incoming.x + s.dir.z * incoming.z > -0.95);
    const routeDir = unit(pointAt(route, atM), pointAt(route, atM + LOOKAHEAD_M));
    const best = straightest(streets, routeDir);
    const follows = best !== undefined && best.dir.x * routeDir.x + best.dir.z * routeDir.z >= 0.5;
    if (streets.length >= 2) crossings.push({ atM, node, streets, routeTo: follows ? best.to : undefined });
  });
  return crossings;
}

const candidatesOf = (net: Network, node: number, streets: readonly Street[], defaultTo: number | undefined): Candidate[] => {
  const at = net.points[node] as Vec2;
  return streets.map((s) => ({ to: s.to, dir: s.dir, tip: { x: at.x + s.dir.x * ARROW_AT_M, z: at.z + s.dir.z * ARROW_AT_M }, isDefault: s.to === defaultTo }));
};

export function createGuide(route: Path, net: Network): Guide {
  const crossings = routeCrossings(route, net);
  const ahead = (c: RouteCrossing, from: number): number => (((c.atM - from) % route.lengthM) + route.lengthM) % route.lengthM;
  let last = 0;
  let heading = headingAt(route, 0);
  let netPos: NetPosition | undefined;
  /** Le carrefour qui approche, tel que la dernière image l'a vu. */
  let current: { key: number; streets: readonly Street[] } | undefined;
  let pending: { key: number; to: number } | undefined;

  const view = (at: Vec2, found: Candidate[], crossingM: number | undefined): GuideView => ({
    at,
    heading,
    candidates: found,
    crossingM,
    chosen: pending?.to,
    offRoute: netPos !== undefined,
  });

  const onNetwork = (step: number): GuideView => {
    const pos = advanceOnNetwork(net, netPos as NetPosition, step, pending && { node: pending.key, to: pending.to });
    netPos = pos;
    heading = turnToward(heading, directionOf(net, pos), step / HEADING_WINDOW_M);
    const crossing = nextCrossing(net, pos);
    if (pending?.key !== crossing?.node) pending = undefined;
    if (!crossing) {
      current = undefined;
      return view(positionOf(net, pos), [], undefined);
    }
    const streets = streetsAt(net, crossing.node, crossing.from);
    current = { key: crossing.node, streets };
    const defaultTo = straightest(streets, crossing.incoming)?.to as number;
    return view(positionOf(net, pos), candidatesOf(net, crossing.node, streets, defaultTo), crossing.distanceM);
  };

  const onRoute = (distanceM: number, step: number): GuideView => {
    const passed = crossings
      .map((c, i) => ({ c, i, a: ahead(c, last - step) }))
      .filter((x) => step > 0 && x.a < step)
      .sort((x, y) => x.a - y.a)[0];
    if (passed) {
      const takes = pending?.key === passed.i && pending.to !== passed.c.routeTo ? pending.to : undefined;
      pending = undefined;
      if (takes !== undefined) {
        netPos = { from: passed.c.node, to: takes, t: step - passed.a };
        return onNetwork(0);
      }
    }
    heading = headingAt(route, distanceM);
    const next = crossings
      .map((c, i) => ({ c, i, a: ahead(c, distanceM) }))
      .filter((x) => x.a <= APPROACH_M)
      .sort((x, y) => x.a - y.a)[0];
    current = next && { key: next.i, streets: next.c.streets };
    const found = next ? candidatesOf(net, next.c.node, next.c.streets, next.c.routeTo) : [];
    return view(pointAt(route, distanceM), found, next?.a);
  };

  return {
    advance(distanceM) {
      const step = Number.isFinite(distanceM) ? Math.max(0, distanceM - last) : 0;
      last += step;
      return netPos ? onNetwork(step) : onRoute(last, step);
    },
    choose(to) {
      if (current?.streets.some((s) => s.to === to)) pending = { key: current.key, to };
    },
  };
}

/** Cap, en degrés, d'un point vu depuis `at` en regardant vers `heading` : positif à gauche, 0 droit devant. */
export function bearingDeg(at: Vec2, heading: Vec2, point: Vec2): number {
  const [dx, dz] = [point.x - at.x, point.z - at.z];
  const along = dx * heading.x + dz * heading.z;
  const left = dx * heading.z - dz * heading.x;
  return (Math.atan2(left, along) * 180) / Math.PI;
}
