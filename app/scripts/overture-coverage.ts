// Essai de couverture d'Overture Maps (APP-003) : mesure, sur les quatre zones des extraits figés, ce qu'Overture
// apporte que l'extrait OpenStreetMap du dépôt n'a pas. Relevé et lecture : docs/intentions/rendu-sources-donnees.md.
//
// Relevé ponctuel, lancé à la main, JAMAIS par l'application : la ville reste l'extrait figé de app/data/ et la
// marche ne fait aucun appel réseau (APP-003). Rien d'Overture n'entre dans app/data/.
//
// Les fichiers lus sont les fichiers publiés d'Overture au format Parquet (bucket public, sans compte ni clé).
// L'exécuteur de requêtes et la lecture des extraits sont injectés : les tests n'ouvrent ni réseau ni fichier.
// Lancement réel (DuckDB hors du dépôt, lui seul ouvre le réseau) :
//   node -e "import('./scripts/overture-coverage.ts').then(async m=>{const {execFile}=require('node:child_process');
//     const fs=require('node:fs');const run=sql=>new Promise((ok,ko)=>execFile(process.env.DUCKDB,['-no-agent','-json','-c',sql],
//       {maxBuffer:1e8},(e,out)=>e?ko(e):ok(out)));
//     fs.writeFileSync(process.argv[1], await m.survey(run, f=>fs.readFileSync('data/'+f,'utf8')));})" <fichier-de-relevé>
import { CORNICHE_BBOX } from "./extract-corniche.ts";
import { FC_ROAD_BBOX } from "./extract-fc-road.ts";
import { PUNE_BBOX } from "./extract-pune.ts";
import { BBOX, DEFAULT_HEIGHT_M } from "./extract-souq.ts";

export interface Bbox { south: number; west: number; north: number; east: number }
export interface Zone { id: string; name: string; bbox: Bbox; extract: string }

/** Version publiée lue : le relevé est figé sur elle, il n'est pas rejoué pendant la marche. */
export const RELEASE = "2026-10-21.0";
export const BUCKET = "s3://overturemaps-us-west-2/release";

export const ZONES: Zone[] = [
  { id: "pune-vieille-ville", name: "Pune Vieille ville", bbox: PUNE_BBOX, extract: "pune-vieille-ville.json" },
  { id: "pune-fc-road", name: "Pune FC Road", bbox: FC_ROAD_BBOX, extract: "pune-fc-road.json" },
  { id: "doha-corniche", name: "Doha Corniche", bbox: CORNICHE_BBOX, extract: "doha-corniche.json" },
  { id: "doha-souq-waqif", name: "Doha Souq Waqif", bbox: BBOX, extract: "souq-waqif.json" },
];

/** Licence de chaque couche lue, relevée sur docs.overturemaps.org/attribution le 2026-11-03 (APP-003). */
export const LICENCES = [
  { layer: "buildings / building", licence: "ODbL", sources: "OpenStreetMap (ODbL), Microsoft Global ML Building Footprints (ODbL), Esri Community Maps (CC BY 4.0), Google Open Buildings (CC BY 4.0)" },
  { layer: "addresses / address", licence: "licences ouvertes, variables par pays", sources: "OpenAddresses et registres nationaux ; ni l'Inde ni le Qatar ne figurent dans la liste des sources" },
] as const;

export const parquet = (theme: string, type: string): string => `${BUCKET}/${RELEASE}/theme=${theme}/type=${type}/*.parquet`;

/** Le cadre d'une zone, lu sur les colonnes `bbox` d'Overture (elles portent les statistiques qui élaguent la lecture). */
export const inBbox = (b: Bbox): string =>
  `bbox.xmin BETWEEN ${String(b.west)} AND ${String(b.east)} AND bbox.ymin BETWEEN ${String(b.south)} AND ${String(b.north)}`;

/** Les attributs comptés côté Overture, dans l'ordre du relevé. */
export const COUNTED: Record<string, string> = {
  batiments: "count(*)", hauteur: "count(CASE WHEN height IS NOT NULL OR num_floors IS NOT NULL THEN 1 END)", etages: "count(num_floors)",
  type: "count(subtype)", nom: "count(names.primary)", toit: "count(roof_shape)", facade: "count(facade_material)",
};

export const PREAMBLE = "INSTALL httpfs; LOAD httpfs; SET s3_region='us-west-2';";

/** Une lecture par zone, chacune avec son seul cadre : un cadre unique (OR) empêcherait l'élagage par les
 * statistiques des fichiers et ferait lire les 270 Go de la couche. */
function perZone(zones: readonly Zone[], counts: string, source: string): string {
  const parts = zones.map((z) => `SELECT '${z.id}' AS zone, ${counts} FROM read_parquet('${source}') WHERE ${inBbox(z.bbox)}`);
  return `${PREAMBLE}\n${parts.join("\nUNION ALL\n")};`;
}

export function buildingsQuery(zones: readonly Zone[] = ZONES): string {
  const counts = Object.entries(COUNTED).map(([name, expr]) => `${expr} AS ${name}`).join(", ");
  return perZone(zones, counts, parquet("buildings", "building"));
}

export function addressesQuery(zones: readonly Zone[] = ZONES): string {
  return perZone(zones, "count(*) AS adresses", parquet("addresses", "address"));
}

export interface BuildingProps {
  kind: string; heightM?: number; levels?: number; building?: string;
  roofShape?: string; colour?: string; material?: string;
}
export type Counts = Record<string, number>;

/** Ce que l'extrait figé du dépôt porte déjà, compté avec les mêmes colonnes que le relevé Overture. */
export function osmCounts(text: string): Counts {
  const parsed = JSON.parse(text) as { features: { properties: BuildingProps }[] };
  const buildings = parsed.features.map((f) => f.properties).filter((p) => p.kind === "building");
  const count = (keep: (p: BuildingProps) => boolean): number => buildings.filter(keep).length;
  return {
    batiments: buildings.length,
    // Hauteur ou étages connus : l'extraction déduit la hauteur des étages et retombe sinon sur DEFAULT_HEIGHT_M
    // (un bâtiment réellement haut de 7 m compte donc comme sans hauteur : la seule approximation du relevé).
    hauteur: count((p) => p.heightM !== DEFAULT_HEIGHT_M),
    etages: count((p) => p.levels !== undefined),
    type: count((p) => p.building !== undefined && p.building !== "yes"),
    nom: 0, // L'extraction ne garde pas le nom des bâtiments : tout nom d'Overture serait un apport.
    toit: count((p) => p.roofShape !== undefined),
    facade: count((p) => p.colour !== undefined || p.material !== undefined),
  };
}

export type Runner = (sql: string) => Promise<string>;
export type ReadExtract = (file: string) => string;

/** Les lignes de DuckDB (`-json`) rangées par zone ; une zone absente de la réponse n'a rien dans Overture. */
export function byZone(json: string): Record<string, Counts> {
  const rows = JSON.parse(json) as (Counts & { zone: string })[];
  return Object.fromEntries(rows.map(({ zone, ...counts }) => [zone, counts]));
}

const cell = (osm: number, over: number): string => {
  const gain = over - osm;
  return `${String(osm)} → ${String(over)} (${gain >= 0 ? "+" : ""}${String(gain)})`;
};

const HEADERS = ["Zone", "Bâtiments", "Hauteur ou étages", "Étages", "Type", "Nom", "Forme de toit", "Matériau de façade", "Adresses"];

export function table(zones: readonly Zone[], osm: Record<string, Counts>, over: Record<string, Counts>, addresses: Record<string, Counts>): string {
  const lines = zones.map((z) => {
    const mine = osm[z.id] ?? {};
    const theirs = over[z.id] ?? {};
    const cells = Object.keys(COUNTED).map((key) => cell(mine[key] ?? 0, theirs[key] ?? 0));
    return `| ${z.name} | ${cells.join(" | ")} | 0 → ${String(addresses[z.id]?.["adresses"] ?? 0)} |`;
  });
  return [`| ${HEADERS.join(" | ")} |`, `|${HEADERS.map(() => "---").join("|")}|`, ...lines].join("\n");
}

export function licences(): string {
  return LICENCES.map((l) => `- \`${l.layer}\` : **${l.licence}** — sources : ${l.sources}`).join("\n");
}

/** Le relevé complet, en Markdown : licences par couche, puis le tableau « extrait figé → Overture ». */
export async function survey(run: Runner, read: ReadExtract, zones: readonly Zone[] = ZONES): Promise<string> {
  const osm = Object.fromEntries(zones.map((z) => [z.id, osmCounts(read(z.extract))]));
  const buildings = byZone(await run(buildingsQuery(zones)));
  const addresses = byZone(await run(addressesQuery(zones)));
  return `## Relevé de couverture d'Overture Maps

Version publiée lue : \`${RELEASE}\` (fichiers Parquet publics, sans compte). Relevé ponctuel : aucune donnée
d'Overture n'entre dans \`app/data/\` et l'application n'appelle jamais ces fichiers.

### Licences des couches lues

${licences()}

### Couverture, par zone : extrait OpenStreetMap figé → Overture

${table(zones, osm, buildings, addresses)}
`;
}
