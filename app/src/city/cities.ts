// Les villes que le casque sait afficher, par identifiant d'itinéraire : chacune est un extrait OpenStreetMap
// et une boucle versionnés dans app/data/ (APP-003, APP-002). Un itinéraire « bientôt » n'y figure pas encore.
import cornicheExtract from "../../data/doha-corniche.json" with { type: "json" };
import cornicheLoop from "../../data/doha-corniche-boucle.json" with { type: "json" };
import puneExtract from "../../data/pune-vieille-ville.json" with { type: "json" };
import puneLoop from "../../data/pune-vieille-ville-boucle.json" with { type: "json" };
import souqExtract from "../../data/souq-waqif.json" with { type: "json" };
import souqLoop from "../../data/souq-waqif-boucle.json" with { type: "json" };
import { loadSouq, type Souq } from "./souq-data.ts";

const CITIES: Record<string, () => Souq> = {
  "doha-corniche": () => loadSouq(cornicheExtract, cornicheLoop),
  "doha-souq-waqif": () => loadSouq(souqExtract, souqLoop),
  "pune-vieille-ville": () => loadSouq(puneExtract, puneLoop),
};

/** La ville et la boucle de l'itinéraire ; un identifiant sans ville dans le dépôt est une erreur, pas un repli muet (QUA-002). */
export function cityFor(itineraryId: string): Souq {
  const load = CITIES[itineraryId];
  if (!load) throw new Error(`Itinéraire « ${itineraryId} » : aucune ville dans le dépôt.`);
  return load();
}
