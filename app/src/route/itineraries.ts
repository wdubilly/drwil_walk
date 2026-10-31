// Les itinéraires proposés à l'accueil (MISSION.md). Données, pas du code (l'illustration de chaque carte est `app/src/ui/<id>.svg`) : la ville de chacun s'ajoutera
// quand son extrait OpenStreetMap existera (docs/intentions/autres-itineraires.md).
export interface Itinerary {
  id: string;
  name: string;
  /** Une ligne pour situer la balade. */
  place: string;
  /** Faux tant que la ville de l'itinéraire n'est pas dans le dépôt : visible, mais impossible à démarrer. */
  available: boolean;
}

export const DEFAULT_ITINERARY_ID = "pune-vieille-ville";

export const ITINERARIES: readonly Itinerary[] = [
  {
    id: DEFAULT_ITINERARY_ID,
    name: "Pune Vieille ville",
    place: "Shaniwar Wada, temple Dagdusheth Ganpati",
    available: true,
  },
  {
    id: "pune-fc-road",
    name: "Pune FC Road",
    place: "Ferguson College Road",
    available: false,
  },
  {
    id: "doha-corniche",
    name: "Doha Corniche",
    place: "Musée d'art islamique, West Bay",
    available: false,
  },
  {
    id: "doha-souq-waqif",
    name: "Doha Souq Waqif",
    place: "Le souk et ses ruelles",
    available: false,
  },
];
