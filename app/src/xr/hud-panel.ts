// Panneau d'infos dans le casque (bouton B) : un texte flottant dans la scène, car la page n'est pas visible en
// réalité mixte. Il passe par le même fondu que la ville (APP-001) : il disparaît tête baissée et ne masque jamais le tapis.
import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { formatSpeedKmh } from "../route/speed.ts";
import { formatDistanceM, formatDurationS } from "../route/walk.ts";
import { panelPlacement, type HeadPose } from "./pose.ts";

const WIDTH_PX = 512;
const HEIGHT_PX = 256;
const LINE_PX = 56;
const FONT_PX = 40;
const PANEL_WIDTH_M = 0.5;

export interface HudInfo {
  speedKmh: number;
  distanceM: number;
  timeS: number;
  /** Le lieu : le nom de l'itinéraire choisi. */
  place: string;
  paused: boolean;
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
  const draw = (lines: string[]): void => {
    context.fillStyle = "#10141c";
    context.fillRect(0, 0, WIDTH_PX, HEIGHT_PX);
    context.fillStyle = "#f2f5fa";
    context.font = `${String(FONT_PX)}px sans-serif`;
    context.textAlign = "left";
    context.textBaseline = "middle";
    lines.forEach((line, i) => {
      context.fillText(line, 20, LINE_PX / 2 + 10 + i * LINE_PX, WIDTH_PX - 40);
    });
    texture.needsUpdate = true;
  };
  return {
    mesh,
    update(info, view) {
      const lines = [
        info.paused ? `${formatSpeedKmh(info.speedKmh)} · PAUSE` : formatSpeedKmh(info.speedKmh),
        formatDistanceM(info.distanceM),
        formatDurationS(info.timeS),
        info.place,
      ];
      const key = lines.join("\n");
      if (key !== drawn) {
        drawn = key;
        draw(lines);
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
