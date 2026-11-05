// Le moteur de la ville vivante (APP-014) : pose les figurants sur les trajets de leur lieu, d'après le catalogue et la table
// de la région. Reproductible (graine de la voie OpenStreetMap), vitesse plafonnée, nombre plafonné par profil, les plus
// proches du parcours gardés. Logique pure : aucune scène ; le mouvement est dans traffic-motion.ts.
import { createPath, pointAt, type Path } from "../route/path.ts";
import type { Building, Road } from "./souq-data.ts";
import { seededRandom } from "./facade-seed.ts";
import { closest } from "./near-route.ts";
import { regionSetting, type Catalogue, type Gabarit, type Lieu } from "./traffic-catalog.ts";
import { laneLengthOf, trafficLanes, type Lane } from "./traffic-lanes.ts";

/** Plafond de vitesse par lieu, quelle que soit la donnée du catalogue. */
export const MAX_SPEED_KMH: Record<Lieu, number> = { chaussee: 30, trottoir: 6, "voie-pietonne": 6 };
/** Écart minimal entre deux figurants d'un même trajet, en plus de leur longueur. */
export const MIN_GAP_M: Record<Lieu, number> = { chaussee: 6, trottoir: 1.5, "voie-pietonne": 1.5 };
/** Variation de vitesse entre trajets (± 15 %), toujours sous le plafond. */
export const SPEED_JITTER = 0.15;

export interface Agent {
  type: string;
  model: string;
  lieu: Lieu;
  path: Path;
  /** Position de départ le long du trajet, vitesse en m/s, et sens (à rebours sur un trajet à double sens). */
  startM: number;
  speedMs: number;
  reverse: boolean;
  gabarit: Gabarit;
}

export interface Caps {
  vehicles: number;
  pedestrians: number;
}

/** Plafonds sans profil graphique : ceux du profil « équilibré » (APP-006). */
export const DEFAULT_CAPS: Caps = { vehicles: 20, pedestrians: 40 };

/** Les types d'un lieu dont la région donne un poids et dont un modèle au moins est disponible. */
function weightedTypes(catalogue: Catalogue, region: string, lieu: Lieu, models: ReadonlySet<string>): [string, number][] {
  const { poids } = regionSetting(catalogue, region);
  return Object.entries(catalogue.types)
    .filter(([name, t]) => t.lieu === lieu && (poids[name] ?? 0) > 0 && t.modeles.some((m) => models.has(m)))
    .map(([name]) => [name, poids[name] as number]);
}

function pick<T>(items: readonly [T, number][], r: number): T {
  const total = items.reduce((sum, [, w]) => sum + w, 0);
  let left = r * total;
  for (const [item, weight] of items.slice(0, -1)) {
    left -= weight;
    if (left < 0) return item;
  }
  return (items[items.length - 1] as [T, number])[0];
}

/** Les figurants d'un trajet : un nombre tiré de la densité, espacés régulièrement à la graine près. */
export function laneAgents(lane: Lane, catalogue: Catalogue, region: string, models: ReadonlySet<string>): Agent[] {
  const types = weightedTypes(catalogue, region, lane.lieu, models);
  const density = regionSetting(catalogue, region).densites[lane.lieu] ?? 0;
  if (types.length === 0 || density === 0) return [];
  const random = seededRandom(lane.seed);
  const lengthM = laneLengthOf(lane.points);
  const longest = Math.max(...types.map(([name]) => (catalogue.types[name] as { gabarit: Gabarit }).gabarit.longueurM));
  const room = Math.floor(lengthM / (longest + MIN_GAP_M[lane.lieu]));
  const count = Math.min(room, Math.floor((density * lengthM * lane.factor) / 100 + random()));
  const chosen = Array.from({ length: count }, () => {
    const name = pick(types, random());
    const type = catalogue.types[name] as { modeles: string[]; vitesseKmh: number; gabarit: Gabarit };
    const usable = type.modeles.filter((m) => models.has(m));
    return { name, type, model: usable[Math.floor(random() * usable.length)] as string };
  });
  // Un seul sens : tous à la vitesse du plus lent, pour garder l'écart (personne ne traverse l'autre).
  const laneKmh = Math.min(...chosen.map((c) => c.type.vitesseKmh)) * (1 - SPEED_JITTER + 2 * SPEED_JITTER * random());
  const path = createPath(lane.points, false);
  return chosen.map(({ name, type, model }, i) => {
    const kmh = lane.bothWays ? type.vitesseKmh * (1 - SPEED_JITTER + 2 * SPEED_JITTER * random()) : laneKmh;
    return {
      type: name,
      model,
      lieu: lane.lieu,
      path,
      startM: ((i + 0.5 + (random() - 0.5) * 0.5) * lengthM) / count,
      speedMs: Math.min(kmh, MAX_SPEED_KMH[lane.lieu]) / 3.6,
      reverse: lane.bothWays && random() < 0.5,
      gabarit: type.gabarit,
    };
  });
}

/**
 * Les figurants de la ville : ceux de chaque trajet, puis au plus `caps.vehicles` véhicules (chaussée) et `caps.pedestrians`
 * piétons, les plus proches du parcours. `models` : les modèles disponibles dans le pack chargé.
 */
export function planTraffic(roads: readonly Road[], buildings: readonly Building[], route: Path, catalogue: Catalogue, region: string, models: ReadonlySet<string>, caps: Caps): Agent[] {
  const all = trafficLanes(roads, buildings, catalogue, regionSetting(catalogue, region)).flatMap((lane) => laneAgents(lane, catalogue, region, models));
  const anchor = (a: Agent) => pointAt(a.path, a.startM);
  return [
    ...closest(all.filter((a) => a.lieu === "chaussee"), route, caps.vehicles, anchor),
    ...closest(all.filter((a) => a.lieu !== "chaussee"), route, caps.pedestrians, anchor),
  ];
}
