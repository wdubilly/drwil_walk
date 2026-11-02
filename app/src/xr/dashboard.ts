// Les valeurs du tableau de bord de marche (lieu, poids, cap, heure, allure, reste, progression), communes au casque
// et à la version PC : un seul calcul à partir du parcours et de l'état de marche (APP-002).
import { ITINERARIES, type Itinerary } from "../route/itineraries.ts";
import { headingAt, type Path } from "../route/path.ts";
import { compassText, formatClock, formatPace, progressOf } from "../route/stats.ts";
import type { WalkState } from "./frame.ts";

/** Le nom de l'itinéraire choisi, affiché comme lieu. */
export const placeOf = (itineraryId: string): string => (ITINERARIES.find((itinerary) => itinerary.id === itineraryId) as Itinerary).name;

export function walkDashboard(route: Path, state: WalkState, fixed: { place: string; weightKg: number; now: () => Date }) {
  const { remainingM, percent } = progressOf(route, state.distanceM);
  const moving = !state.paused && !state.arrived;
  return {
    place: fixed.place,
    weightKg: fixed.weightKg,
    // Le cap est celui du parcours (la ville défile dans le sens où l'on marche).
    compass: compassText(headingAt(route, state.distanceM)),
    clock: formatClock(fixed.now()),
    pace: formatPace(state.speedKmh, moving),
    remainingM,
    progressPct: percent,
  };
}
