// Choix de l'itinéraire à l'accueil : des cartes avec image, en boutons radio (clavier, manette et pointeur
// du navigateur du casque les manient comme n'importe quelle case). Un itinéraire « bientôt » est désactivé.
import { DEFAULT_ITINERARY_ID, ITINERARIES, type Itinerary } from "../route/itineraries.ts";

export const SOON_LABEL = "Bientôt";

export interface RouteChoice {
  element: HTMLElement;
  /** L'itinéraire choisi ; jamais un itinéraire « bientôt ». */
  readId(): string;
}

function text(doc: Document, className: string, content: string): HTMLSpanElement {
  const span = doc.createElement("span");
  span.className = className;
  span.textContent = content;
  return span;
}

function card(doc: Document, itinerary: Itinerary): HTMLLabelElement {
  const label = doc.createElement("label");
  label.className = "card";
  const radio = doc.createElement("input");
  radio.type = "radio";
  radio.name = "itineraire";
  radio.value = itinerary.id;
  radio.checked = itinerary.id === DEFAULT_ITINERARY_ID;
  radio.disabled = !itinerary.available;
  const image = doc.createElement("img");
  image.src = itinerary.image;
  // Décorative : le nom de la carte dit déjà l'itinéraire.
  image.alt = "";
  label.append(radio, image, text(doc, "card-name", itinerary.name), text(doc, "card-place", itinerary.place));
  if (!itinerary.available) label.append(text(doc, "card-soon", SOON_LABEL));
  return label;
}

export function renderRouteChoice(doc: Document): RouteChoice {
  const element = doc.createElement("fieldset");
  element.className = "routes";
  const legend = doc.createElement("legend");
  legend.textContent = "Itinéraire";
  element.append(legend, ...ITINERARIES.map((itinerary) => card(doc, itinerary)));
  return {
    element,
    readId: () => element.querySelector<HTMLInputElement>("input:checked")?.value ?? DEFAULT_ITINERARY_ID,
  };
}
