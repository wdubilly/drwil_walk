// Minicarte du casque : le tracé du parcours et un point à la position courante, dans la scène (la page n'est pas visible en
// réalité mixte). Le tracé seul, nord en haut, sans fond de tuiles ni réseau (APP-002). Même fondu, même masquage et même
// règle de zone tapis que le panneau d'infos (APP-001) ; fond translucide, ni ciel ni fond opaque.
import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import type { Vec2 } from "../route/geo.ts";
import { simplifyPath } from "../route/simplify.ts";
import type { Zone } from "../safety/zone.ts";
import type { PanelSide } from "../ui/panel-side.ts";
import { HUD_BACKGROUND_ALPHA, HUD_BACKGROUND_RGB } from "./hud-panel.ts";
import { MINIMAP_SIZE_M, minimapPlacement, type HeadPose } from "./pose.ts";

const SIZE_PX = 256;
const MARGIN_PX = 24;
/** Le tracé gardé : assez pour une boucle de 4 km lisible sur 256 px, assez peu pour un dessin d'une image. */
export const MINIMAP_MAX_POINTS = 120;
/** Le point n'est redessiné que lorsqu'il change de case de 2 px : à 72 images par seconde, le dessin reste rare. */
const STEP_PX = 2;
export const MINIMAP_ROUTE = "#ffd23f";
export const MINIMAP_DOT = "#ff5a36";

/** Du repère du parcours (mètres, z vers le sud) aux pixels de la carte (nord en haut), le tracé tenant tout entier dans le carré. */
export function mapProjection(points: readonly Vec2[]): (p: Vec2) => { x: number; y: number } {
  const xs = points.map((p) => p.x);
  const zs = points.map((p) => p.z);
  const [minX, maxX, minZ, maxZ] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
  // Un tracé droit n'a pas de largeur : l'échelle suit son côté le plus long, jamais zéro.
  const scale = (SIZE_PX - 2 * MARGIN_PX) / Math.max(maxX - minX, maxZ - minZ, 1);
  const [midX, midZ] = [(minX + maxX) / 2, (minZ + maxZ) / 2];
  return (p) => ({ x: SIZE_PX / 2 + (p.x - midX) * scale, y: SIZE_PX / 2 + (p.z - midZ) * scale });
}

export interface Minimap {
  mesh: Mesh;
  /** Place le point, redessine seulement s'il a avancé d'un pas, applique le fondu ; rend la case du point (« x,y »). */
  update(position: Vec2, view: { show: boolean; opacity: number; pose: HeadPose | undefined; side: PanelSide; zone: Zone }): string;
}

export function createMinimap(doc: Document, route: readonly Vec2[]): Minimap {
  const canvas = doc.createElement("canvas");
  canvas.width = SIZE_PX;
  canvas.height = SIZE_PX;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponible : la minicarte ne peut pas être dessinée.");
  const texture = new CanvasTexture(canvas);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  const mesh = new Mesh(new PlaneGeometry(MINIMAP_SIZE_M, MINIMAP_SIZE_M), material);
  mesh.name = "minimap";
  mesh.visible = false;
  const project = mapProjection(route);
  const line = simplifyPath(route, MINIMAP_MAX_POINTS).map(project);
  let drawn = "";
  const draw = (dot: { x: number; y: number }): void => {
    // « copy » remplace l'image précédente : sans cela, chaque redessin empilerait une couche de fond translucide.
    context.globalCompositeOperation = "copy";
    context.fillStyle = `rgba(${HUD_BACKGROUND_RGB.join(", ")}, ${String(HUD_BACKGROUND_ALPHA)})`;
    context.fillRect(0, 0, SIZE_PX, SIZE_PX);
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = MINIMAP_ROUTE;
    context.lineWidth = 6;
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo((line[0] as { x: number }).x, (line[0] as { y: number }).y);
    for (const p of line.slice(1)) context.lineTo(p.x, p.y);
    context.stroke();
    context.fillStyle = MINIMAP_DOT;
    context.beginPath();
    context.arc(dot.x, dot.y, 12, 0, 2 * Math.PI);
    context.fill();
    texture.needsUpdate = true;
  };
  return {
    mesh,
    update(position, view) {
      const dot = project(position);
      const cell = `${String(Math.round(dot.x / STEP_PX))},${String(Math.round(dot.y / STEP_PX))}`;
      if (cell !== drawn) {
        drawn = cell;
        draw(dot);
      }
      material.opacity = view.opacity;
      // Sans pose, ou sans place hors de la zone tapis, la carte reste cachée plutôt que posée n'importe où (APP-001).
      const at = view.pose && minimapPlacement(view.pose, view.side, view.zone);
      mesh.visible = view.show && view.opacity > 0 && at !== undefined;
      if (at) {
        mesh.position.set(at.x, at.y, at.z);
        mesh.rotation.y = at.yawRad;
        mesh.scale.setScalar(at.scale);
      }
      return cell;
    },
  };
}
