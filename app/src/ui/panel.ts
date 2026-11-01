// Panneau de marche, sur la page : vitesse, distance, temps et opacité de la ville.
// Les valeurs exactes sont aussi en attributs data-*, lues par l'e2e (texte arrondi à l'affichage).
import type { Vec2 } from "../route/geo.ts";
import { OSM_ATTRIBUTION } from "../city/licence.ts";
import { formatSpeedKmh, speedBoundMessage } from "../route/speed.ts";
import { ARRIVAL_TEXT, formatDistanceM, formatDurationS } from "../route/walk.ts";
import type { Zone } from "../safety/zone.ts";
import { formatOpacity } from "../safety/visibility.ts";

export interface WalkInfo {
  speedKmh: number;
  distanceM: number;
  timeS: number;
  cityOpacity: number;
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
  /** La zone tapis réglée et la vignette réelle (APP-001). */
  zone: Zone;
  vignette: boolean;
  /** Marche en pause (gâchette droite) et panneau du casque affiché (bouton B). */
  paused: boolean;
  showPanel: boolean;
  /** Où le parcours est posé après un recalage (bouton A) : position en mètres et cap en radians. */
  calibration: { x: number; z: number; yawRad: number };
}

export interface WalkPanel {
  update(info: WalkInfo): void;
  remove(): void;
}

/** N'écrit que ce qui change : le panneau est mis à jour à chaque image (72 par seconde). */
function show(el: HTMLElement, text: string): void {
  if (el.textContent !== text) el.textContent = text;
}

export function renderWalkPanel(doc: Document, root: HTMLElement): WalkPanel {
  const panel = doc.createElement("section");
  panel.setAttribute("aria-label", "Marche");
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
  pause.textContent = "Marche en pause : la gâchette droite la reprend.";
  pause.hidden = true;
  panel.append(list, limit, pause, arrival, credit);
  root.append(panel);
  return {
    remove: () => {
      panel.remove();
    },
    update(info) {
      show(speed, formatSpeedKmh(info.speedKmh));
      show(distance, formatDistanceM(info.distanceM));
      show(time, formatDurationS(info.timeS));
      show(opacity, formatOpacity(info.cityOpacity));
      show(credit, info.attribution);
      const bound = speedBoundMessage(info.speedKmh);
      show(limit, bound);
      limit.hidden = bound === "";
      arrival.hidden = !info.arrived;
      pause.hidden = !info.paused;
      panel.dataset.paused = String(info.paused);
      panel.dataset.hudVisible = String(info.showPanel);
      panel.dataset.calibrationX = String(info.calibration.x);
      panel.dataset.calibrationZ = String(info.calibration.z);
      panel.dataset.calibrationYaw = String(info.calibration.yawRad);
      const z = info.zone;
      panel.dataset.zone = [z.x, z.z, z.yawRad, z.width, z.depth, z.height].map((v) => v.toFixed(3)).join(" ");
      panel.dataset.vignette = String(info.vignette);
      panel.dataset.arrived = String(info.arrived);
      panel.dataset.speedKmh = String(info.speedKmh);
      panel.dataset.distanceM = String(info.distanceM);
      panel.dataset.timeS = String(info.timeS);
      panel.dataset.cityOpacity = String(info.cityOpacity);
      panel.dataset.positionX = String(info.position.x);
      panel.dataset.positionZ = String(info.position.z);
      panel.dataset.buildingCount = String(info.buildingCount);
      panel.dataset.rendering = info.rendering;
      panel.dataset.tileCount = String(info.tileCount);
    },
  };
}
