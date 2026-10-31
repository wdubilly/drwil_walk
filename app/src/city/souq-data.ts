// Le souk de Doha tel que le casque le lit : l'extrait OpenStreetMap figé dans le dépôt (app/data/), converti
// en mètres locaux. Aucun appel réseau (le script app/scripts/extract-souq.ts produit le fichier, hors casque).
import extractFile from "../../data/souq-waqif.json" with { type: "json" };
import loopFile from "../../data/souq-waqif-boucle.json" with { type: "json" };
import { toLocalMetres, type LonLat, type Vec2 } from "../route/geo.ts";
import { createPath, type Path } from "../route/path.ts";

export interface Building {
  /** Contour fermé, en mètres locaux. */
  footprint: Vec2[];
  heightM: number;
}

export interface Souq {
  route: Path;
  buildings: Building[];
}

interface FeatureFile {
  features: { properties: { kind: string; heightM?: number }; geometry: { coordinates: unknown } }[];
}
interface LoopFile {
  geometry: { coordinates: number[][] };
}

const lonLat = (p: number[]): LonLat => [p[0] as number, p[1] as number];

/** Le départ de la boucle est l'origine du repère local. */
export function loadSouq(extract: FeatureFile, loop: LoopFile): Souq {
  const origin = lonLat(loop.geometry.coordinates[0] as number[]);
  const local = (p: number[]): Vec2 => toLocalMetres(origin, lonLat(p));
  const buildings = extract.features
    .filter((f) => f.properties.kind === "building")
    .map((f) => ({
      footprint: ((f.geometry.coordinates as number[][][])[0] as number[][]).map(local),
      heightM: f.properties.heightM as number,
    }));
  return { route: createPath(loop.geometry.coordinates.map(local)), buildings };
}

export const souqData = (): Souq => loadSouq(extractFile, loopFile);
