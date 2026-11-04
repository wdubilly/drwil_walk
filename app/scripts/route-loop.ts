// Le tracé de boucle d'une ville, produit depuis son extrait (hors casque) : le plus court chemin sur les voies de l'extrait
// entre le départ, les étapes et l'arrivée, puis le retour. Chaque point du tracé est un sommet d'une voie de l'extrait
// (APP-002) : les points demandés sont ramenés au sommet le plus proche du plus grand réseau relié.
import { distanceM, type LonLat } from "../src/route/geo.ts";
import type { Retour } from "./cities.ts";

interface Edge { to: string; cost: number }
type Graph = Map<string, Edge[]>;
interface Line { geometry: { type: string; coordinates: number[][] }; properties: { kind: string; highway?: string } }

const FOOT = new Set(["footway", "pedestrian", "path", "steps", "living_street", "cycleway"]);
const NOT_WALKABLE = new Set(["motorway", "motorway_link"]);
/** Une arête déjà prise à l'aller coûte ce multiple au retour d'une boucle : évitée tant qu'une autre existe. */
const REUSE_FACTOR = 50;
const FOOT_FACTOR = 0.8;

const keyOf = (p: readonly number[]): string => p.join(",");
const lonLat = (key: string): LonLat => key.split(",").map(Number) as unknown as LonLat;
const edgeKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** Le graphe des voies marchables de l'extrait : un sommet par couple de coordonnées, une arête par segment. */
export function graphOf(extract: { features: Line[] }): Graph {
  const graph: Graph = new Map();
  const link = (from: string, to: string, cost: number): void => {
    graph.set(from, [...(graph.get(from) ?? []), { to, cost }]);
  };
  for (const { properties, geometry } of extract.features) {
    if (properties.kind !== "highway" || geometry.type !== "LineString" || NOT_WALKABLE.has(properties.highway ?? "")) continue;
    const factor = FOOT.has(properties.highway ?? "") ? FOOT_FACTOR : 1;
    geometry.coordinates.forEach((p, i) => {
      const next = geometry.coordinates[i + 1];
      if (!next) return;
      const cost = distanceM(p as unknown as LonLat, next as unknown as LonLat) * factor;
      link(keyOf(p), keyOf(next), cost);
      link(keyOf(next), keyOf(p), cost);
    });
  }
  return graph;
}

/** Les sommets du plus grand réseau relié : un départ posé sur une ruelle isolée est ramené à ce réseau. */
export function mainNetwork(graph: Graph): Set<string> {
  let best = new Set<string>();
  const seen = new Set<string>();
  for (const start of graph.keys()) {
    if (seen.has(start)) continue;
    const component = new Set([start]);
    const stack = [start];
    while (stack.length > 0) {
      for (const { to } of graph.get(stack.pop() as string) as Edge[]) {
        if (!component.has(to)) { component.add(to); stack.push(to); }
      }
    }
    component.forEach((k) => seen.add(k));
    if (component.size > best.size) best = component;
  }
  return best;
}

export function snap(network: ReadonlySet<string>, point: LonLat): string {
  let best = "";
  let bestDistance = Infinity;
  for (const key of network) {
    const d = distanceM(point, lonLat(key));
    if (d < bestDistance) { best = key; bestDistance = d; }
  }
  if (best === "") throw new Error("l'extrait ne contient aucune voie marchable : tracé impossible");
  return best;
}

/** Le plus court chemin (Dijkstra) ; les arêtes de `avoid` coûtent `REUSE_FACTOR` fois plus. */
export function shortestPath(graph: Graph, from: string, to: string, avoid: ReadonlySet<string> = new Set()): string[] {
  const dist = new Map([[from, 0]]);
  const before = new Map<string, string>();
  const queue: [number, string][] = [[0, from]];
  const done = new Set<string>();
  while (queue.length > 0) {
    queue.sort((a, b) => b[0] - a[0]);
    const [d, key] = queue.pop() as [number, string];
    if (done.has(key)) continue;
    done.add(key);
    if (key === to) break;
    for (const edge of graph.get(key) as Edge[]) {
      const next = d + edge.cost * (avoid.has(edgeKey(key, edge.to)) ? REUSE_FACTOR : 1);
      if (next < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, next);
        before.set(edge.to, key);
        queue.push([next, edge.to]);
      }
    }
  }
  if (!done.has(to)) throw new Error("aucun chemin entre deux points du tracé");
  const path = [to];
  while (path[0] !== from) path.unshift(before.get(path[0] as string) as string);
  return path;
}

const usedEdges = (path: readonly string[]): Set<string> => new Set(path.slice(1).map((k, i) => edgeKey(path[i] as string, k)));

/** Les sommets du tracé de boucle : de l'aller (départ, étapes, arrivée) puis du retour. */
export function loopOf(extract: { features: Line[] }, points: readonly (readonly number[])[], back: Retour): LonLat[] {
  if (points.length < 2) throw new Error("le tracé demande au moins un départ et une arrivée");
  const graph = graphOf(extract);
  const network = mainNetwork(graph);
  const stops = points.map(([lat, lon]) => snap(network, [lon as number, lat as number]));
  const out = stops.slice(1).reduce<string[]>((path, stop, i) => [...path, ...shortestPath(graph, stops[i] as string, stop).slice(1)], [stops[0] as string]);
  const home = back === "aller-retour" ? [...out].reverse().slice(1) : shortestPath(graph, out[out.length - 1] as string, out[0] as string, usedEdges(out)).slice(1);
  return [...out, ...home].map(lonLat);
}

/** Le fichier de boucle : un GeoJSON d'une ligne, avec son attribution (APP-003). */
export function loopText(name: string, points: readonly (readonly number[])[], back: Retour, extractFile: string, loop: readonly LonLat[]): string {
  const [first, last] = [points[0] as number[], points[points.length - 1] as number[]];
  const how = back === "aller-retour" ? "retour par le même chemin" : "retour par un chemin qui évite l'aller";
  const description = `${name} : départ en (${String(first[0])}, ${String(first[1])}), arrivée en (${String(last[0])}, ${String(last[1])}), ${how}. Tracé : plus court chemin sur les voies OpenStreetMap de ${extractFile}. Chaque point est un sommet d'une voie de l'extrait.`;
  const properties = { name, description, attribution: "© contributeurs OpenStreetMap, licence ODbL" };
  return `${JSON.stringify({ type: "Feature", properties, geometry: { type: "LineString", coordinates: loop } })}\n`;
}
