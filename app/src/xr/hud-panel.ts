// Tableau de bord de marche dans le casque (bouton B le masque) : un texte flottant dans la scène, car la page n'est pas
// visible en réalité mixte. Il passe par le même fondu que la ville (APP-001) : il disparaît tête baissée et ne masque jamais le tapis.
import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { formatSpeedKmh } from "../route/speed.ts";
import { formatKcal } from "../route/stats.ts";
import { formatDistanceM, formatDurationS } from "../route/walk.ts";
import { panelPlacement, type HeadPose } from "./pose.ts";

const WIDTH_PX = 640;
const HEIGHT_PX = 320;
const MARGIN_PX = 24;
// Large de 0,6 m (0,3 m de haut), posé 0,2 m sous les yeux à 1,2 m : son bord bas reste au-dessus de la zone tapis par défaut.
const PANEL_WIDTH_M = 0.6;

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
  update(info: HudInfo, view: { show: boolean; opacity: number; pose: HeadPose | undefined }): void;
}

export function createHudPanel(doc: Document): HudPanel {
  const canvas = doc.createElement("canvas");
  canvas.width = WIDTH_PX;
  canvas.height = HEIGHT_PX;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponible : le panneau d'infos ne peut pas être dessiné.");
  const texture = new CanvasTexture(canvas);
  const material = new MeshBasicMaterial({ map: texture });
  const mesh = new Mesh(new PlaneGeometry(PANEL_WIDTH_M, (PANEL_WIDTH_M * HEIGHT_PX) / WIDTH_PX), material);
  mesh.name = "panneau-infos";
  mesh.visible = false;
  let drawn = "";
  const draw = (cells: Cell[]): void => {
    context.fillStyle = "#10141c";
    context.fillRect(0, 0, WIDTH_PX, HEIGHT_PX);
    context.fillStyle = "#f2f5fa";
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
      material.transparent = view.opacity < 1;
      material.opacity = view.opacity;
      // Sans pose, le panneau n'a pas de place : il reste caché plutôt que posé n'importe où (APP-001).
      mesh.visible = view.show && view.opacity > 0 && view.pose !== undefined;
      if (view.pose) {
        const at = panelPlacement(view.pose);
        mesh.position.set(at.x, at.y, at.z);
        mesh.rotation.y = at.yawRad;
      }
    },
  };
}
