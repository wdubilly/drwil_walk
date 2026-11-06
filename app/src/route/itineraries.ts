// Les itinéraires proposés à l'accueil : lus dans le catalogue des villes (`app/data/villes.json`, APP-003), dans son ordre ;
// une ville créée par `npm run city` y figure sans code. L'illustration de la carte est `app/src/ui/<id>.svg`, sinon un visuel commun.
import { CATALOG } from "../city/cities.ts";

export interface Itinerary {
  id: string;
  name: string;
  /** Une ligne pour situer la balade. */
  place: string;
  /** Faux : visible, mais impossible à démarrer (aucune ville du catalogue n'est dans ce cas). */
  available: boolean;
}

export const DEFAULT_ITINERARY_ID = "doha-souq-waqif";

export const ITINERARIES: readonly Itinerary[] = CATALOG.map((c) => ({ id: c.itinerary, name: c.label, place: c.place, available: true }));
