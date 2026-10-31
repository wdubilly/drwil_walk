// Écran d'accueil (MISSION.md, « Écran d'accueil ») : vitesse de départ, opacité de la ville,
// choix de l'itinéraire, rappel de sécurité et bouton d'entrée en réalité mixte. Construit en DOM simple, sans framework.
import { DEFAULT_SPEED_KMH, MAX_SPEED_KMH, MIN_SPEED_KMH, SPEED_STEP_KMH, clampSpeedKmh } from "../route/speed.ts";
import { renderRouteChoice } from "./route-choice.ts";
import {
  DEFAULT_GLOBAL_OPACITY_PCT,
  MAX_GLOBAL_OPACITY_PCT,
  MIN_GLOBAL_OPACITY_PCT,
  clampGlobalOpacityPct,
} from "../safety/visibility.ts";

export const ENTER_LABEL = "Entrer en réalité mixte";

const SAFETY_REMINDERS = [
  "Clé de sécurité du tapis attachée à vos vêtements.",
  "Une main près de la rampe.",
  "Vitesse modérée : baissez la tête pour voir le tapis, la ville s'efface.",
];

export interface HomeView {
  /** Vitesse de départ saisie, bornée. */
  readSpeedKmh(): number;
  /** Opacité globale saisie, bornée entre 30 et 100 % (APP-001). */
  readOpacityPct(): number;
  /** L'itinéraire choisi (jamais un itinéraire « bientôt »). */
  readRouteId(): string;
  onEnter(handler: () => void): void;
  setEntering(entering: boolean): void;
  showStatus(text: string): void;
  /** Le conteneur où le panneau de marche s'ajoute. */
  root: HTMLElement;
}

function field(doc: Document, label: string, input: HTMLInputElement): HTMLLabelElement {
  const wrapper = doc.createElement("label");
  wrapper.append(`${label} `, input);
  return wrapper;
}

function numberInput(doc: Document, type: string, min: number, max: number, step: number, value: string) {
  const input = doc.createElement("input");
  input.type = type;
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = value;
  return input;
}

export function renderHome(doc: Document, root: HTMLElement): HomeView {
  const routes = renderRouteChoice(doc);
  const title = doc.createElement("h1");
  title.textContent = "drwil_walk";
  const reminder = doc.createElement("ul");
  reminder.setAttribute("aria-label", "Rappel de sécurité");
  for (const text of SAFETY_REMINDERS) {
    const item = doc.createElement("li");
    item.textContent = text;
    reminder.append(item);
  }
  const speed = numberInput(doc, "number", MIN_SPEED_KMH, MAX_SPEED_KMH, SPEED_STEP_KMH, DEFAULT_SPEED_KMH.toFixed(1));
  const opacity = numberInput(
    doc,
    "range",
    MIN_GLOBAL_OPACITY_PCT,
    MAX_GLOBAL_OPACITY_PCT,
    10,
    String(DEFAULT_GLOBAL_OPACITY_PCT),
  );
  const button = doc.createElement("button");
  button.type = "button";
  button.textContent = ENTER_LABEL;
  button.className = "enter";
  const status = doc.createElement("p");
  status.setAttribute("role", "status");
  root.replaceChildren(
    title,
    routes.element,
    reminder,
    field(doc, "Vitesse de départ (km/h)", speed),
    field(doc, "Opacité de la ville (%)", opacity),
    button,
    status,
  );
  return {
    root,
    readSpeedKmh: () => clampSpeedKmh(Number(speed.value.replace(",", "."))),
    readOpacityPct: () => clampGlobalOpacityPct(Number(opacity.value)),
    readRouteId: () => routes.readId(),
    onEnter: (handler) => {
      button.addEventListener("click", () => {
        // L'itinéraire qui démarre est lisible sur la page, comme le panneau de marche.
        root.dataset["route"] = routes.readId();
        handler();
      });
    },
    setEntering: (entering) => {
      button.disabled = entering;
    },
    showStatus: (text) => {
      status.textContent = text;
    },
  };
}
