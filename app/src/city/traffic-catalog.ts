// Le catalogue des figurants de la ville vivante (APP-014), en données (`app/assets/figurants-catalogue.json`) : des types
// (modèles, lieu de circulation, vitesse, gabarit), les classes de voie de chaque lieu et une table par région (densités,
// poids des types, côté de conduite), `ailleurs` par défaut. Le moteur ne connaît aucun type : il lit ce catalogue, validé ici.

export const LIEUX = ["chaussee", "trottoir", "voie-pietonne"] as const;
export type Lieu = (typeof LIEUX)[number];

export interface Gabarit {
  longueurM: number;
  largeurM: number;
  hauteurM: number;
}

export interface FigureType {
  modeles: string[];
  lieu: Lieu;
  vitesseKmh: number;
  gabarit: Gabarit;
}

export interface RegionSetting {
  conduite: "droite" | "gauche";
  /** Figurants par 100 m de voie de chaque lieu (par sens et par voie sur la chaussée). */
  densites: Partial<Record<Lieu, number>>;
  /** Poids de chaque type : sa part parmi les types du même lieu ; absent ou nul, le type n'apparaît pas. */
  poids: Record<string, number>;
}

export interface Catalogue {
  /** Les itinéraires où la case de l'accueil fait apparaître les figurants. */
  itineraires: string[];
  /** Les classes de voie (`highway`) de la chaussée et des voies piétonnes ; les trottoirs viennent de `sidewalk`. */
  lieux: { chaussee: string[]; "voie-pietonne": string[] };
  types: Record<string, FigureType>;
  regions: Record<string, RegionSetting>;
}

export const DEFAULT_REGION = "ailleurs";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === "string");
const positive = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v > 0;

function figureType(name: string, raw: unknown): FigureType {
  const t = isRecord(raw) ? raw : {};
  const g = isRecord(t["gabarit"]) ? t["gabarit"] : {};
  if (!isStrings(t["modeles"]) || t["modeles"].length === 0) throw new Error(`type ${name} : aucun modèle`);
  if (!LIEUX.includes(t["lieu"] as Lieu)) throw new Error(`type ${name} : lieu inconnu`);
  if (!positive(t["vitesseKmh"])) throw new Error(`type ${name} : vitesse illisible`);
  if (!positive(g["longueurM"]) || !positive(g["largeurM"]) || !positive(g["hauteurM"])) throw new Error(`type ${name} : gabarit illisible`);
  return { modeles: t["modeles"], lieu: t["lieu"] as Lieu, vitesseKmh: t["vitesseKmh"], gabarit: { longueurM: g["longueurM"], largeurM: g["largeurM"], hauteurM: g["hauteurM"] } };
}

function region(name: string, raw: unknown, types: Record<string, FigureType>): RegionSetting {
  const r = isRecord(raw) ? raw : {};
  const densites = isRecord(r["densites"]) ? r["densites"] : {};
  const poids = isRecord(r["poids"]) ? r["poids"] : {};
  if (r["conduite"] !== "droite" && r["conduite"] !== "gauche") throw new Error(`région ${name} : côté de conduite illisible`);
  if (!Object.entries(densites).every(([k, v]) => LIEUX.includes(k as Lieu) && typeof v === "number" && v >= 0)) throw new Error(`région ${name} : densité illisible`);
  if (!Object.entries(poids).every(([k, v]) => k in types && typeof v === "number" && v >= 0)) throw new Error(`région ${name} : poids illisible ou type inconnu`);
  return { conduite: r["conduite"], densites, poids: poids as Record<string, number> };
}

/** Lit le catalogue ; toute anomalie lève une erreur qui dit laquelle (jamais un figurant mal décrit). */
export function readCatalogue(raw: unknown): Catalogue {
  const c = isRecord(raw) ? raw : {};
  const lieux = isRecord(c["lieux"]) ? c["lieux"] : {};
  if (!isStrings(c["itineraires"])) throw new Error("catalogue : itinéraires illisibles");
  if (!isStrings(lieux["chaussee"]) || !isStrings(lieux["voie-pietonne"])) throw new Error("catalogue : classes de voie illisibles");
  const types = Object.fromEntries(Object.entries(isRecord(c["types"]) ? c["types"] : {}).map(([k, v]) => [k, figureType(k, v)]));
  const regions = Object.fromEntries(Object.entries(isRecord(c["regions"]) ? c["regions"] : {}).map(([k, v]) => [k, region(k, v, types)]));
  if (!regions[DEFAULT_REGION]) throw new Error(`catalogue : région « ${DEFAULT_REGION} » absente`);
  return { itineraires: c["itineraires"], lieux: { chaussee: lieux["chaussee"], "voie-pietonne": lieux["voie-pietonne"] }, types, regions };
}

/** Le réglage d'une région, ou celui d'`ailleurs` pour une région que la table ne règle pas. */
export const regionSetting = (catalogue: Catalogue, name: string): RegionSetting => catalogue.regions[name] ?? (catalogue.regions[DEFAULT_REGION] as RegionSetting);
