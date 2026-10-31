// Les villes que le casque sait afficher, par identifiant d'itinéraire : chacune est un extrait OpenStreetMap
// et une boucle versionnés dans app/data/ (APP-003, APP-002). Un itinéraire « bientôt » n'y figure pas encore.
import cornicheExtract from "../../data/doha-corniche.json" with { type: "json" };
import cornicheLoop from "../../data/doha-corniche-boucle.json" with { type: "json" };
import fcRoadExtract from "../../data/pune-fc-road.json" with { type: "json" };
import fcRoadLoop from "../../data/pune-fc-road-boucle.json" with { type: "json" };
import puneExtract from "../../data/pune-vieille-ville.json" with { type: "json" };
import puneLoop from "../../data/pune-vieille-ville-boucle.json" with { type: "json" };
import souqExtract from "../../data/souq-waqif.json" with { type: "json" };
import souqLoop from "../../data/souq-waqif-boucle.json" with { type: "json" };
import { loadSouq, type Palette, type Souq } from "./souq-data.ts";

/** Une palette par itinéraire : voies sombres sur un sol plus clair, bâtiments dans quatre tons de la même famille. */
const PALETTES: Record<string, Palette> = {
  "doha-corniche": { ground: 0x7f929c, road: 0x424c54, buildings: [0xc9d3d9, 0xaebcc6, 0xe3e9ec, 0x93a8b5] },
  "doha-souq-waqif": { ground: 0xa8916b, road: 0x5e5446, buildings: [0xe3cfa5, 0xd2b48c, 0xc99a6b, 0xefe0c0] },
  "pune-fc-road": { ground: 0x8d8a7a, road: 0x45423d, buildings: [0xc9805a, 0xd8b48a, 0xb8a58c, 0xa9674a] },
  "pune-vieille-ville": { ground: 0x9a8a78, road: 0x4f4a45, buildings: [0xb5543c, 0xc8785a, 0xd9a27a, 0xa04632] },
};

const CITIES: Record<string, () => Souq> = {
  "doha-corniche": () => loadSouq(cornicheExtract, cornicheLoop, PALETTES["doha-corniche"] as Palette),
  "doha-souq-waqif": () => loadSouq(souqExtract, souqLoop, PALETTES["doha-souq-waqif"] as Palette),
  "pune-fc-road": () => loadSouq(fcRoadExtract, fcRoadLoop, PALETTES["pune-fc-road"] as Palette),
  "pune-vieille-ville": () => loadSouq(puneExtract, puneLoop, PALETTES["pune-vieille-ville"] as Palette),
};

/** La ville et la boucle de l'itinéraire ; un identifiant sans ville dans le dépôt est une erreur, pas un repli muet (QUA-002). */
export function cityFor(itineraryId: string): Souq {
  const load = CITIES[itineraryId];
  if (!load) throw new Error(`Itinéraire « ${itineraryId} » : aucune ville dans le dépôt.`);
  return load();
}
