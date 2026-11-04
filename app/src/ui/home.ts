// Écran d'accueil (MISSION.md, « Écran d'accueil ») : vitesse de départ, opacité de la ville,
// choix de l'itinéraire, rappel de sécurité et bouton d'entrée en réalité mixte. Construit en DOM simple, sans framework.
import { renderLampsChoice } from "./lamps-choice.ts";
import { DEFAULT_SPEED_KMH, MIN_SPEED_KMH, SPEED_RANGE_TEXT, SPEED_STEP_KMH, clampSpeedKmh, speedLimitMessage, formatSpeedKmh } from "../route/speed.ts";
import { GOOGLE_ATTRIBUTION, OSM_ATTRIBUTION } from "../city/licence.ts";
import type { TripPlanner, PlannedTrip } from "../city/free-route.ts";
import { clearWeightKg, loadWeightKg, parseWeightKg, saveWeightKg, MAX_WEIGHT_KG, MIN_WEIGHT_KG, DEFAULT_WEIGHT_KG, type WeightStorage } from "../route/stats.ts";
import { FREE_ITINERARY_ID } from "../route/itineraries.ts";
import { hasLocalMaterials, localMaterialsFor, type LocalMaterials } from "../city/material-library.ts";
import { renderPcButton } from "../pc/pc-button.ts";
import { renderFreeTrip } from "./free-trip.ts";
import { renderPanelSide, type PanelSide } from "./panel-side.ts";
import { renderProfileChoice } from "./profile-choice.ts";
import type { ProfileId } from "../render/profiles.ts";
import { renderRenderChoice, type Rendering } from "./render-choice.ts";
import { renderRouteChoice } from "./route-choice.ts";
import { DEFAULT_GLOBAL_OPACITY_PCT, MAX_GLOBAL_OPACITY_PCT, MIN_GLOBAL_OPACITY_PCT, clampGlobalOpacityPct } from "../safety/visibility.ts";

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
  /** Les matériaux locaux de l'itinéraire s'ils sont choisis (prototype, seulement là où une bibliothèque existe). */
  readMaterials(): LocalMaterials | undefined;
  /** Le poids saisi (facultatif, gardé dans ce navigateur seulement) ; rien : la valeur moyenne s'applique aux calories. */
  readWeightKg(): number | undefined;
  /** Le côté du panneau d'infos dans le casque (gauche ou droite), gardé dans ce navigateur seulement (APP-002). */
  readPanelSide(): PanelSide;
  /** La vignette réelle (périphérie en passthrough), activée par défaut (APP-001). */
  readVignette(): boolean;
  /** Le brouillard d'ambiance : éteint tant que l'utilisateur ne l'allume pas (APP-011). */
  readFog(): boolean;
  /** Le volume des sons d'ambiance en pour cent : 0 (coupé) par défaut (APP-011). */
  readSoundPct(): number;
  /** Le profil graphique choisi (APP-006) : le choix gardé, sinon celui proposé par l'appareil. */
  readProfile(): ProfileId;
  /** Le profil proposé d'après l'appareil, sans effet si un choix existe. */
  proposeProfile(profile: ProfileId): void;
  /** Une raison qui reste lisible pendant la marche (ex. repli sur OpenStreetMap) ; vide l'efface. */
  showNotice: (text: string) => void;
  onEnter(handler: () => void): void;
  /** Le bouton « Version PC » : la marche dans la page, sans session WebXR. */
  onEnterPc(handler: () => void): void;
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

function numberInput(doc: Document, type: string, min: number, max: number | undefined, step: number, value: string) {
  const input = doc.createElement("input");
  input.type = type;
  input.min = String(min);
  if (max !== undefined) input.max = String(max);
  input.step = String(step);
  input.value = value;
  return input;
}

export function renderHome(doc: Document, root: HTMLElement, planner: TripPlanner, storage?: WeightStorage): HomeView {
  const routes = renderRouteChoice(doc);
  const freeTrip = renderFreeTrip(doc, planner);
  const rendering = renderRenderChoice(doc);
  const syncRoute = (): void => {
    freeTrip.setVisible(routes.readId() === FREE_ITINERARY_ID);
    rendering.setLocalAvailable(hasLocalMaterials(routes.readId()));
  };
  routes.onChange(syncRoute);
  syncRoute();
  const title = Object.assign(doc.createElement("h1"), { textContent: "drwil_walk" });
  const reminder = doc.createElement("ul");
  reminder.setAttribute("aria-label", "Rappel de sécurité");
  for (const text of SAFETY_REMINDERS) reminder.append(Object.assign(doc.createElement("li"), { textContent: text }));
  const speed = numberInput(doc, "number", MIN_SPEED_KMH, undefined, SPEED_STEP_KMH, DEFAULT_SPEED_KMH.toFixed(1));
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
  const opacity = numberInput(doc, "range", MIN_GLOBAL_OPACITY_PCT, MAX_GLOBAL_OPACITY_PCT, 10, String(DEFAULT_GLOBAL_OPACITY_PCT));
  // Ambiance (APP-011) : rien n'est gardé d'une séance à l'autre, le brouillard arrive éteint et les sons coupés.
  const fog = Object.assign(doc.createElement("input"), { type: "checkbox", checked: false });
  const sound = numberInput(doc, "range", 0, 100, 10, "0");
  const vignette = Object.assign(doc.createElement("input"), { type: "checkbox", checked: true });
  const button = Object.assign(doc.createElement("button"), { type: "button", textContent: ENTER_LABEL, className: "enter" });
  const pcButton = renderPcButton(doc);
  const status = doc.createElement("p");
  status.setAttribute("role", "status");
  const credit = doc.createElement("p");
  credit.className = "attribution";
  credit.textContent = OSM_ATTRIBUTION;
  // La mention de Google s'ajoute à celle d'OpenStreetMap dès que son rendu est choisi (APP-003).
  const googleCredit = Object.assign(doc.createElement("span"), { className: "attribution-google", textContent: ` · ${GOOGLE_ATTRIBUTION}`, hidden: true });
  credit.append(googleCredit);
  rendering.onChange(() => { googleCredit.hidden = rendering.readRendering() !== "google"; });
  // Une alerte à part du statut : l'ouverture de la session réécrit le statut, pas ce repli.
  const notice = doc.createElement("p");
  notice.setAttribute("role", "alert");
  notice.className = "notice";
  const panelSide = renderPanelSide(doc, storage, notice);
  const profile = renderProfileChoice(doc, storage, notice);
  const weight = numberInput(doc, "number", MIN_WEIGHT_KG, MAX_WEIGHT_KG, 0.5, String(loadWeightKg(storage) ?? ""));
  weight.placeholder = `${String(DEFAULT_WEIGHT_KG)} par défaut`;
  const keep = (ok: boolean): void => { notice.textContent = ok ? "" : "Le poids ne peut pas être gardé dans ce navigateur : il sert seulement pour cette séance."; };
  weight.addEventListener("change", () => {
    const kg = parseWeightKg(weight.value);
    keep(kg === undefined ? clearWeightKg(storage) : saveWeightKg(storage, kg));
  });
  const erase = Object.assign(doc.createElement("button"), { type: "button", textContent: "Effacer mon poids" });
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
    profile.element,
    reminder,
    field(doc, "Vitesse de départ (km/h)", speed),
    speedHint,
    speedLimit,
    field(doc, "Opacité de la ville (%)", opacity),
    field(doc, "Vignette réelle (le réel reste visible sur les bords)", vignette),
    field(doc, "Brouillard (léger, jamais au point de masquer un obstacle)", fog),
    renderLampsChoice(doc),
    field(doc, "Sons d'ambiance (%, coupés par défaut)", sound),
    field(doc, "Poids (kg, facultatif : pour les calories, gardé sur ce casque seulement)", weight),
    erase,
    button,
    pcButton,
    status,
    notice,
    credit,
  );
  // L'itinéraire qui démarre est lisible sur la page, comme le panneau de marche.
  const start = (handler: () => void) => (): void => {
    root.dataset["route"] = routes.readId();
    root.dataset["panelSide"] = panelSide.readSide();
    root.dataset["profile"] = profile.readProfile();
    handler();
  };
  return {
    root,
    readSpeedKmh: announce,
    readOpacityPct: () => clampGlobalOpacityPct(Number(opacity.value)),
    readRouteId: () => routes.readId(),
    readTrip: () => freeTrip.readTrip(),
    readRendering: rendering.readRendering,
    readMaterials: () => (rendering.readLocalMaterials() ? localMaterialsFor(routes.readId()) : undefined),
    readWeightKg: () => parseWeightKg(weight.value),
    readPanelSide: panelSide.readSide,
    readVignette: () => vignette.checked,
    readFog: () => fog.checked,
    readSoundPct: () => Number(sound.value),
    readProfile: profile.readProfile,
    proposeProfile: profile.propose,
    showNotice: (text) => { notice.textContent = text; },
    onEnter: (handler) => { button.addEventListener("click", start(handler)); },
    onEnterPc: (handler) => { pcButton.addEventListener("click", start(handler)); },
    setEntering: (entering) => {
      button.disabled = entering;
      pcButton.disabled = entering;
    },
    showStatus: (text) => { status.textContent = text; },
  };
}
