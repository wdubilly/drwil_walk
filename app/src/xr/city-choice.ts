// La ville de l'itinéraire choisi à l'accueil, commune au casque et à la version PC (APP-002).
import { cityFor } from "../city/cities.ts";
import type { Souq } from "../city/souq-data.ts";
import type { HomeView } from "../ui/home.ts";

/** La ville embarquée de l'itinéraire choisi. */
export function chosenCity(home: HomeView): Souq {
  return cityFor(home.readRouteId());
}
