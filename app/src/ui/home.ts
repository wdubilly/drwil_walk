// Écran d'accueil (MISSION.md, « Écran d'accueil ») : vitesse de départ, opacité de la ville,
// choix de l'itinéraire, rappel de sécurité et bouton d'entrée en réalité mixte. Construit en DOM simple, sans framework.
import { DEFAULT_SPEED_KMH, MAX_SPEED_KMH, MIN_SPEED_KMH, SPEED_RANGE_TEXT, SPEED_STEP_KMH, clampSpeedKmh, speedLimitMessage, formatSpeedKmh } from "../route/speed.ts";
import { GOOGLE_ATTRIBUTION, OSM_ATTRIBUTION } from "../city/licence.ts";
import type { TripPlanner, PlannedTrip } from "../city/free-route.ts";
import { clearWeightKg, loadWeightKg, parseWeightKg, saveWeightKg, MAX_WEIGHT_KG, MIN_WEIGHT_KG, DEFAULT_WEIGHT_KG, type WeightStorage } from "../route/stats.ts";
import { FREE_ITINERARY_ID } from "../route/itineraries.ts";
import { renderFreeTrip } from "./free-trip.ts";
import { renderPanelSide, type PanelSide } from "./panel-side.ts";
import { renderRenderChoice, type Rendering } from "./render-choice.ts";
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
  /** Le trajet libre prêt (chemin calculé, ville chargée), ou rien tant que l'accueil ne l'a pas préparé. */
  readTrip(): PlannedTrip | null;
  /** Le rendu choisi : OpenStreetMap par défaut, ou Google 3D. */
  readRendering: () => Rendering;
  /** Le poids saisi (facultatif, gardé dans ce navigateur seulement) ; rien : la valeur moyenne s'applique aux calories. */
  readWeightKg(): number | undefined;
  /** Le côté du panneau d'infos dans le casque (gauche ou droite), gardé dans ce navigateur seulement (APP-002). */
  readPanelSide(): PanelSide;
  /** La vignette réelle (périphérie en passthrough), activée par défaut (APP-001). */
  readVignette(): boolean;
  /** Les contours des bâtiments, désactivés par défaut tant que la cadence n'est pas mesurée au casque. */
  readOutlines(): boolean;
  /** Une raison qui reste lisible pendant la marche (ex. repli sur OpenStreetMap) ; vide l'efface. */
  showNotice: (text: string) => void;
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

export function renderHome(doc: Document, root: HTMLElement, planner: TripPlanner, storage?: WeightStorage): HomeView {
  const routes = renderRouteChoice(doc);
  const freeTrip = renderFreeTrip(doc, planner);
  const syncFree = (): void => {
    freeTrip.setVisible(routes.readId() === FREE_ITINERARY_ID);
  };
  routes.onChange(syncFree);
  const rendering = renderRenderChoice(doc);
  const title = Object.assign(doc.createElement("h1"), { textContent: "drwil_walk" });
  const reminder = doc.createElement("ul");
  reminder.setAttribute("aria-label", "Rappel de sécurité");
  for (const text of SAFETY_REMINDERS) reminder.append(Object.assign(doc.createElement("li"), { textContent: text }));
  const speed = numberInput(doc, "number", MIN_SPEED_KMH, MAX_SPEED_KMH, SPEED_STEP_KMH, DEFAULT_SPEED_KMH.toFixed(1));
  const speedHint = Object.assign(doc.createElement("p"), { className: "speed-hint", textContent: SPEED_RANGE_TEXT });
  const speedLimit = Object.assign(doc.createElement("p"), { className: "speed-limit" });
  speedLimit.setAttribute("aria-live", "polite");
  const rawSpeed = (): number => Number(speed.value.replace(",", "."));
  const announce = (): number => {
    speedLimit.textContent = speedLimitMessage(rawSpeed());
    return clampSpeedKmh(rawSpeed());
  };
  speed.addEventListener("input", announce);
  speed.addEventListener("change", () => {
    speed.value = formatSpeedKmh(announce()).replace(" km/h", "").replace(",", ".");
  });
  const opacity = numberInput(
    doc,
    "range",
    MIN_GLOBAL_OPACITY_PCT,
    MAX_GLOBAL_OPACITY_PCT,
    10,
    String(DEFAULT_GLOBAL_OPACITY_PCT),
  );
  const vignette = doc.createElement("input");
  vignette.type = "checkbox";
  vignette.checked = true;
  const outlines = doc.createElement("input");
  outlines.type = "checkbox";
  const button = doc.createElement("button");
  button.type = "button";
  button.textContent = ENTER_LABEL;
  button.className = "enter";
  const status = doc.createElement("p");
  status.setAttribute("role", "status");
  const credit = doc.createElement("p");
  credit.className = "attribution";
  credit.textContent = OSM_ATTRIBUTION;
  // La mention de Google s'ajoute à celle d'OpenStreetMap dès que son rendu est choisi (APP-003).
  const googleCredit = doc.createElement("span");
  googleCredit.className = "attribution-google";
  googleCredit.textContent = ` · ${GOOGLE_ATTRIBUTION}`;
  googleCredit.hidden = true;
  credit.append(googleCredit);
  rendering.onChange(() => {
    googleCredit.hidden = rendering.readRendering() !== "google";
  });
  // Une alerte à part du statut : l'ouverture de la session réécrit le statut, pas ce repli.
  const notice = doc.createElement("p");
  notice.setAttribute("role", "alert");
  notice.className = "notice";
  const panelSide = renderPanelSide(doc, storage, notice);
  const weight = numberInput(doc, "number", MIN_WEIGHT_KG, MAX_WEIGHT_KG, 0.5, String(loadWeightKg(storage) ?? ""));
  weight.placeholder = `${String(DEFAULT_WEIGHT_KG)} par défaut`;
  const keep = (ok: boolean): void => {
    notice.textContent = ok ? "" : "Le poids ne peut pas être gardé dans ce navigateur : il sert seulement pour cette séance.";
  };
  weight.addEventListener("change", () => {
    const kg = parseWeightKg(weight.value);
    keep(kg === undefined ? clearWeightKg(storage) : saveWeightKg(storage, kg));
  });
  const erase = doc.createElement("button");
  erase.type = "button";
  erase.textContent = "Effacer mon poids";
  erase.addEventListener("click", () => {
    weight.value = "";
    keep(clearWeightKg(storage));
  });
  root.replaceChildren(
    title,
    routes.element,
    freeTrip.element,
    rendering.element,
    panelSide.element,
    reminder,
    field(doc, "Vitesse de départ (km/h)", speed),
    speedHint,
    speedLimit,
    field(doc, "Opacité de la ville (%)", opacity),
    field(doc, "Vignette réelle (le réel reste visible sur les bords)", vignette),
    field(doc, "Contours des bâtiments (à essayer : peut ralentir l'image)", outlines),
    field(doc, "Poids (kg, facultatif : pour les calories, gardé sur ce casque seulement)", weight),
    erase,
    button,
    status,
    notice,
    credit,
  );
  return {
    root,
    readSpeedKmh: announce,
    readOpacityPct: () => clampGlobalOpacityPct(Number(opacity.value)),
    readRouteId: () => routes.readId(),
    readTrip: () => freeTrip.readTrip(),
    readRendering: rendering.readRendering,
    readWeightKg: () => parseWeightKg(weight.value),
    readPanelSide: panelSide.readSide,
    readVignette: () => vignette.checked,
    readOutlines: () => outlines.checked,
    showNotice: (text) => {
      notice.textContent = text;
    },
    onEnter: (handler) => {
      button.addEventListener("click", () => {
        // L'itinéraire qui démarre est lisible sur la page, comme le panneau de marche.
        root.dataset["route"] = routes.readId();
        root.dataset["panelSide"] = panelSide.readSide();
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
