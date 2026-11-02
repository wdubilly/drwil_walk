// Panneau de marche, sur la page : vitesse, distance, temps, allure, distance restante, progression, calories et opacité de la ville.
// Les valeurs exactes sont aussi en attributs data-*, lues par l'e2e (texte arrondi à l'affichage).
import type { Vec2 } from "../route/geo.ts";
import { PC_HELP } from "../pc/keys.ts";
import { OSM_ATTRIBUTION } from "../city/licence.ts";
import { formatSpeedKmh, speedBoundMessage } from "../route/speed.ts";
import { formatKcal, formatPercent } from "../route/stats.ts";
import { ARRIVAL_TEXT, formatDistanceM, formatDurationS, formatKm } from "../route/walk.ts";
import type { Zone } from "../safety/zone.ts";
import { formatOpacity } from "../safety/visibility.ts";

/** Les carrefours de la marche au casque (APP-002), redits ici pour l'e2e : le carrefour qui approche, ses rues vues de l'utilisateur, le tracé quitté. */
export interface JunctionInfo {
  distanceM: number | undefined;
  choices: { bearingDeg: number; isDefault: boolean; chosen: boolean; pointed: boolean }[];
  offRoute: boolean;
}

export interface WalkInfo {
  speedKmh: number;
  distanceM: number;
  timeS: number;
  cityOpacity: number;
  /** Le tableau de bord du casque, redit ici pour l'e2e : calories estimées, poids retenu (saisi ou moyen), cap, heure locale, lieu. */
  kcal: number;
  /** Allure, distance restante et progression : les mêmes valeurs que le casque. */
  pace: string;
  remainingM: number;
  progressPct: number;
  weightKg: number;
  compass: string;
  clock: string;
  place: string;
  /** Position sur le parcours, en mètres depuis le départ (x est, z sud). */
  position: Vec2;
  buildingCount: number;
  /** Le rendu affiché : le repli sur OpenStreetMap se lit ici. */
  rendering: "osm" | "google";
  /** Tuiles Google affichées (0 en rendu OpenStreetMap). */
  tileCount: number;
  /** Les mentions de données de ce qui est affiché (APP-003). */
  attribution: string;
  /** Trajet libre arrivé : le panneau le dit. */
  arrived: boolean;
  /** La zone tapis réglée et la vignette réelle (APP-001) ; sans zone (null) dans la version PC, qui n'a pas de tapis à protéger. */
  zone: Zone | null;
  vignette: boolean;
  /** Marche en pause (gâchette droite) et panneau du casque affiché (bouton B). */
  paused: boolean;
  showPanel: boolean;
  /** Où le parcours est posé après un recalage (bouton A) : position en mètres et cap en radians. */
  calibration: { x: number; z: number; yawRad: number };
  /** Absent dans la version PC, qui ne propose pas de carrefours. */
  junction?: JunctionInfo;
}

export interface WalkPanel {
  update(info: WalkInfo): void;
  remove(): void;
}

/** N'écrit que ce qui change : le panneau est mis à jour à chaque image (72 par seconde). */
function show(el: HTMLElement, text: string): void {
  if (el.textContent !== text) el.textContent = text;
}

/** `pc` : le panneau de la version PC, posé sur le canvas, avec ses commandes et son tableau qui se masque (touche H). */
export function renderWalkPanel(doc: Document, root: HTMLElement, pc = false): WalkPanel {
  const panel = doc.createElement("section");
  panel.setAttribute("aria-label", "Marche");
  if (pc) {
    panel.className = "pc-panel";
    panel.dataset.mode = "pc";
  }
  const list = doc.createElement("dl");
  const row = (field: string, label: string): HTMLElement => {
    const term = doc.createElement("dt");
    term.textContent = label;
    const value = doc.createElement("dd");
    value.dataset.field = field;
    list.append(term, value);
    return value;
  };
  const speed = row("speed", "Vitesse");
  const distance = row("distance", "Distance");
  const time = row("time", "Temps");
  const pace = row("pace", "Allure");
  const remaining = row("remaining", "Distance restante");
  const progress = row("progress", "Progression");
  const kcal = row("kcal", "Calories");
  const opacity = row("opacity", "Opacité de la ville");
  const credit = doc.createElement("p");
  credit.className = "attribution";
  credit.textContent = OSM_ATTRIBUTION;
  const arrival = doc.createElement("p");
  arrival.className = "arrival";
  arrival.textContent = ARRIVAL_TEXT;
  arrival.hidden = true;
  const limit = doc.createElement("p");
  limit.className = "speed-limit";
  limit.setAttribute("aria-live", "polite");
  limit.hidden = true;
  const pause = doc.createElement("p");
  pause.className = "paused";
  pause.textContent = pc ? "Marche en pause : la touche Espace la reprend." : "Marche en pause : la gâchette droite la reprend.";
  pause.hidden = true;
  const crossing = doc.createElement("p");
  crossing.className = "junction";
  crossing.setAttribute("aria-live", "polite");
  crossing.hidden = true;
  panel.append(list, limit, pause, crossing, arrival, credit);
  if (pc) panel.append(Object.assign(doc.createElement("p"), { className: "pc-help", textContent: PC_HELP }));
  root.append(panel);
  return {
    remove: () => {
      panel.remove();
    },
    update(info) {
      show(speed, formatSpeedKmh(info.speedKmh));
      show(distance, formatDistanceM(info.distanceM));
      show(time, formatDurationS(info.timeS));
      show(pace, info.pace);
      show(remaining, formatKm(info.remainingM));
      show(progress, formatPercent(info.progressPct));
      show(kcal, formatKcal(info.kcal));
      show(opacity, formatOpacity(info.cityOpacity));
      show(credit, info.attribution);
      const bound = speedBoundMessage(info.speedKmh);
      show(limit, bound);
      limit.hidden = bound === "";
      arrival.hidden = !info.arrived;
      pause.hidden = !info.paused;
      // Les mentions de données restent lisibles : seul le tableau se masque (APP-003).
      list.hidden = pc && !info.showPanel;
      const junction = info.junction;
      const near = junction?.distanceM;
      show(crossing, near === undefined ? "" : `Carrefour dans ${String(Math.round(near))} m : pointez une rue avec la manette droite, puis appuyez sur la prise.`);
      crossing.hidden = near === undefined;
      panel.dataset.junctionM = near === undefined ? "" : String(near);
      panel.dataset.choices = JSON.stringify(junction?.choices ?? []);
      panel.dataset.offRoute = String(junction?.offRoute ?? false);
      panel.dataset.paused = String(info.paused);
      panel.dataset.hudVisible = String(info.showPanel);
      panel.dataset.calibrationX = String(info.calibration.x);
      panel.dataset.calibrationZ = String(info.calibration.z);
      panel.dataset.calibrationYaw = String(info.calibration.yawRad);
      const z = info.zone;
      panel.dataset.zone = z ? [z.x, z.z, z.yawRad, z.width, z.depth, z.height].map((v) => v.toFixed(3)).join(" ") : "aucune";
      panel.dataset.vignette = String(info.vignette);
      panel.dataset.arrived = String(info.arrived);
      panel.dataset.speedKmh = String(info.speedKmh);
      panel.dataset.distanceM = String(info.distanceM);
      panel.dataset.timeS = String(info.timeS);
      panel.dataset.pace = info.pace;
      panel.dataset.remainingM = String(info.remainingM);
      panel.dataset.progressPct = String(info.progressPct);
      panel.dataset.kcal = String(info.kcal);
      panel.dataset.weightKg = String(info.weightKg);
      panel.dataset.compass = info.compass;
      panel.dataset.clock = info.clock;
      panel.dataset.place = info.place;
      panel.dataset.cityOpacity = String(info.cityOpacity);
      panel.dataset.positionX = String(info.position.x);
      panel.dataset.positionZ = String(info.position.z);
      panel.dataset.buildingCount = String(info.buildingCount);
      panel.dataset.rendering = info.rendering;
      panel.dataset.tileCount = String(info.tileCount);
    },
  };
}
