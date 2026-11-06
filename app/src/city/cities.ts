// Les villes que le casque sait afficher, lues dans le catalogue `app/data/villes.json` (seule source, APP-003) : chacune est un
// extrait OpenStreetMap et une boucle versionnés dans app/data/ (APP-002). Aucun import écrit par ville : la commande
// `npm run city` en ajoute une, elle apparaît. Les fichiers sont chargés à l'évaluation du module (await de tête), car les tests
// tournent sans la transformation de Vite : pas d'`import.meta.glob`.
import catalog from "../../data/villes.json" with { type: "json" };
import { paletteOf } from "./region-palette.ts";
import { loadSouq, type Souq } from "./souq-data.ts";

type Extract = Parameters<typeof loadSouq>[0];
type Loop = Parameters<typeof loadSouq>[1];

/** Ce que l'application lit d'une entrée du catalogue ; la commande en écrit davantage (emprise, tracé…). */
export interface CatalogEntry {
  itinerary: string;
  /** Le titre de la carte d'accueil. */
  label: string;
  /** Une ligne pour situer la balade, sous le titre de la carte. */
  place: string;
  /** Le fichier de l'extrait, relatif à `app/` ; la boucle est à côté, suffixée `-boucle`. */
  file: string;
}

export const CATALOG: readonly CatalogEntry[] = Object.values(catalog as Record<string, CatalogEntry>);

const stemOf = (file: string): string => file.replace(/^data\//, "").replace(/\.json$/, "");

async function read(entry: CatalogEntry): Promise<() => Souq> {
  const stem = stemOf(entry.file);
  const [extract, loop] = await Promise.all([
    import(`../../data/${stem}.json`, { with: { type: "json" } }) as Promise<{ default: Extract }>,
    import(`../../data/${stem}-boucle.json`, { with: { type: "json" } }) as Promise<{ default: Loop }>,
  ]);
  const start = loop.default.geometry.coordinates[0] as number[];
  return () => loadSouq(extract.default, loop.default, paletteOf([start[0] as number, start[1] as number]));
}

const CITIES = new Map(await Promise.all(CATALOG.map(async (entry) => [entry.itinerary, await read(entry)] as const)));

/** La ville et la boucle de l'itinéraire ; un identifiant sans ville dans le catalogue est une erreur, pas un repli muet (QUA-002). */
export function cityFor(itineraryId: string): Souq {
  const load = CITIES.get(itineraryId);
  if (!load) throw new Error(`Itinéraire « ${itineraryId} » : aucune ville dans le dépôt.`);
  return load();
}
