// Tableau de bord de marche dans le casque (bouton B le masque) : un texte flottant dans la scène, car la page n'est pas
// visible en réalité mixte. Fond légèrement transparent, en bas du champ de vision, du côté choisi à l'accueil. Il passe par
// le même fondu que la ville (APP-001) : il disparaît tête baissée et ne masque jamais le tapis.
import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { formatSpeedKmh } from "../route/speed.ts";
import { formatKcal } from "../route/stats.ts";
import { formatDistanceM, formatDurationS } from "../route/walk.ts";
import type { Zone } from "../safety/zone.ts";
import type { PanelSide } from "../ui/panel-side.ts";
import { PANEL_HEIGHT_M, PANEL_WIDTH_M, panelPlacement, type HeadPose } from "./pose.ts";

const WIDTH_PX = 640;
const HEIGHT_PX = 320;
const MARGIN_PX = 24;
/** Le fond : sombre à 70 % d'opacité. Le texte reste lisible même sur un réel blanc (contraste testé), la réalité se devine derrière. */
export const HUD_BACKGROUND_RGB = [16, 20, 28] as const;
export const HUD_BACKGROUND_ALPHA = 0.7;
export const HUD_TEXT = "#f2f5fa";

export interface HudInfo {
  speedKmh: number;
  distanceM: number;
  timeS: number;
  /** Calories estimées dépensées (affichées « environ »). */
  kcal: number;
  /** Cap de la boussole, lu sur la direction du parcours (« NE 45° »). */
  compass: string;
  /** L'heure locale (« 09:05 »). */
  clock: string;
  /** Le lieu : le nom de l'itinéraire choisi. */
  place: string;
  paused: boolean;
}

/** Un texte du tableau de bord : à gauche ou à droite de la même ligne, `y` au milieu de la ligne. */
interface Cell {
  text: string;
  y: number;
  sizePx: number;
  align: "left" | "right";
}

export interface HudPanel {
  mesh: Mesh;
  /** Redessine le texte seulement si une valeur affichée a changé, applique le fondu et suit le regard. */
  update(info: HudInfo, view: { show: boolean; opacity: number; pose: HeadPose | undefined; side: PanelSide; zone: Zone }): void;
}

export function createHudPanel(doc: Document): HudPanel {
  const canvas = doc.createElement("canvas");
  canvas.width = WIDTH_PX;
  canvas.height = HEIGHT_PX;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponible : le panneau d'infos ne peut pas être dessiné.");
  const texture = new CanvasTexture(canvas);
  // Le fond du canevas est translucide : la matière est donc toujours transparente, et ne cache rien derrière elle dans le tampon de profondeur.
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  const mesh = new Mesh(new PlaneGeometry(PANEL_WIDTH_M, PANEL_HEIGHT_M), material);
  mesh.name = "panneau-infos";
  mesh.visible = false;
  let drawn = "";
  const draw = (cells: Cell[]): void => {
    // « copy » remplace l'image précédente : sans cela, chaque redessin empilerait une couche de fond translucide.
    context.globalCompositeOperation = "copy";
    context.fillStyle = `rgba(${HUD_BACKGROUND_RGB.join(", ")}, ${String(HUD_BACKGROUND_ALPHA)})`;
    context.fillRect(0, 0, WIDTH_PX, HEIGHT_PX);
    context.globalCompositeOperation = "source-over";
    context.fillStyle = HUD_TEXT;
    context.textBaseline = "middle";
    for (const cell of cells) {
      context.font = `${String(cell.sizePx)}px sans-serif`;
      context.textAlign = cell.align;
      context.fillText(cell.text, cell.align === "left" ? MARGIN_PX : WIDTH_PX - MARGIN_PX, cell.y, WIDTH_PX / 2 - MARGIN_PX);
    }
    texture.needsUpdate = true;
  };
  return {
    mesh,
    update(info, view) {
      const speed = formatSpeedKmh(info.speedKmh);
      const cells: Cell[] = [
        { text: info.compass, y: 36, sizePx: 34, align: "left" },
        { text: info.clock, y: 36, sizePx: 34, align: "right" },
        { text: info.place, y: 92, sizePx: 34, align: "left" },
        { text: info.paused ? `${speed} · PAUSE` : speed, y: 160, sizePx: 60, align: "left" },
        { text: formatDurationS(info.timeS), y: 230, sizePx: 40, align: "left" },
        { text: formatDistanceM(info.distanceM), y: 230, sizePx: 40, align: "right" },
        { text: formatKcal(info.kcal), y: 288, sizePx: 36, align: "left" },
      ];
      const key = cells.map((cell) => cell.text).join("\n");
      if (key !== drawn) {
        drawn = key;
        draw(cells);
      }
      material.opacity = view.opacity;
      // Sans pose, ou sans place hors de la zone tapis, le panneau reste caché plutôt que posé n'importe où (APP-001).
      const at = view.pose && panelPlacement(view.pose, view.side, view.zone);
      mesh.visible = view.show && view.opacity > 0 && at !== undefined;
      if (at) {
        mesh.position.set(at.x, at.y, at.z);
        mesh.rotation.y = at.yawRad;
        mesh.scale.setScalar(at.scale);
      }
    },
  };
}
