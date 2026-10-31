// Les mentions de données dans le casque (APP-003) : un panneau dans la scène, car la page n'est pas
// visible en réalité mixte. Elles s'effacent avec la ville (APP-001) : sans ville, il n'y a plus de données à créditer.
import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { OSM_ATTRIBUTION } from "./licence.ts";

const WIDTH_PX = 1024;
const HEIGHT_PX = 128;
const MARGIN_PX = 12;

export interface AttributionLabel {
  mesh: Mesh;
  /** Redessine le panneau (les droits des tuiles Google changent avec ce qui est affiché). */
  setText(text: string): void;
}

/** Panneau posé devant l'utilisateur, un peu sous l'horizon, hors de la zone du tapis. */
export function createAttributionLabel(
  doc: Document,
  text: string = OSM_ATTRIBUTION,
  { name = "attribution", y = 1.0 }: { name?: string; y?: number } = {},
): AttributionLabel {
  const canvas = doc.createElement("canvas");
  canvas.width = WIDTH_PX;
  canvas.height = HEIGHT_PX;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponible : les mentions de données ne peuvent pas être dessinées.");
  const texture = new CanvasTexture(canvas);
  const draw = (content: string): void => {
    context.fillStyle = "#10141c";
    context.fillRect(0, 0, WIDTH_PX, HEIGHT_PX);
    context.fillStyle = "#f2f5fa";
    context.font = "44px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    // Largeur maximale : un texte long est comprimé, jamais tronqué (la mention doit rester entière).
    context.fillText(content, WIDTH_PX / 2, HEIGHT_PX / 2, WIDTH_PX - 2 * MARGIN_PX);
    texture.needsUpdate = true;
  };
  draw(text);
  const mesh = new Mesh(new PlaneGeometry(1.2, 0.15), new MeshBasicMaterial({ map: texture }));
  mesh.name = name;
  mesh.position.set(0, y, -2.5);
  return { mesh, setText: draw };
}
