// Le réseau de voies de l'extrait, en graphe, et la marche sur ce réseau : les rues qui partent d'un carrefour, le tout droit
// par défaut, le demi-tour en bout de voie (APP-002). Logique pure, sans three.js ; les sommets des voies sont les nœuds.
import type { Vec2 } from "./geo.ts";

/** Une voie de l'extrait telle que la ville la lit (sous-ensemble de `Road`). */
export interface NetworkRoad {
  highway: string;
  points: readonly Vec2[];
  footway?: string | undefined;
}

export interface Network {
  points: readonly Vec2[];
  neighbours: readonly (readonly number[])[];
  /** Emprise des voies : un cul-de-sac à son bord est une rue qui sort de l'extrait. */
  extent: { minX: number; maxX: number; minZ: number; maxZ: number };
  index: ReadonlyMap<string, number>;
}

/** Une rue qui part d'un nœud : le nœud suivant et sa direction (vecteur unitaire, prise à quelques mètres). */
export interface Street {
  to: number;
  dir: Vec2;
}

/** Position sur le réseau : sur l'arête `from` → `to`, à `t` mètres de `from`. */
export interface NetPosition {
  from: number;
  to: number;
  t: number;
}

/** Une rue choisie à l'avance : prise quand la marche atteint ce nœud. */
export interface Pick {
  node: number;
  to: number;
}

const NOT_WALKABLE = new Set(["motorway", "motorway_link", "construction"]);
/** Une impasse plus courte n'est pas proposée (bout de ruelle, entrée de cour) ; une impasse près du bord de l'extrait non plus. */
const MIN_STUB_M = 15;
const BORDER_M = 30;
export const LOOKAHEAD_M = 10;
export const APPROACH_M = 40;

const keyOf = (p: Vec2): string => `${p.x.toFixed(3)}_${p.z.toFixed(3)}`;
export const nodeAt = (net: Network, p: Vec2): number | undefined => net.index.get(keyOf(p));
const gap = (a: Vec2, b: Vec2): number => Math.hypot(b.x - a.x, b.z - a.z);

/** Le graphe des voies à pied : ni autoroutes ni trottoirs tracés à part, chaque sommet est un nœud. */
export function buildNetwork(roads: readonly NetworkRoad[]): Network {
  const points: Vec2[] = [];
  const index = new Map<string, number>();
  const links: Set<number>[] = [];
  const nodeOf = (p: Vec2): number => {
    const known = index.get(keyOf(p));
    if (known !== undefined) return known;
    index.set(keyOf(p), points.length);
    points.push(p);
    links.push(new Set());
    return points.length - 1;
  };
  for (const road of roads) {
    if (NOT_WALKABLE.has(road.highway) || road.footway === "sidewalk") continue;
    road.points.forEach((p, i) => {
      const a = nodeOf(p);
      const b = i > 0 ? nodeOf(road.points[i - 1] as Vec2) : a;
      if (a === b) return;
      links[a]?.add(b);
      links[b]?.add(a);
    });
  }
  const xs = points.map((p) => p.x);
  const zs = points.map((p) => p.z);
  const extent = { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) };
  return { points, neighbours: links.map((l) => [...l]), extent, index };
}

export const unit = (from: Vec2, to: Vec2): Vec2 => {
  const length = gap(from, to);
  return { x: (to.x - from.x) / length, z: (to.z - from.z) / length };
};

const atBorder = (net: Network, node: number): boolean => {
  const p = net.points[node] as Vec2;
  const e = net.extent;
  return Math.min(p.x - e.minX, e.maxX - p.x, p.z - e.minZ, e.maxZ - p.z) < BORDER_M;
};

/** Suit une rue depuis `node` par `via` jusqu'au prochain carrefour ou cul-de-sac : sa fin, sa longueur et le point à `LOOKAHEAD_M`. */
function followStreet(net: Network, node: number, via: number): { end: number; lengthM: number; ahead: Vec2 } {
  let [before, here, lengthM] = [node, via, 0];
  let ahead: Vec2 | undefined;
  for (;;) {
    const [a, b] = [net.points[before] as Vec2, net.points[here] as Vec2];
    const step = gap(a, b);
    if (ahead === undefined && lengthM + step >= LOOKAHEAD_M) {
      const t = (LOOKAHEAD_M - lengthM) / step;
      ahead = { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
    }
    lengthM += step;
    const onward = (net.neighbours[here] as number[]).filter((n) => n !== before);
    // Une boucle de voies sans carrefour revient à son point de départ : on s'arrête.
    if (onward.length !== 1 || here === node) return { end: here, lengthM, ahead: ahead ?? b };
    [before, here] = [here, onward[0] as number];
  }
}

/** Les rues qui partent de `node`, sans celle d'où l'on vient ni celles qui sortent de l'extrait ou ne mènent nulle part. */
export function streetsAt(net: Network, node: number, from: number | undefined): Street[] {
  const streets: Street[] = [];
  for (const to of net.neighbours[node] as number[]) {
    if (to === from) continue;
    const { end, lengthM, ahead } = followStreet(net, node, to);
    const deadEnd = (net.neighbours[end] as number[]).length === 1;
    if (deadEnd && (atBorder(net, end) || lengthM < MIN_STUB_M)) continue;
    streets.push({ to, dir: unit(net.points[node] as Vec2, ahead) });
  }
  return streets;
}

/** La rue la plus proche de la direction de marche : le tout droit, jamais un virage brusque imposé. */
export function straightest(streets: readonly Street[], heading: Vec2): Street | undefined {
  const score = (s: Street): number => s.dir.x * heading.x + s.dir.z * heading.z;
  return streets.reduce<Street | undefined>((best, s) => (best === undefined || score(s) > score(best) ? s : best), undefined);
}

export const positionOf = (net: Network, pos: NetPosition): Vec2 => {
  const [a, b] = [net.points[pos.from] as Vec2, net.points[pos.to] as Vec2];
  const f = pos.t / gap(a, b);
  return { x: a.x + (b.x - a.x) * f, z: a.z + (b.z - a.z) * f };
};

export const directionOf = (net: Network, pos: NetPosition): Vec2 => unit(net.points[pos.from] as Vec2, net.points[pos.to] as Vec2);

/** Avance de `ds` mètres : à chaque nœud, la rue choisie d'avance, sinon le tout droit, sinon le demi-tour (voie sans issue). */
export function advanceOnNetwork(net: Network, start: NetPosition, ds: number, pick: Pick | undefined): NetPosition {
  let pos = { ...start, t: start.t + ds };
  for (;;) {
    const length = gap(net.points[pos.from] as Vec2, net.points[pos.to] as Vec2);
    if (pos.t < length) return pos;
    const streets = streetsAt(net, pos.to, pos.from);
    const chosen = pick?.node === pos.to ? streets.find((s) => s.to === pick.to) : undefined;
    const next = chosen ?? straightest(streets, directionOf(net, pos));
    pos = { from: pos.to, to: next ? next.to : pos.from, t: pos.t - length };
  }
}

/** Le prochain nœud d'où l'on peut choisir une rue, à `APPROACH_M` au plus : le nœud, d'où l'on y arrive, la direction d'arrivée et la distance. */
export function nextCrossing(net: Network, pos: NetPosition): { node: number; from: number; incoming: Vec2; distanceM: number } | undefined {
  let [from, node] = [pos.from, pos.to];
  let distanceM = gap(net.points[from] as Vec2, net.points[node] as Vec2) - pos.t;
  while (distanceM <= APPROACH_M) {
    const streets = streetsAt(net, node, from);
    if (streets.length >= 2) return { node, from, incoming: unit(net.points[from] as Vec2, net.points[node] as Vec2), distanceM };
    const only = streets[0];
    if (only === undefined) return undefined;
    distanceM += gap(net.points[node] as Vec2, net.points[only.to] as Vec2);
    [from, node] = [node, only.to];
  }
  return undefined;
}

/** Tourne `current` vers `target` d'une fraction de l'écart d'angle : le changement de direction est lissé, jamais sec. */
export function turnToward(current: Vec2, target: Vec2, fraction: number): Vec2 {
  const now = Math.atan2(current.z, current.x);
  let delta = Math.atan2(target.z, target.x) - now;
  delta -= 2 * Math.PI * Math.round(delta / (2 * Math.PI));
  const angle = now + delta * Math.min(1, Math.max(0, fraction));
  return { x: Math.cos(angle), z: Math.sin(angle) };
}
