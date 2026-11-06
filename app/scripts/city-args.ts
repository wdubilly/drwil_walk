// La ligne de commande de la création d'une ville : lecture des options et écriture de l'entrée dans `data/villes.json`.
//   npm run city -- <identifiant>                  rejoue une ville déjà décrite (les quatre itinéraires existants)
//   npm run city -- <identifiant> --nom "<nom>" --emprise <sud,ouest,nord,est> --depart <lat,lon> --arrivee <lat,lon>
//                   [--via <lat,lon>]... [--retour aller-retour|boucle] [--libelle "<titre de carte>"] [--lieu "<ligne de carte>"]
//                   [--photos <dossier>]
import type { CityDescription, Retour } from "./cities.ts";

export interface CityRequest {
  key: string;
  city: CityDescription;
  /** Le dossier de photos fournies par le demandeur, lu sur le disque, hors dépôt. */
  photosDir: string | undefined;
  /** Vrai si l'entrée de `data/villes.json` est créée ou changée par cette demande. */
  described: boolean;
}

const fail = (why: string): never => {
  throw new Error(`création de ville : ${why}`);
};

const numbers = (text: string, count: number, what: string): number[] => {
  const values = text.split(",").map((v) => Number(v.trim()));
  return values.length === count && values.every(Number.isFinite) ? values : fail(`${what} attendu en ${String(count)} nombres séparés par des virgules, reçu « ${text} »`);
};

const point = (text: string, what: string): number[] => {
  const [lat, lon] = numbers(text, 2, what) as [number, number];
  return Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? [lat, lon] : fail(`${what} hors du globe : « ${text} » (latitude, longitude)`);
};

function flagsOf(args: readonly string[]): Map<string, string[]> {
  const flags = new Map<string, string[]>();
  for (let i = 0; i < args.length; i += 2) {
    const [name, value] = [args[i] as string, args[i + 1]];
    if (!name.startsWith("--") || value === undefined) fail(`option « ${name} » inconnue ou sans valeur`);
    flags.set(name, [...(flags.get(name) ?? []), value as string]);
  }
  return flags;
}

/** La demande : l'identifiant, la ville (décrite par les options, sinon lue dans le catalogue) et le dossier de photos fournies. */
export function parseCityArgs(argv: readonly string[], catalog: Readonly<Record<string, CityDescription>>): CityRequest {
  const [key, ...rest] = argv;
  if (key === undefined || !/^[a-z0-9][a-z0-9-]*$/.test(key)) return fail("un identifiant de ville est demandé (minuscules, chiffres et tirets)");
  const flags = flagsOf(rest);
  const one = (name: string): string | undefined => flags.get(name)?.[0];
  for (const name of flags.keys()) if (!["--nom", "--emprise", "--depart", "--arrivee", "--via", "--retour", "--libelle", "--lieu", "--photos"].includes(name)) fail(`option « ${name} » inconnue`);
  const photosDir = one("--photos");
  const known = catalog[key];
  const described = ["--nom", "--emprise", "--depart", "--arrivee", "--via", "--retour", "--libelle", "--lieu"].some((n) => flags.has(n));
  if (!described) return { key, city: known ?? fail(`« ${key} » n'est pas décrite dans data/villes.json : donner --nom, --emprise, --depart et --arrivee`), photosDir, described };
  const name = one("--nom") ?? known?.name ?? fail("--nom est demandé");
  const box = flags.has("--emprise") ? numbers(one("--emprise") as string, 4, "l'emprise") : undefined;
  const [south, west, north, east] = box ?? [known?.bbox.south, known?.bbox.west, known?.bbox.north, known?.bbox.east];
  if (south === undefined || west === undefined || north === undefined || east === undefined) fail("--emprise est demandée (sud,ouest,nord,est)");
  if ((south as number) >= (north as number) || (west as number) >= (east as number)) fail("l'emprise doit aller du sud vers le nord et de l'ouest vers l'est");
  const route = known?.route.points;
  const from = flags.has("--depart") ? point(one("--depart") as string, "le départ") : route?.[0] ?? fail("--depart est demandé");
  const to = flags.has("--arrivee") ? point(one("--arrivee") as string, "l'arrivée") : route?.[route.length - 1] ?? fail("--arrivee est demandée");
  const via = flags.has("--via") ? (flags.get("--via") as string[]).map((v) => point(v, "l'étape")) : (route?.slice(1, -1) ?? []);
  const back = one("--retour") ?? known?.route.return ?? "aller-retour";
  if (back !== "aller-retour" && back !== "boucle") fail("--retour vaut « aller-retour » ou « boucle »");
  const city: CityDescription = {
    itinerary: known?.itinerary ?? key,
    label: one("--libelle") ?? known?.label ?? name,
    place: one("--lieu") ?? known?.place ?? `Itinéraire à pied : ${name}`,
    name,
    bbox: { south: south as number, west: west as number, north: north as number, east: east as number },
    userAgent: known?.userAgent ?? `drwil_walk/0.1 (extraction OpenStreetMap de ${name})`,
    file: known?.file ?? `data/${key}.json`,
    route: { points: [from, ...via, to], return: back as Retour },
  };
  return { key, city, photosDir, described };
}

/** Le catalogue tel qu'il s'écrit : un champ par ligne, l'emprise et le tracé sur une seule, pour des diffs lisibles. */
export function catalogText(catalog: Readonly<Record<string, CityDescription>>): string {
  const city = (c: CityDescription): string => Object.entries(c).map(([field, value]) => `    ${JSON.stringify(field)}: ${JSON.stringify(value)}`).join(",\n");
  return `{\n${Object.entries(catalog).map(([key, c]) => `  ${JSON.stringify(key)}: {\n${city(c)}\n  }`).join(",\n")}\n}\n`;
}
