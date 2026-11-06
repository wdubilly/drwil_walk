import { DEFAULT_SPEED_KMH, MIN_SPEED_KMH, SPEED_RANGE_TEXT, SPEED_STEP_KMH, clampSpeedKmh, speedLimitMessage, formatSpeedKmh } from "../route/speed.ts";
import { OSM_ATTRIBUTION } from "../city/licence.ts";
import { documentTexture, localMaterialsFor, type LocalMaterials } from "../city/material-library.ts";
import type { WeightStorage } from "../route/stats.ts";
import { renderPcButton } from "../pc/pc-button.ts";
import { renderRouteChoice } from "./route-choice.ts";
import { createPreferenceStore, type PreferenceStore } from "./preferences.ts";

export const ENTER_LABEL = "Entrer en réalité mixte";

export interface HomeView {
  readSpeedKmh(): number;
  readRouteId(): string;
  readMaterials(): LocalMaterials | undefined;
  preferences: PreferenceStore;
  showNotice(text: string): void;
  onEnter(handler: () => void): void;
  onEnterPc(handler: () => void): void;
  setEntering(entering: boolean): void;
  showStatus(text: string): void;
  root: HTMLElement;
}

export function renderHome(doc: Document, root: HTMLElement, storage?: WeightStorage): HomeView {
  const routes = renderRouteChoice(doc);
  const title = Object.assign(doc.createElement("h1"), { textContent: "drwil_walk" });
  const reminder = doc.createElement("ul");
  reminder.setAttribute("aria-label", "Rappel de sécurité");
  for (const text of [
    "Clé de sécurité du tapis attachée à vos vêtements.", "Une main près de la rampe.",
    "Vitesse modérée : baissez la tête pour voir le tapis, la ville s'efface.",
  ]) reminder.append(Object.assign(doc.createElement("li"), { textContent: text }));
  const speed = Object.assign(doc.createElement("input"), {
    type: "number", min: String(MIN_SPEED_KMH), step: String(SPEED_STEP_KMH), value: DEFAULT_SPEED_KMH.toFixed(1),
  });
  const label = doc.createElement("label");
  label.append("Vitesse de départ (km/h) ", speed);
  const speedHint = Object.assign(doc.createElement("p"), { className: "speed-hint", textContent: SPEED_RANGE_TEXT });
  const speedLimit = Object.assign(doc.createElement("p"), { className: "speed-limit" });
  speedLimit.setAttribute("aria-live", "polite");
  const announce = (): number => {
    const raw = Number(speed.value.replace(",", "."));
    speedLimit.textContent = speedLimitMessage(raw);
    return clampSpeedKmh(raw);
  };
  speed.addEventListener("input", announce);
  speed.addEventListener("change", () => { speed.value = formatSpeedKmh(announce()).replace(" km/h", "").replace(",", "."); });
  const button = Object.assign(doc.createElement("button"), { type: "button", textContent: ENTER_LABEL, className: "enter" });
  const pcButton = renderPcButton(doc);
  const status = doc.createElement("p");
  status.setAttribute("role", "status");
  const notice = doc.createElement("p");
  notice.setAttribute("role", "alert");
  const credit = Object.assign(doc.createElement("p"), { className: "attribution", textContent: OSM_ATTRIBUTION });
  const showNotice = (text: string): void => { notice.textContent = text; };
  const preferences = createPreferenceStore(storage, showNotice);
  root.replaceChildren(title, routes.element, reminder, label, speedHint, speedLimit, button, pcButton, status, notice, credit);
  const start = (handler: () => void) => (): void => {
    root.dataset["route"] = routes.readId();
    root.dataset["profile"] = preferences.read().profile;
    handler();
  };
  return {
    root, preferences, readSpeedKmh: announce, readRouteId: () => routes.readId(),
    readMaterials: () => localMaterialsFor(routes.readId(), (url) => documentTexture(doc, url)),
    showNotice,
    onEnter: (handler) => { button.addEventListener("click", start(handler)); },
    onEnterPc: (handler) => { pcButton.addEventListener("click", start(handler)); },
    setEntering: (entering) => { button.disabled = entering; pcButton.disabled = entering; },
    showStatus: (text) => { status.textContent = text; },
  };
}
