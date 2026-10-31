// L'itinéraire libre à l'accueil : départ et arrivée posés en touchant la carte ou en cherchant une adresse (les deux se
// remplissent mutuellement), puis le calcul du chemin à pied. Aucun point ni aucune adresse n'est gardé : tout vit dans cette
// page, jusqu'à la fermeture, et ne part qu'aux services de géocodage et de routage choisis (aucune donnée personnelle conservée).
import type { PlannedTrip, TripPlanner } from "../city/free-route.ts";
import type { LonLat } from "../route/geo.ts";
import { roundedCoordinates } from "../route/providers.ts";
import { createMapPicker, type MarkerKind } from "./map-picker.ts";

export interface FreeTrip {
  element: HTMLElement;
  /** Montre ou cache la section ; la carte ne demande ses tuiles qu'à la première ouverture. */
  setVisible(visible: boolean): void;
  /** Le trajet calculé et sa ville, ou rien tant qu'il n'est pas prêt. */
  readTrip(): PlannedTrip | null;
}

const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));
const FIELDS: readonly { kind: MarkerKind; label: string }[] = [
  { kind: "from", label: "Départ" },
  { kind: "to", label: "Arrivée" },
];

export function renderFreeTrip(doc: Document, planner: TripPlanner): FreeTrip {
  const element = doc.createElement("section");
  element.className = "free-trip";
  element.setAttribute("aria-label", "Itinéraire libre");
  element.hidden = true;
  const message = doc.createElement("p");
  message.className = "free-message";
  message.setAttribute("aria-live", "polite");
  const say = (text: string): void => {
    message.textContent = text;
  };
  const points: Record<MarkerKind, LonLat | null> = { from: null, to: null };
  let trip: PlannedTrip | null = null;
  const map = createMapPicker(doc, (point) => { pick(point); });
  const inputs = {} as Record<MarkerKind, HTMLInputElement>;

  const prompt = (): string =>
    points.from === null
      ? "Touchez la carte pour poser le départ, ou cherchez une adresse."
      : points.to === null
        ? "Départ posé. Touchez la carte pour poser l'arrivée, ou cherchez une adresse."
        : "Départ et arrivée posés : calculez le trajet.";
  const place = (kind: MarkerKind, point: LonLat | null, text: string): void => {
    points[kind] = point;
    trip = null;
    inputs[kind].value = text;
    map.setMarker(kind, point);
  };
  function clear(): void {
    place("from", null, "");
    place("to", null, "");
    say(prompt());
  }
  function pick(point: LonLat): void {
    // Un troisième toucher recommence un trajet.
    if (points.from !== null && points.to !== null) clear();
    const kind: MarkerKind = points.from === null ? "from" : "to";
    place(kind, point, roundedCoordinates(point));
    say(prompt());
    void planner.describe(point).then((address) => {
      if (points[kind] === point) inputs[kind].value = address;
    });
  }
  async function search(kind: MarkerKind): Promise<void> {
    try {
      const found = await planner.find(inputs[kind].value);
      place(kind, found.point, found.label);
      map.centerOn(found.point);
      say(`Retenu : ${found.label}. ${prompt()}`);
    } catch (error) {
      say(errorText(error));
    }
  }
  async function compute(): Promise<void> {
    const [from, to] = [points.from, points.to];
    if (from === null || to === null) {
      say("Posez d'abord un départ et une arrivée.");
      return;
    }
    say("Calcul du trajet…");
    try {
      const planned = await planner.plan(from, to);
      // Les points ont changé pendant le calcul : ce trajet n'est plus celui demandé.
      if (points.from !== from || points.to !== to) return;
      trip = planned;
      say(planned.summary);
    } catch (error) {
      say(errorText(error));
    }
  }

  const button = (text: string, action: () => void): HTMLButtonElement => {
    const b = doc.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.addEventListener("click", action);
    return b;
  };
  for (const { kind, label } of FIELDS) {
    const input = doc.createElement("input");
    input.type = "text";
    input.placeholder = "Lieu ou adresse";
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") void search(kind);
    });
    inputs[kind] = input;
    const wrapper = doc.createElement("label");
    wrapper.append(`${label} `, input);
    element.append(wrapper, button(`Chercher ${label.toLowerCase()}`, () => { void search(kind); }));
  }
  say(prompt());
  element.append(map.element, button("Calculer le trajet", () => { void compute(); }), button("Effacer", clear), message);
  return {
    element,
    setVisible: (visible) => {
      element.hidden = !visible;
      if (visible) map.show();
    },
    readTrip: () => trip,
  };
}
