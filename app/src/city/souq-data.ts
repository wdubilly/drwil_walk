// La ville d'un itinéraire (le souk de Doha, la Vieille ville de Pune…) telle que le casque le lit : l'extrait OpenStreetMap figé dans le dépôt (app/data/), converti
// en mètres locaux. Aucun appel réseau (le script app/scripts/extract-souq.ts produit le fichier, hors casque).
import { toLocalMetres, type LonLat, type Vec2 } from "../route/geo.ts";
import { materialTone, parseHex } from "./tint.ts";
import { createPath, type Path } from "../route/path.ts";

export interface Building {
  /** Contour fermé, en mètres locaux. */
  footprint: Vec2[];
  heightM: number;
  /** Teinte des murs lue des balises OpenStreetMap (couleur, sinon matériau) ; absente : un ton de la palette. */
  wall?: number;
  /** Teinte du toit (`roof:colour`) ; absente : celle des murs. */
  roof?: number;
}

/** Un arbre, un lampadaire ou un banc de l'extrait, en mètres locaux. */
export interface Prop {
  kind: "tree" | "lamp" | "bench";
  at: Vec2;
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
  /** Le départ de la boucle : l'origine du repère local, en longitude et latitude (aligne les tuiles Google). */
  origin: LonLat;
  route: Path;
  buildings: Building[];
  roads: Road[];
  props: Prop[];
  palette: Palette;
}

interface FeatureFile {
  features: {
    properties: { kind: string; heightM?: number; highway?: string; colour?: string; roofColour?: string; material?: string };
    geometry: { coordinates: unknown };
  }[];
}
interface LoopFile {
  geometry: { coordinates: number[][] };
}

const lonLat = (p: number[]): LonLat => [p[0] as number, p[1] as number];

/** Les teintes d'un bâtiment : sa couleur, sinon la teinte de son matériau ; le toit à part s'il a sa couleur. */
function tints(p: { colour?: string; roofColour?: string; material?: string }): Pick<Building, "wall" | "roof"> {
  const wall = (p.colour ? parseHex(p.colour) : undefined) ?? materialTone(p.material);
  const roof = p.roofColour ? parseHex(p.roofColour) : undefined;
  return { ...(wall === undefined ? {} : { wall }), ...(roof === undefined ? {} : { roof }) };
}

/** Le départ de la boucle est l'origine du repère local. */
export function loadSouq(extract: FeatureFile, loop: LoopFile, palette: Palette): Souq {
  const origin = lonLat(loop.geometry.coordinates[0] as number[]);
  const local = (p: number[]): Vec2 => toLocalMetres(origin, lonLat(p));
  const buildings = extract.features
    .filter((f) => f.properties.kind === "building")
    .map((f) => ({
      footprint: ((f.geometry.coordinates as number[][][])[0] as number[][]).map(local),
      heightM: f.properties.heightM as number,
      ...tints(f.properties),
    }));
  const roads = extract.features
    .filter((f) => f.properties.kind === "highway")
    .map((f) => ({
      highway: f.properties.highway as string,
      points: (f.geometry.coordinates as number[][]).map(local),
    }));
  const props = extract.features
    .filter((f) => ["tree", "lamp", "bench"].includes(f.properties.kind))
    .map((f) => ({ kind: f.properties.kind as Prop["kind"], at: local(f.geometry.coordinates as number[]) }));
  return { origin, route: createPath(loop.geometry.coordinates.map(local)), buildings, roads, props, palette };
}
