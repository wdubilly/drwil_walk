// La ville de l'itinéraire choisi à l'accueil, commune au casque et à la version PC (APP-002).
import { cityFor } from "../city/cities.ts";
import type { Souq } from "../city/souq-data.ts";
import { FREE_ITINERARY_ID } from "../route/itineraries.ts";
import type { HomeView } from "../ui/home.ts";

/** La ville de l'itinéraire choisi ; un trajet libre non préparé est une erreur dite, pas une marche dans le vide (QUA-002). */
export function chosenCity(home: HomeView): Souq {
  const id = home.readRouteId();
  if (id !== FREE_ITINERARY_ID) return cityFor(id);
  const trip = home.readTrip();
  if (!trip) throw new Error("Itinéraire libre : posez un départ et une arrivée, puis calculez le trajet.");
  return trip.souq;
}
