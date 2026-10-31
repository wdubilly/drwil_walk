// La ville d'un itinéraire (le souk de Doha, la Vieille ville de Pune…) telle que le casque le lit : l'extrait OpenStreetMap figé dans le dépôt (app/data/), converti
// en mètres locaux. Aucun appel réseau (le script app/scripts/extract-souq.ts produit le fichier, hors casque).
import { toLocalMetres, type LonLat, type Vec2 } from "../route/geo.ts";
import { createPath, type Path } from "../route/path.ts";

export interface Building {
  /** Contour fermé, en mètres locaux. */
  footprint: Vec2[];
  heightM: number;
}

/** Les couleurs d'une ville : sol, voies, et quelques tons de bâtiments (un par bâtiment, sans donnée en plus). */
export interface Palette {
  ground: number;
  road: number;
  buildings: readonly number[];
}

/** Une voie : sa classe OpenStreetMap (`highway`) et son tracé en mètres locaux. */
export interface Road {
  highway: string;
  points: Vec2[];
}

export interface Souq {
  route: Path;
  buildings: Building[];
  roads: Road[];
  palette: Palette;
}

interface FeatureFile {
  features: { properties: { kind: string; heightM?: number; highway?: string }; geometry: { coordinates: unknown } }[];
}
interface LoopFile {
  geometry: { coordinates: number[][] };
}

const lonLat = (p: number[]): LonLat => [p[0] as number, p[1] as number];

/** Le départ de la boucle est l'origine du repère local. */
export function loadSouq(extract: FeatureFile, loop: LoopFile, palette: Palette): Souq {
  const origin = lonLat(loop.geometry.coordinates[0] as number[]);
  const local = (p: number[]): Vec2 => toLocalMetres(origin, lonLat(p));
  const buildings = extract.features
    .filter((f) => f.properties.kind === "building")
    .map((f) => ({
      footprint: ((f.geometry.coordinates as number[][][])[0] as number[][]).map(local),
      heightM: f.properties.heightM as number,
    }));
  const roads = extract.features
    .filter((f) => f.properties.kind === "highway")
    .map((f) => ({
      highway: f.properties.highway as string,
      points: (f.geometry.coordinates as number[][]).map(local),
    }));
  return { route: createPath(loop.geometry.coordinates.map(local)), buildings, roads, palette };
}
