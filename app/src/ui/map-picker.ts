// Carte légère de l'accueil : tuiles OpenStreetMap (avec leur mention), zoom et déplacement par boutons (la manette du casque
// les touche comme n'importe quel bouton), un toucher sur la carte pose un point. Sans bibliothèque : le besoin se
// réduit à afficher des tuiles et à retrouver le point touché. Les tuiles ne se demandent qu'à l'ouverture de la carte.
import type { LonLat } from "../route/geo.ts";
import { OSM_ATTRIBUTION } from "../city/licence.ts";
import { TILE_PX, clampZoom, lonLatToWorld, visibleTiles, worldToLonLat } from "./map-math.ts";

export const MAP_WIDTH_PX = 640;
export const MAP_HEIGHT_PX = 400;
/** Au départ : la Vieille ville de Pune, l'itinéraire par défaut du demandeur. */
const START_CENTER: LonLat = [73.8567, 18.5204];
const START_ZOOM = 14;

export type MarkerKind = "from" | "to";
const MARKER_TEXT: Record<MarkerKind, string> = { from: "A", to: "B" };

export interface MapPicker {
  element: HTMLElement;
  /** À la première ouverture, demande les tuiles. */
  show(): void;
  setMarker(kind: MarkerKind, point: LonLat | null): void;
  centerOn(point: LonLat): void;
}

export function createMapPicker(doc: Document, onPick: (point: LonLat) => void): MapPicker {
  const element = doc.createElement("div");
  element.className = "map-picker";
  const view = doc.createElement("div");
  view.className = "map-view";
  view.setAttribute("role", "img");
  view.setAttribute("aria-label", "Carte : touchez pour poser le départ puis l'arrivée");
  const controls = doc.createElement("div");
  controls.className = "map-controls";
  const credit = doc.createElement("p");
  credit.className = "map-credit";
  credit.textContent = OSM_ATTRIBUTION;
  element.append(view, controls);

  let center = START_CENTER;
  let zoom = START_ZOOM;
  let shown = false;
  const markers: Record<MarkerKind, LonLat | null> = { from: null, to: null };

  const draw = (): void => {
    if (!shown) return;
    const c = lonLatToWorld(center, zoom);
    const children: HTMLElement[] = visibleTiles(center, zoom, MAP_WIDTH_PX, MAP_HEIGHT_PX).map((tile) => {
      const img = doc.createElement("img");
      img.src = tile.url;
      img.alt = "";
      img.style.cssText = `position:absolute;left:${String(tile.left)}px;top:${String(tile.top)}px;width:${String(TILE_PX)}px;height:${String(TILE_PX)}px`;
      return img;
    });
    for (const kind of ["from", "to"] as const) {
      const point = markers[kind];
      if (!point) continue;
      const w = lonLatToWorld(point, zoom);
      const marker = doc.createElement("span");
      marker.className = `marker marker-${kind}`;
      marker.textContent = MARKER_TEXT[kind];
      marker.style.cssText = `position:absolute;left:${String(w.x - c.x + MAP_WIDTH_PX / 2)}px;top:${String(w.y - c.y + MAP_HEIGHT_PX / 2)}px`;
      children.push(marker);
    }
    view.replaceChildren(...children);
  };

  const pan = (dx: number, dy: number): void => {
    const c = lonLatToWorld(center, zoom);
    const size = TILE_PX * 2 ** zoom;
    center = worldToLonLat({ x: c.x + dx, y: Math.max(0, Math.min(size, c.y + dy)) }, zoom);
    draw();
  };
  const button = (label: string, text: string, action: () => void): void => {
    const b = doc.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.setAttribute("aria-label", label);
    b.addEventListener("click", action);
    controls.append(b);
  };
  const [stepX, stepY] = [MAP_WIDTH_PX / 4, MAP_HEIGHT_PX / 4];
  button("Zoom avant", "+", () => {
    zoom = clampZoom(zoom + 1);
    draw();
  });
  button("Zoom arrière", "−", () => {
    zoom = clampZoom(zoom - 1);
    draw();
  });
  button("Carte vers l'ouest", "←", () => { pan(-stepX, 0); });
  button("Carte vers le nord", "↑", () => { pan(0, -stepY); });
  button("Carte vers le sud", "↓", () => { pan(0, stepY); });
  button("Carte vers l'est", "→", () => { pan(stepX, 0); });

  view.addEventListener("click", (event) => {
    const rect = view.getBoundingClientRect();
    const c = lonLatToWorld(center, zoom);
    onPick(worldToLonLat({ x: c.x + event.clientX - rect.left - MAP_WIDTH_PX / 2, y: c.y + event.clientY - rect.top - MAP_HEIGHT_PX / 2 }, zoom));
  });

  return {
    element,
    show: () => {
      // La mention suit les tuiles : elle n'existe qu'une fois la carte ouverte.
      if (!shown) element.append(credit);
      shown = true;
      draw();
    },
    setMarker: (kind, point) => {
      markers[kind] = point;
      draw();
    },
    centerOn: (point) => {
      center = point;
      draw();
    },
  };
}
