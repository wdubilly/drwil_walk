// Panneau de marche, sur la page : vitesse, distance, temps et opacité de la ville.
// Les valeurs exactes sont aussi en attributs data-*, lues par l'e2e (texte arrondi à l'affichage).
import type { Vec2 } from "../route/geo.ts";
import { OSM_ATTRIBUTION } from "../city/licence.ts";
import { formatSpeedKmh } from "../route/speed.ts";
import { formatDistanceM, formatDurationS } from "../route/walk.ts";
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
  panel.append(list, credit);
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
